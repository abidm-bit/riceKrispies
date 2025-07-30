package com.dema.riceKrispies.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private static final int REGISTRATION_LIMIT = 5;
    private static final int LOGIN_LIMIT = 50;
    private static final int FETCH_KEYS_LIMIT = 50;
    private static final long WINDOW_MILLIS = 24 * 60 * 60 * 1000L;

    private final Map<String, RequestCounter> registrationMap = new ConcurrentHashMap<>();
    private final Map<String, RequestCounter> loginMap = new ConcurrentHashMap<>();
    private final Map<String, RequestCounter> fetchKeysMap = new ConcurrentHashMap<>();

    public void checkRegistration(String ip) {
        checkLimit(ip, registrationMap, REGISTRATION_LIMIT);
    }

    public void checkLogin(String ip) {
        checkLimit(ip, loginMap, LOGIN_LIMIT);
    }

    public void checkFetchKeys(String ip) {
        checkLimit(ip, fetchKeysMap, FETCH_KEYS_LIMIT);
    }

    private void checkLimit(String ip, Map<String, RequestCounter> map, int limit) {
        long now = Instant.now().toEpochMilli();
        map.compute(ip, (k, counter) -> {
            if (counter == null || now - counter.windowStart > WINDOW_MILLIS) {
                return new RequestCounter(1, now);
            } else {
                if (counter.count >= limit) {
                    throw new RateLimitExceededException();
                }
                counter.count++;
                return counter;
            }
        });
    }

    private static class RequestCounter {
        int count;
        long windowStart;
        RequestCounter(int count, long windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }
    }

    public static class RateLimitExceededException extends RuntimeException {
        public RateLimitExceededException() {
            super("Rate limit exceeded");
        }
    }
} 