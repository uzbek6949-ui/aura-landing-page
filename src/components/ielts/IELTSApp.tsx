"use client";

import { useIELTSTest } from "@/hooks/useIELTSTest";
import { EXAMINER_VOICES } from "@/lib/ielts/config";
import { VoiceSelector } from "./VoiceSelector";
import { SpeakingInterface } from "./SpeakingInterface";
import { CalculatingScreen } from "./CalculatingScreen";
import { ResultsScreen } from "./ResultsScreen";

export function IELTSApp() {
  const test = useIELTSTest();
  const voiceName =
    EXAMINER_VOICES.find((v) => v.key === test.voice)?.name ?? "AI";

  return (
    <main className="dark relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#05070a] via-[#070b10] to-[#0b0f14] px-5 py-16 text-white">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob -left-24 -top-24 h-96 w-96 bg-emerald-500/20" />
        <div className="blob -bottom-32 -right-24 h-[28rem] w-[28rem] bg-cyan-500/15" />
        <div className="grid-overlay absolute inset-0 opacity-[0.4]" />
      </div>

      {/* current step */}
      <div key={test.step} className="ielts-step-in relative z-10 w-full">
        {test.step === "voice-select" && (
          <VoiceSelector onSelect={test.selectVoice} />
        )}

        {test.step === "speaking" && (
          <SpeakingInterface
            phase={test.phase}
            questionCount={test.questionCount}
            currentQuestion={test.currentQuestion}
            liveTranscript={test.liveTranscript}
            recording={test.recording}
            needsTapToPlay={test.needsTapToPlay}
            sttSupported={test.sttSupported}
            error={test.error}
            voiceName={voiceName}
            onFinish={test.finishAnswer}
            onPlayPending={test.playPending}
            onRetry={test.retry}
          />
        )}

        {test.step === "calculating" && (
          <CalculatingScreen error={test.error} onRetry={test.retry} />
        )}

        {test.step === "results" && test.evaluation && (
          <ResultsScreen
            evaluation={test.evaluation}
            conversationHistory={test.conversationHistory}
            onRestart={test.restart}
          />
        )}
      </div>
    </main>
  );
}
