"use client";

import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import {
  ArrowRight,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { currencyFormatter } from "@/lib/format";
import { useToast } from "@/components/toast-provider";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading, mutating, error, updateItem, removeItem, clearCart } = useCart();
  const toast = useToast();

  async function handleRemove(itemId: number, productName: string) {
    try {
      await removeItem(itemId);
      toast({ title: "Removed from cart", description: `${productName} was removed.` });
    } catch (requestError) {
      toast({ title: "Could not update your cart", description: requestError instanceof Error ? requestError.message : "Please try again.", tone: "error" });
    }
  }

  async function handleClear() {
    try {
      await clearCart();
      toast({ title: "Cart cleared", description: "Your saved cart is now empty." });
    } catch (requestError) {
      toast({ title: "Could not clear your cart", description: requestError instanceof Error ? requestError.message : "Please try again.", tone: "error" });
    }
  }

  if (authLoading || (user && loading)) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <LoaderCircle className="size-7 animate-spin text-[#7a444c]" aria-label="Loading cart" />
      </div>
    );
  }

  if (!user) {
    return (
      <CartMessage
        title="Sign in to view your cart"
        description="Your Beauty Mart cart is saved securely to your account and stays available between visits."
        actionHref="/login"
        actionLabel="Continue with Google"
      />
    );
  }

  if (cart.items.length === 0) {
    return (
      <CartMessage
        title="Your cart is ready for something beautiful"
        description="Browse the Beauty Mart edit and add your everyday skincare, makeup, body, and lip favourites."
        actionHref="/shop"
        actionLabel="Browse products"
      />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <div className="flex flex-col gap-4 border-b border-[#eadfda] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#98666c]">Your selection</p>
          <h1 className="mt-3 font-heading text-5xl tracking-[-0.035em]">Shopping cart</h1>
          <p className="mt-3 text-sm text-[#78645f]">
            {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}, saved to your account.
          </p>
        </div>
        <button
          type="button"
          disabled={mutating}
          onClick={() => void handleClear()}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#7d4a52] hover:text-[#4a272d] disabled:opacity-50"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Clear cart
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-5">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="grid grid-cols-[6.5rem_1fr] gap-5 rounded-[1.5rem] border border-[#eadfda] bg-[#fffdfa] p-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center sm:p-5"
            >
              <Link href={`/products/${item.product.id}`} className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3ebe7]">
                <ProductImage
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  unoptimized
                  sizes="128px"
                  className="object-cover"
                />
              </Link>

              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#96716e]">
                  {item.product.brand} · {item.product.category}
                </p>
                <Link href={`/products/${item.product.id}`} className="hover:text-[#8d4f59]">
                  <h2 className="mt-2 font-heading text-xl leading-6">{item.product.name}</h2>
                </Link>
                <p className="mt-2 text-sm text-[#765e5a]">{currencyFormatter.format(item.product.price)} each</p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-[#d9c4be] bg-white">
                    <button
                      type="button"
                      disabled={mutating || item.quantity <= 1}
                      onClick={() => void updateItem(item.id, item.quantity - 1).catch(() => undefined)}
                      className="grid size-9 place-items-center rounded-full hover:bg-[#f5e9e5] disabled:opacity-35"
                      aria-label={`Decrease ${item.product.name} quantity`}
                    >
                      <Minus className="size-3.5" aria-hidden="true" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold" aria-label={`Quantity ${item.quantity}`}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={mutating || item.quantity >= item.product.stock}
                      onClick={() => void updateItem(item.id, item.quantity + 1).catch(() => undefined)}
                      className="grid size-9 place-items-center rounded-full hover:bg-[#f5e9e5] disabled:opacity-35"
                      aria-label={`Increase ${item.product.name} quantity`}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={mutating}
                    onClick={() => void handleRemove(item.id, item.product.name)}
                    className="text-xs font-semibold text-[#8a555d] hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="col-span-2 text-right font-heading text-xl text-[#58323a] sm:col-span-1">
                {currencyFormatter.format(item.lineTotal)}
              </p>
            </article>
          ))}
        </div>

        <aside className="rounded-[1.75rem] bg-[#f3e6e1] p-6 sm:p-8 lg:sticky lg:top-28">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8c5d63]">Order summary</p>
          <div className="mt-6 flex items-center justify-between border-b border-[#d9c3bd] pb-5">
            <span className="text-sm text-[#705a56]">Subtotal</span>
            <span className="font-heading text-2xl">{currencyFormatter.format(cart.subtotal)}</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#715a56]">
            Delivery is available within Lagos. Delivery details will be collected at checkout.
          </p>
          <Link
            href="/checkout"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3b2025] px-6 text-sm font-semibold text-white transition hover:bg-[#291519]"
          >
            Continue to checkout
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link href="/shop" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#673c43] hover:underline">
            Continue shopping
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}

function CartMessage({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#edd8d5] text-[#673a42]">
        <ShoppingBag className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-7 font-heading text-4xl sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#77635e]">{description}</p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white hover:bg-[#291519]"
      >
        {actionLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
