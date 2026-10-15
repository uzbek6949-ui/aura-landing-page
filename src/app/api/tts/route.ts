import { NextResponse } from "next/server";
import { getVoice, DEFAULT_ELEVENLABS_MODEL } from "@/lib/ielts/config";

// Proxies a single text-to-speech request to ElevenLabs and streams the
// resulting MP3 back to the browser. The API key lives only on the server.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key is not configured (.env.local)." },
      { status: 500 },
    );
  }

  let text = "";
  let voiceKey = "";
  try {
    const body = await request.json();
    text = typeof body?.text === "string" ? body.text.trim() : "";
    voiceKey = typeof body?.voice === "string" ? body.voice : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "Missing 'text'." }, { status: 400 });
  }

  const voice = getVoice(voiceKey);
  if (!voice) {
    return NextResponse.json({ error: "Unknown voice." }, { status: 400 });
  }

  const model = process.env.ELEVENLABS_MODEL || DEFAULT_ELEVENLABS_MODEL;

  let elRes: Response;
  try {
    elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.elevenLabsVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0,
            use_speaker_boost: true,
          },
        }),
      },
    );
  } catch (err) {
    console.error("[tts] network error", err);
    return NextResponse.json({ error: "Could not reach ElevenLabs." }, { status: 502 });
  }

  if (!elRes.ok) {
    const detail = await elRes.text().catch(() => "");
    console.error("[tts] ElevenLabs error", elRes.status, detail.slice(0, 400));
    return NextResponse.json(
      { error: "Text-to-speech failed.", status: elRes.status },
      { status: 502 },
    );
  }

  const audio = await elRes.arrayBuffer();
  return new NextResponse(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
