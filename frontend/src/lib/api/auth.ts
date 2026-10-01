import { z } from "zod";

const authUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().nullable(),
  profilePictureUrl: z.url().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const authResponseSchema = z.object({
  token: z.string().min(1),
  user: authUserSchema,
});

const apiErrorSchema = z.object({
  message: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
export const authTokenKey = "beauty-mart-auth-token";

export async function authenticateWithGoogle(credential: string): Promise<AuthResponse> {
  const response = await fetch(`${apiUrl}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });

  if (!response.ok) {
    throw new Error(await responseMessage(response, "Google sign-in failed"));
  }

  return authResponseSchema.parse(await response.json());
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await responseMessage(response, "Your session has expired"));
  }

  return authUserSchema.parse(await response.json());
}

async function responseMessage(response: Response, fallback: string) {
  try {
    const body = apiErrorSchema.parse(await response.json());
    return body.message;
  } catch {
    return fallback;
  }
}
