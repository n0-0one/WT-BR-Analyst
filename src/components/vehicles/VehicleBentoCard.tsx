"use client";

import React from "react";
import clsx from "clsx";
import { BRChange } from "@/types";
import { NATIONS, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { BRStepPill } from "@/components/ui/BRStepPill";
import { VehicleImageWithFallback } from "./VehicleImageWithFallback";
import { Sparkles } from "lucide-react";

interface VehicleBentoCardProps {
  change: BRChange;
  className?: string;
}

export function VehicleBentoCard({ change, className }: VehicleBentoCardProps) {
  const nationData = NATIONS.find((n) => n.id === change.nation);
  const classData = VEHICLE_CLASS_LABELS[change.vehicleClass];
  const isNerf = change.direction === "nerf";
  const isBuff = change.direction === "buff";

  return (
    <div
      className={clsx(
        "group relative rounded-3xl bg-[#121214] hover:bg-[#17171A] border border-white/[0.08] hover:border-white/20 transition-all duration-300 p-5 flex flex-col justify-between shadow-lg",
        className
      )}
    >
      {/* Top Telemetry Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none" title={nationData?.name}>
            {nationData?.flag ?? "🏳️"}
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-zinc-300 uppercase truncate max-w-[140px]">
            {change.vehicleName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {change.isPremium && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider">
              PREMIUM
            </span>
          )}
          {change.isSquadron && (
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider">
              SQUADRON
            </span>
          )}

          {/* Impact Score Gauge Circle */}
          <div
            className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold border",
              isNerf && "border-nothing-red/40 bg-nothing-red/10 text-nothing-red",
              isBuff && "border-white/40 bg-white/10 text-white",
              !isNerf && !isBuff && "border-zinc-700 bg-zinc-800 text-zinc-400"
            )}
            title={`Impact Score: ${change.impactScore}/100`}
          >
            {change.impactScore}
          </div>
        </div>
      </div>

      {/* Class and Rank Monospace Label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-mono text-zinc-500 uppercase flex items-center gap-1">
          <span>{classData?.icon}</span>
          <span>{classData?.label}</span>
        </span>
        <span className="text-zinc-700">•</span>
        <span className="text-[11px] font-mono text-zinc-500 uppercase">
          RANK {change.rank}
        </span>
      </div>

      {/* Center Vehicle Profile Image */}
      <div className="h-28 w-full my-2 flex items-center justify-center bg-black/40 rounded-2xl p-2 border border-white/[0.04] bg-dot-matrix-dense">
        <VehicleImageWithFallback
          src={`https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${change.vehicleId}.png`}
          alt={change.vehicleName}
          vehicleClass={change.vehicleClass}
          className="h-full w-full"
        />
      </div>

      {/* Bottom BR Transition & Analytical Reasons */}
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <BRStepPill
            brBefore={change.brBefore}
            brAfter={change.brAfter}
            stepDelta={change.stepDelta}
            direction={change.direction}
            size="sm"
          />
        </div>

        {/* Analytical Bullets */}
        <div className="flex flex-col gap-1 mt-1 text-[11px] font-mono text-zinc-400">
          {change.impactReasons.slice(0, 2).map((reason, idx) => (
            <div key={idx} className="flex items-start gap-1.5 leading-tight">
              <span className={clsx("mt-1 w-1 h-1 rounded-full shrink-0", isNerf ? "bg-nothing-red" : "bg-white")} />
              <span>{reason}</span>
            </div>
          ))}
          {change.notes && (
            <p className="text-[10px] text-zinc-500 italic mt-0.5">
              &quot;{change.notes}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
