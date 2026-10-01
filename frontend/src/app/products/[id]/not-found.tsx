import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProductNotFound() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a6a70]">
        Product not found
      </p>
      <h1 className="mt-4 font-heading text-4xl sm:text-5xl">
        That beauty favourite is not on our shelf.
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#77635e]">
        It may have moved or no longer be available. Browse the current Beauty
        Mart collection to find another option.
      </p>
      <Link
        href="/shop"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-8 rounded-full bg-[#45262b] px-6 text-white hover:bg-[#2f191d]"
        )}
      >
        <ArrowLeft aria-hidden="true" />
        Browse products
      </Link>
    </section>
  );
}
