package com.dema.riceKrispies.repository;

import com.dema.riceKrispies.model.AUserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AUserRepository extends JpaRepository<AUserModel, Integer> {
    Optional<AUserModel> findByEmail(String email);
    Optional<AUserModel> findByUserId(Integer userId);
    boolean existsByEmail(String email);
} 