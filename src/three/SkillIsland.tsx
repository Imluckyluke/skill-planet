"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import type { SkillCategory, OrbShape } from "@/data/skills";
import { usePlanet } from "@/store/usePlanet";
import { anchorRegistry } from "./labelRegistry";

function OrbGeometry({
  shape,
  size,
  detail,
}: {
  shape: OrbShape;
  size: number;
  detail: 0 | 1;
}) {
  switch (shape) {
    case "dodeca":
      return <dodecahedronGeometry args={[size, 0]} />;
    case "octa":
      return <octahedronGeometry args={[size, 0]} />;
    case "tetra":
      return <tetrahedronGeometry args={[size, 1]} />;
    case "knot":
      return <torusKnotGeometry args={[size * 0.62, size * 0.2, 64, 10]} />;
    case "ico":
    default:
      return <icosahedronGeometry args={[size, detail]} />;
  }
}

export function SkillIsland({ category }: { category: SkillCategory }) {
  const { selectedId, select, hover } = usePlanet();
  const mesh = useRef<THREE.Mesh>(null);
  const anchor = useRef<THREE.Group>(null);
  const moonPivot = useRef<THREE.Group>(null);
  const [localHover, setLocalHover] = useState(false);

  const selected = selectedId === category.id;
  const { size } = category;
  const moonOrbit = size * 2.1;

  useEffect(() => {
    if (anchor.current) {
      anchor.current.userData.labelHeight = size + 0.55;
      anchorRegistry.set(category.id, anchor.current);
    }
    return () => {
      anchorRegistry.delete(category.id);
    };
  }, [category.id, size]);

  useFrame((state) => {
    const m = mesh.current;
    if (m) {
      const mat = m.material as THREE.MeshStandardMaterial;
      const targetScale = selected ? 1.5 : localHover ? 1.25 : 1;
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, targetScale, 0.12));
      mat.emissive.set(category.color);
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        selected || localHover ? 0.45 : 0.07,
        0.12,
      );
    }
    if (moonPivot.current) {
      moonPivot.current.rotation.y = state.clock.elapsedTime * 0.7;
      moonPivot.current.rotation.x = 0.35;
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(selected ? null : category.id);
  };

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={anchor} position={category.position}>
        <mesh
          ref={mesh}
          onClick={onClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            hover(category.id);
            setLocalHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            hover(null);
            setLocalHover(false);
            document.body.style.cursor = "auto";
          }}
        >
          <OrbGeometry
            shape={category.shape}
            size={size}
            detail={category.detail}
          />
          <meshStandardMaterial
            color={category.color}
            roughness={0.3}
            metalness={0.35}
            flatShading
          />
        </mesh>

        {/* Tiny orbiting moon (only some orbs have one) */}
        {category.moon && (
          <group ref={moonPivot}>
            <mesh position={[moonOrbit, 0.25, 0]}>
              <sphereGeometry args={[size * 0.22, 16, 16]} />
              <meshStandardMaterial
                color="#e2e8f0"
                emissive={category.color}
                emissiveIntensity={0.35}
                roughness={0.4}
              />
            </mesh>
          </group>
        )}

        {selected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.55, size * 1.8, 48]} />
            <meshBasicMaterial
              color={category.color}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}
