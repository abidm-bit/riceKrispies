package com.dema.riceKrispies.config;

import com.dema.riceKrispies.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            .cors().configurationSource(request -> {
                var cors = new org.springframework.web.cors.CorsConfiguration();
                for (String origin : allowedOrigins) cors.addAllowedOrigin(origin);
                cors.addAllowedMethod("*"); // Allow all HTTP methods including OPTIONS
                cors.addAllowedHeader("*");
                cors.setAllowCredentials(true);
                return cors;
            })
            .and()
            .csrf().disable() // Disable CSRF for REST API
            .headers(headers -> headers
                .addHeaderWriter(new StaticHeadersWriter("X-Content-Type-Options", "nosniff"))
            )
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                // Allow OPTIONS requests for CORS preflight - MUST be first
                .requestMatchers(HttpMethod.OPTIONS).permitAll()
                // Allow public endpoints
                .requestMatchers("/", "/users/register/", "/users/login/").permitAll()
                // Require authentication for protected endpoints
                .requestMatchers(HttpMethod.POST, "/fetchKeys/").authenticated()
                // Deny everything else
                .anyRequest().denyAll()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
} 