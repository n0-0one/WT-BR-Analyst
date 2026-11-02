"use client";

import React, { useState } from "react";
import { GameMode, Vehicle } from "@/types";
import { allVehicles, latestPatch } from "@/lib/data-loader";
import { WTHeader, WTTab } from "@/components/layout/WTHeader";
import { Footer } from "@/components/layout/Footer";
import { LineupBuilderView } from "@/components/views/LineupBuilderView";
import { MatchmakerInspectorModal } from "@/components/infographics/MatchmakerInspectorModal";
import { useRouter } from "next/navigation";

export default function LineupBuilderPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<GameMode>("rb");
  const [inspectorVehicle, setInspectorVehicle] = useState<Vehicle | null>(null);

  const handleTabChange = (tab: WTTab) => {
    if (tab === "lineup-builder") return;
    router.push(`/?view=${tab}`);
  };

  return (
    <div className="min-h-screen bg-[#11161D] text-slate-100 flex flex-col justify-between selection:bg-[#E65100] selection:text-white">
      <div>
        <WTHeader
          activeTab="lineup-builder"
          onTabChange={handleTabChange}
          activeMode={activeMode}
          onModeChange={setActiveMode}
          totalVehiclesCount={allVehicles.length}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-6 pb-12">
          <LineupBuilderView
            vehicles={allVehicles}
            changes={latestPatch.changes}
            activeMode={activeMode}
            onSelectVehicle={setInspectorVehicle}
          />
        </main>
      </div>

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
