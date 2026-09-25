"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { usePlanet } from "@/store/usePlanet";
import { getGlowTexture } from "./textures";

const R = 7;

export const SUN_SURFACE_POSITION: [number, number, number] = [0, 0, 0];

/**
 * Real-sun-like surface, built from scratch:
 * - animated boiling photosphere (custom GLSL: 3D fbm granulation + limb darkening)
 * - ballistic plasma eruption jets (molten gas fountains rising and falling back)
 * - breathing prominence loops + corona glow
 * Rendered at local origin — WarpTargets places it at SUN_POSITION.
 */
export function SunSurface({ isWarpView = false }: { isWarpView?: boolean }) {
  const startWarp = usePlanet((s) => s.startWarp);

  const onSunClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isWarpView) startWarp("sun");
  };

  return (
    <group position={SUN_SURFACE_POSITION}>
      <Photosphere onSunClick={onSunClick} />

      {/* Corona glow */}
      <sprite scale={[30, 30, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color="#fff3d6"
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </sprite>
      <sprite scale={[52, 52, 1]}>
        <spriteMaterial
          map={getGlowTexture()}
          color="#ffb066"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </sprite>

      {/* Molten gas eruptions */}
      <EruptionJets />

      {/* Prominence loops, slowly wheeling around the limb */}
      <ProminenceField />
    </group>
  );
}

/* ---------------------------------- photosphere ---------------------------------- */

const VERT = /* glsl */ `
varying vec3 vObjN;
varying vec3 vNormalW;
varying vec3 vPosW;
void main() {
  vObjN = normalize(position);
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vObjN;
varying vec3 vNormalW;
varying vec3 vPosW;

float hash3(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1,0,0)), u.x),
        mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), u.x), u.y),
    mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), u.x),
        mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), u.x), u.y),
    u.z);
}
float fbm3(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise3(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec3 n = normalize(vObjN);
  float t = uTime * 0.15;
  // Boiling granulation: two fbm layers churning against each other (seamless 3D noise)
  float n1 = fbm3(n * 3.0 + vec3(0.0, t * 0.7, t * 0.4));
  float n2 = fbm3(n * 6.5 - vec3(t * 1.1, 0.0, t * 0.8));
  float g = n1 * 0.68 + n2 * 0.32;

  vec3 dark  = vec3(0.42, 0.07, 0.0);
  vec3 mid   = vec3(1.0, 0.36, 0.04);
  vec3 hot   = vec3(1.0, 0.80, 0.40);
  vec3 white = vec3(1.0, 0.99, 0.92);
  vec3 col = mix(dark, mid, smoothstep(0.28, 0.55, g));
  col = mix(col, hot, smoothstep(0.52, 0.72, g));
  col = mix(col, white, smoothstep(0.72, 0.90, g));

  // Limb darkening: the edge burns deep red
  vec3 V = normalize(cameraPosition - vPosW);
  float limb = clamp(dot(normalize(vNormalW), V), 0.0, 1.0);
  col *= mix(0.32, 1.18, pow(limb, 0.55));
  col = mix(vec3(0.55, 0.09, 0.0), col, smoothstep(0.0, 0.38, limb));

  // Slow global breathing
  col *= 0.96 + 0.06 * sin(uTime * 0.8);

  gl_FragColor = vec4(col * 1.6, 1.0);
}
`;

function Photosphere({ onSunClick }: { onSunClick: (e: ThreeEvent<MouseEvent>) => void }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: { uTime: { value: 0 } },
      }),
    [],
  );

  useFrame((state, delta) => {
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    if (mesh.current) mesh.current.rotation.y += delta * 0.03;
  });

  return (
    <mesh
      ref={mesh}
      onClick={onSunClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <sphereGeometry args={[R, 96, 96]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* -------------------------------- eruption jets ---------------------------------- */

const SITES = 14;
const PER_SITE = 45;
const COUNT = SITES * PER_SITE;
const GRAV = 3.4;

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ballistic plasma fountains: gas erupts along the surface normal and falls back. */
function EruptionJets() {
  const { positions, colors, vels, ages, lives, siteOf } = useMemo(() => {
    const rand = mulberry(1234);
    const sites: THREE.Vector3[] = [];
    for (let i = 0; i < SITES; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      sites.push(new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a)));
    }
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const vels = new Float32Array(COUNT * 3);
    const ages = new Float32Array(COUNT);
    const lives = new Float32Array(COUNT);
    const siteOf = new Uint8Array(COUNT);
    const spawn = (i: number, stagger: boolean) => {
      const s = sites[i % SITES];
      siteOf[i] = i % SITES;
      const jx = (rand() - 0.5) * 0.5;
      const jy = (rand() - 0.5) * 0.5;
      const jz = (rand() - 0.5) * 0.5;
      const nx = s.x + jx * 0.3;
      const ny = s.y + jy * 0.3;
      const nz = s.z + jz * 0.3;
      positions[i * 3] = nx * (R + 0.15);
      positions[i * 3 + 1] = ny * (R + 0.15);
      positions[i * 3 + 2] = nz * (R + 0.15);
      // Erupt along the normal with a sideways kick
      const speed = 2.6 + rand() * 3.8;
      vels[i * 3] = nx * speed + (rand() - 0.5) * 2.2;
      vels[i * 3 + 1] = ny * speed + (rand() - 0.5) * 2.2;
      vels[i * 3 + 2] = nz * speed + (rand() - 0.5) * 2.2;
      lives[i] = 1.4 + rand() * 1.8;
      ages[i] = stagger ? rand() * lives[i] : 0;
    };
    for (let i = 0; i < COUNT; i++) spawn(i, true);
    return { positions, colors, vels, ages, lives, siteOf, spawn, sites };
  }, []);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const fresh = useMemo(() => new THREE.Color("#ffe6bd"), []);
  const spent = useMemo(() => new THREE.Color("#ff2d00"), []);
  const cc = useMemo(() => new THREE.Color(), []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    for (let i = 0; i < COUNT; i++) {
      ages[i] += delta;
      const ix = i * 3;
      if (ages[i] >= lives[i]) {
        spawn(i, false);
        continue;
      }
      // Gravity pulls back toward the sun's center
      tmp.set(positions[ix], positions[ix + 1], positions[ix + 2]);
      const dist = tmp.length();
      if (dist < R - 0.25) {
        spawn(i, false);
        continue;
      }
      tmp.divideScalar(dist); // center direction
      vels[ix] -= tmp.x * GRAV * delta;
      vels[ix + 1] -= tmp.y * GRAV * delta;
      vels[ix + 2] -= tmp.z * GRAV * delta;
      positions[ix] += vels[ix] * delta;
      positions[ix + 1] += vels[ix + 1] * delta;
      positions[ix + 2] += vels[ix + 2] * delta;
      // Fresh ejecta burns white-hot, cooling to deep red as it falls
      const k = 1 - ages[i] / lives[i];
      cc.copy(spent).lerp(fresh, k * k);
      colors[ix] = cc.r;
      colors[ix + 1] = cc.g;
      colors[ix + 2] = cc.b;
    }
    (geom.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (geom.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points geometry={geom} frustumCulled={false}>
      <pointsMaterial
        size={0.45}
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}

/* ------------------------------- prominence loops -------------------------------- */

function ProminenceField() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.02;
  });
  return (
    <group ref={group}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ProminenceLoop key={i} seed={i} />
      ))}
    </group>
  );
}

