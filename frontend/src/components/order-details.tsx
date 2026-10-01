import Link from "next/link";
import { MapPin, PackageCheck, UserRound } from "lucide-react";
import type { Order } from "@/lib/api/orders";
import { currencyFormatter, dateFormatter } from "@/lib/format";

export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section className="overflow-hidden rounded-[1.75rem] border border-[#eadfda] bg-[#fffdfa]">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eadfda] p-5 sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98666c]">Order</p>
            <h2 className="mt-2 font-heading text-3xl">{order.orderNumber}</h2>
            <p className="mt-2 text-sm text-[#7a6560]">Placed {dateFormatter.format(new Date(order.createdAt))}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
            <PackageCheck className="size-4" aria-hidden="true" />
            {order.status}
          </span>
        </div>

        <div className="divide-y divide-[#eadfda] px-5 sm:px-7">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-5 py-5">
              <div className="min-w-0">
                <p className="font-semibold text-[#40292d]">{item.productName}</p>
                <p className="mt-1 text-sm text-[#7b6661]">
                  {currencyFormatter.format(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 font-semibold">{currencyFormatter.format(item.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-[#eadfda] bg-[#fbf5f2] p-5 text-sm sm:p-7">
          <div className="flex justify-between text-[#715d58]">
            <span>Subtotal</span>
            <span>{currencyFormatter.format(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#715d58]">
            <span>Delivery</span>
            <span>{currencyFormatter.format(order.total - order.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#ddcbc5] pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-heading text-2xl">{currencyFormatter.format(order.total)}</span>
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-[1.5rem] bg-[#f2e4df] p-6">
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-[#804c55]" aria-hidden="true" />
            <h2 className="font-heading text-xl">Delivery</h2>
          </div>
          <p className="mt-4 text-sm font-semibold">{order.deliveryArea}, Lagos</p>
          <p className="mt-2 text-sm leading-6 text-[#715c57]">{order.deliveryAddress}</p>
        </section>

        <section className="rounded-[1.5rem] border border-[#eadfda] bg-[#fffdfa] p-6">
          <div className="flex items-center gap-3">
            <UserRound className="size-5 text-[#804c55]" aria-hidden="true" />
            <h2 className="font-heading text-xl">Contact</h2>
          </div>
          <p className="mt-4 text-sm font-semibold">{order.fullName}</p>
          <p className="mt-2 break-all text-sm text-[#715c57]">{order.email}</p>
          <p className="mt-1 text-sm text-[#715c57]">{order.phoneNumber}</p>
        </section>

        <Link href="/shop" className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#b78e8b] text-sm font-semibold text-[#59383e] hover:bg-[#f5e9e5]">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
