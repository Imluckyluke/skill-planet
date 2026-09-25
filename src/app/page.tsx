"use client";

import { useEffect } from "react";
import { PlanetScene } from "@/three/PlanetScene";
import { HUD } from "@/ui/HUD";
import { IslandLabels } from "@/ui/IslandLabels";
import { SunFlare } from "@/ui/SunFlare";
import { SkillCard } from "@/ui/SkillCard";
import { PlanetCard } from "@/ui/PlanetCard";
import { WarpCard } from "@/ui/WarpCard";
import { SKILL_CATEGORIES } from "@/data/skills";
import { usePlanet } from "@/store/usePlanet";

export default function Home() {
  const { selectedId, select, setPlanetOpen } = usePlanet();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { warpPhase, setWarpPhase } = usePlanet.getState();
      if (warpPhase === "in" || warpPhase === "out") {
        if (e.key === "Escape") setWarpPhase("back");
        return;
      }
      if (e.key === "Escape" || e.key === "0") {
        select(null);
        setPlanetOpen(e.key === "0");
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= SKILL_CATEGORIES.length) {
        const id = SKILL_CATEGORIES[n - 1].id;
        setPlanetOpen(false);
        select(selectedId === id ? null : id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, select, setPlanetOpen]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#05070f] text-white">
      <div className="absolute inset-0">
        <PlanetScene />
      </div>
      <IslandLabels />
      <SunFlare />
      <HUD />
      <SkillCard />
      <PlanetCard />
      <WarpCard />
    </main>
  );
}
