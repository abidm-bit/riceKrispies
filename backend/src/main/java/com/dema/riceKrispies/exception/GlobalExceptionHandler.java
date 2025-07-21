package com.dema.riceKrispies.exception;

import com.dema.riceKrispies.service.RateLimiterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        if ("invalid registration".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("invalid registration");
        } else if ("wrong credentials".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("wrong credentials");
        }
        // Fallback for other IllegalArgumentExceptions
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("invalid registration");
    }

    @ExceptionHandler(RateLimiterService.RateLimitExceededException.class)
    public ResponseEntity<String> handleRateLimit(RateLimiterService.RateLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("rate limit exceeded");
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntime(RuntimeException ex) {
        // Only allow the valid message for duplicate email
        if ("bad request".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("bad request");
        }
        // Fallback for other runtime exceptions
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("internal server error");
    }
} 