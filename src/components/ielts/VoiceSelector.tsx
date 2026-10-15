"use client";

import { Mic, Sparkles, Volume2 } from "lucide-react";
import { EXAMINER_VOICES, QUESTION_COUNT } from "@/lib/ielts/config";
import type { VoiceKey } from "@/lib/ielts/types";

export function VoiceSelector({
  onSelect,
}: {
  onSelect: (voice: VoiceKey) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-300">
        <Sparkles size={14} className="text-emerald-400" />
        AI bilan IELTS Speaking mashqi
      </span>

      <h1 className="mt-7 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Imtihon oluvchini <span className="ielts-gradient-text">tanlang</span>
      </h1>
      <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-zinc-400">
        {QUESTION_COUNT} ta savol, jonli ovozli suhbat va yakunida batafsil
        IELTS bahosi. Boshlash uchun ovozni tanlang.
      </p>

      <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {EXAMINER_VOICES.map((voice, i) => (
          <button
            key={voice.key}
            onClick={() => onSelect(voice.key)}
            className="ielts-card group relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-center transition-all duration-300 hover:border-emerald-400/40 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
              <Mic size={26} className="text-emerald-300" />
              <span className="ielts-pulse-ring absolute inset-0 rounded-full" />
            </span>
            <span>
              <span className="block text-xl font-semibold text-white">
                {voice.name}
              </span>
              <span className="mt-1 flex items-center justify-center gap-1.5 text-sm text-zinc-400">
                <Volume2 size={13} />
                {voice.tagline}
              </span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-zinc-500">
        Eng yaxshi natija uchun Chrome yoki Edge brauzeridan va mikrofondan
        foydalaning.
      </p>
    </div>
  );
}
