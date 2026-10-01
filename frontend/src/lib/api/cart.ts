import { z } from "zod";
import { productSchema } from "@/lib/api/products";

const cartItemSchema = z.object({
  id: z.number().int().positive(),
  product: productSchema,
  quantity: z.number().int().positive(),
  lineTotal: z.number().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const cartSchema = z.object({
  items: z.array(cartItemSchema),
  totalItems: z.number().int().nonnegative(),
  subtotal: z.number().nonnegative(),
});

const apiErrorSchema = z.object({ message: z.string() });

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class CartApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "CartApiError";
  }
}

export function getCart(token: string) {
  return cartRequest("/api/cart", token);
}

export function addCartItem(token: string, productId: number, quantity = 1) {
  return cartRequest("/api/cart/items", token, {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(token: string, cartItemId: number, quantity: number) {
  return cartRequest(`/api/cart/items/${cartItemId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(token: string, cartItemId: number) {
  return cartRequest(`/api/cart/items/${cartItemId}`, token, { method: "DELETE" });
}

export function clearCart(token: string) {
  return cartRequest("/api/cart", token, { method: "DELETE" });
}

async function cartRequest(path: string, token: string, init: RequestInit = {}) {
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
    let message = "The cart could not be updated";
    try {
      message = apiErrorSchema.parse(await response.json()).message;
    } catch {
      // Keep the useful fallback when the response is not an API error payload.
    }
    throw new CartApiError(message, response.status);
  }

  return cartSchema.parse(await response.json());
}
