package com.rental.backend.controller;

import com.rental.backend.dto.review.ReviewRequest;
import com.rental.backend.entity.Car;
import com.rental.backend.entity.Review;
import com.rental.backend.entity.User;
import com.rental.backend.entity.enums.UserRole;
import com.rental.backend.exception.ApiException;
import com.rental.backend.repository.CarRepository;
import com.rental.backend.repository.ReviewRepository;
import com.rental.backend.service.ApiMapper;
import com.rental.backend.service.CurrentUserService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final CarRepository carRepository;
    private final CurrentUserService currentUserService;
    private final ApiMapper apiMapper;

    @GetMapping("/car/{carId}")
    @Transactional
    public List<Map<String, Object>> listReviewsByCar(@PathVariable Long carId) {
        carRepository.findById(carId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));

        return reviewRepository.findByCarIdOrderByCreatedAtDesc(carId)
            .stream()
            .map(review -> apiMapper.review(review, false))
            .toList();
    }

    @PostMapping("/car/{carId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public Map<String, Object> createReview(@PathVariable Long carId, @Valid @RequestBody ReviewRequest request) {
        if (reviewRepository.findByCarIdAndUserId(carId, currentUserService.getCurrentUser().getId()).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You already reviewed this car");
        }

        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));

        User currentUser = currentUserService.getCurrentUser();
        Review review = new Review();
        review.setCar(car);
        review.setUser(currentUser);
        review.setRating(request.getRating());
        review.setComment(request.getComment() == null ? "" : request.getComment());

        reviewRepository.save(review);
        refreshCarStats(carId);
        return apiMapper.review(review, true);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public Map<String, Object> updateReview(@PathVariable Long id, @Valid @RequestBody ReviewRequest request) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));

        User currentUser = currentUserService.getCurrentUser();
        validateReviewOwnership(review, currentUser);

        review.setRating(request.getRating());
        review.setComment(request.getComment() == null ? "" : request.getComment());

        reviewRepository.save(review);
        refreshCarStats(review.getCar().getId());
        return apiMapper.review(review, true);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public Map<String, Object> deleteReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Review not found"));

        User currentUser = currentUserService.getCurrentUser();
        validateReviewOwnership(review, currentUser);

        Long carId = review.getCar().getId();
        reviewRepository.delete(review);
        refreshCarStats(carId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Review deleted successfully");
        return response;
    }

    private void refreshCarStats(Long carId) {
        Car car = carRepository.findById(carId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Car not found"));

        Double avg = reviewRepository.findAvgRatingByCarId(carId);
        Long count = reviewRepository.countByCarId(carId);

        car.setAvgRating(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        car.setReviewCount(count.intValue());
        carRepository.save(car);
    }

    private void validateReviewOwnership(Review review, User user) {
        if (user.getRole() == UserRole.ADMIN) {
            return;
        }
        if (review.getUser() == null || !review.getUser().getId().equals(user.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your own reviews");
        }
    }
}
