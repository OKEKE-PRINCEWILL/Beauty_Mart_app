"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getOrder, type Order } from "@/lib/api/orders";
import { currencyFormatter } from "@/lib/format";

export function OrderSuccessContent({ orderId }: { orderId: number | null }) {
  const { user, token, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!token || !orderId) return;
    void getOrder(token, orderId)
      .then((value) => active && setOrder(value))
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "The order could not be loaded");
      });
    return () => { active = false; };
  }, [orderId, token]);

  if (authLoading || (user && token && orderId && !order && !error)) {
    return <div className="grid min-h-[55vh] place-items-center"><LoaderCircle className="size-7 animate-spin text-[#7a444c]" aria-label="Loading order" /></div>;
  }

  if (!user) return <SuccessMessage title="Sign in to see this order" description="Your order receipt is connected to the account used at checkout." />;
  if (!orderId || error || !order) return <SuccessMessage title="Order receipt unavailable" description={error ?? "Open your order history to find your recent purchases."} />;

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
      <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-800">
        <Check className="size-9" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-[#97626a]">Order confirmed</p>
      <h1 className="mt-3 font-heading text-5xl tracking-[-0.035em] sm:text-6xl">Thank you, {order.fullName.split(" ")[0]}</h1>
      <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#74605b]">
        We received order <strong className="text-[#452c31]">{order.orderNumber}</strong>. Your {order.items.length === 1 ? "item" : `${order.items.length} items`} will be delivered to {order.deliveryArea}, Lagos.
      </p>

      <div className="mx-auto mt-8 flex max-w-md items-center justify-between rounded-2xl bg-[#f2e5e1] px-5 py-4 text-left">
        <span className="text-sm text-[#715b57]">Order total</span>
        <span className="font-heading text-2xl">{currencyFormatter.format(order.total)}</span>
      </div>

      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={`/orders/${order.id}`} className="inline-flex h-12 items-center justify-center rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white hover:bg-[#291519]">View order details</Link>
        <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-full border border-[#b78e8b] px-7 text-sm font-semibold text-[#59383e] hover:bg-[#f5e9e5]">Continue shopping</Link>
      </div>
    </section>
  );
}

function SuccessMessage({ title, description }: { title: string; description: string }) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-heading text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-[#74605b]">{description}</p>
      <Link href="/orders" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white">View your orders</Link>
    </section>
  );
}
