import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { IELTSApp } from "@/components/ielts/IELTSApp";

export const metadata: Metadata = {
  title: "IELTS Speaking Simulyatori",
  description:
    "AI imtihon oluvchi bilan jonli ovozli IELTS Speaking mashqi qiling va batafsil baho oling.",
};

export default async function IELTSPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Keep this route statically renderable under next-intl.
  setRequestLocale(locale);
  return <IELTSApp />;
}
