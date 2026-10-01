import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getProducts, type Product } from "@/lib/api/products";
import { cn } from "@/lib/utils";

function categoryId(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function groupProducts(products: Product[]) {
  return products.reduce<Map<string, Product[]>>((groups, product) => {
    const categoryProducts = groups.get(product.category) ?? [];
    categoryProducts.push(product);
    groups.set(product.category, categoryProducts);
    return groups;
  }, new Map());
}

export default async function ShopPage() {
  await connection();

  let products: Product[] | null = null;

  try {
    products = await getProducts();
  } catch {
    products = null;
  }

  const groupedProducts: Map<string, Product[]> = products
    ? groupProducts(products)
    : new Map<string, Product[]>();

  return (
    <>
      <section className="border-b border-[#eadbd6] bg-[#f4e7e2]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#925e64]">
            The Beauty Mart edit
          </p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="max-w-3xl font-heading text-5xl leading-[0.98] tracking-[-0.04em] sm:text-6xl">
              Find your everyday favourites.
            </h1>
            <p className="max-w-md text-sm leading-6 text-[#725d59] sm:text-base">
              Browse skincare, makeup, body care, and lip essentials selected
              for routines that feel simple and personal.
            </p>
          </div>

          {products && products.length > 0 && (
            <nav className="mt-10 flex flex-wrap gap-2" aria-label="Product categories">
              {[...groupedProducts.keys()].map((category) => (
                <Link
                  key={category}
                  href={`#${categoryId(category)}`}
                  className="rounded-full border border-[#c9aaa8] bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#57383d] transition hover:bg-white"
                >
                  {category}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        {products && products.length > 0 ? (
          <div className="space-y-20">
            {[...groupedProducts.entries()].map(([category, categoryProducts]) => (
              <section
                key={category}
                id={categoryId(category)}
                className="scroll-mt-28"
              >
                <div className="mb-8 flex items-end justify-between border-b border-[#eadfda] pb-4">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#98726f]">
                      Shop the category
                    </p>
                    <h2 className="mt-2 font-heading text-3xl sm:text-4xl">
                      {category}
                    </h2>
                  </div>
                  <span className="text-sm text-[#856d68]">
                    {categoryProducts.length} {categoryProducts.length === 1 ? "product" : "products"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
                  {categoryProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="rounded-[2rem] border border-[#eadbd6] bg-[#fbf7f4] px-6 py-16 text-center sm:px-10">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#edd8d5] text-[#6c3d44]">
              <PackageSearch className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 font-heading text-3xl">The catalog is taking a moment.</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#77635e]">
              We could not reach the Beauty Mart product service. Please try
              again when the backend is available.
            </p>
            <Link
              href="/shop"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-7 h-11 rounded-full bg-[#45262b] px-6 text-white hover:bg-[#2f191d]"
              )}
            >
              Try again
              <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
