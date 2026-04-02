package com.rental.backend.dto.post;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePostRequest {

    private String postType;
    private String title;
    private String content;
    private String location;
    private String contactPhone;
    private BigDecimal budgetPerDay;
    private Long car;
}
