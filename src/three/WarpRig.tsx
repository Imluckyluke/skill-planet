"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SUN_POSITION } from "./PlanetScene";
import { GALAXY_POSITION } from "./Galaxy";
import { usePlanet } from "@/store/usePlanet";

const OVERVIEW = new THREE.Vector3(0, 2.6, 9.5);
const fromPos = new THREE.Vector3();
const destPos = new THREE.Vector3();
const lookPos = new THREE.Vector3();

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function destinationFor(target: "sun" | "galaxy") {
  if (target === "sun") {
    lookPos.set(SUN_POSITION[0], SUN_POSITION[1], SUN_POSITION[2]);
    destPos.copy(lookPos).add(new THREE.Vector3(13, -10, 40).normalize().multiplyScalar(13));
  } else {
    lookPos.set(GALAXY_POSITION[0], GALAXY_POSITION[1], GALAXY_POSITION[2]);
    destPos.copy(lookPos).add(new THREE.Vector3(-46, 21, 72).normalize().multiplyScalar(38));
  }
  return { destPos, lookPos };
}

/** Drives the warp flights; OrbitControls take over on arrival. */
export function WarpRig() {
  const progress = useRef(0);
  const lastPhase = useRef<string>("idle");

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { warpTarget, warpPhase, setWarpPhase, endWarp } =
      usePlanet.getState();
    const camera = state.camera as THREE.PerspectiveCamera;
    const controls = state.controls as unknown as OrbitControlsImpl | null;

    if (warpPhase !== lastPhase.current) {
      lastPhase.current = warpPhase;
      progress.current = 0;
      fromPos.copy(camera.position);
      if (controls) controls.enabled = false;
    }

    if (warpPhase === "out" && warpTarget) {
      progress.current = Math.min(1, progress.current + delta / 1.8);
      const t = easeInOutCubic(progress.current);
      const { destPos: dest, lookPos: look } = destinationFor(warpTarget);
      camera.position.lerpVectors(fromPos, dest, t);
      camera.lookAt(look);
      camera.fov = 45 + Math.sin(Math.PI * Math.min(1, progress.current * 1.15)) * 50;
      camera.updateProjectionMatrix();
      if (progress.current >= 1) {
        camera.fov = 55;
        camera.updateProjectionMatrix();
        if (controls) {
          controls.target.copy(look);
          controls.enabled = true;
        }
        setWarpPhase("in");
      }
    } else if (warpPhase === "back") {
      progress.current = Math.min(1, progress.current + delta / 1.4);
      const t = easeInOutCubic(progress.current);
      camera.position.lerpVectors(fromPos, OVERVIEW, t);
      camera.lookAt(0, 0, 0);
      camera.fov = 55 - 10 * t;
      camera.updateProjectionMatrix();
      if (progress.current >= 1) {
        camera.fov = 45;
        camera.updateProjectionMatrix();
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.enabled = true;
        }
        endWarp();
      }
    }
  });

  return null;
}
