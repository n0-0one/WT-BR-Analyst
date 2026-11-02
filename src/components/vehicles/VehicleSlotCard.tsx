"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { GameMode, Vehicle } from "@/types";
import {
  NATIONS,
  toRomanNumeral,
  VEHICLE_CLASS_LABELS,
  getVehicleImageUrl,
  getVehicleSecondaryImageUrl,
  getVehiclePlaceholderUrl,
} from "@/lib/constants";
import { formatBR, formatSplitBR } from "@/lib/br-engine";

interface VehicleSlotCardProps {
  vehicle: Vehicle;
  activeMode: GameMode;
  onClick?: () => void;
  highlightDelta?: { before: number; after: number };
  className?: string;
}

export function VehicleSlotCard({
  vehicle,
  activeMode,
  onClick,
  highlightDelta,
  className,
}: VehicleSlotCardProps) {
  const [imgErrorCount, setImgErrorCount] = useState(0);

  const nation = NATIONS.find((n) => n.id === vehicle.nation);
  const classInfo = VEHICLE_CLASS_LABELS[vehicle.vehicleClass];

  const currentBR = vehicle.br[activeMode] ?? 1.0;
  const splitGroundBR = activeMode === "rb" ? vehicle.br.rbGround : undefined;

  // Determine slot style based on vehicle category
  let slotClass = "wt-slot-regular text-slate-200";
  let badgeBorder = "border-[#2E4259] bg-[#11161D]/80 text-white";

  if (vehicle.isPremium) {
    slotClass = "wt-slot-premium text-amber-200";
    badgeBorder = "border-[#D49B27] bg-[#2A200E] text-[#F5B841]";
  } else if (vehicle.isSquadron) {
    slotClass = "wt-slot-squadron text-emerald-200";
    badgeBorder = "border-[#2E6F40] bg-[#122618] text-[#4ADE80]";
  } else if (vehicle.isEvent) {
    slotClass = "wt-slot-event text-fuchsia-200";
    badgeBorder = "border-[#6E3B64] bg-[#261523] text-fuchsia-300";
  }

  // Multi-CDN Image Fallback
  let imageSrc = getVehicleImageUrl(vehicle.id);
  if (imgErrorCount === 1) {
    imageSrc = getVehicleSecondaryImageUrl(vehicle.id);
  } else if (imgErrorCount >= 2) {
    imageSrc = getVehiclePlaceholderUrl(vehicle.vehicleClass);
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative flex flex-col justify-between rounded-lg p-2.5 transition-all duration-200 cursor-pointer shadow-md select-none",
        slotClass,
        className
      )}
    >
      {/* Top Header: Flag + Class + BR Badge */}
      <div className="flex items-center justify-between gap-1.5 z-10">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-sm leading-none" title={nation?.name}>
            {nation?.flag ?? "🏳️"}
          </span>
          <span
            className="text-[11px] font-semibold text-slate-300 flex items-center gap-1 truncate"
            title={classInfo?.label}
          >
            <span>{classInfo?.icon}</span>
          </span>
        </div>

        {/* BR Badge */}
        <div
          className={clsx(
            "px-2 py-0.5 rounded text-xs font-mono font-bold border tracking-tight shrink-0 shadow-sm",
            badgeBorder
          )}
        >
          {highlightDelta ? (
            <span className="flex items-center gap-1">
              <span className="text-slate-400 line-through text-[11px]">
                {formatBR(highlightDelta.before)}
              </span>
              <span>&rarr;</span>
              <span className="text-white">{formatBR(highlightDelta.after)}</span>
            </span>
          ) : splitGroundBR && splitGroundBR !== currentBR ? (
            <span title={`Air: ${currentBR.toFixed(1)} | Ground: ${splitGroundBR.toFixed(1)}`}>
              {currentBR.toFixed(1)} / {splitGroundBR.toFixed(1)} G
            </span>
          ) : (
            formatBR(currentBR)
          )}
        </div>
      </div>

      {/* Center Vehicle Render */}
      <div className="relative h-20 w-full my-1.5 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={vehicle.name}
          onError={() => setImgErrorCount((prev) => prev + 1)}
          loading="lazy"
          className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      {/* Bottom Nameplate & Rank Roman Numeral */}
      <div className="pt-1.5 border-t border-black/40 flex items-center justify-between gap-2 z-10">
        <span
          className="text-xs font-bold truncate max-w-[150px] leading-tight tracking-tight text-white group-hover:text-[#38BDF8] transition-colors"
          title={vehicle.name}
        >
          {vehicle.name}
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
          Rank {toRomanNumeral(vehicle.rank)}
        </span>
      </div>

      {/* Premium / Squadron Banner Ribbon */}
      {vehicle.isPremium && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#F5B841] rounded-tr-lg" />
      )}
      {vehicle.isSquadron && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-[#4ADE80] rounded-tr-lg" />
      )}
    </div>
  );
}
