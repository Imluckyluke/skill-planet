"use client";

import { create } from "zustand";

interface PlanetState {
  selectedId: string | null;
  hoveredId: string | null;
  planetOpen: boolean;
  warpTarget: "sun" | "galaxy" | "blackhole" | null;
  // out = flying there, in = warp view, turn = rotating toward home,
  // back = flying home, idle = main orbit.
  warpPhase: "idle" | "out" | "in" | "turn" | "back";
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setPlanetOpen: (v: boolean) => void;
  startWarp: (t: "sun" | "galaxy" | "blackhole") => void;
  setWarpPhase: (p: PlanetState["warpPhase"]) => void;
  endWarp: () => void;
}

export const usePlanet = create<PlanetState>((set) => ({
  selectedId: null,
  hoveredId: null,
  planetOpen: false,
  warpTarget: null,
  warpPhase: "idle",
  select: (selectedId) => set({ selectedId }),
  hover: (hoveredId) => set({ hoveredId }),
  setPlanetOpen: (planetOpen) => set({ planetOpen }),
  startWarp: (warpTarget) =>
    set({ warpTarget, warpPhase: "out", selectedId: null, planetOpen: false }),
  setWarpPhase: (warpPhase) => set({ warpPhase }),
  endWarp: () => set({ warpTarget: null, warpPhase: "idle" }),
}));
