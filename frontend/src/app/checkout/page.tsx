"use client";

import { type FormEvent, useState } from "react";
import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, LockKeyhole, MapPin } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { currencyFormatter } from "@/lib/format";
import { createOrder } from "@/lib/api/orders";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "Enter your full name"),
  email: z.email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^(?:\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  deliveryAddress: z
    .string()
    .trim()
    .min(10, "Enter a complete delivery address"),
  deliveryArea: z.preprocess(
    (value) => value ?? "",
    z.string().min(1, "Select your delivery area")
  ),
});

type CheckoutField = keyof z.infer<typeof checkoutSchema>;
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

const lagosAreas = [
  "Ajah",
  "Festac",
  "Gbagada",
  "Ikeja",
  "Ikoyi",
  "Lekki",
  "Maryland",
  "Surulere",
  "Victoria Island",
  "Yaba",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  if (authLoading || (user && cartLoading)) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <LoaderCircle className="size-7 animate-spin text-[#7a444c]" aria-label="Loading checkout" />
      </div>
    );
  }

  if (!user) {
    return (
      <CheckoutMessage
        title="Sign in before checkout"
        description="Your delivery details and order will be connected securely to your Beauty Mart account."
        href="/login"
        action="Continue with Google"
      />
    );
  }

  if (cart.items.length === 0) {
    return (
      <CheckoutMessage
        title="Your cart is empty"
        description="Add at least one beauty essential before continuing to checkout."
        href="/shop"
        action="Browse products"
      />
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || placingOrder) return;
    setSubmissionError(null);
    const formData = new FormData(event.currentTarget);
    const result = checkoutSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]])
        ) as CheckoutErrors
      );
      return;
    }

    setErrors({});
    setPlacingOrder(true);
    try {
      const order = await createOrder(token, result.data);
      await refreshCart();
      router.push(`/order-success?orderId=${order.id}`);
    } catch (requestError) {
      setSubmissionError(
        requestError instanceof Error ? requestError.message : "Your order could not be placed"
      );
      setPlacingOrder(false);
    }
  }

  const defaultFullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#76545a] hover:text-[#a15b67]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to cart
      </Link>

      <div className="mt-7 border-b border-[#eadfda] pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#98666c]">Delivery details</p>
        <h1 className="mt-3 font-heading text-5xl tracking-[-0.035em] sm:text-6xl">Checkout</h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f2e5e1] px-4 py-2 text-sm font-medium text-[#633b42]">
          <MapPin className="size-4" aria-hidden="true" />
          Delivery is currently available within Lagos only
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <form onSubmit={handleSubmit} noValidate className="rounded-[1.75rem] border border-[#eadfda] bg-[#fffdfa] p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-[#eedbd7] font-heading text-lg text-[#663a42]">1</span>
            <div>
              <h2 className="font-heading text-2xl">Contact and delivery</h2>
              <p className="mt-1 text-sm text-[#79645f]">Tell us where your Beauty Mart order should go.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Field label="Full name" name="fullName" error={errors.fullName}>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={defaultFullName}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                className={inputClass}
              />
            </Field>

            <Field label="Email address" name="email" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                className={inputClass}
              />
            </Field>

            <Field label="Phone number" name="phoneNumber" error={errors.phoneNumber} hint="For example: 08012345678">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="tel"
                placeholder="0801 234 5678"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phoneNumber)}
                className={inputClass}
              />
            </Field>

            <Field label="Area / LGA" name="deliveryArea" error={errors.deliveryArea}>
              <select
                id="deliveryArea"
                name="deliveryArea"
                defaultValue=""
                aria-invalid={Boolean(errors.deliveryArea)}
                className={inputClass}
              >
                <option value="" disabled>Select an area</option>
                {lagosAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Delivery address" name="deliveryAddress" error={errors.deliveryAddress} hint="Include house number, street, and a nearby landmark when helpful.">
                <textarea
                  id="deliveryAddress"
                  name="deliveryAddress"
                  rows={4}
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.deliveryAddress)}
                  className={`${inputClass} resize-none py-3`}
                />
              </Field>
            </div>
          </div>

          {submissionError && (
            <div role="alert" className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">
              {submissionError}
            </div>
          )}

          <button
            type="submit"
            disabled={placingOrder}
            className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b2025] px-6 text-sm font-semibold text-white transition hover:bg-[#291519] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {placingOrder ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <LockKeyhole className="size-4" aria-hidden="true" />
            )}
            {placingOrder ? "Placing order…" : "Place order"}
          </button>
        </form>

        <aside className="rounded-[1.75rem] bg-[#f3e6e1] p-5 sm:p-7 lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl">Order summary</h2>
            <Link href="/cart" className="text-xs font-semibold uppercase tracking-[0.1em] text-[#74464e] hover:underline">Edit cart</Link>
          </div>

          <div className="mt-6 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#eadbd6]">
                  <ProductImage
                    src={item.product.imageUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.product.name}</p>
                  <p className="mt-1 text-xs text-[#78615d]">Qty {item.quantity} · {currencyFormatter.format(item.product.price)}</p>
                </div>
                <p className="text-sm font-semibold">{currencyFormatter.format(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-3 border-t border-[#d9c3bd] pt-5 text-sm">
            <div className="flex justify-between text-[#6f5753]">
              <span>Subtotal</span>
              <span>{currencyFormatter.format(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6f5753]">
              <span>Delivery</span>
              <span>₦0</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#d9c3bd] pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-heading text-2xl">{currencyFormatter.format(cart.subtotal)}</span>
            </div>
          </div>

          <p className="mt-5 text-xs leading-5 text-[#78615d]">
            Prices shown here come from your saved cart. The backend will confirm final prices when the order is placed.
          </p>
        </aside>
      </div>
    </section>
  );
}

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-[#dac6c0] bg-white px-4 text-sm outline-none transition placeholder:text-[#aa9490] focus:border-[#8b555e] focus:ring-2 focus:ring-[#d8b8b8]/50 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-100";

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: CheckoutField;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-[#4f3439]">{label}</label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-red-700">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[#8a7470]">{hint}</p>
      ) : null}
    </div>
  );
}

function CheckoutMessage({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#edd8d5] text-[#673a42]">
        <LockKeyhole className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-7 font-heading text-4xl sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#77635e]">{description}</p>
      <Link href={href} className="mt-8 inline-flex h-12 items-center rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white hover:bg-[#291519]">
        {action}
      </Link>
    </section>
  );
}
