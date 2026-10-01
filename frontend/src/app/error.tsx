"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#f2dedd] text-[#7c4149]">
        <AlertCircle className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-7 font-heading text-4xl sm:text-5xl">Something needs another moment</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#77635e]">We could not load this part of Beauty Mart. Try again, or return to the shop.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white hover:bg-[#291519]"><RefreshCw className="size-4" aria-hidden="true" />Try again</button>
        <Link href="/shop" className="inline-flex h-12 items-center justify-center rounded-full border border-[#b78e8b] px-7 text-sm font-semibold text-[#59383e] hover:bg-[#f5e9e5]">Return to shop</Link>
      </div>
    </section>
  );
}
