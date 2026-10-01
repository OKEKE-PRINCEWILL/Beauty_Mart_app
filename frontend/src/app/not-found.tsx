import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#edd8d5] text-[#673a42]"><SearchX className="size-7" aria-hidden="true" /></span>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-[#98666c]">404</p>
      <h1 className="mt-3 font-heading text-4xl sm:text-5xl">This page is not on our shelf</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#77635e]">The page may have moved, or the address may be incorrect.</p>
      <Link href="/shop" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white hover:bg-[#291519]">Browse products</Link>
    </section>
  );
}
