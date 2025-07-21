package com.dema.riceKrispies.controller;

import com.dema.riceKrispies.dto.FetchKeyRequest;
import com.dema.riceKrispies.dto.FetchKeyResponse;
import com.dema.riceKrispies.service.KeyService;
import com.dema.riceKrispies.service.RateLimiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequiredArgsConstructor
public class KeyController {
    private final KeyService keyService;
    private final RateLimiterService rateLimiterService;

    @PostMapping("/fetchKeys/")
    public ResponseEntity<?> fetchKey(@RequestBody FetchKeyRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiterService.checkFetchKeys(ip);
        FetchKeyResponse response = keyService.fetchAndBurnKey(request.getUserId());
        return ResponseEntity.ok(response);
    }
} 