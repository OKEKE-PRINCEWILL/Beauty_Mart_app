package com.beautymart.api.service;

public interface TransactionalEmailSender {

    void send(String recipient, String subject, String textBody, String htmlBody);
}
