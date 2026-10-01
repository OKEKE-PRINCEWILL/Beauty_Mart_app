import { z } from "zod";

const orderItemSchema = z.object({
  id: z.number().int().positive(),
  productId: z.number().int().positive(),
  productName: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().nonnegative(),
});

const orderSchema = z.object({
  id: z.number().int().positive(),
  orderNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  deliveryAddress: z.string(),
  deliveryArea: z.string(),
  subtotal: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.string(),
  items: z.array(orderItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const apiErrorSchema = z.object({ message: z.string() });
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CheckoutDetails = Pick<
  Order,
  "fullName" | "email" | "phoneNumber" | "deliveryAddress" | "deliveryArea"
>;

export class OrderApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "OrderApiError";
  }
}

export function createOrder(token: string, details: CheckoutDetails) {
  return orderRequest("/api/orders", token, {
    method: "POST",
    body: JSON.stringify(details),
  }, orderSchema);
}

export function getOrders(token: string) {
  return orderRequest("/api/orders", token, {}, z.array(orderSchema));
}

export function getOrder(token: string, orderId: number) {
  return orderRequest(`/api/orders/${orderId}`, token, {}, orderSchema);
}

async function orderRequest<T>(
  path: string,
  token: string,
  init: RequestInit,
  schema: z.ZodType<T>
) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "The order request could not be completed";
    try {
      message = apiErrorSchema.parse(await response.json()).message;
    } catch {
      // Keep the fallback when the API does not return its standard error shape.
    }
    throw new OrderApiError(message, response.status);
  }

  return schema.parse(await response.json());
}
