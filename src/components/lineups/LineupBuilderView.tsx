"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { BRChange, GameMode, Nation, Vehicle } from "@/types";
import { buildOptimalLineup } from "@/lib/lineup-engine";
import { formatBR, WT_BR_VALUES } from "@/lib/br-engine";
import { NATIONS, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { BentoCard } from "@/components/ui/BentoCard";
import { VehicleImageWithFallback } from "../vehicles/VehicleImageWithFallback";
import { CheckCircle2, XCircle, Share2, Check, Shield, Crosshair, Plane, Zap, Target } from "lucide-react";

interface LineupBuilderViewProps {
  vehicles: Vehicle[];
  changes: BRChange[];
  activeMode: GameMode;
  initialNation?: Nation;
  initialBR?: number;
}

const POPULAR_COMBINED_BRS = [5.7, 6.7, 8.7, 9.0, 9.3, 10.3, 11.7, 12.0];

export function LineupBuilderView({
  vehicles,
  changes,
  activeMode,
  initialNation = "germany",
  initialBR = 10.3,
}: LineupBuilderViewProps) {
  const [selectedNation, setSelectedNation] = useState<Nation>(initialNation);
  const [targetBR, setTargetBR] = useState<number>(initialBR);
  const [copied, setCopied] = useState<boolean>(false);

  const lineup = buildOptimalLineup(
    selectedNation,
    activeMode,
    targetBR,
    vehicles,
    changes
  );

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "lineup-builder");
    url.searchParams.set("nation", selectedNation);
    url.searchParams.set("br", targetBR.toString());
    url.searchParams.set("mode", activeMode);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Configuration Card */}
      <BentoCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <h2 className="font-dot text-base sm:text-lg tracking-wider uppercase text-white">
                COMBINED ARMS LINEUP BUILDER
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Synthesizes optimal Ground + CAS composition tuned for maximum tactical synergy.
            </p>
          </div>

          <button
            onClick={handleShare}
            type="button"
            className="flex items-center gap-2 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white transition-all select-none"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-nothing-green" />
                <span className="text-nothing-green font-bold">LINK COPIED!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE LINEUP</span>
              </>
            )}
          </button>
        </div>

        {/* Nation Selection */}
        <div className="mb-6">
          <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
            SELECT NATION
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {NATIONS.map((n) => {
              const isSelected = selectedNation === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNation(n.id)}
                  type="button"
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono transition-all whitespace-nowrap border select-none",
                    isSelected
                      ? "bg-white text-black font-bold border-white shadow-md"
                      : "bg-[#161619] text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/20"
                  )}
                >
                  <span>{n.flag}</span>
                  <span>{n.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target BR Selection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              DESIRED BR BRACKET
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {POPULAR_COMBINED_BRS.map((br) => {
                const isSelected = targetBR === br;
                return (
                  <button
                    key={br}
                    onClick={() => setTargetBR(br)}
                    type="button"
                    className={clsx(
                      "rounded-full px-3 py-1.5 text-xs font-mono transition-all border font-bold select-none",
                      isSelected
                        ? "bg-white text-black border-white shadow-md"
                        : "bg-[#161619] text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/20"
                    )}
                  >
                    {formatBR(br)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="self-end sm:self-auto shrink-0">
            <select
              value={targetBR}
              onChange={(e) => setTargetBR(Number(e.target.value))}
              className="bg-[#18181B] border border-white/10 rounded-full px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
            >
              {WT_BR_VALUES.map((br) => (
                <option key={br} value={br}>
                  {formatBR(br)} BR
                </option>
              ))}
            </select>
          </div>
        </div>
      </BentoCard>

      {/* Lineup Quality Summary Banner */}
      <div className="rounded-3xl p-6 bg-[#121214] border border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          {/* Circular Score Gauge */}
          <div className="relative w-16 h-16 rounded-full bg-black/60 border-2 border-white/20 flex flex-col items-center justify-center shrink-0">
            <span className="font-mono text-lg font-bold text-white leading-none">
              {lineup.score}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
              SCORE
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-dot text-sm sm:text-base tracking-wider uppercase font-bold text-white">
                {selectedNation.toUpperCase()} {formatBR(targetBR)} {activeMode.toUpperCase()} LINEUP
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              Combined Arms synergy rating based on anchor density, tactical roles, and recent patch momentum.
            </p>
          </div>
        </div>

        {/* Role Completeness Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
              lineup.roleCompleteness.hasMBT
                ? "bg-white/10 border-white/30 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-600"
            )}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>MBT / BRAWLER</span>
            {lineup.roleCompleteness.hasMBT ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-nothing-green" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </div>

          <div
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
              lineup.roleCompleteness.hasSPAA
                ? "bg-white/10 border-white/30 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-600"
            )}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>SPAA</span>
            {lineup.roleCompleteness.hasSPAA ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-nothing-green" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </div>

          <div
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
              lineup.roleCompleteness.hasLightScout
                ? "bg-white/10 border-white/30 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-600"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>LIGHT SCOUT</span>
            {lineup.roleCompleteness.hasLightScout ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-nothing-green" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </div>

          <div
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border",
              lineup.roleCompleteness.hasCAS
                ? "bg-white/10 border-white/30 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-600"
            )}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>CAS AIR</span>
            {lineup.roleCompleteness.hasCAS ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-nothing-green" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-zinc-600" />
            )}
          </div>
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ground Force (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="font-dot text-xs tracking-wider uppercase text-zinc-200">
                GROUND VEHICLE ROSTER (MAX 5)
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {lineup.groundVehicles.length} SELECTED
            </span>
          </div>

          {lineup.groundVehicles.length === 0 ? (
            <BentoCard className="p-8 text-center text-xs font-mono text-zinc-500 italic">
              No viable ground combat vehicles found near this BR bracket.
            </BentoCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lineup.groundVehicles.map((v) => {
                const classData = VEHICLE_CLASS_LABELS[v.vehicleClass];
                return (
                  <div
                    key={v.id}
                    className="rounded-3xl p-4 bg-[#141416] hover:bg-[#18181B] border border-white/[0.08] transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-white truncate max-w-[150px]">
                        {v.name}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                        {formatBR(v.br[activeMode] ?? targetBR)}
                      </span>
                    </div>

                    <div className="h-20 w-full my-2 flex items-center justify-center bg-black/40 rounded-2xl p-1 bg-dot-matrix-dense">
                      <VehicleImageWithFallback
                        src={`https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${v.id}.png`}
                        alt={v.name}
                        vehicleClass={v.vehicleClass}
                        className="w-full h-full"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2">
                      <span className="uppercase">{classData?.label}</span>
                      <span>RANK {v.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Air & CAS Support (1 col) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nothing-red" />
              <span className="font-dot text-xs tracking-wider uppercase text-zinc-200">
                CAS & AIR SUPPORT (MAX 2)
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {lineup.casVehicles.length} SELECTED
            </span>
          </div>

          {lineup.casVehicles.length === 0 ? (
            <BentoCard className="p-8 text-center text-xs font-mono text-zinc-500 italic">
              No aircraft/helicopters available within reasonable BR spread.
            </BentoCard>
          ) : (
            <div className="flex flex-col gap-4">
              {lineup.casVehicles.map((plane) => {
                const classData = VEHICLE_CLASS_LABELS[plane.vehicleClass];
                return (
                  <div
                    key={plane.id}
                    className="rounded-3xl p-4 bg-[#141416] hover:bg-[#18181B] border border-white/[0.08] transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-white truncate max-w-[150px]">
                        {plane.name}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                        {formatBR(plane.br[activeMode] ?? targetBR)}
                      </span>
                    </div>

                    <div className="h-20 w-full my-2 flex items-center justify-center bg-black/40 rounded-2xl p-1 bg-dot-matrix-dense">
                      <VehicleImageWithFallback
                        src={`https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${plane.id}.png`}
                        alt={plane.name}
                        vehicleClass={plane.vehicleClass}
                        className="w-full h-full"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2">
                      <span className="uppercase">{classData?.label}</span>
                      <span>RANK {plane.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tactical Strengths Card */}
          {lineup.strengths.length > 0 && (
            <BentoCard className="p-4 mt-2">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                KEY TACTICAL STRENGTHS
              </span>
              <div className="flex flex-col gap-1.5 text-xs font-mono text-zinc-300">
                {lineup.strengths.map((str, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          )}
        </div>
      </div>
    </div>
  );
}
