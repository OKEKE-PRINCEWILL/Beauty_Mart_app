package com.beautymart.api.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class MailgunEmailSender implements TransactionalEmailSender {

    private static final Logger log = LoggerFactory.getLogger(MailgunEmailSender.class);

    private final RestClient restClient;
    private final String domain;
    private final String from;
    private final boolean configured;

    public MailgunEmailSender(
            @Value("${app.mailgun.api-key:}") String apiKey,
            @Value("${app.mailgun.domain:}") String domain,
            @Value("${app.mailgun.from:}") String from,
            @Value("${app.mailgun.base-url:https://api.mailgun.net}") String baseUrl
    ) {
        this.domain = domain.trim();
        this.from = from.trim();
        this.configured = !apiKey.isBlank() && !this.domain.isBlank() && !this.from.isBlank();
        String authorization = Base64.getEncoder().encodeToString(
                ("api:" + apiKey).getBytes(StandardCharsets.UTF_8)
        );
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl.replaceAll("/$", ""))
                .defaultHeader("Authorization", "Basic " + authorization)
                .build();
    }

    @Override
    public void send(String recipient, String subject, String textBody, String htmlBody) {
        if (!configured) {
            log.info("Mailgun is not configured; skipping email to {}", recipient);
            return;
        }

        MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        form.add("from", from);
        form.add("to", recipient);
        form.add("subject", subject);
        form.add("text", textBody);
        form.add("html", htmlBody);

        restClient.post()
                .uri("/v3/{domain}/messages", domain)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(form)
                .retrieve()
                .toBodilessEntity();
    }
}
