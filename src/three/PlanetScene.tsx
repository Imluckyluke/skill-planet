"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Planet } from "./Planet";
import { SkillIsland } from "./SkillIsland";
import { CameraRig } from "./CameraRig";
import { LabelProjector } from "./LabelProjector";
import { SKILL_CATEGORIES } from "@/data/skills";
import { usePlanet } from "@/store/usePlanet";
import { getStreakTexture, getSunTexture } from "./textures";
import { Galaxy, GALAXY_POSITION } from "./Galaxy";
import { BlackHole, BLACK_HOLE_POSITION } from "./BlackHole";
import { FlareProjector } from "./FlareProjector";
import { WarpRig } from "./WarpRig";

export const SUN_POSITION: [number, number, number] = [-13, 10, -40];

export function PlanetScene() {
  const select = usePlanet((s) => s.select);
  const setPlanetOpen = usePlanet((s) => s.setPlanetOpen);
  const startWarp = usePlanet((s) => s.startWarp);

  const clearAll = () => {
    select(null);
    setPlanetOpen(false);
  };

  const hoverOn = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const hoverOff = () => {
    document.body.style.cursor = "auto";
  };

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.6, 9.5], fov: 45 }}
      onPointerMissed={clearAll}
    >
      <color attach="background" args={["#05070f"]} />
      <ambientLight intensity={0.35} />
      {/* Key light from the distant sun: carves specular highlights on the orbs */}
      <directionalLight
        position={[-6.5, 5, -20]}
        intensity={2.4}
        color="#fff1d6"
      />
      {/* Cool planetary bounce so shadow sides stay readable */}
      <directionalLight position={[8, -4, 10]} intensity={0.5} color="#60a5fa" />
      <Suspense fallback={null}>
        {/* Distant sun: hot core + anamorphic lens streaks */}
        <group position={SUN_POSITION}>
          <sprite scale={[5.5, 5.5, 1]}>
            <spriteMaterial
              map={getSunTexture()}
              transparent
              opacity={0.98}
              depthWrite={false}
            />
          </sprite>
          <sprite scale={[18, 1.4, 1]}>
            <spriteMaterial
              map={getStreakTexture()}
              color="#cfe0ff"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              depthTest
            />
          </sprite>
        </group>
        <Stars
          radius={60}
          depth={30}
          count={3500}
          factor={2.5}
          saturation={0}
          fade
          speed={0.6}
        />
        <Planet />
        {SKILL_CATEGORIES.map((c) => (
          <SkillIsland key={c.id} category={c} />
        ))}
        <Galaxy />
        <BlackHole />
        {/* Generous invisible click targets for warping */}
        <mesh
          position={SUN_POSITION}
          onClick={(e) => {
            e.stopPropagation();
            startWarp("sun");
          }}
          onPointerOver={hoverOn}
          onPointerOut={hoverOff}
        >
          <sphereGeometry args={[7, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh
          position={GALAXY_POSITION}
          onClick={(e) => {
            e.stopPropagation();
            startWarp("galaxy");
          }}
          onPointerOver={hoverOn}
          onPointerOut={hoverOff}
        >
          <sphereGeometry args={[22, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh
          position={BLACK_HOLE_POSITION}
          onClick={(e) => {
            e.stopPropagation();
            startWarp("blackhole");
          }}
          onPointerOver={hoverOn}
          onPointerOut={hoverOff}
        >
          <sphereGeometry args={[9, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <CameraRig />
        <LabelProjector />
        <FlareProjector />
        <WarpRig />
      </Suspense>
      <EffectComposer multisampling={4}>
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.6}
          mipmapBlur
        />
        <Vignette offset={0.25} darkness={0.55} />
      </EffectComposer>
    </Canvas>
  );
}
