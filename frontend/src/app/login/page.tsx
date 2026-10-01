import { Check, MapPin, ShieldCheck } from "lucide-react";
import { GoogleSignIn } from "@/components/google-sign-in";

export default function LoginPage() {
  return (
    <section className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-[#321b20] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-28 size-[32rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-32 size-[34rem] rounded-full bg-[#a65f6b]/20 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e3bfc2]">
            Beauty Mart account
          </p>
          <h1 className="mt-6 max-w-2xl font-heading text-6xl leading-[1.02] tracking-[-0.04em]">
            Your beauty edit, kept close.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/68">
            Sign in once to prepare for persistent carts, easier checkout, and
            access to your Beauty Mart orders.
          </p>
        </div>

        <div className="relative grid gap-4">
          {[
            { icon: ShieldCheck, text: "Secure Google authentication" },
            { icon: Check, text: "One account for cart and orders" },
            { icon: MapPin, text: "Made for delivery within Lagos" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-white/76">
              <span className="grid size-9 place-items-center rounded-full bg-white/10">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#fbf7f4] px-5 py-16 sm:px-8">
        <div className="w-full max-w-md rounded-[2rem] border border-[#e8dad4] bg-white p-7 shadow-[0_28px_80px_rgba(68,34,38,0.1)] sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-full border border-[#a77479] bg-[#f0d8d6] font-heading text-sm font-bold tracking-[0.08em] text-[#553038]">
            BM
          </span>
          <div className="mt-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#96666c]">
              Welcome to Beauty Mart
            </p>
            <h2 className="mt-3 font-heading text-4xl tracking-[-0.03em]">
              Continue with Google
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#77635e]">
              We use Google to verify your identity. Beauty Mart never receives
              your Google password.
            </p>
          </div>

          <div className="mt-8">
            <GoogleSignIn />
          </div>

          <p className="mt-7 text-center text-xs leading-5 text-[#927b76]">
            By continuing, you agree to use your account for Beauty Mart shopping
            and order services.
          </p>
        </div>
      </div>
    </section>
  );
}
