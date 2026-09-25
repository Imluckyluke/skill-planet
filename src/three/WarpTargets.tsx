"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlanet } from "@/store/usePlanet";
import { SunSurface } from "./SunSurface";
import { GalaxySurface } from "./GalaxySurface";
import { BlackHoleSurface } from "./BlackHoleSurface";
import { SUN_POSITION } from "./PlanetScene";
import { GALAXY_POSITION } from "./Galaxy";
import { BLACK_HOLE_POSITION } from "./BlackHole";

/** Immersive surfaces, rendered AT the distant object (entering its atmosphere).
 *  Kept mounted during "back" too, so the Back button flies you away from
 *  the surface instead of it vanishing with a jump cut. */
export function WarpTargets() {
  const { warpPhase, warpTarget } = usePlanet();

  if (warpPhase === "idle" || !warpTarget) return null;

  switch (warpTarget) {
    case "sun":
      return (
        <group position={SUN_POSITION}>
          <Appear>
            <SunSurface isWarpView={true} />
          </Appear>
        </group>
      );
    case "galaxy":
      return (
        <group position={GALAXY_POSITION}>
          <Appear>
            <GalaxySurface />
          </Appear>
        </group>
      );
    case "blackhole":
      return (
        <group position={BLACK_HOLE_POSITION}>
          <Appear>
            <BlackHoleSurface />
          </Appear>
        </group>
      );
    default:
      return null;
  }
}

/** Grow-in animation: the surface materializes during the warp flight
 *  (~1.7s, matching the flight) instead of popping into existence. */
function Appear({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, rawDelta) => {
    if (t.current >= 1) return;
    t.current = Math.min(1, t.current + Math.min(rawDelta, 0.05) / 1.7);
    const e = 1 - Math.pow(1 - t.current, 3);
    ref.current?.scale.setScalar(Math.max(0.001, e));
  });

  return (
    <group ref={ref} scale={0.001}>
      {children}
    </group>
  );
}
