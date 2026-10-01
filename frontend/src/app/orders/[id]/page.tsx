"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { OrderDetails } from "@/components/order-details";
import { getOrder, type Order } from "@/lib/api/orders";

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  const orderId = /^\d+$/.test(params.id) ? Number(params.id) : null;
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

  if (!user) return <OrderMessage title="Sign in to view this order" description="Order details are only available to the account that placed the order." href="/login" action="Continue with Google" />;
  if (!orderId || error || !order) return <OrderMessage title="Order not found" description={error ?? "This order does not exist or does not belong to your account."} href="/orders" action="Back to your orders" />;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <Link href="/orders" className="mb-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#76545a] hover:text-[#a15b67]"><ArrowLeft className="size-4" aria-hidden="true" />All orders</Link>
      <OrderDetails order={order} />
    </section>
  );
}

function OrderMessage({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-heading text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-[#74605b]">{description}</p>
      <Link href={href} className="mt-8 inline-flex h-12 items-center rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white">{action}</Link>
    </section>
  );
}
