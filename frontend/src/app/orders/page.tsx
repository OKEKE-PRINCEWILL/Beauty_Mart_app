"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, PackageOpen } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getOrders, type Order } from "@/lib/api/orders";
import { currencyFormatter, dateFormatter } from "@/lib/format";

export default function OrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) return;
    void getOrders(token)
      .then((value) => active && setOrders(value))
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Your orders could not be loaded");
      });
    return () => { active = false; };
  }, [token]);

  if (authLoading || (user && token && orders === null && !error)) {
    return <div className="grid min-h-[55vh] place-items-center"><LoaderCircle className="size-7 animate-spin text-[#7a444c]" aria-label="Loading orders" /></div>;
  }
  if (!user) return <EmptyOrders title="Sign in to view your orders" description="Your Beauty Mart order history is saved securely to your account." href="/login" action="Continue with Google" />;

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#98666c]">Your account</p>
      <h1 className="mt-3 font-heading text-5xl tracking-[-0.035em] sm:text-6xl">Orders</h1>
      <p className="mt-4 text-sm text-[#75615c]">Review your confirmed purchases and delivery details.</p>

      {error ? (
        <div role="alert" className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>
      ) : orders?.length === 0 ? (
        <EmptyOrders title="No orders yet" description="Your confirmed purchases will appear here after checkout." href="/shop" action="Browse products" />
      ) : (
        <div className="mt-10 space-y-4">
          {orders?.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="group grid gap-5 rounded-[1.5rem] border border-[#eadfda] bg-[#fffdfa] p-5 transition hover:border-[#caa9a5] hover:shadow-md sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-heading text-2xl">{order.orderNumber}</h2>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-emerald-800">{order.status}</span>
                </div>
                <p className="mt-2 text-sm text-[#77635e]">{dateFormatter.format(new Date(order.createdAt))} · {order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
              </div>
              <div className="flex items-center justify-between gap-5 sm:justify-end">
                <span className="font-heading text-xl">{currencyFormatter.format(order.total)}</span>
                <ArrowRight className="size-5 text-[#8b5c63] transition group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyOrders({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-[1.75rem] bg-[#f3e6e1] px-6 py-14 text-center">
      <PackageOpen className="mx-auto size-10 text-[#7a4a52]" aria-hidden="true" />
      <h2 className="mt-5 font-heading text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#75615c]">{description}</p>
      <Link href={href} className="mt-7 inline-flex h-11 items-center rounded-full bg-[#3b2025] px-6 text-sm font-semibold text-white">{action}</Link>
    </div>
  );
}
