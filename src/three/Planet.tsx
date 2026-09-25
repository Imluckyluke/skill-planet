"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { usePlanet } from "@/store/usePlanet";

export function Planet() {
  const rings = useRef<THREE.Group>(null);
  const select = usePlanet((s) => s.select);
  const setPlanetOpen = usePlanet((s) => s.setPlanetOpen);

  useFrame((_, delta) => {
    if (rings.current) {
      rings.current.rotation.y += delta * 0.06;
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(null);
    setPlanetOpen(true);
  };

  return (
    <group>
      {/* Core */}
      <mesh
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.75} metalness={0.15} />
      </mesh>

      {/* Rotating latitude bands */}
      <group ref={rings}>
        <mesh scale={1.015}>
          <sphereGeometry args={[1.6, 32, 32]} />
          <meshBasicMaterial
            color="#60a5fa"
            wireframe
            transparent
            opacity={0.16}
          />
        </mesh>
      </group>

      {/* Atmosphere glow */}
      <mesh scale={1.18}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
