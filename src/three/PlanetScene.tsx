"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Planet } from "./Planet";
import { SkillIsland } from "./SkillIsland";
import { CameraRig } from "./CameraRig";
import { LabelProjector } from "./LabelProjector";
import { SKILL_CATEGORIES } from "@/data/skills";
import { usePlanet } from "@/store/usePlanet";
import { Galaxy, GALAXY_POSITION } from "./Galaxy";
import { BlackHole, BLACK_HOLE_POSITION } from "./BlackHole";
import { FlareProjector } from "./FlareProjector";
import { WarpRig } from "./WarpRig";
import { WarpTargets } from "./WarpTargets";
import { getSunTexture } from "./textures";

export const SUN_POSITION: [number, number, number] = [-34, 12, -42];

export function PlanetScene() {
  const select = usePlanet((s) => s.select);
  const setPlanetOpen = usePlanet((s) => s.setPlanetOpen);
  const startWarp = usePlanet((s) => s.startWarp);
  // Hide the distant billboard while its immersive surface is shown.
  const warpTarget = usePlanet((s) => s.warpTarget);
  const warpPhase = usePlanet((s) => s.warpPhase);
  const warpedTo = (t: string) =>
    warpTarget === t && (warpPhase === "in" || warpPhase === "out");

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
        {/* Distant sun sprite (small, always visible unless warped to it).
            NOTE: the old world-space anamorphic streak sprite was removed here:
            as a 3D sprite it stayed fixed across the main orbit and cut through
            the planet. The streak now lives in screen space (SunFlare) and
            follows the sun's projection, so it moves/rotates with the camera. */}
        {!warpedTo("sun") && (
          <group position={SUN_POSITION}>
            <sprite scale={[5.5, 5.5, 1]}>
              <spriteMaterial
                map={getSunTexture()}
                transparent
                opacity={0.98}
                depthWrite={false}
              />
            </sprite>
          </group>
        )}

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
        {!warpedTo("galaxy") && <Galaxy />}
        {!warpedTo("blackhole") && <BlackHole />}

        {/* Detailed warp targets - only rendered when warped to that target */}
        <WarpTargets />

        {/* Invisible click targets — sized to NOT overlap each other
            (old radii 9/28/12 overlapped since sun & BH were ~22 units apart). */}
        <mesh
          position={SUN_POSITION}
          onClick={(e) => {
            e.stopPropagation();
            startWarp("sun");
          }}
          onPointerOver={hoverOn}
          onPointerOut={hoverOff}
        >
          <sphereGeometry args={[6, 16, 16]} />
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
          <sphereGeometry args={[20, 16, 16]} />
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
          <sphereGeometry args={[7, 16, 16]} />
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