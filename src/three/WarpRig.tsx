"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SUN_POSITION } from "./PlanetScene";
import { GALAXY_POSITION } from "./Galaxy";
import { BLACK_HOLE_POSITION } from "./BlackHole";
import { usePlanet } from "@/store/usePlanet";

const OVERVIEW = new THREE.Vector3(0, 2.6, 9.5);
const fromPos = new THREE.Vector3();
const destPos = new THREE.Vector3();
const lookPos = new THREE.Vector3();

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function destinationFor(target: "sun" | "galaxy" | "blackhole") {
  if (target === "sun") {
    lookPos.set(SUN_POSITION[0], SUN_POSITION[1], SUN_POSITION[2]);
    // Park well off the photosphere: radius 7 + tall plasma jets need room,
    // otherwise the surface swallows the whole frame and feels wrong.
    destPos
      .copy(lookPos)
      .add(new THREE.Vector3(10, -6, 30).normalize().multiplyScalar(16.5));
  } else if (target === "galaxy") {
    lookPos.set(GALAXY_POSITION[0], GALAXY_POSITION[1], GALAXY_POSITION[2]);
    destPos
      .copy(lookPos)
      .add(new THREE.Vector3(-14, 10, 34).normalize().multiplyScalar(26));
  } else {
    lookPos.set(
      BLACK_HOLE_POSITION[0],
      BLACK_HOLE_POSITION[1],
      BLACK_HOLE_POSITION[2],
    );
    // Approach from the scene side so the flight sweeps through the main
    // orbit instead of backing straight out.
    destPos
      .copy(lookPos)
      .add(new THREE.Vector3(-12, -4, -30).normalize().multiplyScalar(13));
  }
  return { destPos, lookPos };
}

const splitCache = { f: -1, w: 0, h: 0 };

/** Shift the 3D view left on wide screens so the side menu owns the right half.
 *  factor 0 = centered, 1 = full split. Animated so entering/exiting the
 *  warp view never jump-cuts (that hard cut is what felt like a page reload).
 *  Skips redundant projection updates (perf: updateProjectionMatrix is not free). */
function applySplitView(
  camera: THREE.PerspectiveCamera,
  size: { width: number; height: number },
  factor: number,
) {
  const f = size.width > 640 ? factor : 0;
  if (f === splitCache.f && size.width === splitCache.w && size.height === splitCache.h) return;
  splitCache.f = f;
  splitCache.w = size.width;
  splitCache.h = size.height;
  if (f > 0.001) {
    camera.setViewOffset(size.width, size.height, size.width * 0.22 * f, 0, size.width, size.height);
  } else {
    camera.clearViewOffset();
  }
  camera.updateProjectionMatrix();
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
      // Flights own the camera; overview + warp views belong to OrbitControls.
      // (Forgetting to re-enable on arrival is what killed drag/zoom after Back.)
      if (controls) controls.enabled = warpPhase !== "out" && warpPhase !== "back";
      // NOTE: no instant clearViewOffset here — the split factor animates
      // continuously (0 at flight starts, easing in/out), so no jump cut.
    }

    if (warpPhase === "idle") {
      // Safety net: controls must never stay disabled in overview.
      if (controls && !controls.enabled) controls.enabled = true;
      return;
    }

    if (warpPhase === "out" && warpTarget) {
      progress.current = Math.min(1, progress.current + delta / 1.8);
      const t = easeInOutCubic(progress.current);
      const { destPos: dest, lookPos: look } = destinationFor(warpTarget);
      camera.position.lerpVectors(fromPos, dest, t);
      camera.lookAt(look);
      camera.fov = 45 + Math.sin(Math.PI * Math.min(1, progress.current * 1.15)) * 50;
      // Ease the split view in over the last stretch of the flight.
      applySplitView(camera, state.size, THREE.MathUtils.smoothstep(progress.current, 0.65, 1));
      camera.updateProjectionMatrix();
      if (progress.current >= 1) {
        camera.fov = 55;
        camera.updateProjectionMatrix();
        if (controls) {
          controls.target.copy(look);
          // Warp parking distances (11–26) exceed the orbit defaults (4–16).
          controls.minDistance = 4;
          controls.maxDistance = 60;
          controls.enabled = true;
          controls.update();
        }
        applySplitView(camera, state.size, 1);
        setWarpPhase("in");
      }
    } else if (warpPhase === "in" && warpTarget) {
      // Keep the lock every frame: damping/autoRotate would otherwise drift
      // the target back toward the planet. Also re-apply split view on resize.
      const { lookPos: look } = destinationFor(warpTarget);
      if (controls) {
        controls.target.lerp(look, 1 - Math.exp(-6 * delta));
        controls.enabled = true;
        controls.update();
      } else {
        camera.lookAt(look);
      }
      applySplitView(camera, state.size, 1);
    } else if (warpPhase === "back") {
      progress.current = Math.min(1, progress.current + delta / 1.4);
      const t = easeInOutCubic(progress.current);
      camera.position.lerpVectors(fromPos, OVERVIEW, t);
      camera.lookAt(0, 0, 0);
      camera.fov = 55 - 10 * t;
      // Ease the split view back out while flying home — a real warp-back,
      // not a cut. The surface stays mounted (see WarpTargets) so you fly
      // away from it instead of it popping out of existence.
      applySplitView(camera, state.size, 1 - t);
      camera.updateProjectionMatrix();
      if (progress.current >= 1) {
        camera.fov = 45;
        camera.clearViewOffset();
        camera.updateProjectionMatrix();
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.minDistance = 4;
          controls.maxDistance = 16;
          controls.enabled = true;
          controls.update();
        }
        endWarp();
      }
    }
  });

  return null;
}
