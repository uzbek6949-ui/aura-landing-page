// ──────────────────────────────────────────────────────────────
//  Central configuration for the IELTS Speaking simulator.
//  Everything you might want to tweak lives here:
//   • how many questions the test has
//   • which ElevenLabs voice powers each examiner
//   • the default model ids (overridable via .env.local)
//   • the Gemini system prompts
// ──────────────────────────────────────────────────────────────

import type { VoiceKey } from "./types";

/** The test is exactly this many questions long (spec requirement). */
export const QUESTION_COUNT = 5;

// ── Model defaults ────────────────────────────────────────────
// Routes read process.env first and fall back to these constants.
export const DEFAULT_GEMINI_MODEL = "gemini-3-pro-preview";
// Used automatically if the primary model returns a quota/permission error
// (e.g. Gemini 3 Pro needs billing; 2.5 Flash works on the free tier).
export const DEFAULT_GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";
export const DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2";

// ── Examiner voices ───────────────────────────────────────────
// `elevenLabsVoiceId` values are ElevenLabs "premade" English male
// voices. Swap them for any voice id from your ElevenLabs library.
export interface ExaminerVoice {
  key: VoiceKey;
  /** Display name on the start screen. */
  name: string;
  /** Short Uzbek subtitle under the name. */
  tagline: string;
  /** ElevenLabs voice id used by /api/tts. Change freely. */
  elevenLabsVoiceId: string;
}

export const EXAMINER_VOICES: ExaminerVoice[] = [
  {
    key: "muhammad",
    name: "Muhammad",
    tagline: "Bosiq va aniq ohang",
    elevenLabsVoiceId: "pNInz6obpgDQGcFmaJgB", // "Adam" — deep, calm
  },
  {
    key: "ahmad",
    name: "Ahmad",
    tagline: "Iliq va do‘stona ohang",
    elevenLabsVoiceId: "TxGEqnHWrfWFTfGW9XjX", // "Josh" — warm, friendly
  },
];

/** Look up a voice by its logical key (used server-side in /api/tts). */
export function getVoice(key: string): ExaminerVoice | undefined {
  return EXAMINER_VOICES.find((v) => v.key === key);
}

// ── Gemini prompts ────────────────────────────────────────────

/** Stable examiner persona shared by every Gemini call. */
export const EXAMINER_PERSONA = `You are a professional, warm, and realistic IELTS Speaking examiner.
You are conducting a real spoken English test with one candidate.
The whole test is exactly ${QUESTION_COUNT} questions long.
Speak only English. Keep a polite, encouraging, examiner-like tone.
Your questions should feel natural when read aloud (they will be spoken
to the candidate by a text-to-speech voice).`;

/**
 * System prompt for generating the next question.
 * The conversation so far is supplied as `contents`; this only tells the
 * model what to do next and to return nothing but the question text.
 */
export function buildQuestionSystemPrompt(questionNumber: number): string {
  const isFirst = questionNumber === 1;
  const isLast = questionNumber === QUESTION_COUNT;

  const arc = isFirst
    ? `This is the FIRST question. Briefly greet the candidate in one short sentence, then ask an easy IELTS Part 1 style warm-up question (about themselves, home, work, studies, or hobbies).`
    : questionNumber <= 2
      ? `Ask another friendly IELTS Part 1 style question on a familiar everyday topic.`
      : questionNumber === 3
        ? `Ask a richer IELTS Part 2 / Part 3 style question that invites a longer, more developed answer (e.g. "Describe..." or "Tell me about a time when...").`
        : `Ask a thoughtful IELTS Part 3 style opinion/abstract question that builds on the topics discussed so far.`;

  return `${EXAMINER_PERSONA}

You are now asking question ${questionNumber} of ${QUESTION_COUNT}.
${arc}
${isLast ? "Make it clear in tone that this is the final question." : ""}

Rules:
- Output ONLY the question text the candidate should hear.
- Do NOT include the question number, labels, quotation marks, or any feedback about previous answers.
- Keep it to one or two natural spoken sentences.`;
}

/**
 * System prompt for the final evaluation.
 * Paired with responseMimeType="application/json" + a response schema,
 * so the model must return the exact Evaluation shape.
 */
export function buildEvaluationSystemPrompt(): string {
  return `${EXAMINER_PERSONA}

The test is now complete. Based ONLY on the candidate's answers in the
transcript, evaluate their spoken English like a real IELTS examiner.

Assess three criteria, each as an IELTS band score from 0 to 9 in 0.5
steps (e.g. 5.0, 6.5, 7.0):
- fluency_score: Fluency & Coherence
- lexical_resource_score: Lexical Resource (vocabulary)
- grammatical_range_score: Grammatical Range & Accuracy
Then set overall_band_score as the average of the three, rounded to the
nearest 0.5.

Also write 3 to 4 short, specific, constructive "personalized_tips" in
clear English. Reference what the candidate actually said and give
concrete advice they can act on. Be honest but encouraging.

Return ONLY the JSON object — no markdown, no extra text.`;
}

/**
 * Gemini response schema that locks the evaluation JSON shape.
 * Note: Gemini's Schema `type` uses the UPPERCASE Type enum.
 */
export const EVALUATION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    overall_band_score: { type: "NUMBER" },
    fluency_score: { type: "NUMBER" },
    lexical_resource_score: { type: "NUMBER" },
    grammatical_range_score: { type: "NUMBER" },
    personalized_tips: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: [
    "overall_band_score",
    "fluency_score",
    "lexical_resource_score",
    "grammatical_range_score",
    "personalized_tips",
  ],
  propertyOrdering: [
    "overall_band_score",
    "fluency_score",
    "lexical_resource_score",
    "grammatical_range_score",
    "personalized_tips",
  ],
} as const;
