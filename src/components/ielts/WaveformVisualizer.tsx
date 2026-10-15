"use client";

import { useEffect, useRef } from "react";
import type { SpeakingPhase } from "@/lib/ielts/types";

const BAR_COUNT = 56;

/**
 * Canvas waveform that reacts to the candidate's microphone in real time
 * while listening, and plays a smooth synthetic animation otherwise.
 */
export function WaveformVisualizer({ mode }: { mode: SpeakingPhase }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const rafRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const levelsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0));

  // Attach / detach the microphone analyser when entering / leaving listening.
  useEffect(() => {
    if (mode !== "listening") return;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(analyser);
        analyserRef.current = analyser;
        dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch {
        // Mic blocked — the synthetic animation keeps things alive.
      }
    })();

    return () => {
      cancelled = true;
      analyserRef.current = null;
      dataRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, [mode]);

  // The render loop runs for the lifetime of the component.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const start = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const t = (now - start) / 1000;
      const m = modeRef.current;
      const levels = levelsRef.current;
      const analyser = analyserRef.current;
      const data = dataRef.current;

      ctx.clearRect(0, 0, w, h);

      if (m === "listening" && analyser && data) {
        analyser.getByteFrequencyData(data);
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        let target: number;
        if (m === "listening" && analyser && data) {
          const idx = Math.floor((i / BAR_COUNT) * data.length);
          target = (data[idx] ?? 0) / 255;
          target = Math.pow(target, 0.85) * 1.15;
        } else if (m === "speaking") {
          target =
            0.22 +
            0.5 * Math.abs(Math.sin(t * 3 + i * 0.5) * Math.cos(t * 2 + i * 0.22));
        } else if (m === "thinking" || m === "processing") {
          target = 0.12 + 0.14 * (0.5 + 0.5 * Math.sin(t * 2.2 + i * 0.3));
        } else {
          target = 0.05 + 0.05 * (0.5 + 0.5 * Math.sin(t * 1.2 + i * 0.25));
        }

        // Emphasise the centre, taper the edges.
        const center = 1 - Math.abs(i - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2);
        target *= 0.35 + 0.65 * center;

        // Ease toward the target for smooth motion.
        levels[i] += (target - levels[i]) * 0.25;
      }

      const gap = 3;
      const barW = (w - gap * (BAR_COUNT - 1)) / BAR_COUNT;
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "#34d399");
      gradient.addColorStop(0.5, "#2dd4bf");
      gradient.addColorStop(1, "#22d3ee");
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "rgba(45, 212, 191, 0.55)";

      for (let i = 0; i < BAR_COUNT; i++) {
        const bh = Math.max(barW * 0.7, levels[i] * h * 0.92);
        const x = i * (barW + gap);
        const y = (h - bh) / 2;
        roundRect(ctx, x, y, barW, bh, barW / 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
