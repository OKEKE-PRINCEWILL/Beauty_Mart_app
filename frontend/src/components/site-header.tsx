"use client";

import Image from "next/image";
import Link from "next/link";
import { LogIn, LogOut, Menu, Package, Search, ShoppingBag } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const utilityButtonClass = cn(
  buttonVariants({ variant: "ghost", size: "icon" }),
  "text-[#43282d] disabled:opacity-55"
);

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "All products" },
  { href: "/#our-story", label: "Our story" },
];

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const { cart, loading: cartLoading } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[#eadfd9] bg-[#fffdfa]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="Beauty Mart home">
          <span className="grid size-12 place-items-center rounded-full border border-[#a77479] bg-[#f0d8d6] font-heading text-sm font-bold tracking-[0.08em] text-[#553038] shadow-sm">
            BM
          </span>
          <span className="hidden font-heading text-xl tracking-tight text-[#392428] sm:inline">
            Beauty Mart
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#543c3f] md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.label} className="transition-colors hover:text-[#a25864]" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button className={utilityButtonClass} type="button" aria-label="Search products" disabled>
            <Search aria-hidden="true" />
          </button>
          <Link
            className={cn(utilityButtonClass, "relative")}
            href="/cart"
            aria-label={`Shopping cart with ${cart.totalItems} items`}
          >
            <ShoppingBag aria-hidden="true" />
            {!cartLoading && cart.totalItems > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#8d4f59] px-1 text-[0.6rem] font-bold leading-4 text-white">
                {cart.totalItems > 99 ? "99+" : cart.totalItems}
              </span>
            )}
          </Link>

          <div className="ml-1 hidden items-center md:flex">
            {loading ? (
              <span className="h-9 w-24 animate-pulse rounded-full bg-[#eee1dc]" aria-label="Loading account" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link className={utilityButtonClass} href="/orders" aria-label="Your orders">
                  <Package aria-hidden="true" />
                </Link>
                <div className="flex items-center gap-2 rounded-full bg-[#f5e9e5] py-1 pl-1 pr-3">
                  {user.profilePictureUrl ? (
                    <Image
                      src={user.profilePictureUrl}
                      alt=""
                      width={30}
                      height={30}
                      unoptimized
                      className="size-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-7 place-items-center rounded-full bg-[#dcb8b7] text-xs font-semibold">
                      {user.firstName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-24 truncate text-sm font-medium">{user.firstName}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className={utilityButtonClass}
                  aria-label="Sign out"
                >
                  <LogOut aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-[#c9aaa8] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#54363b] hover:bg-[#f5e9e5]"
              >
                <LogIn className="size-4" aria-hidden="true" />
                Sign in
              </Link>
            )}
          </div>

          <details className="relative md:hidden">
            <summary className={cn(utilityButtonClass, "cursor-pointer list-none [&::-webkit-details-marker]:hidden")} aria-label="Open navigation">
              <Menu aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-[#eadfd9] bg-[#fffdfa] p-2 shadow-xl">
              <nav aria-label="Mobile navigation">
                {navLinks.map((link) => (
                  <Link key={link.label} className="block rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.13em] hover:bg-[#f5e8e4]" href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-1 border-t border-[#eadfd9] pt-1">
                {!loading && user ? (
                  <div className="p-2">
                    <p className="px-2 py-2 text-sm font-medium">Signed in as {user.firstName}</p>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-[#6d454b] hover:bg-[#f5e8e4]"
                    >
                      <Package className="size-4" aria-hidden="true" />
                      Your orders
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-[#6d454b] hover:bg-[#f5e8e4]"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.13em] hover:bg-[#f5e8e4]"
                  >
                    <LogIn className="size-4" aria-hidden="true" />
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
