package com.dema.riceKrispies.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FetchKeyResponse {
    private String key;
    private Integer userId;
} 