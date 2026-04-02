package com.rental.backend.dto.car;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarUpsertRequest {

    private Long owner;
    private String make;
    private String model;
    private Integer year;
    private String plate;
    private BigDecimal pricePerDay;
    private Boolean available;
    private String location;
}
