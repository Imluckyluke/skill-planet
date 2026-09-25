"use client";

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
          <SunSurface isWarpView={true} />
        </group>
      );
    case "galaxy":
      return (
        <group position={GALAXY_POSITION}>
          <GalaxySurface />
        </group>
      );
    case "blackhole":
      return (
        <group position={BLACK_HOLE_POSITION}>
          <BlackHoleSurface />
        </group>
      );
    default:
      return null;
  }
}
