"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneMotion } from "./motion-state";
import { useLowPowerRendering } from "./useLowPowerRendering";

const vertexShader = `
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uStage;
  uniform float uVelocity;
  uniform float uReduced;
  uniform vec2 uPointer;
  varying vec3 vColor;
  varying float vSeed;
  varying float vGlow;

  void main() {
    vec3 p = position;
    float stage = mix(uStage, 0.0, uReduced);
    float motion = 1.0 - uReduced;
    float network = smoothstep(0.45, 2.3, stage) * (1.0 - smoothstep(5.25, 6.0, stage));
    float layers = smoothstep(1.6, 2.8, stage) * (1.0 - smoothstep(3.2, 4.0, stage));
    float calm = smoothstep(4.9, 6.0, stage);
    float speed = mix(1.0, 0.0, uReduced) + uVelocity * 1.7;
    float breathe = sin(uTime * 0.42 * speed + aSeed * 24.0 + p.y * 2.3) * 0.028 * motion;
    float radial = sin(atan(p.z, p.x) * 6.0 + p.y * 3.0 - uTime * 0.18 * speed + aSeed * 4.0) * 0.055 * motion;
    float layerWave = sin(p.y * 7.0 + aSeed * 12.0) * 0.17 * motion;
    vec3 direction = normalize(p);
    p += direction * (breathe + radial * network + layerWave * layers);
    p.x += sin(uTime * 0.09 * speed + aSeed * 17.0) * 0.034 * motion;
    p.y += cos(uTime * 0.11 * speed + aSeed * 21.0) * 0.028 * motion;

    float lattice = sin(p.y * 5.0 + aSeed * 8.0) * 0.09;
    p += direction * lattice * network;
    p = mix(p, p * vec3(0.91, 1.04, 0.94) + vec3(sign(p.x) * 0.12, 0.0, 0.0), calm * 0.32);
    p.xy += uPointer * (0.035 + network * 0.025) * motion;

    float rotation = uTime * 0.045 * speed * motion;
    float cs = cos(rotation);
    float sn = sin(rotation);
    p.xz = mat2(cs, -sn, sn, cs) * p.xz;
    float scalePulse = 1.0 + 0.035 * sin(uTime * 0.28 * speed + aSeed * 6.28) * motion;
    p *= scalePulse;

    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp((1.25 + aSeed * 2.05) * (310.0 / max(2.0, -viewPosition.z)), 1.0, 5.5);
    vColor = aColor * (0.78 + 0.26 * sin(uTime * 0.38 * speed + aSeed * 17.0) * motion);
    vColor = mix(vColor, vec3(0.72, 1.0, 0.55), network * 0.15);
    vSeed = aSeed;
    vGlow = mix(0.9, 0.58 + 0.42 * sin(uTime * 0.75 * speed + aSeed * 40.0), motion);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vSeed;
  varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float core = 1.0 - smoothstep(0.08, 0.48, d);
    float halo = exp(-d * d * 30.0);
    float alpha = (core * 0.50 + halo * 0.34) * (0.28 + vSeed * 0.56) * vGlow;
    if (alpha < 0.025) discard;
    gl_FragColor = vec4(vColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function makeParticleGeometry(count: number) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  let seed = 901;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const palette = [
    new THREE.Color("#B5FF8A"),
    new THREE.Color("#DDE9DD"),
    new THREE.Color("#A7E9E8"),
    new THREE.Color("#8EBFA4"),
    new THREE.Color("#F2D9A1"),
  ];

  for (let i = 0; i < count; i += 1) {
    const y = random() * 2 - 1;
    const azimuth = random() * Math.PI * 2;
    const radial = Math.sqrt(1 - y * y);
    const radius = 0.47 + Math.pow(random(), 0.74) * 1.68;
    const index = i * 3;
    positions[index] = Math.cos(azimuth) * radial * radius;
    positions[index + 1] = y * radius;
    positions[index + 2] = Math.sin(azimuth) * radial * radius;
    const color = palette[Math.floor(random() * palette.length)];
    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;
    seeds[i] = random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

export function ParticleField() {
  const lowPower = useLowPowerRendering();
  const count = lowPower ? 1_350 : 3_800;
  const geometry = useMemo(() => makeParticleGeometry(count), [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uStage: { value: 0 },
          uVelocity: { value: 0 },
          uReduced: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uStage.value = sceneMotion.stage;
    material.uniforms.uVelocity.value = sceneMotion.velocity;
    material.uniforms.uReduced.value = sceneMotion.reduced ? 1 : 0;
    (material.uniforms.uPointer.value as THREE.Vector2).set(sceneMotion.pointerX, sceneMotion.pointerY);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
