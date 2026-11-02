"use client";

import React, { useState } from "react";
import { GameMode } from "@/types";
import { latestPatch } from "@/lib/data-loader";
import { ActiveTab, NothingHeader } from "@/components/layout/NothingHeader";
import { Footer } from "@/components/layout/Footer";
import { WinnersLosersView } from "@/components/vehicles/WinnersLosersView";
import { useRouter } from "next/navigation";

export default function WinnersLosersPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<GameMode>("rb");

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === "winners-losers") return;
    router.push(`/?view=${tab}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-nothing-red selection:text-white">
      <div>
        <NothingHeader
          activeTab="winners-losers"
          onTabChange={handleTabChange}
          activeMode={activeMode}
          onModeChange={setActiveMode}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <WinnersLosersView
            changes={latestPatch.changes}
            activeMode={activeMode}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}
