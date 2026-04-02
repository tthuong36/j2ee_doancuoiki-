package com.rental.backend.repository;

import com.rental.backend.entity.Car;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarRepository extends JpaRepository<Car, Long> {

    Optional<Car> findByPlate(String plate);

    boolean existsByPlate(String plate);

    boolean existsByPlateAndIdNot(String plate, Long id);

    List<Car> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<Car> findByAvailableAndPricePerDayBetweenOrderByCreatedAtDesc(Boolean available, BigDecimal min, BigDecimal max);
}
