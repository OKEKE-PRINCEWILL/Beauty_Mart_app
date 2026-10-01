import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AddToCartButton } from "@/components/add-to-cart-button";
import {
  getProduct,
  ProductApiError,
  type Product,
} from "@/lib/api/products";
import { currencyFormatter } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function ProductPage({
  params,
}: PageProps<"/products/[id]">) {
  await connection();
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  let product: Product | null = null;
  let unavailable = false;

  try {
    product = await getProduct(Number(id));
  } catch (error) {
    if (error instanceof ProductApiError && error.status === 404) {
      notFound();
    }
    unavailable = true;
  }

  if (unavailable || !product) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-heading text-4xl">This product could not be loaded.</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#77635e]">
          The Beauty Mart product service is currently unavailable. Return to
          the shop and try again shortly.
        </p>
        <Link
          href="/shop"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-8 rounded-full border-[#5a3339] px-6"
          )}
        >
          <ArrowLeft aria-hidden="true" />
          Back to shop
        </Link>
      </section>
    );
  }

  return (
    <article className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#76545a] hover:text-[#a15b67]"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to all products
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1fr)] lg:gap-14">
        <div className="relative mx-auto aspect-[4/4.6] w-full max-w-[22rem] overflow-hidden rounded-[2rem] bg-[#f3ebe7] sm:max-w-[27rem] lg:max-w-[30rem]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            unoptimized
            priority
            sizes="(max-width: 640px) 352px, (max-width: 1024px) 432px, 480px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col lg:py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a6a70]">
            {product.brand} · {product.category}
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            {product.name}
          </h1>
          <p className="mt-6 font-heading text-3xl text-[#60343c]">
            {currencyFormatter.format(product.price)}
          </p>
          <p className="mt-7 text-base leading-8 text-[#6f5b57]">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-3 border-y border-[#eadfda] py-5">
            <span
              className={cn(
                "size-2 rounded-full",
                product.stock > 0 ? "bg-emerald-600" : "bg-[#a15b67]"
              )}
              aria-hidden="true"
            />
            <p className="text-sm font-medium">
              {product.stock > 0
                ? `${product.stock} available and ready to order`
                : "Currently out of stock"}
            </p>
          </div>

          <AddToCartButton productId={product.id} stock={product.stock} />

          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl bg-[#f8f1ed] p-5">
              <ShieldCheck className="size-5 text-[#7a444c]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">Thoughtfully selected</p>
            </div>
            <div className="rounded-2xl bg-[#f8f1ed] p-5">
              <PackageCheck className="size-5 text-[#7a444c]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">Carefully prepared</p>
            </div>
            <div className="rounded-2xl bg-[#f8f1ed] p-5">
              <MapPin className="size-5 text-[#7a444c]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">Lagos delivery</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
