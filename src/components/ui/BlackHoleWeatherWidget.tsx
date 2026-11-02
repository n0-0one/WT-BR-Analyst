import React from "react";
import clsx from "clsx";
import { BRChange, GameMode } from "@/types";
import { BLACK_HOLE_BRS } from "@/lib/constants";
import { formatBR } from "@/lib/br-engine";
import { BentoCard } from "./BentoCard";
import { Radio, ArrowDownRight, ArrowUpRight } from "lucide-react";

interface BlackHoleWeatherWidgetProps {
  changes: BRChange[];
  activeMode: GameMode;
}

export function BlackHoleWeatherWidget({ changes, activeMode }: BlackHoleWeatherWidgetProps) {
  // Analyze which vehicles entered or escaped each black hole for active mode
  const modeChanges = changes.filter((c) => c.mode === activeMode);

  const blackHoleStatus = BLACK_HOLE_BRS.map((bh) => {
    const reach = Number((bh - 1.0).toFixed(1));

    // Escaped: was >= reach, now < reach
    const escaped = modeChanges.filter(
      (c) => c.direction === "buff" && c.brBefore >= reach && c.brAfter < reach
    );

    // Pulled in: was < reach, now >= reach
    const pulledIn = modeChanges.filter(
      (c) => c.direction === "nerf" && c.brBefore < reach && c.brAfter >= reach
    );

    return {
      br: bh,
      reach,
      escaped,
      pulledIn,
      totalActivity: escaped.length + pulledIn.length,
    };
  });

  return (
    <BentoCard className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-4 h-4 text-nothing-red animate-pulse" />
            <h2 className="font-dot text-sm sm:text-base tracking-wider uppercase text-white">
              MATCHMAKER BLACK HOLE WEATHER
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            High-population brackets that generate massive gravitational pull, drawing BR -1.0 into continuous full uptiers.
          </p>
        </div>

        <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
          MODE: {activeMode.toUpperCase()}
        </span>
      </div>

      {/* Grid of Black Hole Brackets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {blackHoleStatus.map((bh) => {
          const hasActivity = bh.totalActivity > 0;
          return (
            <div
              key={bh.br}
              className={clsx(
                "rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3",
                hasActivity
                  ? "bg-[#18181B] border-white/10"
                  : "bg-black/30 border-white/[0.04]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">
                    {formatBR(bh.br)} BR
                  </span>
                  {hasActivity && (
                    <span className="w-2 h-2 rounded-full bg-nothing-red" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  REACH: ≥{formatBR(bh.reach)}
                </span>
              </div>

              {/* Status details */}
              <div className="flex flex-col gap-1.5 text-[11px] font-mono">
                {bh.escaped.length > 0 && (
                  <div className="flex items-start gap-1 text-nothing-green">
                    <ArrowDownRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {bh.escaped.map((c) => c.vehicleName).join(", ")} ESCAPED
                    </span>
                  </div>
                )}

                {bh.pulledIn.length > 0 && (
                  <div className="flex items-start gap-1 text-nothing-red">
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {bh.pulledIn.map((c) => c.vehicleName).join(", ")} PULLED IN
                    </span>
                  </div>
                )}

                {!hasActivity && (
                  <span className="text-zinc-600 italic">Stable horizon (no shifts)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
}
