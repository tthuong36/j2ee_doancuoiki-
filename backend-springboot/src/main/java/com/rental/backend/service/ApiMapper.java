package com.rental.backend.service;

import com.rental.backend.entity.Booking;
import com.rental.backend.entity.Car;
import com.rental.backend.entity.Post;
import com.rental.backend.entity.Review;
import com.rental.backend.entity.User;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ApiMapper {

    public Map<String, Object> user(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole().name().toLowerCase());
        map.put("isActive", user.getIsActive());
        map.put("phone", user.getPhone());
        map.put("address", user.getAddress());
        map.put("avatar", user.getAvatar());
        map.put("createdAt", user.getCreatedAt());
        map.put("updatedAt", user.getUpdatedAt());
        return map;
    }

    public Map<String, Object> car(Car car, boolean includeOwner) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", car.getId());
        if (includeOwner && car.getOwner() != null) {
            map.put("owner", user(car.getOwner()));
        }
        map.put("make", car.getMake());
        map.put("model", car.getModel());
        map.put("year", car.getYear());
        map.put("plate", car.getPlate());
        map.put("pricePerDay", car.getPricePerDay());
        map.put("available", car.getAvailable());
        map.put("images", car.getImages());
        map.put("location", car.getLocation());
        map.put("avgRating", car.getAvgRating());
        map.put("reviewCount", car.getReviewCount());
        map.put("createdAt", car.getCreatedAt());
        map.put("updatedAt", car.getUpdatedAt());
        return map;
    }

    public Map<String, Object> review(Review review, boolean includeCar) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", review.getId());
        if (includeCar) {
            map.put("car", car(review.getCar(), false));
        } else {
            map.put("carId", review.getCar().getId());
        }
        map.put("user", user(review.getUser()));
        map.put("rating", review.getRating());
        map.put("comment", review.getComment());
        map.put("createdAt", review.getCreatedAt());
        map.put("updatedAt", review.getUpdatedAt());
        return map;
    }

    public Map<String, Object> post(Post post) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", post.getId());
        map.put("author", user(post.getAuthor()));
        map.put("postType", post.getPostType().name().toLowerCase());
        map.put("title", post.getTitle());
        map.put("content", post.getContent());
        map.put("location", post.getLocation());
        map.put("contactPhone", post.getContactPhone());
        map.put("budgetPerDay", post.getBudgetPerDay());
        map.put("car", post.getCar() != null ? car(post.getCar(), false) : null);
        map.put("status", post.getStatus().name().toLowerCase());
        map.put("reviewedBy", post.getReviewedBy() != null ? user(post.getReviewedBy()) : null);
        map.put("reviewedAt", post.getReviewedAt());
        map.put("reviewNote", post.getReviewNote());
        map.put("active", post.getActive());
        map.put("createdAt", post.getCreatedAt());
        map.put("updatedAt", post.getUpdatedAt());
        return map;
    }

    public Map<String, Object> booking(Booking booking) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", booking.getId());
        map.put("user", user(booking.getUser()));
        map.put("car", car(booking.getCar(), false));
        map.put("startDate", booking.getStartDate());
        map.put("endDate", booking.getEndDate());
        map.put("totalPrice", booking.getTotalPrice());
        map.put("status", booking.getStatus().name().toLowerCase());
        map.put("createdAt", booking.getCreatedAt());
        map.put("updatedAt", booking.getUpdatedAt());
        return map;
    }

    public List<Map<String, Object>> carList(List<Car> cars, boolean includeOwner) {
        return cars.stream().map(c -> car(c, includeOwner)).toList();
    }
}
