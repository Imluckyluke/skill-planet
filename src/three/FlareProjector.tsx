"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN_POSITION } from "./PlanetScene";
import { ghostRegistry } from "./labelRegistry";

const v = new THREE.Vector3();
const pv = new THREE.Vector3();
const PLANET_SCREEN_RADIUS = 2.1;

const GHOSTS = [
  { t: 0.45, base: 0.75 },
  { t: 0.75, base: 0.6 },
  { t: 1.25, base: 0.45 },
];

/**
 * Classic lens ghosts: mirrored across screen center from the sun,
 * fading as the sun leaves the frame or hides behind the camera.
 */
export function FlareProjector() {
  useFrame((state) => {
    const { camera, size } = state;
    const persp = camera as THREE.PerspectiveCamera;
    v.set(SUN_POSITION[0], SUN_POSITION[1], SUN_POSITION[2]).project(camera);

    const visible = v.z < 1;
    const sx = (v.x * 0.5 + 0.5) * size.width;
    const sy = (-v.y * 0.5 + 0.5) * size.height;
    const cx = size.width / 2;
    const cy = size.height / 2;
    const distFromCenter = Math.hypot(v.x, v.y);
    const fade = visible
      ? Math.max(0, Math.min(1, 1.35 - distFromCenter))
      : 0;

    // Planet disc on screen: ghosts hiding behind it must fade out
    pv.set(0, 0, 0).project(camera);
    const planetInFront = pv.z < 1;
    const planetSx = (pv.x * 0.5 + 0.5) * size.width;
    const planetSy = (-pv.y * 0.5 + 0.5) * size.height;
    const planetDist = camera.position.length();
    const planetPx =
      ((PLANET_SCREEN_RADIUS / planetDist) /
        Math.tan(THREE.MathUtils.degToRad(persp.fov / 2))) *
      (size.height / 2);

    GHOSTS.forEach((g, i) => {
      const el = ghostRegistry.get(i);
      if (!el) return;
      const gx = sx + (cx - sx) * g.t;
      const gy = sy + (cy - sy) * g.t;
      const overPlanet =
        planetInFront &&
        Math.hypot(gx - planetSx, gy - planetSy) < planetPx;
      el.style.transform = `translate(-50%,-50%) translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px)`;
      el.style.opacity = overPlanet ? "0" : (fade * g.base).toFixed(2);
    });
  });

  return null;
}
