"use client";

import { getGlowTexture } from "./textures";

/** Distant black hole: event-horizon shadow, photon glow, accretion disk. */
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
      <mesh rotation={[Math.PI / 2.15, 0, 0]}>
        <torusGeometry args={[4.8, 0.22, 12, 128]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.9} />
      </mesh>
      <mesh rotation={[Math.PI / 2.15, 0, 0]}>
        <torusGeometry args={[6.6, 0.6, 12, 128]} />
        <meshBasicMaterial
          color="#ff7a3c"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}