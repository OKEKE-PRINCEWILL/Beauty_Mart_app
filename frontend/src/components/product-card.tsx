"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useProductQuickView } from "@/components/product-quick-view";
import type { Product } from "@/lib/api/products";
import { currencyFormatter } from "@/lib/format";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { openProduct } = useProductQuickView();

  return (
    <article className="group flex h-full flex-col">
      <button
        type="button"
        onClick={() => openProduct(product)}
        className="relative block aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-[#f3ebe7] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8d4f59]"
        aria-label={`Preview ${product.name}`}
      >
        <span className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-[#553138] backdrop-blur sm:left-3 sm:top-3">
          {product.stock > 0 ? "In stock" : "Out of stock"}
        </span>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      </button>
      <p className="mt-3 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[#8a6c67] sm:mt-4 sm:text-[0.62rem]">
        {product.brand} · {product.category}
      </p>
      <button type="button" onClick={() => openProduct(product)} className="mt-1.5 text-left hover:text-[#89505a]">
        <h3 className="font-heading text-base leading-5 sm:text-lg sm:leading-6">{product.name}</h3>
      </button>
      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#78645f]">
        {product.description}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#eadfda] pt-3">
        <p className="text-sm font-medium text-[#573139]">
          {currencyFormatter.format(product.price)}
        </p>
        <button
          type="button"
          onClick={() => openProduct(product)}
          className="inline-flex items-center gap-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-[#573139] hover:text-[#a15b67]"
        >
          View
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
