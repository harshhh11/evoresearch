"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FloatingNavigation, ResearchStatusPanel } from "@/components/navigation/FloatingNavigation";
import { ResearchNarrative } from "@/components/narrative/ResearchNarrative";
import { ScrollSceneController } from "@/components/scene/ScrollSceneController";

const CinematicCanvas = dynamic(() => import("@/components/scene/CinematicCanvas"), {
  ssr: false,
  loading: () => <div className="canvas-preload" aria-hidden="true" />,
});

export function EvoResearchExperience() {
  const [journey, setJourney] = useState<HTMLElement | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const bindJourney = useCallback((node: HTMLDivElement | null) => setJourney(node), []);
  const updateStage = useCallback((stage: number) => setActiveStage(stage), []);

  return (
    <div className="site-environment">
      <CinematicCanvas />
      <div className="atmosphere-layer" aria-hidden="true" />
      <FloatingNavigation activeStage={activeStage} />
      <ResearchStatusPanel activeStage={activeStage} />
      <main ref={bindJourney}>
        <ResearchNarrative />
      </main>
      <ScrollSceneController root={journey} onStageChange={updateStage} />
    </div>
  );
}
