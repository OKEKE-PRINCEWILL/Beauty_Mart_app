import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Check,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getProducts } from "@/lib/api/products";
import { cn } from "@/lib/utils";

const categories = ["Skincare", "Makeup", "Body Care", "Lip Care"];

const promises = [
  {
    icon: ShieldCheck,
    title: "Carefully selected",
    copy: "A considered edit of beauty products for real, everyday routines.",
  },
  {
    icon: PackageCheck,
    title: "Lagos delivery",
    copy: "Straightforward local delivery, with clear updates along the way.",
  },
  {
    icon: Sparkles,
    title: "Beauty made simple",
    copy: "Easy browsing across skincare, makeup, body care, and lip care.",
  },
];

export default async function Home() {
  await connection();

  let products = null;

  try {
    products = await getProducts();
  } catch {
    products = null;
  }

  return (
    <>
      <section className="relative isolate min-h-[38rem] overflow-hidden bg-[#6b353b] sm:min-h-[44rem] lg:min-h-[calc(100svh-5rem)]">
        <Image
          src="/images/beauty-mart-hero.png"
          alt="A blush-toned arrangement of skincare bottles and jars"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(39,18,22,0.82)_0%,rgba(52,24,29,0.58)_42%,rgba(52,24,29,0.12)_78%)]" />
        <div className="relative mx-auto flex min-h-[38rem] max-w-7xl items-center px-5 py-20 sm:min-h-[44rem] sm:px-8 lg:min-h-[calc(100svh-5rem)] lg:px-12">
          <div className="max-w-3xl text-white">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Your everyday beauty edit
            </p>
            <h1 className="max-w-3xl font-heading text-5xl leading-[0.94] tracking-[-0.04em] text-balance sm:text-6xl lg:text-[5.5rem]">
              Beauty essentials your routine will love.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/82 sm:text-lg">
              Discover a thoughtful mix of skincare, makeup, body care, and lip
              essentials, delivered across Lagos.
            </p>
            <div className="mt-9 flex max-w-md flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full bg-[#321b20] px-7 text-white hover:bg-[#1d1013]"
                )}
              >
                View products
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="#our-story"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-full border-white bg-white px-7 text-[#321b20] hover:bg-white/90"
                )}
              >
                Discover Beauty Mart
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-[#eadbd6] bg-[#fbf6f2] py-6" aria-label="Product categories">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-7 gap-y-3 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#754d52] sm:justify-between sm:px-8 lg:px-12">
          {categories.map((category, index) => (
            <div key={category} className="flex items-center gap-7">
              <span>{category}</span>
              {index < categories.length - 1 && (
                <span className="hidden size-1 rounded-full bg-[#c79aa0] sm:block" aria-hidden="true" />
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 text-[#3f2529]">
            <MapPin className="size-4" aria-hidden="true" />
            Lagos delivery
          </div>
        </div>
      </section>

      <section id="our-story" className="bg-[#f7efea]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-12 lg:py-28">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#925e64]">
              Curated with intention
            </p>
            <h2 className="mt-5 font-heading text-4xl leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Make room for a ritual that feels like you.
            </h2>
            <p className="mt-6 text-base leading-7 text-[#6e5a56]">
              Beauty Mart brings everyday favourites into one calm, considered
              space. Build a routine around what your skin needs, the finish you
              love, and the moments that help you feel your best.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-[#4d3937]">
              {[
                "Skincare, makeup, body, and lip essentials",
                "A clean shopping experience with no clutter",
                "Local delivery within Lagos",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-[#ead4d2] text-[#6e343d]">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/shop"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-9 h-11 rounded-full border-[#5a3339] bg-transparent px-6 text-[#45262b] hover:bg-[#45262b] hover:text-white"
              )}
            >
              Explore the edit
            </Link>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[9rem] rounded-b-[1.5rem] bg-[#dfc4b7] shadow-[0_35px_80px_rgba(70,38,34,0.14)] sm:rounded-t-[13rem]">
            <Image
              src="/images/beauty-mart-ritual.png"
              alt="A woman applying moisturizer during her skincare routine"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#925e64]">
              From our shelves
            </p>
            <h2 className="mt-3 font-heading text-4xl italic tracking-[-0.03em] sm:text-5xl">
              Beauty favourites
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Explore customer-ready essentials served directly from the Beauty Mart catalog.
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="mt-11 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-11 overflow-hidden rounded-[1.75rem] border border-[#eadbd6] bg-[#fbf7f4]">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <div
                  key={category}
                  className={cn(
                    "flex min-h-44 flex-col justify-between border-[#eadbd6] p-6",
                    index < categories.length - 1 && "border-b lg:border-b-0 lg:border-r",
                    index === 1 && "sm:border-b lg:border-b-0",
                    index % 2 === 0 && "sm:border-r"
                  )}
                >
                  <span className="font-heading text-2xl">{category}</span>
                  <span className="text-xs uppercase tracking-[0.17em] text-[#987a74]">
                    Catalog preview
                  </span>
                </div>
              ))}
            </div>
            <p className="border-t border-[#eadbd6] px-6 py-4 text-center text-sm text-[#806963]">
              Product details will appear as soon as the Beauty Mart API is available.
            </p>
          </div>
        )}
      </section>

      <section className="px-3 sm:px-5">
        <div className="relative mx-auto min-h-[34rem] max-w-[94rem] overflow-hidden rounded-[2rem] bg-[#2d171b] text-white">
          <Image
            src="/images/beauty-mart-hero.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[72%_center] opacity-40"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#2a1519_5%,rgba(42,21,25,0.93)_37%,rgba(42,21,25,0.2)_76%)]" />
          <div className="relative flex min-h-[34rem] items-center px-7 py-16 sm:px-12 lg:px-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e0b9bb]">
                The complete beauty ritual
              </p>
              <h2 className="mt-5 font-heading text-4xl leading-[1.03] tracking-[-0.035em] sm:text-6xl">
                Your shelf deserves a little everyday luxury.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/72">
                Start with the essentials, discover something new, and build a
                collection that works beautifully together.
              </p>
              <Link
                href="/shop"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "mt-8 h-12 rounded-full bg-white px-7 text-[#321b20] hover:bg-[#f8eded]"
                )}
              >
                Shop the collection
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.27em] text-[#925e64]">
          The Beauty Mart promise
        </p>
        <blockquote className="mx-auto mt-7 max-w-4xl font-heading text-3xl italic leading-[1.22] tracking-[-0.025em] text-[#3d2729] sm:text-5xl">
          “Your everyday beauty edit should feel simple, personal, and worth coming back to.”
        </blockquote>
        <div className="mt-14 grid gap-4 text-left md:grid-cols-3">
          {promises.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-[1.5rem] border border-[#eadbd6] bg-[#fbf7f4] p-7">
              <span className="grid size-11 place-items-center rounded-full bg-[#edd7d5] text-[#683840]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 font-heading text-2xl">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#77635e]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#e6b7b7] px-5 py-6 text-[#3b2226] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-heading text-2xl">Beauty, delivered within Lagos.</p>
            <p className="mt-1 text-sm text-[#5f3d42]">Find your next everyday favourite in the Beauty Mart edit.</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.13em] underline-offset-4 hover:underline"
          >
            Browse products <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
