package com.rental.backend.controller;

import com.rental.backend.dto.car.CarUpsertRequest;
import com.rental.backend.entity.Car;
import com.rental.backend.entity.User;
import com.rental.backend.entity.enums.UserRole;
import com.rental.backend.exception.ApiException;
import com.rental.backend.repository.CarRepository;
import com.rental.backend.repository.ReviewRepository;
import com.rental.backend.repository.UserRepository;
import com.rental.backend.service.ApiMapper;
import com.rental.backend.service.CurrentUserService;
import com.rental.backend.service.FileStorageService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarRepository carRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final FileStorageService fileStorageService;
    private final ApiMapper apiMapper;

    @GetMapping
    @Transactional
    public List<Map<String, Object>> listCars(
        @RequestParam(value = "available", required = false) Boolean available,
        @RequestParam(value = "q", required = false) String q,
        @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
        @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice
    ) {
        return carRepository.findAll().stream()
            .filter(car -> available == null || available.equals(car.getAvailable()))
            .filter(car -> q == null || containsIgnoreCase(car.getMake(), q) || containsIgnoreCase(car.getModel(), q) || containsIgnoreCase(car.getPlate(), q))
            .filter(car -> minPrice == null || car.getPricePerDay().compareTo(minPrice) >= 0)
            .filter(car -> maxPrice == null || car.getPricePerDay().compareTo(maxPrice) <= 0)
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(car -> apiMapper.car(car, true))
            .toList();
    }

    @GetMapping("/me/my-cars")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Transactional
    public List<Map<String, Object>> myCars() {
        User user = currentUserService.getCurrentUser();
        List<Car> cars = user.getRole() == UserRole.ADMIN
            ? carRepository.findAll()
            : carRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId());

        return cars.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(car -> apiMapper.car(car, true))
            .toList();
    }

    @GetMapping("/{id}")
    @Transactional
    public Map<String, Object> getCar(@PathVariable Long id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));

        List<Map<String, Object>> latestReviews = reviewRepository.findByCarIdOrderByCreatedAtDesc(car.getId())
            .stream()
            .limit(5)
            .map(review -> apiMapper.review(review, false))
            .toList();

        Map<String, Object> response = new HashMap<>(apiMapper.car(car, true));
        response.put("latestReviews", latestReviews);
        return response;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Transactional
    public Map<String, Object> createCar(
        CarUpsertRequest request,
        @RequestParam(value = "images", required = false) List<MultipartFile> images,
        jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        if (request.getMake() == null || request.getModel() == null || request.getPlate() == null || request.getPricePerDay() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "make, model, plate, pricePerDay are required");
        }
        if (carRepository.existsByPlate(request.getPlate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Plate already exists");
        }

        User currentUser = currentUserService.getCurrentUser();
        User owner = resolveOwner(request.getOwner(), currentUser);

        Car car = new Car();
        car.setOwner(owner);
        applyCarFields(car, request, false);

        String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort() + "/api";
        car.setImages(fileStorageService.storeCarImages(images, baseUrl));

        carRepository.save(car);
        return apiMapper.car(car, true);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Transactional
    public Map<String, Object> updateCar(@PathVariable Long id, @RequestBody CarUpsertRequest request) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));
        User currentUser = currentUserService.getCurrentUser();
        validateCarOwnership(car, currentUser);

        if (request.getPlate() != null && carRepository.existsByPlateAndIdNot(request.getPlate(), id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Plate already exists");
        }

        applyCarFields(car, request, true);

        if (currentUser.getRole() == UserRole.ADMIN && request.getOwner() != null) {
            User owner = userRepository.findById(request.getOwner())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Owner not found"));
            car.setOwner(owner);
        }

        carRepository.save(car);
        return apiMapper.car(car, true);
    }

    @PutMapping("/{id}/with-images")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Transactional
    public Map<String, Object> updateCarWithImages(
        @PathVariable Long id,
        CarUpsertRequest request,
        @RequestParam(value = "images", required = false) List<MultipartFile> images,
        jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));
        User currentUser = currentUserService.getCurrentUser();
        validateCarOwnership(car, currentUser);

        if (request.getPlate() != null && carRepository.existsByPlateAndIdNot(request.getPlate(), id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Plate already exists");
        }

        applyCarFields(car, request, true);

        if (currentUser.getRole() == UserRole.ADMIN && request.getOwner() != null) {
            User owner = userRepository.findById(request.getOwner())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Owner not found"));
            car.setOwner(owner);
        }

        String baseUrl = httpRequest.getScheme() + "://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort() + "/api";
        List<String> uploaded = fileStorageService.storeCarImages(images, baseUrl);
        if (!uploaded.isEmpty()) {
            car.setImages(uploaded);
        }

        carRepository.save(car);
        return apiMapper.car(car, true);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    public Map<String, Object> deleteCar(@PathVariable Long id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));
        validateCarOwnership(car, currentUserService.getCurrentUser());
        carRepository.delete(car);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Car deleted successfully");
        return response;
    }

    private void applyCarFields(Car car, CarUpsertRequest request, boolean partial) {
        if (!partial || request.getMake() != null) car.setMake(request.getMake());
        if (!partial || request.getModel() != null) car.setModel(request.getModel());
        if (!partial || request.getYear() != null) car.setYear(request.getYear());
        if (!partial || request.getPlate() != null) car.setPlate(request.getPlate());
        if (!partial || request.getPricePerDay() != null) car.setPricePerDay(request.getPricePerDay());
        if (!partial || request.getAvailable() != null) car.setAvailable(request.getAvailable() == null ? true : request.getAvailable());
        if (!partial || request.getLocation() != null) car.setLocation(request.getLocation());
    }

    private User resolveOwner(Long ownerId, User currentUser) {
        if (currentUser.getRole() == UserRole.OWNER) {
            return currentUser;
        }
        if (ownerId == null) {
            return currentUser;
        }
        return userRepository.findById(ownerId)
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Owner not found"));
    }

    private void validateCarOwnership(Car car, User user) {
        if (user.getRole() == UserRole.ADMIN) {
            return;
        }
        if (car.getOwner() == null || !car.getOwner().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own cars");
        }
    }

    private boolean containsIgnoreCase(String value, String query) {
        return value != null && query != null
            && value.toLowerCase(Locale.ROOT).contains(query.toLowerCase(Locale.ROOT));
    }
}
