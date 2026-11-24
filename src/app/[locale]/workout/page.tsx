import type { Metadata, Viewport } from "next";
import { setRequestLocale } from "next-intl/server";
import { WorkoutLanding } from "./WorkoutLanding";

export const metadata: Metadata = {
  title: "Full-Body Training: Beginner Guide, Workout Timer & Quiz",
  description:
    "Learn full-body training: benefits, a sample beginner workout, reliable sources, fitness vocabulary, a workout timer and an interactive quiz.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#DFFB44",
};

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WorkoutLanding />;
}
