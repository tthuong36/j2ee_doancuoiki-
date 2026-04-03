package com.rental.backend.controller;

import com.rental.backend.dto.booking.CreateBookingRequest;
import com.rental.backend.entity.Booking;
import com.rental.backend.entity.Car;
import com.rental.backend.entity.User;
import com.rental.backend.entity.enums.BookingStatus;
import com.rental.backend.entity.enums.UserRole;
import com.rental.backend.exception.ApiException;
import com.rental.backend.repository.BookingRepository;
import com.rental.backend.repository.CarRepository;
import com.rental.backend.service.ApiMapper;
import com.rental.backend.service.CurrentUserService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public Map<String, Object> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "endDate must be after startDate");
        }

        Car car = carRepository.findById(request.getCarId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));

        if (!Boolean.TRUE.equals(car.getAvailable())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Car is not available");
        }

        Set<BookingStatus> activeStatuses = EnumSet.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

        boolean overlapped = bookingRepository.existsByCarIdAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
            car.getId(),
            activeStatuses,
            request.getEndDate(),
            request.getStartDate()
        );

        if (overlapped) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Car is already booked for the selected period");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalPrice = car.getPricePerDay().multiply(BigDecimal.valueOf(days));

        User currentUser = currentUserService.getCurrentUser();
        Booking booking = new Booking();
        booking.setUser(currentUser);
        booking.setCar(car);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        bookingRepository.save(booking);
        return apiMapper.booking(booking);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public List<Map<String, Object>> myBookings() {
        User currentUser = currentUserService.getCurrentUser();
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
            .stream()
            .map(apiMapper::booking)
            .toList();
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public List<Map<String, Object>> adminAllBookings() {
        return bookingRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(apiMapper::booking)
            .toList();
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Map<String, Object> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

        BookingStatus newStatus = parseStatus(body.get("status"));
        applyBookingStatus(booking, newStatus);

        bookingRepository.save(booking);
        return apiMapper.booking(booking);
    }

    @GetMapping("/owner/all")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Transactional
    public List<Map<String, Object>> ownerAllBookings() {
        User currentUser = currentUserService.getCurrentUser();
        List<Booking> bookings = currentUser.getRole() == UserRole.ADMIN
            ? bookingRepository.findAll()
            : bookingRepository.findByCarOwnerIdOrderByCreatedAtDesc(currentUser.getId());

        return bookings.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(apiMapper::booking)
            .toList();
    }

    @PatchMapping("/owner/{id}/status")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    @Transactional
    public Map<String, Object> updateOwnerBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User currentUser = currentUserService.getCurrentUser();
        Booking booking = currentUser.getRole() == UserRole.ADMIN
            ? bookingRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"))
            : bookingRepository.findByIdAndCarOwnerId(id, currentUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You can only manage bookings for your own cars"));

        BookingStatus newStatus = parseStatus(body.get("status"));
        applyBookingStatus(booking, newStatus);

        bookingRepository.save(booking);
        return apiMapper.booking(booking);
    }

    private BookingStatus parseStatus(String statusRaw) {
        if (statusRaw == null || statusRaw.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "status is required");
        }

        try {
            return BookingStatus.valueOf(statusRaw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid booking status");
        }
    }

    private void applyBookingStatus(Booking booking, BookingStatus newStatus) {
        booking.setStatus(newStatus);

        // Khi đơn được xác nhận, xe tự chuyển sang không còn trống.
        Car car = booking.getCar();
        if (car != null) {
            if (newStatus == BookingStatus.CONFIRMED) {
                car.setAvailable(false);
                carRepository.save(car);
            } else if (newStatus == BookingStatus.CANCELLED) {
                car.setAvailable(true);
                carRepository.save(car);
            }
        }
    }
}
