"use client";

import { useState } from "react";
import { Check, LoaderCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/components/toast-provider";

type AddToCartButtonProps = {
  productId: number;
  stock: number;
};

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const { addItem, loading: cartLoading, mutating } = useCart();
  const router = useRouter();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!user) {
      router.push("/login");
      return;
    }

    setError(null);
    try {
      await addItem(productId);
      setAdded(true);
      toast({ title: "Added to your cart", description: "Your selection is saved to your account." });
      window.setTimeout(() => setAdded(false), 1800);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add this item");
      toast({
        title: "Could not add this item",
        description: requestError instanceof Error ? requestError.message : "Please try again.",
        tone: "error",
      });
    }
  }

  const disabled = authLoading || cartLoading || mutating || stock < 1;

  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={disabled}
        onClick={handleAdd}
        className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#3b2025] px-7 text-sm font-semibold text-white transition hover:bg-[#291519] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {mutating ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : added ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <ShoppingBag className="size-4" aria-hidden="true" />
        )}
        {stock < 1 ? "Out of stock" : added ? "Added to cart" : user ? "Add to cart" : "Sign in to add to cart"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
