package com.rental.backend.repository;

import com.rental.backend.entity.Booking;
import com.rental.backend.entity.enums.BookingStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    boolean existsByCarIdAndStatusInAndStartDateLessThanAndEndDateGreaterThan(
        Long carId,
        Collection<BookingStatus> statuses,
        LocalDate endDate,
        LocalDate startDate
    );
}
