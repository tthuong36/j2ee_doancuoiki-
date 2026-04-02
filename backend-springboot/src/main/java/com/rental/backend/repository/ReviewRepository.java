package com.rental.backend.repository;

import com.rental.backend.entity.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCarIdOrderByCreatedAtDesc(Long carId);

    Optional<Review> findByCarIdAndUserId(Long carId, Long userId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.car.id = :carId")
    Double findAvgRatingByCarId(Long carId);

    @Query("select count(r.id) from Review r where r.car.id = :carId")
    Long countByCarId(Long carId);
}
