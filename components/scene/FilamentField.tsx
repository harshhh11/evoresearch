"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneMotion } from "./motion-state";

function seeded(seedStart: number) {
  let seed = seedStart;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const filamentVertexShader = `
  attribute vec3 color;
  attribute float aPathT;
  attribute float aPathSeed;
  uniform float uTime;
  uniform float uStage;
  uniform float uVelocity;
  uniform float uReduced;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float stage = mix(uStage, 0.0, uReduced);
    float motion = 1.0 - uReduced;
    float pathways = smoothstep(0.35, 0.8, stage) * (1.0 - smoothstep(1.35, 1.8, stage));
    float evidence = smoothstep(1.65, 2.05, stage) * (1.0 - smoothstep(2.75, 3.1, stage));
    float repair = smoothstep(2.65, 3.0, stage) * (1.0 - smoothstep(3.8, 4.1, stage));
    float budget = smoothstep(3.65, 4.0, stage) * (1.0 - smoothstep(4.8, 5.1, stage));
    float collaboration = smoothstep(4.85, 5.2, stage) * (1.0 - smoothstep(5.7, 6.0, stage));
    float angle = aPathSeed * 6.28318;
    float along = smoothstep(0.08, 0.5, aPathT);
    float cluster = floor(aPathSeed * 3.0) - 1.0;
    float layer = cluster;
    vec3 p = position;

    float arc = sin(aPathT * 3.14159) * pathways * 0.18;
    p.x += cos(angle + aPathT * 1.5) * arc;
    p.y += sin(angle + aPathT * 1.5) * arc;
    p.z += layer * 0.38 * evidence * smoothstep(0.08, 0.32, aPathT);
    p.x += cos(angle) * 0.16 * budget * along;
    p.y += sin(angle) * 0.16 * budget * along;
    p.x += cluster * 0.2 * collaboration * along;
    p.y += sin(aPathSeed * 31.4159) * 0.13 * collaboration * along;

    float repairSignal = sin(uTime * 1.4 + aPathSeed * 6.28318 + aPathT * 10.0) * 0.13 * repair * motion;
    p += normalize(p) * repairSignal;
    float drift = sin(uTime * 0.16 * (1.0 + uVelocity) + aPathSeed * 19.0 + aPathT * 5.0) * (0.007 + uVelocity * 0.008) * motion;
    p += vec3(drift, drift * cos(angle), drift * sin(angle));

    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    vColor = color;
    vColor = mix(vColor, vec3(0.69, 1.0, 0.56), pathways * 0.19 + collaboration * 0.18);
    vColor = mix(vColor, vec3(0.57, 0.82, 0.9), evidence * 0.17);
    float shimmer = 1.0 + sin(uTime * 0.32 + aPathSeed * 18.0 + aPathT * 4.0) * 0.06 * motion;
    vAlpha = uOpacity * shimmer * (0.76 + aPathT * 0.24);
  }
`;

const filamentFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function makeFilaments() {
  const geometry = new THREE.BufferGeometry();
  const random = seeded(413);
  const paths = 72;
  const segments = 32;
  const vertexCount = paths * segments * 2;
  const positions = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const pathProgress = new Float32Array(vertexCount);
  const pathSeeds = new Float32Array(vertexCount);
  const palette = [new THREE.Color("#B5FF8A"), new THREE.Color("#C7E6E5"), new THREE.Color("#D9E2DB")];
  let vertex = 0;

  for (let path = 0; path < paths; path += 1) {
    const rootRandom = seeded(413 + Math.floor(path / 3) * 7919);
    const branch = (path % 3) - 1;
    const y = rootRandom() * 2 - 1;
    const phi = rootRandom() * Math.PI * 2;
    const horizontal = Math.sqrt(1 - y * y);
    const axis = new THREE.Vector3(Math.cos(phi) * horizontal, y, Math.sin(phi) * horizontal);
    const tangent = new THREE.Vector3(-axis.z, 0.18 + rootRandom() * 0.6, axis.x).normalize();
    const forkDirection = new THREE.Vector3().crossVectors(axis, tangent).normalize();
    const bend = (rootRandom() - 0.5) * 0.2;
    const color = palette[Math.floor(random() * palette.length)].clone().multiplyScalar(0.55 + random() * 0.5);
    const pathSeed = (path + 0.5) / paths;

    const at = (t: number) => {
      const radius = 0.44 + t * 1.73;
      const curve = Math.sin(t * Math.PI * 1.7 + path * 0.7) * bend;
      const fork = Math.max(0, t - 0.18) * branch * 0.15;
      return axis.clone().multiplyScalar(radius).add(tangent.clone().multiplyScalar(curve)).add(forkDirection.clone().multiplyScalar(fork));
    };

    let previous = at(0);
    let previousT = 0;
    for (let i = 1; i <= segments; i += 1) {
      const currentT = i / segments;
      const current = at(currentT);
      for (const [point, pathT] of [[previous, previousT], [current, currentT]] as const) {
        const offset = vertex * 3;
        positions[offset] = point.x;
        positions[offset + 1] = point.y;
        positions[offset + 2] = point.z;
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
        pathProgress[vertex] = pathT;
        pathSeeds[vertex] = pathSeed;
        vertex += 1;
      }
      previous = current;
      previousT = currentT;
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aPathT", new THREE.BufferAttribute(pathProgress, 1));
  geometry.setAttribute("aPathSeed", new THREE.BufferAttribute(pathSeeds, 1));
  geometry.computeBoundingSphere();
  return geometry;
}

function makeStarGeometry() {
  const geometry = new THREE.BufferGeometry();
  const count = 520;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const random = seeded(221);
  for (let i = 0; i < count; i += 1) {
    const radius = 7 + random() * 17;
    const y = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const horizontal = Math.sqrt(1 - y * y);
    const idx = i * 3;
    positions[idx] = Math.cos(angle) * horizontal * radius;
    positions[idx + 1] = y * radius;
    positions[idx + 2] = Math.sin(angle) * horizontal * radius;
    const tint = random() > 0.7 ? new THREE.Color("#97BECE") : new THREE.Color("#D6E1DB");
    const intensity = 0.16 + random() * 0.42;
    colors[idx] = tint.r * intensity;
    colors[idx + 1] = tint.g * intensity;
    colors[idx + 2] = tint.b * intensity;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function FilamentField() {
  const geometry = useMemo(makeFilaments, []);
  const stars = useMemo(makeStarGeometry, []);
  const strandMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uStage: { value: 0 },
          uVelocity: { value: 0 },
          uReduced: { value: 0 },
          uOpacity: { value: 0.2 },
        },
        vertexShader: filamentVertexShader,
        fragmentShader: filamentFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const starMaterial = useMemo(
    () => new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.66, depthWrite: false, sizeAttenuation: true }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      stars.dispose();
      strandMaterial.dispose();
      starMaterial.dispose();
    };
  }, [geometry, stars, strandMaterial, starMaterial]);

  useFrame(({ clock }) => {
    strandMaterial.uniforms.uTime.value = clock.elapsedTime;
    strandMaterial.uniforms.uStage.value = sceneMotion.stage;
    strandMaterial.uniforms.uVelocity.value = sceneMotion.velocity;
    strandMaterial.uniforms.uReduced.value = sceneMotion.reduced ? 1 : 0;
    strandMaterial.uniforms.uOpacity.value = sceneMotion.reduced
      ? 0.19
      : 0.18 + (sceneMotion.stage > 2.4 && sceneMotion.stage < 3.5 ? 0.075 : 0);
    starMaterial.opacity = sceneMotion.reduced ? 0.62 : 0.54 + Math.sin(clock.elapsedTime * 0.12) * 0.07;
  });

  return (
    <>
      <lineSegments geometry={geometry} material={strandMaterial} frustumCulled={false} />
      <points geometry={stars} material={starMaterial} frustumCulled={false} />
    </>
  );
}
