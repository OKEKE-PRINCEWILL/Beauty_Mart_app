import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart-provider";
import { ProductQuickViewProvider } from "@/components/product-quick-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToastProvider } from "@/components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Beauty Mart",
    template: "%s | Beauty Mart",
  },
  description:
    "Shop curated skincare, makeup, body care, and lip essentials with delivery across Lagos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ProductQuickViewProvider>
                <SiteHeader />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </ProductQuickViewProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
