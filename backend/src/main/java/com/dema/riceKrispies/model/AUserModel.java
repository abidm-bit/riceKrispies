package com.dema.riceKrispies.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AUserModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", unique = true, nullable = false)
    private Integer userId;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

} 


// private static final Pattern PASSWORD_PATTERN = Pattern.compile(
//     "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+={}|,.<>/?-]).{8,100}$");