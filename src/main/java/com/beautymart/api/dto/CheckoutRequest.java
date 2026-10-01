package com.beautymart.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 200, message = "Full name must not exceed 200 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 320, message = "Email must not exceed 320 characters")
        String email,

        @NotBlank(message = "Phone number is required")
        @Pattern(
                regexp = "^(?:\\+234|0)[789][01]\\d{8}$",
                message = "Enter a valid Nigerian phone number"
        )
        String phoneNumber,

        @NotBlank(message = "Delivery address is required")
        @Size(
                min = 10,
                max = 500,
                message = "Delivery address must contain between 10 and 500 characters"
        )
        String deliveryAddress,

        @NotBlank(message = "Delivery area is required")
        @Pattern(
                regexp = "^(Ajah|Festac|Gbagada|Ikeja|Ikoyi|Lekki|Maryland|Surulere|Victoria Island|Yaba)$",
                message = "Select a supported Lagos delivery area"
        )
        String deliveryArea
) {
}
