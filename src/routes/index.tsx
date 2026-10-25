import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import type { Screen } from "@/components/cs/ui";
import { Welcome, Signup, Onboard, Empty, Home } from "@/components/cs/screens-a";
import { Analyze, Processing, Results, Behavior, Health, Sound } from "@/components/cs/screens-b";
import { History, Alerts, Profile } from "@/components/cs/screens-c";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CatSense AI — Understand what your cat feels" },
      { name: "description", content: "Clickable demo of CatSense: AI cat behavior, sound and health analysis." },
      { property: "og:title", content: "CatSense AI — Understand what your cat feels" },
      { property: "og:description", content: "Clickable demo of CatSense: AI cat behavior, sound and health analysis." },
    ],
  }),
  component: Index,
});

const map = { welcome: Welcome, signup: Signup, onboard: Onboard, empty: Empty, home: Home, analyze: Analyze, processing: Processing, results: Results, behavior: Behavior, health: Health, sound: Sound, history: History, alerts: Alerts, profile: Profile };

function Index() {
  const [s, setS] = useState<Screen>("welcome");
  const ref = useRef<HTMLDivElement>(null);
  const go = useCallback((n: Screen) => {
    setS(n);
    ref.current?.scrollTo({ top: 0 });
  }, []);
  const C = map[s];
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted sm:py-6">
      <div ref={ref} className="relative h-screen w-full max-w-[420px] overflow-y-auto bg-background sm:h-[860px] sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-8 sm:ring-ink">
        <div key={s} className="float-in min-h-full pb-4">
          <C go={go} />
        </div>
      </div>
    </div>
  );
}
