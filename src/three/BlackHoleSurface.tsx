"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getGlowTexture } from "./textures";

const DISK_TILT: [number, number, number] = [Math.PI / 2.15, 0, 0];

/**
 * Warp-view black hole: event-horizon shadow, photon glow, accretion disk,
 * plus light being stretched and dragged in — spiral streamers + infalling
 * particles that accelerate toward the horizon and redden as they fall.
 */
export function BlackHoleSurface() {
  return (
    <group position={[0, 0, 0]} rotation={[0.3, 0, -0.2]} scale={[2.5, 2.5, 2.5]}>
      {/* Photon glow behind the shadow */}
      <sprite scale={[13, 13, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color="#ff9a3c"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </sprite>

      {/* Event horizon shadow */}
      <mesh>
        <sphereGeometry args={[3, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Accretion disk rim */}
      <mesh rotation={DISK_TILT}>
        <torusGeometry args={[4.8, 0.22, 12, 128]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.9} />
      </mesh>
      <mesh rotation={DISK_TILT}>
        <torusGeometry args={[6.6, 0.6, 12, 128]} />
        <meshBasicMaterial
          color="#ff7a3c"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* Light stretched into the hole */}
      <group rotation={DISK_TILT}>
        <StreamTubes />
        <InfallParticles />
      </group>
    </group>
  );
}

/* ------------------------- stretched spiral streamers ------------------------- */

const ARMS = 5;
const R_OUT = 9.6;
const R_IN = 3.25;
const TURNS = 2.1;

function spiralPoint(arm: number, s: number, out: THREE.Vector3) {
  // s: 1 = outer edge, 0 = horizon
  const r = R_IN + s * (R_OUT - R_IN);
  const a = (arm / ARMS) * Math.PI * 2 + s * TURNS * Math.PI * 2;
  out.set(Math.cos(a) * r, Math.sin(a) * r, (1 - s) * 0.35);
  return out;
}

/** Static glowing trails along the infall spirals — the "stretched light" look. */
function StreamTubes() {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);
  const geoms = useMemo(() => {
    return Array.from({ length: ARMS }, (_, arm) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        pts.push(spiralPoint(arm, 1 - i / 64, new THREE.Vector3()).clone());
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.07, 6, false);
    });
  }, []);

  useFrame((state, delta) => {
    if (group.current) group.current.rotation.z += delta * 0.45;
    const pulse = 0.32 + 0.14 * Math.sin(state.clock.elapsedTime * 2.2);
    mats.current.forEach((m) => {
      if (m) m.opacity = pulse;
    });
  });

  return (
    <group ref={group}>
      {geoms.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial
            ref={(m) => {
              if (m) mats.current[i] = m;
            }}
            color="#ffb066"
            transparent
            opacity={0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------- infalling light particles --------------------------- */

const P_COUNT = 520;

function InfallParticles() {
  const dataRef = useRef<{
    positions: Float32Array;
    colors: Float32Array;
    sVals: Float32Array;
  } | null>(null);

  if (dataRef.current === null) {
    const rand = mulberry31(7);
    dataRef.current = {
      positions: new Float32Array(P_COUNT * 3),
      colors: new Float32Array(P_COUNT * 3),
      sVals: Float32Array.from({ length: P_COUNT }, () => rand()),
    };
  }

  const data = dataRef.current;
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
    return g;
  }, [data]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const outer = useMemo(() => new THREE.Color("#fff3d6"), []);
  const mid = useMemo(() => new THREE.Color("#ffb066"), []);
  const inner = useMemo(() => new THREE.Color("#ff3d00"), []);
  const cc = useMemo(() => new THREE.Color(), []);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const swirl = state.clock.elapsedTime * 0.12;
    for (let i = 0; i < P_COUNT; i++) {
      const arm = i % ARMS;
      let s = data.sVals[i] - delta * (0.10 + (1 - data.sVals[i]) * 0.35);
      if (s <= 0) s = 1;
      data.sVals[i] = s;
      spiralPoint(arm, s, tmp);
      const cs = Math.cos(swirl);
      const sn = Math.sin(swirl);
      const x = tmp.x * cs - tmp.y * sn;
      const y = tmp.x * sn + tmp.y * cs;
      data.positions[i * 3] = x;
      data.positions[i * 3 + 1] = y;
      data.positions[i * 3 + 2] = tmp.z;
      if (s > 0.5) cc.copy(mid).lerp(outer, (s - 0.5) * 2);
      else cc.copy(inner).lerp(mid, s * 2);
      data.colors[i * 3] = cc.r;
      data.colors[i * 3 + 1] = cc.g;
      data.colors[i * 3 + 2] = cc.b;
    }
    (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (geom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points geometry={geom} frustumCulled={false}>
      <pointsMaterial
        size={0.22}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}

function mulberry31(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
