"use client";

import { Suspense } from "react";
import { AdaptiveDpr } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { ResearchCore } from "./ResearchCore";
import { useLowPowerRendering } from "./useLowPowerRendering";

function WebGLFallback() {
  return (
    <div className="webgl-fallback" role="status">
      <span className="eyebrow">VISUAL FIELD / UNAVAILABLE</span>
      <span>The research narrative remains accessible without WebGL.</span>
    </div>
  );
}

export default function CinematicCanvas() {
  const lowPower = useLowPowerRendering();

  return (
    <div className="cinematic-canvas" aria-hidden="true">
      <Canvas
        dpr={lowPower ? [1, 1.1] : [1, 1.6]}
        camera={{ position: [0.1, 0, 8.9], fov: 35, near: 0.1, far: 90 }}
        gl={{ alpha: true, antialias: !lowPower, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping }}
        fallback={<WebGLFallback />}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#050706"), 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <AdaptiveDpr pixelated />
        <Suspense fallback={null}>
          <ResearchCore />
        </Suspense>
      </Canvas>
    </div>
  );
}
