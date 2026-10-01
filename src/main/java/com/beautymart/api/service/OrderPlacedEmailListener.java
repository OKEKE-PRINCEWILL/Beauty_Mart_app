package com.beautymart.api.service;

import com.beautymart.api.dto.OrderItemResponse;
import com.beautymart.api.dto.OrderResponse;
import com.beautymart.api.event.OrderPlacedEvent;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.HtmlUtils;

@Component
public class OrderPlacedEmailListener {

    private static final Logger log = LoggerFactory.getLogger(OrderPlacedEmailListener.class);
    private final TransactionalEmailSender emailSender;
    private final String adminEmail;

    public OrderPlacedEmailListener(
            TransactionalEmailSender emailSender,
            @Value("${app.mailgun.admin-email:}") String adminEmail
    ) {
        this.emailSender = emailSender;
        this.adminEmail = adminEmail.trim();
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        OrderResponse order = event.order();
        sendSafely(
                order.email(),
                "Beauty Mart order confirmed — " + order.orderNumber(),
                customerText(order),
                customerHtml(order)
        );

        if (!adminEmail.isBlank()) {
            sendSafely(
                    adminEmail,
                    "New Beauty Mart order — " + order.orderNumber(),
                    adminText(order),
                    adminHtml(order)
            );
        }
    }

    private void sendSafely(String recipient, String subject, String text, String html) {
        try {
            emailSender.send(recipient, subject, text, html);
        } catch (RuntimeException exception) {
            log.error("Could not send order email to {}", recipient, exception);
        }
    }

    private String customerText(OrderResponse order) {
        return "Hello " + order.fullName() + ",\n\n"
                + "Your Beauty Mart order " + order.orderNumber() + " has been placed.\n"
                + itemText(order)
                + "\nTotal: " + money(order.total())
                + "\nDelivery: " + order.deliveryAddress() + ", " + order.deliveryArea() + ", Lagos"
                + "\n\nWe will let you know when your order has been delivered.";
    }

    private String adminText(OrderResponse order) {
        return "New order " + order.orderNumber() + " from " + order.fullName() + ".\n"
                + itemText(order)
                + "\nTotal: " + money(order.total())
                + "\nPhone: " + order.phoneNumber()
                + "\nDelivery: " + order.deliveryAddress() + ", " + order.deliveryArea() + ", Lagos";
    }

    private String itemText(OrderResponse order) {
        StringBuilder items = new StringBuilder();
        for (OrderItemResponse item : order.items()) {
            items.append("\n- ").append(item.productName())
                    .append(" × ").append(item.quantity())
                    .append(": ").append(money(item.lineTotal()));
        }
        return items.toString();
    }

    private String customerHtml(OrderResponse order) {
        return emailShell(
                "Order confirmed",
                "Hello " + escape(order.fullName()) + ",",
                "Your order <strong>" + escape(order.orderNumber()) + "</strong> has been placed.",
                order
        );
    }

    private String adminHtml(OrderResponse order) {
        return emailShell(
                "New order received",
                escape(order.fullName()) + " placed an order.",
                "Call <strong>" + escape(order.phoneNumber()) + "</strong> for delivery coordination.",
                order
        );
    }

    private String emailShell(String heading, String introduction, String message, OrderResponse order) {
        StringBuilder rows = new StringBuilder();
        for (OrderItemResponse item : order.items()) {
            rows.append("<tr><td style=\"padding:10px 0;border-bottom:1px solid #eadfda\">")
                    .append(escape(item.productName())).append(" × ").append(item.quantity())
                    .append("</td><td style=\"padding:10px 0;border-bottom:1px solid #eadfda;text-align:right\">")
                    .append(escape(money(item.lineTotal()))).append("</td></tr>");
        }

        return "<!doctype html><html><body style=\"margin:0;background:#f7f0ed;font-family:Arial,sans-serif;color:#3b2025\">"
                + "<div style=\"max-width:600px;margin:0 auto;padding:32px 20px\">"
                + "<div style=\"background:#fffdfa;border-radius:24px;padding:32px\">"
                + "<p style=\"margin:0;color:#98666c;letter-spacing:2px;font-size:12px\">BEAUTY MART</p>"
                + "<h1 style=\"font-family:Georgia,serif;font-size:34px;margin:14px 0\">" + escape(heading) + "</h1>"
                + "<p>" + introduction + "</p><p>" + message + "</p>"
                + "<table style=\"width:100%;border-collapse:collapse;margin-top:24px\">" + rows + "</table>"
                + "<p style=\"font-size:20px;font-weight:bold;text-align:right\">Total: " + escape(money(order.total())) + "</p>"
                + "<div style=\"margin-top:24px;padding:18px;background:#f2e5e1;border-radius:14px\"><strong>Delivery</strong><br>"
                + escape(order.deliveryAddress()) + "<br>" + escape(order.deliveryArea()) + ", Lagos</div>"
                + "</div></div></body></html>";
    }

    private String money(BigDecimal amount) {
        return NumberFormat.getCurrencyInstance(Locale.forLanguageTag("en-NG")).format(amount);
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value);
    }
}
