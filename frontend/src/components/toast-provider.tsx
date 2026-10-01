"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type ToastTone = "success" | "error";
type ToastInput = { title: string; description?: string; tone?: ToastTone };
type Toast = ToastInput & { id: number };

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { ...toast, id }]);
    window.setTimeout(() => dismiss(id), 3800);
  }, [dismiss]);

  const value = useMemo(() => showToast, [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-24 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const isError = toast.tone === "error";
          const Icon = isError ? AlertCircle : CheckCircle2;
          return (
            <div
              key={toast.id}
              role={isError ? "alert" : "status"}
              className={`pointer-events-auto animate-in slide-in-from-right-4 fade-in rounded-2xl border bg-[#fffdfa] p-4 shadow-[0_18px_55px_rgba(55,28,33,0.18)] ${isError ? "border-red-200" : "border-[#decac4]"}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 size-5 shrink-0 ${isError ? "text-red-700" : "text-emerald-700"}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#3f272c]">{toast.title}</p>
                  {toast.description && <p className="mt-1 text-xs leading-5 text-[#77635e]">{toast.description}</p>}
                </div>
                <button type="button" onClick={() => dismiss(toast.id)} className="grid size-7 shrink-0 place-items-center rounded-full text-[#806a66] hover:bg-[#f3e7e2]" aria-label="Dismiss notification">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
