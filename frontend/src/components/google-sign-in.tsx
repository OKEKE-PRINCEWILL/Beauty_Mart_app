"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";

type GoogleCredentialResponse = {
  credential: string;
};

type GoogleIdentityApi = {
  initialize: (configuration: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    use_fedcm_for_button?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: "standard";
      theme: "outline";
      size: "large";
      text: "continue_with";
      shape: "pill";
      width: number;
    }
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityApi;
      };
    };
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleSignIn() {
  const buttonContainer = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!scriptReady || !googleClientId || !buttonContainer.current || !window.google) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      use_fedcm_for_button: !["localhost", "127.0.0.1"].includes(
        window.location.hostname
      ),
      callback: async ({ credential }) => {
        setSubmitting(true);
        setError(null);
        try {
          await signInWithGoogle(credential);
          toast({ title: "Welcome to Beauty Mart", description: "You are now signed in." });
          router.replace("/");
        } catch (signInError) {
          setError(
            signInError instanceof Error
              ? signInError.message
              : "Google sign-in could not be completed"
          );
          setSubmitting(false);
        }
      },
    });

    buttonContainer.current.replaceChildren();
    const buttonWidth = Math.min(buttonContainer.current.offsetWidth || 320, 320);
    window.google.accounts.id.renderButton(buttonContainer.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: buttonWidth,
    });
  }, [router, scriptReady, signInWithGoogle, toast]);

  if (user) {
    return (
      <div className="rounded-2xl border border-[#e5d7d1] bg-white/70 p-5 text-center">
        <p className="font-medium">You are signed in as {user.firstName}.</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6c3b43] hover:underline"
        >
          Continue shopping <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (!googleClientId) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Google sign-in needs a client ID. Add this value to the frontend environment:
        <code className="mt-2 block break-all rounded bg-white px-2 py-1">
          NEXT_PUBLIC_GOOGLE_CLIENT_ID
        </code>
      </div>
    );
  }

  return (
    <div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div className="relative flex min-h-11 justify-center">
        <div
          ref={buttonContainer}
          className="flex w-full justify-center"
          aria-label="Continue with Google"
        />
        {submitting && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/90 text-sm text-[#553138]">
            <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Signing you in…
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
