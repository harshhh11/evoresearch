import { RESEARCH_SCENES } from "@/lib/research-scenes";
import { HeroSection } from "./HeroSection";
import { ResearchNarrativeSection } from "./ResearchNarrativeSection";
import { SiteFooter } from "./SiteFooter";
import { WorkspaceCTA } from "./WorkspaceCTA";

function FinalWorkspaceScene() {
  const scene = RESEARCH_SCENES[6];
  return (
    <section className="scene-stage scene-stage--workspace" id="workspace" data-scene data-mode="workspace" aria-labelledby="scene-title-6">
      <div className="scene-copy final-copy">
        <div className="scene-eyebrow"><span>07 / 07</span><i aria-hidden="true" />{scene.eyebrow}</div>
        <h2 className="scene-headline" id="scene-title-6"><span>BUILD ON</span><span>WHAT YOU LEARN.</span></h2>
        <p className="scene-description">{scene.description}</p>
        <div className="scene-labels scene-labels--final">
          {scene.labels.map((label, index) => <span key={label}><i aria-hidden="true">0{index + 1}</i>{label}</span>)}
        </div>
        <WorkspaceCTA />
      </div>
      <SiteFooter />
      <span className="scene-index-ghost" aria-hidden="true">07</span>
    </section>
  );
}

export function ResearchNarrative() {
  return (
    <div className="research-journey">
      <HeroSection />
      {RESEARCH_SCENES.slice(1, 6).map((scene, index) => (
        <ResearchNarrativeSection key={scene.id} scene={scene} index={index + 1} />
      ))}
      <FinalWorkspaceScene />
    </div>
  );
}
