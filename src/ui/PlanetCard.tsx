"use client";

import { usePlanet } from "@/store/usePlanet";

export function PlanetCard() {
  const { planetOpen, setPlanetOpen } = usePlanet();

  if (!planetOpen) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 sm:p-6">
      <div className="scroll-slim max-h-[46vh] w-full max-w-md overflow-y-auto rounded-2xl border border-sky-400/30 bg-black/70 p-4 backdrop-blur sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] text-sky-300">
              HADI — IMLUCKYLUKE
            </p>
            <p className="mt-1 text-sm text-white/70">
              Full-stack web + Telegram bots. Realtime systems that survive
              production.
            </p>
          </div>
          <button
            onClick={() => setPlanetOpen(false)}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["15+ public repos", "Python", "Kotlin", "TypeScript", "Node.js"].map(
            (s) => (
              <span
                key={s}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/85"
              >
                {s}
              </span>
            ),
          )}
        </div>

        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          <a
            href="https://github.com/Imluckyluke"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
          >
            <span className="text-sm font-semibold text-white">GitHub</span>
            <span className="ml-2 text-xs text-white/50">
              github.com/Imluckyluke ↗
            </span>
            <span className="mt-0.5 block text-xs leading-5 text-white/60">
              Chat platform, bots, Android apps — starred: Luckyroom,
              Music-arch
            </span>
          </a>
          <a
            href="https://t.me/imluckyluke"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
          >
            <span className="text-sm font-semibold text-white">Telegram</span>
            <span className="ml-2 text-xs text-white/50">t.me/imluckyluke ↗</span>
            <span className="mt-0.5 block text-xs leading-5 text-white/60">
              Fastest way to reach me
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
