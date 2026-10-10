"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneMotion } from "./motion-state";

type ScrollSceneControllerProps = {
  root: HTMLElement | null;
  onStageChange: (stage: number) => void;
};

export function ScrollSceneController({ root, onStageChange }: ScrollSceneControllerProps) {
  useEffect(() => {
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const journey = root.querySelector<HTMLElement>(".research-journey");
    if (!journey) return;

    let lastStage = -1;
    const updateActiveStage = (progress: number) => {
      const active = Math.min(6, Math.round(progress * 6));
      if (active !== lastStage) {
        lastStage = active;
        onStageChange(active);
      }
    };

    const media = gsap.matchMedia(root);
    media.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        motionAllowed: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const reduced = context.conditions?.reduced === true;
        sceneMotion.reduced = reduced;
        sceneMotion.velocity = 0;
        sceneMotion.pointerX = 0;
        sceneMotion.pointerY = 0;
        lastStage = -1;

        if (reduced) {
          sceneMotion.stage = 0;
          ScrollTrigger.create({
            trigger: journey,
            start: "top top",
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onRefresh: (self) => updateActiveStage(self.progress),
            onUpdate: (self) => updateActiveStage(self.progress),
          });
        } else {
          let lastVelocity = 0;
          const stageProgress = { value: 0 };
          gsap.to(stageProgress, {
            value: 6,
            ease: "none",
            scrollTrigger: {
              trigger: journey,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.05,
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                stageProgress.value = self.progress * 6;
                sceneMotion.stage = stageProgress.value;
                updateActiveStage(self.progress);
              },
              onUpdate: (self) => {
                sceneMotion.stage = stageProgress.value;
                const velocity = Math.min(1, Math.abs(self.getVelocity()) / 1600);
                lastVelocity += (velocity - lastVelocity) * 0.18;
                sceneMotion.velocity = lastVelocity;
                updateActiveStage(self.progress);
              },
            },
          });

          const copyBlocks = gsap.utils.toArray<HTMLElement>(".scene-copy", journey);
          copyBlocks.forEach((copy) => {
            gsap.fromTo(
              copy,
              { y: 22, opacity: 0.82 },
              {
                y: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: copy.closest("[data-scene]") ?? copy,
                  start: "top 78%",
                  end: "top 36%",
                  scrub: 0.55,
                },
              },
            );
          });
        }

        ScrollTrigger.refresh();
        return () => {
          sceneMotion.stage = 0;
          sceneMotion.velocity = 0;
          sceneMotion.pointerX = 0;
          sceneMotion.pointerY = 0;
        };
      },
    );

    const pointer = (event: PointerEvent) => {
      if (sceneMotion.reduced || event.pointerType === "touch") return;
      sceneMotion.pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      sceneMotion.pointerY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    const resetPointer = () => {
      sceneMotion.pointerX = 0;
      sceneMotion.pointerY = 0;
    };

    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("blur", resetPointer);

    return () => {
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("blur", resetPointer);
      media.revert();
      sceneMotion.stage = 0;
      sceneMotion.velocity = 0;
      sceneMotion.pointerX = 0;
      sceneMotion.pointerY = 0;
      sceneMotion.reduced = false;
      ScrollTrigger.refresh();
    };
  }, [root, onStageChange]);

  return null;
}
