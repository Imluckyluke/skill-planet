"use client";

import { usePlanet } from "@/store/usePlanet";

const INFO = {
  sun: {
    title: "SOL",
    tagline: "G-type star. You are inside its atmosphere — the granulated photosphere fills the left half of your screen.",
    chips: ["1.4M km wide", "5,505°C surface", "powers the highlights"],
    body: "Prominence loops arc overhead. The corona glow and streak you see are the same lens system that flares in the overview — now you're inside the light source itself.",
  },
  galaxy: {
    title: "THE SPIRAL",
    tagline: "15,000 stars, generated in code. No images. You're parked inside the disk.",
    chips: ["15k rendered stars", "3 arms", "100% procedural"],
    body: "Warm core fading to a cool rim. Drag to orbit inside the star field — the arms wrap around you.",
  },
  blackhole: {
    title: "THE VOID",
    tagline: "Stellar-mass black hole. Nothing escapes, not even light.",
    chips: ["~10 M☉", "Event horizon: ~30km", "Accretion disk visible"],
    body: "The photon ring and accretion rim surround the shadow. Drag slowly — the disk parallax at this distance is the whole show.",
  },
} as const;

export function WarpCard() {
  const { warpTarget, warpPhase, setWarpPhase } = usePlanet();

  if (warpPhase !== "in" || !warpTarget) return null;
  const info = INFO[warpTarget];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex justify-end">
      {/* Right-half menu; the 3D surface owns the left half (see WarpRig split view). */}
      <div className="pointer-events-auto flex w-full flex-col justify-center p-4 sm:w-1/2 sm:p-8">
        <div className="scroll-slim max-h-[80vh] overflow-y-auto rounded-2xl border border-amber-200/30 bg-black/70 p-5 backdrop-blur sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-amber-200">
                {info.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">{info.tagline}</p>
            </div>
            <button
              onClick={() => setWarpPhase("back")}
              className="shrink-0 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              ← Back
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/60">{info.body}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {info.chips.map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/85"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/40">
            Drag to look around · scroll to dive closer · Back (or Esc) returns to orbit.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Tiny status pill shown during the warp flights (out + back). */
export function WarpStatus() {
  const warpPhase = usePlanet((s) => s.warpPhase);

  if (warpPhase !== "out" && warpPhase !== "back") return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center sm:top-6">
      <div className="animate-pulse rounded-full border border-amber-200/30 bg-black/60 px-4 py-1.5 text-xs tracking-widest text-amber-100/90 backdrop-blur">
        {warpPhase === "out" ? "WARPING ⟶" : "⟵ RETURNING TO ORBIT"}
      </div>
    </div>
  );
}
