"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import type { Evaluation, Turn } from "@/lib/ielts/types";

const CRITERIA: { key: keyof Evaluation; label: string; hint: string }[] = [
  { key: "fluency_score", label: "Ravonlik", hint: "Fluency & Coherence" },
  { key: "lexical_resource_score", label: "Lug‘at boyligi", hint: "Lexical Resource" },
  { key: "grammatical_range_score", label: "Grammatika", hint: "Grammatical Range" },
];

function bandLabel(score: number): string {
  if (score >= 8.5) return "Expert user";
  if (score >= 7.5) return "Very good user";
  if (score >= 6.5) return "Good user";
  if (score >= 5.5) return "Competent user";
  if (score >= 4.5) return "Modest user";
  if (score >= 3.5) return "Limited user";
  return "Basic user";
}

export function ResultsScreen({
  evaluation,
  conversationHistory,
  onRestart,
}: {
  evaluation: Evaluation;
  conversationHistory: Turn[];
  onRestart: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300">
        <Sparkles size={14} className="text-emerald-400" />
        Natijangiz tayyor
      </span>

      {/* overall score */}
      <div className="ielts-score-ring relative mt-8 grid h-44 w-44 place-items-center rounded-full">
        <div className="flex flex-col items-center">
          <span className="ielts-gradient-text text-6xl font-bold leading-none">
            {evaluation.overall_band_score.toFixed(1)}
          </span>
          <span className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
            / 9.0
          </span>
        </div>
      </div>
      <p className="mt-5 text-lg font-semibold text-white">Umumiy IELTS bali</p>
      <p className="text-sm text-zinc-400">{bandLabel(evaluation.overall_band_score)}</p>

      {/* sub scores */}
      <div className="mt-10 w-full space-y-5">
        {CRITERIA.map(({ key, label, hint }) => {
          const value = evaluation[key] as number;
          const pct = (value / 9) * 100;
          return (
            <div key={key}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-zinc-200">
                  {label}{" "}
                  <span className="text-xs font-normal text-zinc-500">{hint}</span>
                </span>
                <span className="text-sm font-semibold text-white">
                  {value.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-[width] duration-1000 ease-out"
                  style={{ width: mounted ? `${pct}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* tips */}
      <div className="mt-10 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-white">
          <Lightbulb size={18} className="text-emerald-300" />
          Shaxsiy maslahatlar
        </h3>
        <ul className="mt-4 space-y-3">
          {evaluation.personalized_tips.map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xs font-semibold text-emerald-300">
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* transcript */}
      {conversationHistory.length > 0 && (
        <details className="group mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.02] p-1">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-5 py-3 text-sm font-medium text-zinc-300 hover:text-white">
            Suhbat matnini ko‘rish
            <ChevronDown
              size={18}
              className="ielts-chevron transition-transform duration-300"
            />
          </summary>
          <div className="space-y-4 px-5 pb-5 pt-2">
            {conversationHistory.map((turn, i) => (
              <div key={i}>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {turn.role === "examiner" ? "Imtihon oluvchi" : "Siz"}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-300">
                  {turn.text}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}

      <button onClick={onRestart} className="ielts-btn-primary mt-10">
        <RotateCcw size={18} />
        Yana boshlash
      </button>
    </div>
  );
}
