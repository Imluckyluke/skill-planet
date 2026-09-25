"use client";

import { SKILL_CATEGORIES } from "@/data/skills";
import { usePlanet } from "@/store/usePlanet";

export function SkillCard() {
  const { selectedId, select } = usePlanet();
  const active = SKILL_CATEGORIES.find((c) => c.id === selectedId);

  if (!active) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 sm:p-6">
      <div
        className="scroll-slim max-h-[46vh] w-full max-w-md overflow-y-auto rounded-2xl border bg-black/70 p-4 backdrop-blur sm:p-5"
        style={{ borderColor: `${active.color}55` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-xs font-bold tracking-[0.25em]"
              style={{ color: active.color }}
            >
              {active.label.toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-white/70">{active.tagline}</p>
          </div>
          <button
            onClick={() => select(null)}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {active.skills.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/85"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {active.projects.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
            >
              <span className="text-sm font-semibold text-white">
                {p.name}
              </span>
              <span className="ml-2 text-xs text-white/50">GitHub ↗</span>
              <span className="mt-0.5 block text-xs leading-5 text-white/60">
                {p.note}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
