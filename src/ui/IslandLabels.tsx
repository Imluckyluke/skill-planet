"use client";

import { useEffect, useRef } from "react";
import { SKILL_CATEGORIES } from "@/data/skills";
import { pillRegistry } from "@/three/labelRegistry";

export function IslandLabels() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {SKILL_CATEGORIES.map((c) => (
        <Pill key={c.id} id={c.id} label={c.label} />
      ))}
    </div>
  );
}

function Pill({ id, label }: { id: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) pillRegistry.set(id, ref.current);
    return () => {
      pillRegistry.delete(id);
    };
  }, [id ]);

  return (
    <div
      ref={ref}
      className="absolute top-0 left-0 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap text-white opacity-0 transition-opacity duration-200 select-none"
      style={{ willChange: "transform" }}
    >
      {label}
    </div>
  );
}
