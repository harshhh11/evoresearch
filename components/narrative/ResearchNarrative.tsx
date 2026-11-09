"use client";

import { RESEARCH_SCENES } from "@/lib/research-scenes";
import { HeroSection } from "./HeroSection";
import { ResearchNarrativeSection } from "./ResearchNarrativeSection";
import { SiteFooter } from "./SiteFooter";
import { WorkspaceCTA } from "./WorkspaceCTA";

export function ResearchNarrative() {
  return (
    <div className="research-journey bg-[#F5F9F3] text-[#17251D] font-sans">
      {/* 1. Interactive Platform Hero Section */}
      <HeroSection />

      {/* 2. Seven-Stage Scientific Narrative Scenes */}
      {RESEARCH_SCENES.map((scene, index) => (
        <ResearchNarrativeSection key={scene.id} scene={scene} index={index} />
      ))}

      {/* 3. Global Call-to-Action & Footer */}
      <div className="px-6 pt-12 pb-6 max-w-[1240px] mx-auto">
        <WorkspaceCTA />
        <SiteFooter />
      </div>
    </div>
  );
}
