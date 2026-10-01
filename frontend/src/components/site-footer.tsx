import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-[#241316] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-12 lg:py-20">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Beauty Mart home">
            <span className="grid size-14 place-items-center rounded-full border border-white/35 bg-[#e2b4b7] font-heading text-sm font-bold tracking-[0.08em] text-[#3c2227]">
              BM
            </span>
            <span className="font-heading text-2xl">Beauty Mart</span>
          </Link>
          <p className="mt-6 text-sm leading-7 text-white/64">
            A thoughtfully curated destination for skincare, makeup, body care,
            and lip essentials, delivered within Lagos.
          </p>
          <p className="mt-5 flex items-center gap-2 text-sm text-[#ddb9bc]">
            <MapPin className="size-4" aria-hidden="true" /> Lagos, Nigeria
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ddb9bc]">Explore</p>
          <div className="mt-5 space-y-3 text-sm text-white/72">
            <Link className="block hover:text-white" href="/">Home</Link>
            <Link className="block hover:text-white" href="/shop">All products</Link>
            <Link className="block hover:text-white" href="/#our-story">Our story</Link>
          </div>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ddb9bc]">Shopping</p>
          <div className="mt-5 space-y-3 text-sm text-white/72">
            <p>Delivery within Lagos</p>
            <p>Secure account checkout</p>
            <Link className="inline-flex items-center gap-1 hover:text-white" href="/shop">
              Browse the edit <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span>© {new Date().getFullYear()} Beauty Mart. All rights reserved.</span>
          <span>Beauty for every day.</span>
        </div>
      </div>
    </footer>
  );
}
