package com.dema.riceKrispies.repository;

import com.dema.riceKrispies.model.AKeyModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AKeyRepository extends JpaRepository<AKeyModel, String> {
    Optional<AKeyModel> findFirstByBurnedFalse();
} 