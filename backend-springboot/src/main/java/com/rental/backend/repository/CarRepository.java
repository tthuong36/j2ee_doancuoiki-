package com.rental.backend.repository;

import com.rental.backend.entity.Car;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, Long> {

    @EntityGraph(attributePaths = {"owner", "images"})
    List<Car> findAll();

    Optional<Car> findByPlate(String plate);

    boolean existsByPlate(String plate);

    boolean existsByPlateAndIdNot(String plate, Long id);

    @EntityGraph(attributePaths = {"owner", "images"})
    List<Car> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Override
    @EntityGraph(attributePaths = {"owner", "images"})
    Optional<Car> findById(Long id);

    List<Car> findByAvailableAndPricePerDayBetweenOrderByCreatedAtDesc(Boolean available, BigDecimal min, BigDecimal max);
}
