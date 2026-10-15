// Shared types for the IELTS Speaking simulator.
// Used on both the client (hook/components) and the server (API routes).

/** The four screens the user moves through, in order. */
export type Step = "voice-select" | "speaking" | "calculating" | "results";

/** Logical id of an examiner voice (mapped to an ElevenLabs voice id in config). */
export type VoiceKey = "muhammad" | "ahmad";

/** A single line of the conversation transcript. */
export interface Turn {
  role: "examiner" | "candidate";
  text: string;
}

/**
 * The final result shape returned by Gemini.
 * MUST match the JSON schema enforced in /api/gemini (evaluation mode).
 */
export interface Evaluation {
  overall_band_score: number;
  fluency_score: number;
  lexical_resource_score: number;
  grammatical_range_score: number;
  personalized_tips: string[];
}

/** Request body for POST /api/gemini. */
export type GeminiRequest =
  | { action: "question"; history: Turn[]; questionNumber: number }
  | { action: "evaluate"; history: Turn[] };

/** Visual/behavioural phase inside the "speaking" step. */
export type SpeakingPhase =
  | "idle" // nothing happening yet
  | "thinking" // waiting for Gemini to produce the next question
  | "speaking" // examiner audio is playing
  | "listening" // microphone is recording the candidate
  | "processing"; // answer captured, sending to Gemini
