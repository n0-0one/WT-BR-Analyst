"use client";

import React from "react";
import clsx from "clsx";
import { EcosystemShift } from "@/types";
import { formatBR } from "@/lib/br-engine";
import { ArrowLeft, ArrowRight, ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MatchmakerWindowBarProps {
  br: number;
  groundBR?: number;
  ecosystemShift?: EcosystemShift;
  className?: string;
}

export function MatchmakerWindowBar({
  br,
  groundBR,
  ecosystemShift,
  className,
}: MatchmakerWindowBarProps) {
  const floorBR = Math.max(1.0, Number((br - 1.0).toFixed(1)));
  const ceilingBR = Number((br + 1.0).toFixed(1));

  const threatsEscaped = ecosystemShift?.threatsEscapedAbove.count ?? 0;
  const newThreats = ecosystemShift?.newThreatsAddedAbove.count ?? 0;
  const targetsLost = ecosystemShift?.easyTargetsLostBelow.count ?? 0;
  const newTargets = ecosystemShift?.newEasyTargetsBelow.count ?? 0;

  return (
    <div
      className={clsx(
        "rounded-xl bg-[#141B24] border border-[#2E4259] p-3 flex flex-col gap-2.5 shadow-inner",
        className
      )}
    >
      {/* Top Telemetry Bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <span>MATCHMAKER WINDOW</span>
          <span className="text-slate-500">(±1.0 BR Spread)</span>
        </span>

        {ecosystemShift && (
          <span
            className="px-2 py-0.5 rounded text-[11px] font-bold"
            style={{
              backgroundColor: `${ecosystemShift.categoryColor}20`,
              color: ecosystemShift.categoryColor,
              border: `1px solid ${ecosystemShift.categoryColor}50`,
            }}
          >
            {ecosystemShift.categoryLabel}
          </span>
        )}
      </div>

      {/* Visual Window Diagram: [Floor -1.0] <--- [Vehicle BR] ---> [Ceiling +1.0] */}
      <div className="grid grid-cols-3 items-center gap-2 text-center font-mono">
        {/* Floor Downtier */}
        <div className="flex flex-col items-center bg-[#17202B] border border-[#2E4259] rounded-lg p-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ArrowLeft className="w-3 h-3 text-slate-500" />
            <span>DOWNTIER FLOOR</span>
          </div>
          <span className="text-sm font-bold text-white mt-0.5">{formatBR(floorBR)}</span>

          {ecosystemShift && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
              {targetsLost > 0 && (
                <span className="text-red-400 flex items-center" title="Targets lost below">
                  <ArrowDownRight className="w-2.5 h-2.5" /> -{targetsLost}
                </span>
              )}
              {newTargets > 0 && (
                <span className="text-emerald-400 flex items-center" title="New targets added below">
                  +{newTargets}
                </span>
              )}
              {targetsLost === 0 && newTargets === 0 && (
                <span className="text-slate-500">Stable</span>
              )}
            </div>
          )}
        </div>

        {/* Center Vehicle BR */}
        <div className="flex flex-col items-center bg-gradient-to-b from-[#2E4259] to-[#1E2B3A] border-2 border-[#3B82F6] rounded-lg p-2 shadow-md">
          <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">
            VEHICLE BR
          </span>
          <span className="text-base font-bold text-white mt-0.5">
            {formatBR(br)}
          </span>
          {groundBR && groundBR !== br && (
            <span className="text-[10px] text-amber-300 font-semibold">
              Ground: {formatBR(groundBR)}
            </span>
          )}
        </div>

        {/* Ceiling Uptier */}
        <div className="flex flex-col items-center bg-[#17202B] border border-[#2E4259] rounded-lg p-2">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>UPTIER CEILING</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </div>
          <span className="text-sm font-bold text-white mt-0.5">{formatBR(ceilingBR)}</span>

          {ecosystemShift && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
              {threatsEscaped > 0 && (
                <span
                  className="text-emerald-400 font-bold flex items-center"
                  title="Threats escaped above (no longer faced!)"
                >
                  <ArrowUpRight className="w-2.5 h-2.5" /> -{threatsEscaped} Threats
                </span>
              )}
              {newThreats > 0 && (
                <span
                  className="text-red-400 font-bold flex items-center"
                  title="New threats entering uptier range"
                >
                  +{newThreats} Threats
                </span>
              )}
              {threatsEscaped === 0 && newThreats === 0 && (
                <span className="text-slate-500">Stable</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Narrative */}
      {ecosystemShift?.summary && (
        <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-[#11161D] rounded p-2 border border-white/[0.04]">
          {ecosystemShift.summary}
        </p>
      )}
    </div>
  );
}
