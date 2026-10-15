"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

const MESSAGES = [
  "Javoblaringiz tahlil qilinmoqda…",
  "Ravonlik baholanmoqda…",
  "Lug‘at boyligi tekshirilmoqda…",
  "Grammatik aniqlik o‘lchanmoqda…",
  "Yakuniy IELTS bali tayyorlanmoqda…",
];

export function CalculatingScreen({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (error) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
      {error ? (
        <>
          <span className="grid h-16 w-16 place-items-center rounded-full border border-red-500/30 bg-red-500/10">
            <AlertCircle size={28} className="text-red-400" />
          </span>
          <p className="mt-6 text-base text-zinc-300">{error}</p>
          <button onClick={onRetry} className="ielts-btn-primary mt-8">
            <RotateCcw size={18} />
            Qayta urinish
          </button>
        </>
      ) : (
        <>
          <div className="ielts-calc-orb relative grid h-28 w-28 place-items-center">
            <span className="ielts-calc-ring absolute inset-0 rounded-full" />
            <span
              className="ielts-calc-ring absolute inset-0 rounded-full"
              style={{ animationDelay: "0.6s" }}
            />
            <span className="ielts-gradient-text text-3xl font-semibold">IELTS</span>
          </div>
          <h2 className="mt-9 text-2xl font-semibold text-white">Hisoblanmoqda…</h2>
          <p
            key={index}
            className="ielts-fade-in mt-3 h-6 text-sm text-zinc-400"
          >
            {MESSAGES[index]}
          </p>
        </>
      )}
    </div>
  );
}
