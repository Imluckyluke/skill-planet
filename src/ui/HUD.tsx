"use client";

import { usePlanet } from "@/store/usePlanet";

const TARGETS = [
  { id: "sun", label: "☀ Sun" },
  { id: "galaxy", label: "✦ Galaxy" },
  { id: "blackhole", label: "● Black hole" },
] as const;

export function HUD() {
  const startWarp = usePlanet((s) => s.startWarp);
  const setPlanetOpen = usePlanet((s) => s.setPlanetOpen);
  const warpPhase = usePlanet((s) => s.warpPhase);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
      <div>
        <h1 className="text-base font-bold tracking-[0.3em] text-white sm:text-xl">
          SKILL PLANET
        </h1>
        <p className="mt-1 max-w-[220px] text-xs leading-5 text-white/60 sm:mt-2 sm:max-w-xs sm:text-sm sm:leading-6">
          Drag to orbit &middot; scroll to zoom &middot; click an island to
          explore it.
        </p>
        {warpPhase === "idle" && (
          <div className="pointer-events-auto mt-3 flex flex-wrap gap-2">
            {TARGETS.map((t) => (
              <button
                key={t.id}
                onClick={() => startWarp(t.id)}
                className="rounded-full border border-amber-200/30 bg-black/50 px-3 py-1 text-xs text-amber-100/90 backdrop-blur transition-colors hover:bg-amber-200/20 hover:text-white"
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={() => setPlanetOpen(true)}
              className="rounded-full border border-sky-300/30 bg-black/50 px-3 py-1 text-xs text-sky-100/90 backdrop-blur transition-colors hover:bg-sky-300/20 hover:text-white"
            >
              ✉ About
            </button>
            <a
              href="https://t.me/imluckyluke"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-sky-300/30 bg-black/50 px-3 py-1 text-xs text-sky-100/90 backdrop-blur transition-colors hover:bg-sky-300/20 hover:text-white"
            >
              ✈ @imluckyluke
            </a>
          </div>
        )}
      </div>
      <div className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-widest text-white/70 backdrop-blur sm:block">
        5 ORBITS
      </div>
    </div>
  );
}
