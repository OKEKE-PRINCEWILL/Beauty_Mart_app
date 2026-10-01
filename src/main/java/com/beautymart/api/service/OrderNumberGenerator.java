package com.beautymart.api.service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class OrderNumberGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.BASIC_ISO_DATE;

    public String generate() {
        String date = LocalDate.now(ZoneOffset.UTC).format(DATE_FORMAT);
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "BM-" + date + "-" + suffix;
    }
}
