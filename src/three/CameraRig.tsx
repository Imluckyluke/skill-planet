"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SKILL_CATEGORIES } from "@/data/skills";
import { usePlanet } from "@/store/usePlanet";

const desired = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const selectedId = usePlanet((s) => s.selectedId);
  const warpPhase = usePlanet((s) => s.warpPhase);

  useFrame((state, delta) => {
    const c = controls.current;
    if (!c) return;
    // WarpRig owns the camera during flights + warp views. Don't fight it:
    // touching target/update here is what snapped the view back to the planet.
    if (warpPhase !== "idle") {
      c.autoRotate = false;
      return;
    }
    c.autoRotate = selectedId === null;

    const active = SKILL_CATEGORIES.find((k) => k.id === selectedId);
    if (active) {
      desired.set(active.position[0], active.position[1], active.position[2]);
      desired.multiplyScalar(1.95);
      desired.y += 1.1;
      state.camera.position.lerp(desired, 1 - Math.exp(-2.5 * delta));
      lookTarget.set(
        active.position[0],
        active.position[1],
        active.position[2],
      );
      c.target.lerp(lookTarget, 1 - Math.exp(-4 * delta));
    } else {
      lookTarget.set(0, 0, 0);
      c.target.lerp(lookTarget, 1 - Math.exp(-2 * delta));
    }
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={4}
      maxDistance={16}
      autoRotate
      autoRotateSpeed={0.7}
      enableDamping
    />
  );
}
