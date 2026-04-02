package com.rental.backend.dto.booking;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull
    private Long carId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}
