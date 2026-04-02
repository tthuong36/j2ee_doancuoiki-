package com.rental.backend.controller;

import com.rental.backend.dto.booking.CreateBookingRequest;
import com.rental.backend.entity.Booking;
import com.rental.backend.entity.Car;
import com.rental.backend.entity.User;
import com.rental.backend.entity.enums.BookingStatus;
import com.rental.backend.exception.ApiException;
import com.rental.backend.repository.BookingRepository;
import com.rental.backend.repository.CarRepository;
import com.rental.backend.service.ApiMapper;
import com.rental.backend.service.CurrentUserService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

        Set<BookingStatus> activeStatuses = new HashSet<>();
        activeStatuses.add(BookingStatus.PENDING);
        activeStatuses.add(BookingStatus.CONFIRMED);

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
}
