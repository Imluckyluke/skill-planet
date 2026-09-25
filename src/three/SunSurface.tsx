"use client";

import * as THREE from "three";
import { usePlanet } from "@/store/usePlanet";
import { ThreeEvent } from "@react-three/fiber";
import { getGlowTexture, getSunTexture, getStreakTexture } from "./textures";

export const SUN_SURFACE_POSITION: [number, number, number] = [0, 0, 0];

/** Immersive sun surface: granulated photosphere, prominences, corona.
 *  Rendered at local origin — WarpTargets places it at SUN_POSITION. */
export function SunSurface({ isWarpView = false }: { isWarpView?: boolean }) {
  const startWarp = usePlanet((s) => s.startWarp);

  const onSunClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isWarpView) startWarp("sun");
  };

  return (
    <group position={SUN_SURFACE_POSITION}>
      {/* Photosphere - granulated surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={onSunClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[7, 128, 128]} />
        <meshBasicMaterial
          map={getSunTexture()}
          transparent
          opacity={1}
        />
      </mesh>

      {/* Corona glow */}
      <sprite scale={[28, 28, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color="#fff8e7"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </sprite>

      {/* Prominence loops */}
      <group>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ProminenceLoop key={i} seed={i} />
        ))}
      </group>

      {/* Anamorphic streaks at surface level */}
      <sprite scale={[18, 1.2, 1]}>
        <spriteMaterial
          map={getStreakTexture()}
          color="#ffe8c0"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

function ProminenceLoop({ seed }: { seed: number }) {
  const rand = mulberry(seed + 77);
  const points: THREE.Vector3[] = [];
  const steps = 32;
  const baseR = 7.5;
  const height = 4 + rand() * 3.5;
  const width = 1.5 + rand() * 2;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI;
    const r = baseR + Math.sin(angle) * width;
    const y = Math.sin(angle) * height;
    const twist = rand() * 0.5;
    points.push(
      new THREE.Vector3(
        r * Math.cos(twist),
        y * 0.5 + (rand() - 0.5) * 0.5,
        r * Math.sin(twist),
      ),
    );
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeom = new THREE.TubeGeometry(curve, 48, 0.15, 8, false);

  return (
    <mesh>
      <primitive object={tubeGeom} attach="geometry" />
      <meshBasicMaterial
        color="#ff6b2e"
        transparent
        opacity={0.65}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}