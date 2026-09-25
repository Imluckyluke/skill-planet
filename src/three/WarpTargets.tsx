"use client";

import { usePlanet } from "@/store/usePlanet";
import { SunSurface } from "./SunSurface";
import { GalaxySurface } from "./GalaxySurface";
import { BlackHoleSurface } from "./BlackHoleSurface";

/** Renders the detailed surface only when warped to that target. */
export function WarpTargets() {
  const { warpPhase, warpTarget } = usePlanet();

  if (warpPhase !== "in" || !warpTarget) return null;

  switch (warpTarget) {
    case "sun":
      return <SunSurface isWarpView={true} />;
    case "galaxy":
      return <GalaxySurface />;
    case "blackhole":
      return <BlackHoleSurface />;
    default:
      return null;
  }
}