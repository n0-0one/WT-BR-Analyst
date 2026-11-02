"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GameMode, Nation } from "@/types";
import { allVehicles, latestPatch } from "@/lib/data-loader";
import { ActiveTab, NothingHeader } from "@/components/layout/NothingHeader";
import { Footer } from "@/components/layout/Footer";
import { LineupSurvivalView } from "@/components/lineups/LineupSurvivalView";

function LineupCheckerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeMode, setActiveMode] = useState<GameMode>("rb");
  const [initialNation, setInitialNation] = useState<Nation>("ussr");
  const [initialBR, setInitialBR] = useState<number>(10.3);

  useEffect(() => {
    const modeParam = searchParams.get("mode") as GameMode | null;
    const nationParam = searchParams.get("nation") as Nation | null;
    const brParam = searchParams.get("br");

    if (modeParam && ["rb", "ab", "sb"].includes(modeParam)) setActiveMode(modeParam);
    if (nationParam) setInitialNation(nationParam);
    if (brParam && !isNaN(Number(brParam))) setInitialBR(Number(brParam));
  }, [searchParams]);

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === "lineup-checker") return;
    router.push(`/?view=${tab}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-nothing-red selection:text-white">
      <div>
        <NothingHeader
          activeTab="lineup-checker"
          onTabChange={handleTabChange}
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <LineupSurvivalView
            vehicles={allVehicles}
            changes={latestPatch.changes}
            activeMode={activeMode}
            initialNation={initialNation}
            initialBR={initialBR}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function LineupCheckerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-zinc-500">
          INITIALIZING LINEUP SURVIVAL ENGINE...
        </div>
      }
    >
      <LineupCheckerContent />
    </Suspense>
  );
}
