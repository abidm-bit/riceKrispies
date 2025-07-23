package com.dema.riceKrispies.controller;

import com.dema.riceKrispies.dto.FetchKeyRequest;
import com.dema.riceKrispies.dto.FetchKeyResponse;
import com.dema.riceKrispies.service.KeyService;
import com.dema.riceKrispies.service.RateLimiterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = KeyController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class,
    org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
})
@Disabled("Temporarily disabled")
class KeyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private KeyService keyService;

    @MockBean
    private RateLimiterService rateLimiterService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testFetchKey_Success() throws Exception {
        FetchKeyRequest request = new FetchKeyRequest();
        request.setUserId(1);

        FetchKeyResponse mockResponse = new FetchKeyResponse("mock-key-12345", 1);
        when(keyService.fetchAndBurnKey(1)).thenReturn(mockResponse);

        mockMvc.perform(post("/fetchKeys/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.key").value("mock-key-12345"))
                .andExpect(jsonPath("$.userId").value(1));

        verify(rateLimiterService).checkFetchKeys(any());
        verify(keyService).fetchAndBurnKey(1);
    }

    @Test
    void testFetchKey_NoAvailableKeys() throws Exception {
        FetchKeyRequest request = new FetchKeyRequest();
        request.setUserId(1);

        when(keyService.fetchAndBurnKey(1)).thenThrow(new RuntimeException("No available keys"));

        mockMvc.perform(post("/fetchKeys/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("internal server error"));

        verify(rateLimiterService).checkFetchKeys(any());
        verify(keyService).fetchAndBurnKey(1);
    }

    @Test
    void testFetchKey_RateLimitExceeded() throws Exception {
        FetchKeyRequest request = new FetchKeyRequest();
        request.setUserId(1);

        doThrow(new RateLimiterService.RateLimitExceededException())
                .when(rateLimiterService).checkFetchKeys(any());

        mockMvc.perform(post("/fetchKeys/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string("rate limit exceeded"));

        verify(rateLimiterService).checkFetchKeys(any());
        verify(keyService, never()).fetchAndBurnKey(any());
    }

    @Test
    void testFetchKey_InvalidUserId() throws Exception {
        FetchKeyRequest request = new FetchKeyRequest();
        request.setUserId(null);

        when(keyService.fetchAndBurnKey(null)).thenThrow(new IllegalArgumentException("Invalid user ID"));

        mockMvc.perform(post("/fetchKeys/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("invalid registration"));

        verify(rateLimiterService).checkFetchKeys(any());
        verify(keyService).fetchAndBurnKey(null);
    }

    @Test
    void testFetchKey_DifferentUser() throws Exception {
        FetchKeyRequest request = new FetchKeyRequest();
        request.setUserId(42);

        FetchKeyResponse mockResponse = new FetchKeyResponse("another-key-67890", 42);
        when(keyService.fetchAndBurnKey(42)).thenReturn(mockResponse);

        mockMvc.perform(post("/fetchKeys/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.key").value("another-key-67890"))
                .andExpect(jsonPath("$.userId").value(42));

        verify(rateLimiterService).checkFetchKeys(any());
        verify(keyService).fetchAndBurnKey(42);
    }

    @Test
    void testFetchKey_ServiceException() throws Exception {
        FetchKeyRequest request = new FetchKeyRequest();
        request.setUserId(1);

        when(keyService.fetchAndBurnKey(1)).thenThrow(new RuntimeException("Database connection error"));

        mockMvc.perform(post("/fetchKeys/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("internal server error"));

        verify(rateLimiterService).checkFetchKeys(any());
        verify(keyService).fetchAndBurnKey(1);
    }
} 