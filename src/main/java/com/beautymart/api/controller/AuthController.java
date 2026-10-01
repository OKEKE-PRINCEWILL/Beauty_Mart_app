package com.beautymart.api.controller;

import com.beautymart.api.dto.AuthResponse;
import com.beautymart.api.dto.GoogleAuthRequest;
import com.beautymart.api.dto.UserResponse;
import com.beautymart.api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/google")
    public AuthResponse authenticateWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.authenticateWithGoogle(request.credential());
    }

    @GetMapping("/me")
    public UserResponse getAuthenticatedUser(@AuthenticationPrincipal Jwt jwt) {
        return authService.getAuthenticatedUser(Long.valueOf(jwt.getSubject()));
    }
}
