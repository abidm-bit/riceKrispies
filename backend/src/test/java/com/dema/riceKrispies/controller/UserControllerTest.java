package com.dema.riceKrispies.controller;

import com.dema.riceKrispies.dto.LoginRequest;
import com.dema.riceKrispies.dto.LoginResponse;
import com.dema.riceKrispies.dto.RegisterRequest;
import com.dema.riceKrispies.service.RateLimiterService;
import com.dema.riceKrispies.service.UserService;
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

@WebMvcTest(controllers = UserController.class, excludeAutoConfiguration = {
    org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class,
    org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class
})
@Disabled("Temporarily disabled")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private RateLimiterService rateLimiterService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegister() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password!1");

        mockMvc.perform(post("/users/register/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Account created"));

        verify(rateLimiterService).checkRegistration(any());
        verify(userService).register(any(RegisterRequest.class));
    }

    @Test
    void testLogin() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password!1");

        LoginResponse loginResponse = new LoginResponse(1, "mock-jwt");
        when(userService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        mockMvc.perform(post("/users/login/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.jwtToken").value("mock-jwt"));

        verify(rateLimiterService).checkLogin(any());
        verify(userService).login(any(LoginRequest.class));
    }

    // REGISTRATION FAILURE TESTS

    @Test
    void testRegister_EmailAlreadyExists() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setPassword("Password!1");

        doThrow(new RuntimeException("bad request")).when(userService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/users/register/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(content().string("bad request"));

        verify(rateLimiterService).checkRegistration(any());
        verify(userService).register(any(RegisterRequest.class));
    }

    @Test
    void testRegister_InvalidEmailFormat() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid-email-format");
        request.setPassword("Password!1");

        doThrow(new IllegalArgumentException("invalid registration")).when(userService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/users/register/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("invalid registration"));

        verify(rateLimiterService).checkRegistration(any());
        verify(userService).register(any(RegisterRequest.class));
    }

    @Test
    void testRegister_InvalidPasswordFormat() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("weak");

        doThrow(new IllegalArgumentException("invalid registration")).when(userService).register(any(RegisterRequest.class));

        mockMvc.perform(post("/users/register/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("invalid registration"));

        verify(rateLimiterService).checkRegistration(any());
        verify(userService).register(any(RegisterRequest.class));
    }

    // LOGIN FAILURE TESTS

    @Test
    void testLogin_WrongPassword() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("WrongPassword!1");

        when(userService.login(any(LoginRequest.class))).thenThrow(new IllegalArgumentException("wrong credentials"));

        mockMvc.perform(post("/users/login/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("wrong credentials"));

        verify(rateLimiterService).checkLogin(any());
        verify(userService).login(any(LoginRequest.class));
    }

    @Test
    void testLogin_UserNotFound() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("Password!1");

        when(userService.login(any(LoginRequest.class))).thenThrow(new IllegalArgumentException("wrong credentials"));

        mockMvc.perform(post("/users/login/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("wrong credentials"));

        verify(rateLimiterService).checkLogin(any());
        verify(userService).login(any(LoginRequest.class));
    }

    // RATE LIMITING TESTS

    @Test
    void testRegister_RateLimitExceeded() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password!1");

        doThrow(new RateLimiterService.RateLimitExceededException())
                .when(rateLimiterService).checkRegistration(any());

        mockMvc.perform(post("/users/register/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string("rate limit exceeded"));

        verify(rateLimiterService).checkRegistration(any());
        verify(userService, never()).register(any());
    }

    @Test
    void testLogin_RateLimitExceeded() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password!1");

        doThrow(new RateLimiterService.RateLimitExceededException())
                .when(rateLimiterService).checkLogin(any());

        mockMvc.perform(post("/users/login/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string("rate limit exceeded"));

        verify(rateLimiterService).checkLogin(any());
        verify(userService, never()).login(any());
    }
} 