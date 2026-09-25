"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN_POSITION } from "./PlanetScene";
import { ghostRegistry } from "./labelRegistry";
import { usePlanet } from "@/store/usePlanet";

const v = new THREE.Vector3();
const pv = new THREE.Vector3();
const PLANET_RADIUS = 1.6;

const MAIN_IDX = 3;
const STREAK_IDX = 4;

/**
 * Screen-space sun flare: main glow + anamorphic streak + lens ghosts.
 * Everything is positioned from the sun's live projection, so the whole
 * flare follows the camera as you orbit (nothing is fixed in world space).
 * The streak is drawn through the sun toward the screen center, so its
 * angle visibly rotates as the camera moves.
 */
export function FlareProjector() {
  useFrame((state) => {
    const { camera, size } = state;
    const persp = camera as THREE.PerspectiveCamera;
    const { warpPhase, warpTarget } = usePlanet.getState();
    const inSun = warpTarget === "sun" && warpPhase !== "idle";

    v.set(SUN_POSITION[0], SUN_POSITION[1], SUN_POSITION[2]).project(camera);

    const inFront = v.z < 1 && v.z > -1;
    const sx = (v.x * 0.5 + 0.5) * size.width;
    const sy = (-v.y * 0.5 + 0.5) * size.height;
    const cx = size.width / 2;
    const cy = size.height / 2;
    const distFromCenter = Math.hypot(v.x, v.y);
    // Relaxed curve: the old 1.35 cutoff killed the flare the moment the
    // sun neared the frame edge, so it was almost never visible.
    let fade = inFront ? Math.max(0, Math.min(1, 1.6 - distFromCenter * 0.9)) : 0;

    // Planet disc on screen: flare hiding behind it must fade out
    pv.set(0, 0, 0).project(camera);
    const planetInFront = pv.z < 1;
    const planetSx = (pv.x * 0.5 + 0.5) * size.width;
    const planetSy = (-pv.y * 0.5 + 0.5) * size.height;
    const planetDist = camera.position.length();
    const planetPx =
      ((PLANET_RADIUS / planetDist) /
        Math.tan(THREE.MathUtils.degToRad(persp.fov / 2))) *
      (size.height / 2);

    // Sun behind the planet (ray from camera to sun intersects planet)?
    const camPos = camera.position;
    const toSun = new THREE.Vector3()
      .set(SUN_POSITION[0], SUN_POSITION[1], SUN_POSITION[2])
      .sub(camPos);
    const sunDist = toSun.length();
    const sunDir = toSun.normalize();
    const toPlanet = new THREE.Vector3(0, 0, 0).sub(camPos);
    const planetDistCam = toPlanet.length();
    const planetDir = toPlanet.normalize();
    const cosAngle = sunDir.dot(planetDir);
    const angle = Math.acos(Math.min(1, Math.max(-1, cosAngle)));
    const planetAngularRadius = Math.asin(Math.min(1, PLANET_RADIUS / planetDistCam));
    const sunBehindPlanet = planetDistCam < sunDist && angle < planetAngularRadius;

    const blocked = inSun || sunBehindPlanet;
    if (blocked) fade = 0;

    // Streak angle: line through the sun toward screen center (degrees).
    const streakAngle = (Math.atan2(sy - cy, sx - cx) * 180) / Math.PI;

    const main = ghostRegistry.get(MAIN_IDX);
    if (main) {
      main.style.transform = `translate(-50%,-50%) translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`;
      main.style.opacity = (fade * 0.9).toFixed(2);
    }
    const streak = ghostRegistry.get(STREAK_IDX);
    if (streak) {
      streak.style.transform = `translate(-50%,-50%) translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) rotate(${streakAngle.toFixed(1)}deg)`;
      streak.style.opacity = (fade * 0.75).toFixed(2);
    }

    GHOSTS.forEach((g, i) => {
      const el = ghostRegistry.get(i);
      if (!el) return;
      const gx = sx + (cx - sx) * g.t;
      const gy = sy + (cy - sy) * g.t;
      const overPlanet =
        planetInFront &&
        Math.hypot(gx - planetSx, gy - planetSy) < planetPx;
      el.style.transform = `translate(-50%,-50%) translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px)`;
      el.style.opacity = blocked || overPlanet ? "0" : (fade * g.base).toFixed(2);
    });
  });

  return null;
}

const GHOSTS = [
  { t: 0.45, base: 0.75 },
  { t: 0.75, base: 0.6 },
  { t: 1.25, base: 0.45 },
];
