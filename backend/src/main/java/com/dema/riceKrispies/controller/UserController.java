package com.dema.riceKrispies.controller;

import com.dema.riceKrispies.dto.*;
import com.dema.riceKrispies.service.RateLimiterService;
import com.dema.riceKrispies.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final RateLimiterService rateLimiterService;

    @PostMapping("/register/")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiterService.checkRegistration(ip);
        userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Account created");
    }

    @PostMapping("/login/")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiterService.checkLogin(ip);
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }
} 