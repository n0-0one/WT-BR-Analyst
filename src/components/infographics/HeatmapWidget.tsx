"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { GameMode, Vehicle } from "@/types";
import { formatBR, WT_BR_VALUES } from "@/lib/br-engine";
import { BLACK_HOLE_BRS } from "@/lib/constants";
import { BarChart2, Radio } from "lucide-react";

interface HeatmapWidgetProps {
  vehicles: Vehicle[];
  activeMode: GameMode;
  onSelectBR?: (br: number) => void;
}

export function HeatmapWidget({ vehicles, activeMode, onSelectBR }: HeatmapWidgetProps) {
  const [hoveredBR, setHoveredBR] = useState<number | null>(null);

  // Calculate distribution of vehicles across all BR values
  const distribution: Record<number, { count: number; sampleVehicles: string[] }> = {};
  let maxCount = 1;

  for (const br of WT_BR_VALUES) {
    distribution[br] = { count: 0, sampleVehicles: [] };
  }

  for (const v of vehicles) {
    const rawBR = v.br[activeMode] ?? 1.0;
    const rounded = Number(rawBR.toFixed(1));
    if (distribution[rounded]) {
      distribution[rounded].count += 1;
      if (distribution[rounded].sampleVehicles.length < 4) {
        distribution[rounded].sampleVehicles.push(v.name);
      }
      if (distribution[rounded].count > maxCount) {
        maxCount = distribution[rounded].count;
      }
    }
  }

  const selectedData = hoveredBR !== null ? distribution[hoveredBR] : null;

  return (
    <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#F57C00]" />
          <h3 className="font-bold text-sm tracking-wider uppercase text-white">
            DECOMPRESSION & MATCHMAKER HEATMAP ({activeMode.toUpperCase()})
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing vehicle population density across all 42 discrete BR steps
        </span>
      </div>

      {/* Heatmap Bar Strip */}
      <div className="flex items-end gap-1 h-28 pt-2 overflow-x-auto pb-1 scrollbar-none">
        {WT_BR_VALUES.map((br) => {
          const data = distribution[br];
          const count = data?.count ?? 0;
          const heightPercent = Math.max(8, Math.round((count / maxCount) * 100));
          const isBlackHole = BLACK_HOLE_BRS.includes(br);
          const isHovered = hoveredBR === br;

          return (
            <div
              key={br}
              onClick={() => onSelectBR?.(br)}
              onMouseEnter={() => setHoveredBR(br)}
              onMouseLeave={() => setHoveredBR(null)}
              className="flex-1 min-w-[20px] flex flex-col items-center gap-1 cursor-pointer group"
              title={`${formatBR(br)} BR: ${count} vehicles`}
            >
              <div className="w-full flex items-end justify-center h-20">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={clsx(
                    "w-full rounded-t transition-all duration-150",
                    isHovered
                      ? "bg-white shadow-lg shadow-white/20"
                      : isBlackHole
                      ? "bg-gradient-to-t from-[#B91C1C] to-[#EF4444]"
                      : count > 80
                      ? "bg-gradient-to-t from-[#D97706] to-[#F59E0B]"
                      : "bg-gradient-to-t from-[#1F2D3D] to-[#3B82F6]"
                  )}
                />
              </div>

              <span
                className={clsx(
                  "text-[9px] font-mono leading-none tracking-tighter",
                  isBlackHole ? "text-red-400 font-bold" : "text-slate-500"
                )}
              >
                {formatBR(br)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hover Inspection Strip */}
      <div className="bg-[#11161D] rounded-lg p-2.5 border border-[#2E4259] flex items-center justify-between text-xs font-mono">
        {selectedData && hoveredBR !== null ? (
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#38BDF8] text-sm">{formatBR(hoveredBR)} BR:</span>
            <span className="text-white font-bold">{selectedData.count} Vehicles</span>
            <span className="text-slate-400 truncate max-w-md hidden sm:inline">
              (e.g., {selectedData.sampleVehicles.join(", ")})
            </span>
          </div>
        ) : (
          <span className="text-slate-500">
            Hover over any BR column to inspect exact vehicle density & prominent anchors.
          </span>
        )}

        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span className="flex items-center gap-1 text-red-400">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            <span>Black Hole Anchor</span>
          </span>
          <span className="flex items-center gap-1 text-[#38BDF8]">
            <span className="w-2 h-2 rounded bg-[#3B82F6]" />
            <span>Standard BR</span>
          </span>
        </div>
      </div>
    </div>
  );
}
