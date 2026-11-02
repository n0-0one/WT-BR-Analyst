"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GameMode, Nation } from "@/types";
import { allVehicles, latestPatch } from "@/lib/data-loader";
import { ActiveTab, NothingHeader } from "@/components/layout/NothingHeader";
import { Footer } from "@/components/layout/Footer";
import { HeroTelemetryWidget } from "@/components/ui/HeroTelemetryWidget";
import { BlackHoleWeatherWidget } from "@/components/ui/BlackHoleWeatherWidget";
import { SpotlightCards } from "@/components/ui/SpotlightCards";
import { WinnersLosersView } from "@/components/vehicles/WinnersLosersView";
import { LineupSurvivalView } from "@/components/lineups/LineupSurvivalView";
import { LineupBuilderView } from "@/components/lineups/LineupBuilderView";
import { MatrixExplorerView } from "@/components/vehicles/MatrixExplorerView";
import { NothingChangelogDiff } from "@/components/diff/NothingChangelogDiff";

function MainContent() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [activeMode, setActiveMode] = useState<GameMode>("rb");
  const [initialNation, setInitialNation] = useState<Nation>("ussr");
  const [initialBR, setInitialBR] = useState<number>(10.3);

  // Synchronize state with URL parameters on mount
  useEffect(() => {
    const viewParam = searchParams.get("view") as ActiveTab | null;
    const modeParam = searchParams.get("mode") as GameMode | null;
    const nationParam = searchParams.get("nation") as Nation | null;
    const brParam = searchParams.get("br");

    if (viewParam) setActiveTab(viewParam);
    if (modeParam && ["rb", "ab", "sb"].includes(modeParam)) setActiveMode(modeParam);
    if (nationParam) setInitialNation(nationParam);
    if (brParam && !isNaN(Number(brParam))) setInitialBR(Number(brParam));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-nothing-red selection:text-white">
      <div>
        {/* Floating Nothing OS Pill Header */}
        <NothingHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-10 animate-fade-in">
              <HeroTelemetryWidget
                metadata={latestPatch.metadata}
                activeModeVehiclesCount={allVehicles.length}
              />

              <BlackHoleWeatherWidget
                changes={latestPatch.changes}
                activeMode={activeMode}
              />

              <SpotlightCards
                changes={latestPatch.changes}
                activeMode={activeMode}
                onViewAllWinners={() => setActiveTab("winners-losers")}
                onViewAllLosers={() => setActiveTab("winners-losers")}
              />
            </div>
          )}

          {activeTab === "winners-losers" && (
            <WinnersLosersView
              changes={latestPatch.changes}
              activeMode={activeMode}
            />
          )}

          {activeTab === "lineup-checker" && (
            <LineupSurvivalView
              vehicles={allVehicles}
              changes={latestPatch.changes}
              activeMode={activeMode}
              initialNation={initialNation}
              initialBR={initialBR}
            />
          )}

          {activeTab === "lineup-builder" && (
            <LineupBuilderView
              vehicles={allVehicles}
              changes={latestPatch.changes}
              activeMode={activeMode}
              initialNation={initialNation}
              initialBR={initialBR}
            />
          )}

          {activeTab === "explorer" && (
            <MatrixExplorerView
              vehicles={allVehicles}
              activeMode={activeMode}
            />
          )}

          {activeTab === "diff" && (
            <NothingChangelogDiff
              changes={latestPatch.changes}
              activeMode={activeMode}
              forumUrl={latestPatch.metadata.forumUrl}
              syncedAt={latestPatch.metadata.syncedAt}
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-nothing-red animate-ping mr-2" />
          SYNCHRONIZING WT // NOTHING TELEMETRY...
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