function ProminenceLoop({ seed }: { seed: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const geom = useMemo(() => {
    const rand = mulberry(seed + 77);
    const points: THREE.Vector3[] = [];
    const steps = 32;
    const baseR = R + 0.4;
    const height = 4.5 + rand() * 4;
    const width = 1.6 + rand() * 2.2;
    const twist = rand() * Math.PI * 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI;
      const r = baseR + Math.sin(angle) * width;
      const y = Math.sin(angle) * height;
      points.push(
        new THREE.Vector3(
          r * Math.cos(twist) + (rand() - 0.5) * 0.3,
          y * 0.6 - 1.2,
          r * Math.sin(twist) + (rand() - 0.5) * 0.3,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 48, 0.17, 8, false);
  }, [seed]);

  const phase = useMemo(() => seed * 1.7, [seed]);
  const speed = useMemo(() => 0.5 + (seed % 3) * 0.22, [seed]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breathe = 0.5 + 0.5 * Math.sin(t * speed + phase);
    if (mesh.current) mesh.current.scale.set(1, 0.8 + breathe * 0.5, 1);
    if (material.current) material.current.opacity = 0.4 + breathe * 0.4;
  });

  return (
    <mesh ref={mesh} geometry={geom}>
      <meshBasicMaterial
        ref={material}
        color="#ff6b2e"
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
