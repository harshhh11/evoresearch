"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FilamentField } from "./FilamentField";
import { ParticleField } from "./ParticleField";
import { sceneMotion } from "./motion-state";

const CAMERA_Z = [8.9, 6.9, 6.1, 6.7, 5.8, 7.1, 8.7];
const CAMERA_X = [0.02, 0.42, -0.26, 0.22, -0.38, 0.1, 0.02];

function sample(values: number[], progress: number) {
  const position = THREE.MathUtils.clamp(progress, 0, 6);
  const from = Math.floor(position);
  const to = Math.min(values.length - 1, from + 1);
  return THREE.MathUtils.lerp(values[from], values[to], position - from);
}

function CameraChoreography() {
  const { camera, size } = useThree();
  const previousFov = useRef(0);

  useFrame(() => {
    const mobile = size.width < 720;
    if (sceneMotion.reduced) {
      camera.lookAt(mobile ? 0.02 : 0.74, 0, 0);
      return;
    }
    const stage = sceneMotion.stage;
    const offset = mobile ? 0.08 : 0.26;
    const x = sample(CAMERA_X, stage) + sceneMotion.pointerX * 0.18;
    const z = sample(CAMERA_Z, stage) + (mobile ? 0.55 : 0);
    const y = sceneMotion.pointerY * 0.1 + Math.sin(stage * 0.36) * 0.06;
    const focusX = mobile ? 0.02 : 0.74;
    camera.position.x += (x + offset - camera.position.x) * 0.035;
    camera.position.y += (y - camera.position.y) * 0.035;
    camera.position.z += (z - camera.position.z) * 0.035;
    camera.lookAt(focusX, 0, 0);

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = 35 - Math.sin((stage / 6) * Math.PI) * 2.5;
      if (Math.abs(previousFov.current - targetFov) > 0.02) {
        camera.fov += (targetFov - camera.fov) * 0.035;
        camera.updateProjectionMatrix();
        previousFov.current = camera.fov;
      }
    }
  });

  return null;
}

function DiagnosticSignal() {
  const node = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: "#B5FF8A", transparent: true, opacity: 0.75, toneMapped: false }), []);

  useEffect(() => () => glowMaterial.dispose(), [glowMaterial]);

  useFrame(({ clock }) => {
    if (!node.current || !light.current) return;
    const time = clock.elapsedTime * (sceneMotion.reduced ? 0 : 0.28);
    const stage = sceneMotion.stage;
    const visibility = sceneMotion.reduced
      ? 0
      : THREE.MathUtils.smoothstep(stage, 2.2, 3.05) * (1 - THREE.MathUtils.smoothstep(stage, 3.45, 4.0));
    node.current.position.set(Math.cos(time * 1.35) * 1.15, Math.sin(time * 1.9) * 0.83, Math.sin(time * 0.8) * 0.45);
    glowMaterial.opacity = sceneMotion.reduced ? 0 : 0.2 + visibility * 0.72;
    light.current.intensity = visibility * 1.35;
  });

  return (
    <mesh ref={node} material={glowMaterial} scale={0.52}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <pointLight ref={light} color="#B5FF8A" distance={1.8} intensity={0} decay={2} />
    </mesh>
  );
}

function CoreAssembly() {
  const group = useRef<THREE.Group>(null);
  const { size } = useThree();

  useFrame(({ clock }) => {
    if (!group.current) return;
    const stage = sceneMotion.stage;
    const mobile = size.width < 720;
    if (sceneMotion.reduced) {
      group.current.position.set(mobile ? 0.02 : 0.72, 0, 0);
      group.current.scale.setScalar(1);
      group.current.rotation.set(0, 0.12, 0);
      return;
    }
    const settle = THREE.MathUtils.smoothstep(stage, 4.8, 6);
    const targetScale = 1.0 + Math.sin((stage / 6) * Math.PI) * 0.08 - settle * 0.04;
    group.current.scale.setScalar(targetScale);
    group.current.position.x += ((mobile ? 0.02 : 0.72) - group.current.position.x) * 0.025;
    group.current.position.y += (sceneMotion.pointerY * 0.035 - group.current.position.y) * 0.04;
    group.current.rotation.y = clock.elapsedTime * (sceneMotion.reduced ? 0.006 : 0.018) + stage * 0.08;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.09) * 0.035 + sceneMotion.pointerY * 0.025;
    group.current.rotation.z = sceneMotion.pointerX * 0.025;
  });

  return (
    <group ref={group}>
      <ParticleField />
      <FilamentField />
      <DiagnosticSignal />
    </group>
  );
}

export function ResearchCore() {
  return (
    <>
      <CameraChoreography />
      <ambientLight intensity={0.32} color="#A5C7BA" />
      <pointLight position={[-2.7, 1.6, 3.4]} intensity={13} distance={10} color="#8FC78F" decay={2} />
      <pointLight position={[3.1, -1.2, -2]} intensity={10} distance={9} color="#72BAC2" decay={2} />
      <pointLight position={[0, 0, 0.8]} intensity={5} distance={4} color="#E8F4D8" decay={2} />
      <CoreAssembly />
    </>
  );
}
