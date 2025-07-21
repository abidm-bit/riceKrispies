package com.dema.riceKrispies.service;

import com.dema.riceKrispies.dto.*;
import com.dema.riceKrispies.model.AUserModel;
import com.dema.riceKrispies.repository.AUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {
    private final AUserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}|,.<>/?-]).{8,100}$");

    public void validateRegistration(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("invalid registration");
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("invalid registration");
        }
    }

    @Transactional
    public void register(RegisterRequest request) {
        validateRegistration(request.getEmail(), request.getPassword());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("bad request"); // Will be mapped to 409
        }
        String hashed = passwordEncoder.encode(request.getPassword());
        AUserModel user = new AUserModel();
        user.setEmail(request.getEmail());
        user.setPassword(hashed);
        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        Optional<AUserModel> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("wrong credentials");
        }
        AUserModel user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("wrong credentials");
        }
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail());
        return new LoginResponse(user.getUserId(), token);
    }

    public Optional<AUserModel> findById(Integer userId) {
        return userRepository.findByUserId(userId);
    }
} 