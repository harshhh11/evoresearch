"use client";

import { RESEARCH_SCENES } from "@/lib/research-scenes";
import { ResearchNarrativeSection } from "./ResearchNarrativeSection";
import { SiteFooter } from "./SiteFooter";
import { WorkspaceCTA } from "./WorkspaceCTA";

export function ResearchNarrative() {
  return (
    <div className="research-journey" style={{ background: "#F8F6EF", color: "#26352D" }}>
      {RESEARCH_SCENES.map((scene, index) => (
        <ResearchNarrativeSection key={scene.id} scene={scene} index={index} />
      ))}

      <div style={{ padding: "40px 24px 0", maxWidth: 1240, margin: "0 auto" }}>
        <WorkspaceCTA />
        <SiteFooter />
      </div>
    </div>
  );
}
