"use client";

export function HUD() {
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
      </div>
      <div className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs tracking-widest text-white/70 backdrop-blur sm:block">
        5 ORBITS
      </div>
    </div>
  );
}
