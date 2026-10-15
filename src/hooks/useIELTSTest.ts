"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTION_COUNT } from "@/lib/ielts/config";
import type { Evaluation, SpeakingPhase, Step, Turn, VoiceKey } from "@/lib/ielts/types";
import { useSpeechRecognition } from "./useSpeechRecognition";

/** Auto-finish an answer after this many ms of silence (once something was said). */
const SILENCE_MS = 6000;

export interface IELTSTest {
  // ── state machine ──
  step: Step;
  voice: VoiceKey | null;
  conversationHistory: Turn[];
  questionCount: number;
  currentQuestion: string;
  phase: SpeakingPhase;
  evaluation: Evaluation | null;
  error: string | null;

  // ── derived flags (per spec) ──
  recording: boolean;
  playing: boolean;
  loading: boolean;

  // ── speech-to-text passthrough ──
  sttSupported: boolean;
  liveTranscript: string;

  /** Examiner audio was blocked by autoplay; user must tap to hear it. */
  needsTapToPlay: boolean;

  // ── actions ──
  selectVoice: (voice: VoiceKey) => void;
  finishAnswer: (typedAnswer?: string) => void;
  playPending: () => void;
  retry: () => void;
  restart: () => void;
}

export function useIELTSTest(): IELTSTest {
  const stt = useSpeechRecognition("en-US");

  const [step, setStep] = useState<Step>("voice-select");
  const [voice, setVoice] = useState<VoiceKey | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Turn[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [phase, setPhase] = useState<SpeakingPhase>("idle");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsTapToPlay, setNeedsTapToPlay] = useState(false);

  // Refs mirror the values read inside async flows, avoiding stale closures.
  const voiceRef = useRef<VoiceKey | null>(null);
  const historyRef = useRef<Turn[]>([]);
  const countRef = useRef(0);
  const phaseRef = useRef<SpeakingPhase>("idle");
  const stepRef = useRef<Step>("voice-select");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const finishRef = useRef<(typed?: string) => void>(() => {});

  const setPhaseBoth = useCallback((next: SpeakingPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const setStepBoth = useCallback((next: Step) => {
    stepRef.current = next;
    setStep(next);
  }, []);

  const pushTurn = useCallback((turn: Turn) => {
    const next = [...historyRef.current, turn];
    historyRef.current = next;
    setConversationHistory(next);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      try {
        audioRef.current.pause();
      } catch {
        /* ignore */
      }
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  // Move into "listening": start the microphone transcription.
  const startListening = useCallback(() => {
    setNeedsTapToPlay(false);
    setPhaseBoth("listening");
    stt.start();
  }, [setPhaseBoth, stt]);

  // Play the most recently fetched examiner audio, then start listening.
  const playCurrentAudio = useCallback(() => {
    const url = audioUrlRef.current;
    if (!url) {
      startListening();
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => startListening();
    audio.onerror = () => startListening();
    audio
      .play()
      .then(() => setNeedsTapToPlay(false))
      .catch(() => setNeedsTapToPlay(true)); // autoplay blocked → wait for tap
  }, [startListening]);

  // Fetch TTS for `text` and play it.
  const speak = useCallback(
    async (text: string) => {
      setPhaseBoth("speaking");
      setNeedsTapToPlay(false);
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: voiceRef.current }),
        });
        if (!res.ok) throw new Error("tts-failed");
        const blob = await res.blob();
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        playCurrentAudio();
      } catch {
        // If speech fails we still let the candidate answer (question is on screen).
        startListening();
      }
    },
    [playCurrentAudio, setPhaseBoth, startListening],
  );

  // Ask question number `n`: get it from Gemini, show it, speak it.
  const askQuestion = useCallback(
    async (n: number) => {
      setError(null);
      setPhaseBoth("thinking");
      try {
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "question",
            history: historyRef.current,
            questionNumber: n,
          }),
        });
        if (!res.ok) throw new Error("gemini-failed");
        const data = (await res.json()) as { question?: string };
        const question = (data.question ?? "").trim();
        if (!question) throw new Error("empty-question");

        countRef.current = n;
        setQuestionCount(n);
        setCurrentQuestion(question);
        pushTurn({ role: "examiner", text: question });
        await speak(question);
      } catch {
        setError("Savolni olishda xatolik yuz berdi. Internet aloqasi va API kalitlarini tekshiring.");
        setPhaseBoth("idle");
      }
    },
    [pushTurn, setPhaseBoth, speak],
  );

  // After the 5th answer: ask Gemini for the final IELTS evaluation.
  const evaluate = useCallback(async () => {
    setError(null);
    setStepBoth("calculating");
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate", history: historyRef.current }),
      });
      if (!res.ok) throw new Error("eval-failed");
      const data = (await res.json()) as Evaluation;
      setEvaluation(data);
      setStepBoth("results");
    } catch {
      setError("Bahoni hisoblashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.");
      // Stay on the calculating screen so the user can retry.
    }
  }, [setStepBoth]);

  // Candidate finished the current answer (button, silence, or typed fallback).
  const finishAnswer = useCallback(
    (typedAnswer?: string) => {
      if (phaseRef.current !== "listening") return;
      const captured = typedAnswer !== undefined ? typedAnswer : stt.stop();
      const answer = captured.trim() || "(The candidate did not give an audible answer.)";
      setPhaseBoth("processing");
      pushTurn({ role: "candidate", text: answer });

      if (countRef.current < QUESTION_COUNT) {
        void askQuestion(countRef.current + 1);
      } else {
        void evaluate();
      }
    },
    [askQuestion, evaluate, pushTurn, setPhaseBoth, stt],
  );

  // Keep the silence-timer's reference to finishAnswer current.
  useEffect(() => {
    finishRef.current = finishAnswer;
  }, [finishAnswer]);

  const selectVoice = useCallback(
    (selected: VoiceKey) => {
      voiceRef.current = selected;
      setVoice(selected);
      setStepBoth("speaking");
      void askQuestion(1);
    },
    [askQuestion, setStepBoth],
  );

  const playPending = useCallback(() => {
    setNeedsTapToPlay(false);
    playCurrentAudio();
  }, [playCurrentAudio]);

  // Re-run whichever step failed, based on current progress.
  const retry = useCallback(() => {
    if (stepRef.current === "calculating") {
      void evaluate();
    } else {
      void askQuestion(countRef.current + 1);
    }
  }, [askQuestion, evaluate]);

  const restart = useCallback(() => {
    stopAudio();
    stt.stop();
    voiceRef.current = null;
    historyRef.current = [];
    countRef.current = 0;
    phaseRef.current = "idle";
    setVoice(null);
    setConversationHistory([]);
    setQuestionCount(0);
    setCurrentQuestion("");
    setEvaluation(null);
    setError(null);
    setNeedsTapToPlay(false);
    setPhase("idle");
    setStepBoth("voice-select");
  }, [setStepBoth, stopAudio, stt]);

  // Auto-finish after a stretch of silence once the candidate has spoken.
  useEffect(() => {
    if (phase !== "listening") return;
    const spoken = `${stt.transcript} ${stt.interim}`.trim();
    if (!spoken) return;
    const timer = setTimeout(() => finishRef.current(), SILENCE_MS);
    return () => clearTimeout(timer);
  }, [phase, stt.transcript, stt.interim]);

  // Clean up audio on unmount.
  useEffect(() => stopAudio, [stopAudio]);

  const liveTranscript = `${stt.transcript} ${stt.interim}`.trim();

  return {
    step,
    voice,
    conversationHistory,
    questionCount,
    currentQuestion,
    phase,
    evaluation,
    error,
    recording: phase === "listening",
    playing: phase === "speaking",
    loading: phase === "thinking" || phase === "processing" || step === "calculating",
    sttSupported: stt.supported,
    liveTranscript,
    needsTapToPlay,
    selectVoice,
    finishAnswer,
    playPending,
    retry,
    restart,
  };
}
