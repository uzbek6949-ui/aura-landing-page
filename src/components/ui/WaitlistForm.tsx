"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Loader2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({
  variant = "default",
}: {
  variant?: "default" | "onAccent";
}) {
  const t = useTranslations("form");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setMessage(t("invalid"));
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      setMessage(t("success"));
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(t("error"));
    }
  }

  if (status === "success") {
    return (
      <div
        className={`flex items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-sm font-medium ${
          variant === "onAccent"
            ? "bg-white/15 text-white"
            : "border border-brand/30 bg-brand/10 text-foreground"
        }`}
        role="status"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
          <Check size={14} />
        </span>
        {message}
      </div>
    );
  }

  const onAccent = variant === "onAccent";

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      <div
        className={`flex flex-col gap-2.5 rounded-2xl p-1.5 sm:flex-row sm:items-center sm:gap-2 ${
          onAccent ? "bg-white/15" : "glass"
        }`}
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          aria-invalid={status === "error"}
          className={`h-12 flex-1 rounded-xl bg-transparent px-4 text-base outline-none transition-shadow placeholder:text-muted-foreground/80 focus:ring-2 ${
            onAccent
              ? "text-white placeholder:text-white/60 focus:ring-white/50"
              : "text-foreground focus:ring-brand"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-70 ${
            onAccent
              ? "bg-white text-emerald-700 hover:bg-white/90 focus-visible:ring-white"
              : "gradient-brand text-brand-foreground shadow-lg shadow-brand/25 hover:shadow-brand/40 focus-visible:ring-brand"
          }`}
        >
          {status === "loading" ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t("loading")}
            </>
          ) : (
            <>
              {t("button")}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      {status === "error" && (
        <p
          className={`mt-2 px-1 text-sm ${onAccent ? "text-white/90" : "text-red-500"}`}
          role="alert"
        >
          {message}
        </p>
      )}
    </form>
  );
}
