"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { X } from "lucide-react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/api/products";
import { currencyFormatter } from "@/lib/format";

type ProductQuickViewContextValue = {
  openProduct: (product: Product) => void;
};

const ProductQuickViewContext = createContext<ProductQuickViewContextValue | null>(null);

export function ProductQuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const close = useCallback(() => setProduct(null), []);

  useEffect(() => {
    if (!product) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, product]);

  const value = useMemo(
    () => ({ openProduct: setProduct }),
    []
  );

  return (
    <ProductQuickViewContext.Provider value={value}>
      {children}
      {product && (
        <div className="fixed inset-0 z-[70]" role="presentation">
          <button
            type="button"
            aria-label="Close product preview"
            onClick={close}
            className="absolute inset-0 animate-in fade-in bg-[#2b171b]/45 backdrop-blur-[2px] duration-200"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[31rem] animate-in slide-in-from-right flex-col overflow-y-auto bg-[#fffdfa] shadow-[-20px_0_60px_rgba(44,22,27,0.18)] duration-300"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eadfda] bg-[#fffdfa]/95 px-5 py-4 backdrop-blur sm:px-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8e6267]">
                Product preview
              </p>
              <button
                type="button"
                onClick={close}
                className="grid size-10 place-items-center rounded-full border border-[#decac4] text-[#4f3035] hover:bg-[#f5e9e5]"
                aria-label="Close product preview"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="px-5 pb-10 pt-6 sm:px-7">
              <div className="relative mx-auto aspect-[4/4.6] w-full max-w-[20rem] overflow-hidden rounded-[1.6rem] bg-[#f3ebe7]">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  unoptimized
                  sizes="320px"
                  className="object-cover"
                  priority
                />
              </div>

              <p className="mt-7 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#94666b]">
                {product.brand} · {product.category}
              </p>
              <h2 id="quick-view-title" className="mt-3 font-heading text-4xl leading-[1.05] tracking-[-0.03em]">
                {product.name}
              </h2>
              <p className="mt-4 font-heading text-2xl text-[#60343c]">
                {currencyFormatter.format(product.price)}
              </p>
              <p className="mt-5 text-sm leading-7 text-[#6f5b57]">{product.description}</p>

              <div className="mt-6 flex items-center gap-3 border-y border-[#eadfda] py-4">
                <span className={`size-2 rounded-full ${product.stock > 0 ? "bg-emerald-600" : "bg-[#a15b67]"}`} />
                <p className="text-sm font-medium">
                  {product.stock > 0 ? `${product.stock} available` : "Currently out of stock"}
                </p>
              </div>

              <AddToCartButton productId={product.id} stock={product.stock} />
            </div>
          </aside>
        </div>
      )}
    </ProductQuickViewContext.Provider>
  );
}

export function useProductQuickView() {
  const context = useContext(ProductQuickViewContext);
  if (!context) {
    throw new Error("useProductQuickView must be used within ProductQuickViewProvider");
  }
  return context;
}
