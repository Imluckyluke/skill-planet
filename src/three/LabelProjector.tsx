"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SKILL_CATEGORIES } from "@/data/skills";
import { anchorRegistry, pillRegistry } from "./labelRegistry";
import { usePlanet } from "@/store/usePlanet";

const v = new THREE.Vector3();
const toIsland = new THREE.Vector3();
const toPlanet = new THREE.Vector3();
const PLANET_RADIUS = 1.85;

/**
 * Projects island anchors to screen space every frame and positions the
 * DOM label pills. Direct DOM writes (no React state) keep this at 60fps.
 */
export function LabelProjector() {
  useFrame((state) => {
    const { camera, size } = state;
    // Hide island pills while warped — they'd float over the surface view.
    const { warpPhase } = usePlanet.getState();
    const warped = warpPhase !== "idle";
    toPlanet.set(0, 0, 0).sub(camera.position);
    const distPlanet = toPlanet.length();
    const planetAngular = Math.asin(Math.min(1, PLANET_RADIUS / distPlanet));

    for (const c of SKILL_CATEGORIES) {
      const anchor = anchorRegistry.get(c.id);
      const pill = pillRegistry.get(c.id);
      if (!anchor || !pill) continue;

      anchor.updateWorldMatrix(true, false);
      const labelHeight =
        typeof anchor.userData.labelHeight === "number"
          ? anchor.userData.labelHeight
          : 1;
      v.set(0, labelHeight, 0).applyMatrix4(anchor.matrixWorld);

      toIsland.copy(v).sub(camera.position);
      const distIsland = toIsland.length();

      v.project(camera);
      const behindCamera = v.z > 1 || v.z < -1;
      const occluded =
        distIsland > distPlanet && toIsland.angleTo(toPlanet) < planetAngular;

      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      pill.style.transform = `translate(-50%,-50%) translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      pill.style.opacity = warped || behindCamera || occluded ? "0" : "1";
    }
  });

  return null;
}
