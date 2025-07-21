package com.dema.riceKrispies.service;

import com.dema.riceKrispies.dto.FetchKeyResponse;
import com.dema.riceKrispies.model.AKeyModel;
import com.dema.riceKrispies.repository.AKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KeyService {
    private final AKeyRepository keyRepository;

    @Transactional
    public FetchKeyResponse fetchAndBurnKey(Integer userId) {
        AKeyModel key = keyRepository.findFirstByBurnedFalse()
                .orElseThrow(() -> new RuntimeException("No available keys"));
        key.setBurned(true);
        key.setBurnedBy(userId);
        keyRepository.save(key);
        return new FetchKeyResponse(key.getKey(), userId);
    }
} 