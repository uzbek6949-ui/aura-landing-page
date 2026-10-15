import { NextResponse } from "next/server";
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_FALLBACK_MODEL,
  QUESTION_COUNT,
  buildQuestionSystemPrompt,
  buildEvaluationSystemPrompt,
  EVALUATION_RESPONSE_SCHEMA,
} from "@/lib/ielts/config";
import type { Turn, Evaluation, GeminiRequest } from "@/lib/ielts/types";

// Single entry point for both Gemini interactions:
//   • action: "question"  -> next examiner question (plain text)
//   • action: "evaluate"  -> final IELTS scores (strict JSON)
// The API key is read from the server environment only.
export const runtime = "nodejs";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiContent = { role: "user" | "model"; parts: { text: string }[] };

/**
 * Convert our transcript into Gemini "contents".
 * Examiner -> "model", candidate -> "user". A constant opening user turn
 * keeps the required user/model/user… alternation valid even for Q1.
 */
function toContents(history: Turn[]): GeminiContent[] {
  const contents: GeminiContent[] = [
    {
      role: "user",
      parts: [
        { text: "Hello. I am the candidate and I am ready to begin the IELTS Speaking test." },
      ],
    },
  ];
  for (const turn of history) {
    contents.push({
      role: turn.role === "examiner" ? "model" : "user",
      parts: [{ text: turn.text }],
    });
  }
  return contents;
}

// Once the primary model returns a quota/permission error (e.g. Gemini 3 Pro
// needs billing) we remember it for this process so we don't pay the failing
// round-trip on every call. Restart the server after enabling billing.
let primaryUnavailable = false;

function postToModel(model: string, apiKey: string, payload: Record<string, unknown>) {
  return fetch(`${GEMINI_BASE}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(payload),
  });
}

function extractText(data: unknown): string {
  const parts = (data as { candidates?: { content?: { parts?: { text?: string }[] } }[] })
    ?.candidates?.[0]?.content?.parts;
  return (parts ?? []).map((p) => p?.text ?? "").join("").trim();
}

async function callGemini(body: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("missing-key");

  const primary = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const fallback = process.env.GEMINI_FALLBACK_MODEL || DEFAULT_GEMINI_FALLBACK_MODEL;

  const models: string[] = [];
  if (!primaryUnavailable) models.push(primary);
  if (fallback && fallback !== primary) models.push(fallback);
  if (models.length === 0) models.push(fallback || primary);

  let lastStatus = 0;
  for (const model of models) {
    let res = await postToModel(model, apiKey, body);

    // Some models reject `thinkingConfig` (e.g. the 2.5 family vs 3.x). If
    // that's the only problem, retry once without it.
    const cfg = body.generationConfig as Record<string, unknown> | undefined;
    if (res.status === 400 && cfg && "thinkingConfig" in cfg) {
      const { thinkingConfig: _omit, ...rest } = cfg;
      void _omit;
      res = await postToModel(model, apiKey, { ...body, generationConfig: rest });
    }

    if (res.ok) {
      const text = extractText(await res.json());
      if (!text) throw new Error("gemini-empty");
      return text;
    }

    lastStatus = res.status;
    const detail = await res.text().catch(() => "");
    console.error(`[gemini] ${model} -> ${res.status}`, detail.slice(0, 300));

    // 429 quota / 403 permission / 404 missing model → try the fallback model.
    const quotaOrAccess = res.status === 429 || res.status === 403 || res.status === 404;
    if (quotaOrAccess && model === primary) primaryUnavailable = true;
    if (!quotaOrAccess) break; // genuine error — fallback won't help
  }

  throw new Error(`gemini-${lastStatus}`);
}

export async function POST(request: Request) {
  let payload: GeminiRequest;
  try {
    payload = (await request.json()) as GeminiRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    if (payload.action === "question") {
      const n = Math.min(Math.max(1, Number(payload.questionNumber) || 1), QUESTION_COUNT);
      const text = await callGemini({
        systemInstruction: { parts: [{ text: buildQuestionSystemPrompt(n) }] },
        contents: toContents(payload.history ?? []),
        // Keep the conversation snappy; falls back automatically if rejected.
        generationConfig: { thinkingConfig: { thinkingLevel: "low" } },
      });
      const question = text.replace(/^["'\s]+|["'\s]+$/g, "");
      return NextResponse.json({ question });
    }

    if (payload.action === "evaluate") {
      const text = await callGemini({
        systemInstruction: { parts: [{ text: buildEvaluationSystemPrompt() }] },
        contents: toContents(payload.history ?? []),
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: EVALUATION_RESPONSE_SCHEMA,
        },
      });
      const evaluation = parseEvaluation(text);
      if (!evaluation) {
        return NextResponse.json({ error: "Could not parse evaluation." }, { status: 502 });
      }
      return NextResponse.json(evaluation);
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    if (msg === "missing-key") {
      return NextResponse.json(
        { error: "Gemini API key is not configured (.env.local)." },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "Gemini request failed." }, { status: 502 });
  }
}

/** Parse + sanitise the evaluation JSON, clamping bands to valid 0–9 / .5 steps. */
function parseEvaluation(raw: string): Evaluation | null {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) text = text.slice(first, last + 1);

  try {
    const obj = JSON.parse(text) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" ? v : Number(v));
    const band = (v: number) =>
      Number.isFinite(v) ? Math.min(9, Math.max(0, Math.round(v * 2) / 2)) : 0;
    const tips = Array.isArray(obj.personalized_tips)
      ? (obj.personalized_tips as unknown[])
          .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
          .map((t) => t.trim())
      : [];

    return {
      overall_band_score: band(num(obj.overall_band_score)),
      fluency_score: band(num(obj.fluency_score)),
      lexical_resource_score: band(num(obj.lexical_resource_score)),
      grammatical_range_score: band(num(obj.grammatical_range_score)),
      personalized_tips: tips.length
        ? tips
        : ["Keep practising regularly to build confidence and fluency."],
    };
  } catch {
    return null;
  }
}
