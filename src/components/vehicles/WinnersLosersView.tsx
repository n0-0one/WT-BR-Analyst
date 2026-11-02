"use client";

import React, { useState } from "react";
import { BRChange, GameMode, Nation } from "@/types";
import { FilterBar, DirectionFilter } from "./FilterBar";
import { VehicleBentoCard } from "./VehicleBentoCard";
import { BentoCard } from "@/components/ui/BentoCard";
import { TrendingUp, TrendingDown } from "lucide-react";

interface WinnersLosersViewProps {
  changes: BRChange[];
  activeMode: GameMode;
  initialDirection?: DirectionFilter;
}

export function WinnersLosersView({
  changes,
  activeMode,
  initialDirection = "all",
}: WinnersLosersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNation, setSelectedNation] = useState<Nation | "all">("all");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>(initialDirection);
  const [minImpact, setMinImpact] = useState<number>(0);

  const modeChanges = changes.filter((c) => c.mode === activeMode);

  const filtered = modeChanges.filter((c) => {
    if (directionFilter !== "all" && c.direction !== directionFilter) return false;
    if (selectedNation !== "all" && c.nation !== selectedNation) return false;
    if (c.impactScore < minImpact) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.vehicleName.toLowerCase().includes(q) ||
      c.vehicleId.toLowerCase().includes(q) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  // Sort by impact score descending
  filtered.sort((a, b) => b.impactScore - a.impactScore);

  const buffCount = modeChanges.filter((c) => c.direction === "buff").length;
  const nerfCount = modeChanges.filter((c) => c.direction === "nerf").length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Overview Banner Card */}
      <BentoCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-nothing-red" />
              <h2 className="font-dot text-base sm:text-lg tracking-wider uppercase text-white">
                META IMPACT INDEX: WINNERS & LOSERS
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Ranked 0 to 100 based on discrete step magnitude, Matchmaker Black Hole gravitational escape/capture, and lineup anchor cohesion.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white border border-white/20">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{buffCount} WINNERS</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nothing-red/10 text-nothing-red border border-nothing-red/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{nerfCount} LOSERS</span>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedNation={selectedNation}
        onNationChange={setSelectedNation}
        directionFilter={directionFilter}
        onDirectionChange={setDirectionFilter}
        minImpactScore={minImpact}
        onMinImpactChange={setMinImpact}
      />

      {/* Vehicle Cards Grid */}
      {filtered.length === 0 ? (
        <BentoCard className="p-12 text-center text-xs font-mono text-zinc-500 italic">
          No vehicles found matching your criteria for {activeMode.toUpperCase()} mode.
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((change) => (
            <VehicleBentoCard
              key={`${change.vehicleId}-${change.mode}`}
              change={change}
            />
          ))}
        </div>
      )}
    </div>
  );
}
