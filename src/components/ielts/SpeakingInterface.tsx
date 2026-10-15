"use client";

import { useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  Send,
} from "lucide-react";
import { QUESTION_COUNT } from "@/lib/ielts/config";
import type { SpeakingPhase } from "@/lib/ielts/types";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface Props {
  phase: SpeakingPhase;
  questionCount: number;
  currentQuestion: string;
  liveTranscript: string;
  recording: boolean;
  needsTapToPlay: boolean;
  sttSupported: boolean;
  error: string | null;
  voiceName: string;
  onFinish: (typedAnswer?: string) => void;
  onPlayPending: () => void;
  onRetry: () => void;
}

const STATUS: Record<SpeakingPhase, string> = {
  idle: "Tayyorlanmoqda…",
  thinking: "Imtihon oluvchi savol tayyorlamoqda…",
  speaking: "Imtihon oluvchi gapirmoqda…",
  listening: "Sizni tinglayapman — javob bering",
  processing: "Javobingiz qayd etilmoqda…",
};

export function SpeakingInterface({
  phase,
  questionCount,
  currentQuestion,
  liveTranscript,
  recording,
  needsTapToPlay,
  sttSupported,
  error,
  voiceName,
  onFinish,
  onPlayPending,
  onRetry,
}: Props) {
  const [typed, setTyped] = useState("");
  const activeNo = Math.min(Math.max(questionCount, 1), QUESTION_COUNT);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      {/* progress */}
      <div className="flex w-full items-center justify-between text-sm text-zinc-400">
        <span>
          Imtihon oluvchi: <span className="text-zinc-200">{voiceName}</span>
        </span>
        <span>
          Savol <span className="text-zinc-200">{activeNo}</span> / {QUESTION_COUNT}
        </span>
      </div>
      <div className="mt-3 flex w-full gap-1.5">
        {Array.from({ length: QUESTION_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
              i < questionCount ? "bg-gradient-to-r from-emerald-400 to-cyan-400" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* status */}
      <p className="mt-12 h-5 text-sm font-medium tracking-wide text-emerald-300/90">
        {error ? "" : STATUS[phase]}
      </p>

      {/* waveform */}
      <div className="ielts-wave-glow mt-4 h-36 w-full max-w-xl">
        <WaveformVisualizer mode={phase} />
      </div>

      {/* question text */}
      <p className="mt-8 min-h-[3.5rem] max-w-xl text-balance text-center text-xl font-medium leading-relaxed text-white sm:text-2xl">
        {currentQuestion || "…"}
      </p>

      {/* live transcript while listening */}
      {recording && (
        <p className="mt-4 max-w-xl text-center text-sm leading-relaxed text-zinc-400">
          {liveTranscript ? (
            <span className="italic">“{liveTranscript}”</span>
          ) : (
            <span className="text-zinc-500">Gapirishni boshlang…</span>
          )}
        </p>
      )}

      {/* controls */}
      <div className="mt-10 flex min-h-[3.5rem] w-full flex-col items-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="flex items-center gap-2 text-center text-sm text-red-400">
              <AlertCircle size={16} />
              {error}
            </p>
            <button onClick={onRetry} className="ielts-btn-primary">
              <RotateCcw size={18} />
              Qayta urinish
            </button>
          </div>
        ) : needsTapToPlay ? (
          <button onClick={onPlayPending} className="ielts-btn-primary">
            <Play size={18} />
            Savolni eshitish
          </button>
        ) : !sttSupported && recording ? (
          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <textarea
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Brauzeringiz ovozni matnga o‘girishni qo‘llab-quvvatlamaydi. Javobingizni shu yerga yozing…"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/30"
            />
            <button
              onClick={() => {
                onFinish(typed);
                setTyped("");
              }}
              disabled={!typed.trim()}
              className="ielts-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={17} />
              Javobni yuborish
            </button>
          </div>
        ) : recording ? (
          <button onClick={() => onFinish()} className="ielts-btn-primary">
            <Check size={18} />
            Javob berib bo‘ldim
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-300">
            {phase === "speaking" ? (
              <Mic size={16} className="text-emerald-300" />
            ) : (
              <Loader2 size={16} className="animate-spin text-emerald-300" />
            )}
            {STATUS[phase]}
          </div>
        )}
      </div>
    </div>
  );
}
