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
 * Screen-space lens flare driven by FlareProjector.
 * Main glow + rotating streak follow the sun's projection every frame,
 * so the flare moves/rotates with the camera instead of sitting fixed
 * in world space. Sits under the info cards.
 */
export function SunFlare() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {GHOSTS.map((g, i) => (
        <Ghost key={i} index={i} size={g.size} bg={g.bg} />
      ))}
      {/* Sun's main glow */}
      <FlareDiv
        index={3}
        style={{
          width: 230,
          height: 230,
          background:
            "radial-gradient(circle, rgba(255,250,235,0.55) 0%, rgba(255,210,150,0.22) 35%, transparent 68%)",
          borderRadius: 9999,
        }}
      />
      {/* Anamorphic streak through the sun (rotated toward screen center) */}
      <FlareDiv
        index={4}
        style={{
          width: "min(46vw, 560px)",
          height: 10,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(160,200,255,0.25) 18%, rgba(255,244,220,0.85) 50%, rgba(160,200,255,0.25) 82%, transparent 100%)",
          borderRadius: 9999,
          filter: "blur(0.5px)",
        }}
      />
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

function FlareDiv({ index, style }: { index: number; style: React.CSSProperties }) {
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
      className="absolute top-0 left-0 opacity-0"
      style={{ ...style, willChange: "transform" }}
    />
  );
}
