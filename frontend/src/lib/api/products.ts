import { z } from "zod";

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  imageUrl: z.url(),
  category: z.string().min(1),
  stock: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const productListSchema = z.array(productSchema);

export type Product = z.infer<typeof productSchema>;

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class ProductApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ProductApiError";
  }
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${apiUrl}/api/products`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new ProductApiError(
      `Product request failed with status ${response.status}`,
      response.status
    );
  }

  return productListSchema.parse(await response.json());
}

export async function getProduct(id: number): Promise<Product> {
  const response = await fetch(`${apiUrl}/api/products/${id}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new ProductApiError(
      `Product request failed with status ${response.status}`,
      response.status
    );
  }

  return productSchema.parse(await response.json());
}
