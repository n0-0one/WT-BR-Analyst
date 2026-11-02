"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { GameMode, Nation, Vehicle } from "@/types";
import { allVehicles, latestPatch } from "@/lib/data-loader";
import { WTHeader, WTTab } from "@/components/layout/WTHeader";
import { Footer } from "@/components/layout/Footer";
import { PatchOverviewView } from "@/components/views/PatchOverviewView";
import { WinnersLosersView } from "@/components/views/WinnersLosersView";
import { TechTreeExplorerView } from "@/components/views/TechTreeExplorerView";
import { LineupSurvivalView } from "@/components/views/LineupSurvivalView";
import { LineupBuilderView } from "@/components/views/LineupBuilderView";
import { FullPatchTableView } from "@/components/views/FullPatchTableView";
import { MatchmakerInspectorModal } from "@/components/infographics/MatchmakerInspectorModal";

function MainContent() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<WTTab>("overview");
  const [activeMode, setActiveMode] = useState<GameMode>("rb");
  const [initialNation, setInitialNation] = useState<Nation>("ussr");
  const [initialBR, setInitialBR] = useState<number>(10.3);
  const [inspectorVehicle, setInspectorVehicle] = useState<Vehicle | null>(null);

  // Synchronize state with URL parameters on mount
  useEffect(() => {
    const viewParam = searchParams.get("view") as WTTab | null;
    const modeParam = searchParams.get("mode") as GameMode | null;
    const nationParam = searchParams.get("nation") as Nation | null;
    const brParam = searchParams.get("br");

    if (viewParam) {
      if (viewParam === ("changes" as any)) {
        setActiveTab("full-table");
      } else if (viewParam === ("explorer" as any)) {
        setActiveTab("tech-tree");
      } else {
        setActiveTab(viewParam);
      }
    }
    if (modeParam && ["rb", "ab", "sb"].includes(modeParam)) setActiveMode(modeParam);
    if (nationParam) setInitialNation(nationParam);
    if (brParam && !isNaN(Number(brParam))) setInitialBR(Number(brParam));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#11161D] text-slate-100 flex flex-col justify-between selection:bg-[#E65100] selection:text-white">
      <div>
        {/* Authentic War Thunder Hangar Header */}
        <WTHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeMode={activeMode}
          onModeChange={setActiveMode}
          totalVehiclesCount={allVehicles.length}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-6 pb-12">
          {activeTab === "overview" && (
            <PatchOverviewView
              metadata={latestPatch.metadata}
              changes={latestPatch.changes}
              vehicles={allVehicles}
              activeMode={activeMode}
              onSelectVehicle={setInspectorVehicle}
              onNavigateTab={(tab) => {
                if (tab === "tech-tree") setActiveTab("tech-tree");
                else if (tab === "winners-losers") setActiveTab("winners-losers");
                else if (tab === "lineup-checker") setActiveTab("lineup-checker");
                else if (tab === "lineup-builder") setActiveTab("lineup-builder");
                else if (tab === "full-table") setActiveTab("full-table");
              }}
            />
          )}

          {activeTab === "winners-losers" && (
            <WinnersLosersView
              changes={latestPatch.changes}
              vehicles={allVehicles}
              activeMode={activeMode}
              onSelectVehicle={setInspectorVehicle}
            />
          )}

          {activeTab === "tech-tree" && (
            <TechTreeExplorerView
              vehicles={allVehicles}
              activeMode={activeMode}
              onSelectVehicle={setInspectorVehicle}
              initialNation={initialNation}
            />
          )}

          {activeTab === "lineup-checker" && (
            <LineupSurvivalView
              vehicles={allVehicles}
              changes={latestPatch.changes}
              activeMode={activeMode}
              onSelectVehicle={setInspectorVehicle}
              initialNation={initialNation}
              initialBR={initialBR}
            />
          )}

          {activeTab === "lineup-builder" && (
            <LineupBuilderView
              vehicles={allVehicles}
              changes={latestPatch.changes}
              activeMode={activeMode}
              onSelectVehicle={setInspectorVehicle}
              initialNation={initialNation}
              initialBR={initialBR}
            />
          )}

          {activeTab === "full-table" && (
            <FullPatchTableView
              changes={latestPatch.changes}
              vehicles={allVehicles}
              activeMode={activeMode}
              forumUrl={latestPatch.metadata.forumUrl}
              onSelectVehicle={setInspectorVehicle}
            />
          )}
        </main>
      </div>

      {/* Matchmaker Inspector Modal */}
      <MatchmakerInspectorModal
        vehicle={inspectorVehicle}
        activeMode={activeMode}
        allVehicles={allVehicles}
        onClose={() => setInspectorVehicle(null)}
      />

      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#11161D] flex items-center justify-center text-white font-mono text-sm">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#E65100] animate-ping" />
            <span>INITIALIZING WAR THUNDER ECOSYSTEM INTELLIGENCE...</span>
          </div>
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
