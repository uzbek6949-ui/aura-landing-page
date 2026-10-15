"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export interface SpeechRecognitionState {
  /** Whether the browser exposes the Web Speech API at all. */
  supported: boolean;
  /** True while the microphone is actively transcribing. */
  listening: boolean;
  /** Finalised transcript so far. */
  transcript: string;
  /** Words currently being recognised (not yet final). */
  interim: string;
  /** Non-fatal recognition error code, if any. */
  error: string | null;
  /** Begin a fresh recording (clears previous transcript). */
  start: () => void;
  /** Stop recording and return everything captured so far. */
  stop: () => string;
  /** Clear transcript without touching the recogniser. */
  reset: () => void;
}

// Feature detection via useSyncExternalStore so it works with SSR and never
// calls setState inside an effect.
const subscribeNoop = () => () => {};
const getSupported = () =>
  typeof window !== "undefined" &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const getSupportedServer = () => false;

/**
 * Thin wrapper around the browser SpeechRecognition API tuned for the
 * IELTS use case: English, continuous, with interim results. It keeps the
 * recogniser alive across Chrome's periodic auto-stops until the caller
 * explicitly stops it.
 */
export function useSpeechRecognition(lang = "en-US"): SpeechRecognitionState {
  const supported = useSyncExternalStore(subscribeNoop, getSupported, getSupportedServer);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const manualStopRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalRef.current = `${finalRef.current} ${text}`.trim();
        } else {
          interimText += text;
        }
      }
      interimRef.current = interimText;
      setTranscript(finalRef.current);
      setInterim(interimText);
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are part of normal operation.
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error);
      }
    };

    rec.onend = () => {
      // Chrome stops on its own after a pause; keep going unless the
      // caller asked us to stop.
      if (!manualStopRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* already running */
        }
      }
      setListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      manualStopRef.current = true;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    finalRef.current = "";
    interimRef.current = "";
    manualStopRef.current = false;
    setTranscript("");
    setInterim("");
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      // start() throws if it's already running — safe to ignore.
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    // Fold any pending interim words into the captured result.
    const captured = `${finalRef.current} ${interimRef.current}`.trim();
    manualStopRef.current = true;
    if (rec) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    setListening(false);
    setInterim("");
    return captured;
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    interimRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  return { supported, listening, transcript, interim, error, start, stop, reset };
}
