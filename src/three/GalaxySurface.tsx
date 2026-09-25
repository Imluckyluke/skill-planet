"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 15000;
const RADIUS = 34;
const BRANCHES = 3;
const SPIN = 1.1;
const RANDOMNESS = 0.4;
const POWER = 3;

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Procedural spiral galaxy: warm core fading to cool rim, additive points. */
export function GalaxySurface() {
  const spin = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const rand = mulberry(42);
    const inside = new THREE.Color("#ffb46b");
    const outside = new THREE.Color("#38bdf8");
    const tmp = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const radius = rand() * RADIUS;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spinAngle = radius * SPIN;

      const rx = Math.pow(rand(), POWER) * (rand() < 0.5 ? 1 : -1) * RANDOMNESS * radius;
      const ry = Math.pow(rand(), POWER) * (rand() < 0.5 ? 1 : -1) * RANDOMNESS * radius * 0.5;
      const rz = Math.pow(rand(), POWER) * (rand() < 0.5 ? 1 : -1) * RANDOMNESS * radius;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + rx;
      positions[i * 3 + 1] = ry;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rz;

      tmp.copy(inside).lerp(outside, radius / RADIUS);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    return { positions, colors };
  }, []);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.02;
  });

  return (
    <points
      ref={spin}
      position={[0, 0, 0]}
      rotation={[1.05, 0.15, 0.35]}
      scale={[1.2, 1.2, 1.2]}
    >
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.7}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}