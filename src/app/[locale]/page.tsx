import type { Metadata, Viewport } from "next";
import { setRequestLocale } from "next-intl/server";
import { WorkoutLanding } from "./workout/WorkoutLanding";

const TITLE = "Full-Body Training: Beginner Guide, Workout Timer & Quiz";
const DESCRIPTION =
  "Learn full-body training: benefits, a sample beginner workout, reliable sources, fitness vocabulary, a workout timer and an interactive quiz.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "Fit Workout",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#DFFB44",
};

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <WorkoutLanding />;
}
