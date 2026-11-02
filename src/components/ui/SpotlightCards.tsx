import React from "react";
import { BRChange, GameMode } from "@/types";
import { VehicleBentoCard } from "../vehicles/VehicleBentoCard";
import { TrendingDown, TrendingUp } from "lucide-react";

interface SpotlightCardsProps {
  changes: BRChange[];
  activeMode: GameMode;
  onViewAllWinners: () => void;
  onViewAllLosers: () => void;
}

export function SpotlightCards({
  changes,
  activeMode,
  onViewAllWinners,
  onViewAllLosers,
}: SpotlightCardsProps) {
  const modeChanges = changes.filter((c) => c.mode === activeMode);

  // Top 3 Winners (Buffs: BR decreased, sorted by impact score descending)
  const topWinners = modeChanges
    .filter((c) => c.direction === "buff")
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);

  // Top 3 Losers (Nerfs: BR increased, sorted by impact score descending)
  const topLosers = modeChanges
    .filter((c) => c.direction === "nerf")
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-10 w-full">
      {/* Top Winners Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-white" />
            <h2 className="font-dot text-sm sm:text-base tracking-wider uppercase text-white">
              TOP META WINNERS (MAJOR BUFFS)
            </h2>
          </div>
          <button
            onClick={onViewAllWinners}
            type="button"
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            VIEW ALL WINNERS →
          </button>
        </div>

        {topWinners.length === 0 ? (
          <p className="text-xs font-mono text-zinc-500 italic py-6">
            No buffs recorded for {activeMode.toUpperCase()} mode.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topWinners.map((c) => (
              <VehicleBentoCard key={`${c.vehicleId}-${c.mode}`} change={c} />
            ))}
          </div>
        )}
      </div>

      {/* Top Losers Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-nothing-red" />
            <h2 className="font-dot text-sm sm:text-base tracking-wider uppercase text-white">
              TOP META LOSERS (CRITICAL NERFS)
            </h2>
          </div>
          <button
            onClick={onViewAllLosers}
            type="button"
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            VIEW ALL LOSERS →
          </button>
        </div>

        {topLosers.length === 0 ? (
          <p className="text-xs font-mono text-zinc-500 italic py-6">
            No nerfs recorded for {activeMode.toUpperCase()} mode.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topLosers.map((c) => (
              <VehicleBentoCard key={`${c.vehicleId}-${c.mode}`} change={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
