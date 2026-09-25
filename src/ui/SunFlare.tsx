"use client";

import { useEffect, useRef } from "react";
import { ghostRegistry } from "@/three/labelRegistry";

const GHOSTS = [
  {
    size: 100,
    bg: "radial-gradient(circle, rgba(147,197,253,0.20) 0%, rgba(147,197,253,0.06) 55%, transparent 70%)",
  },
  {
    size: 46,
    bg: "radial-gradient(circle, rgba(167,243,208,0.22) 0%, transparent 68%)",
  },
  {
    size: 150,
    bg: "radial-gradient(circle, rgba(251,207,232,0.10) 0%, rgba(251,207,232,0.04) 50%, transparent 70%)",
  },
];

/**
 * Screen-space lens ghosts driven by FlareProjector.
 * Sits under the info cards so names never bleed through them.
 */
export function SunFlare() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {GHOSTS.map((g, i) => (
        <Ghost key={i} index={i} size={g.size} bg={g.bg} />
      ))}
    </div>
  );
}

function Ghost({
  index,
  size,
  bg,
}: {
  index: number;
  size: number;
  bg: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ghostRegistry.set(index, ref.current);
    return () => {
      ghostRegistry.delete(index);
    };
  }, [index]);

  return (
    <div
      ref={ref}
      className="absolute top-0 left-0 rounded-full opacity-0"
      style={{ width: size, height: size, background: bg, willChange: "transform" }}
    />
  );
}
