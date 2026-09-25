"use client";

import { usePlanet } from "@/store/usePlanet";

const INFO = {
  sun: {
    title: "SOL",
    tagline: "G-type star. The engine of this whole scene.",
    chips: ["1.4M km wide", "5,505°C surface", "powers the highlights"],
  },
  galaxy: {
    title: "THE SPIRAL",
    tagline: "15,000 stars, generated in code. No images.",
    chips: ["15k rendered stars", "3 arms", "100% procedural"],
  },
} as const;

export function WarpCard() {
  const { warpTarget, warpPhase, setWarpPhase } = usePlanet();

  if (warpPhase !== "in" || !warpTarget) return null;
  const info = INFO[warpTarget];

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 sm:p-6">
      <div className="scroll-slim max-h-[46vh] w-full max-w-md overflow-y-auto rounded-2xl border border-amber-200/30 bg-black/70 p-4 backdrop-blur sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-amber-200">
              {info.title}
            </p>
            <p className="mt-1 text-sm text-white/70">{info.tagline}</p>
          </div>
          <button
            onClick={() => setWarpPhase("back")}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            ← Back
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {info.chips.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/85"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
