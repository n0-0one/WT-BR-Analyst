"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { BRChange, GameMode, Nation, Vehicle } from "@/types";
import { buildOptimalLineup } from "@/lib/lineup-engine";
import { formatBR, WT_BR_VALUES } from "@/lib/br-engine";
import { NATIONS, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { VehicleSlotCard } from "../vehicles/VehicleSlotCard";
import {
  Swords,
  Share2,
  Check,
  Shield,
  Plane,
  Crosshair,
  Zap,
  Target,
  Sparkles,
  AlertTriangle,
  Plus,
} from "lucide-react";

interface LineupBuilderViewProps {
  vehicles: Vehicle[];
  changes: BRChange[];
  activeMode: GameMode;
  onSelectVehicle: (v: Vehicle) => void;
  initialNation?: Nation;
  initialBR?: number;
}

const POPULAR_COMBINED_BRS = [3.7, 5.7, 6.7, 8.7, 9.3, 10.0, 10.3, 11.7, 12.0, 12.7];

export function LineupBuilderView({
  vehicles,
  changes,
  activeMode,
  onSelectVehicle,
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

  const nationInfo = NATIONS.find((n) => n.id === selectedNation);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#171E27] via-[#1E2733] to-[#171E27] border border-[#2E4259] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F57C00]" />
            <h2 className="text-xl font-bold tracking-wide uppercase text-white flex items-center gap-2">
              <span>COMBINED ARMS LINEUP BUILDER</span>
              <span className="text-[#38BDF8]">& SYNERGY OPTIMIZER</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Synthesizes optimal Ground + CAS composition tuned for maximum tactical synergy, accounting for Ground RB separate aircraft BRs.
          </p>
        </div>

        <button
          onClick={handleShare}
          type="button"
          className="flex items-center gap-2 rounded-xl bg-[#1E2733] hover:bg-[#2E4259] border border-[#2E4259] px-4 py-2 text-xs font-mono text-slate-300 hover:text-white transition-all select-none shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">LINK COPIED!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>SHARE LINEUP</span>
            </>
          )}
        </button>
      </div>

      {/* Nation & Target BR Selector */}
      <div className="flex flex-col gap-4 bg-[#171E27] border border-[#2E4259] p-4 rounded-xl">
        {/* Nation Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {NATIONS.map((n) => {
            const isActive = selectedNation === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSelectedNation(n.id)}
                type="button"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap",
                  isActive
                    ? "bg-[#1E2733] border-[#F57C00] text-white shadow-md shadow-orange-950/20"
                    : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
                )}
              >
                <span>{n.flag}</span>
                <span className="font-mono">{n.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick BR Chips & Custom Step Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2E4259]/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-slate-400 mr-1">Popular BRs:</span>
            {POPULAR_COMBINED_BRS.map((br) => (
              <button
                key={br}
                onClick={() => setTargetBR(br)}
                type="button"
                className={clsx(
                  "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all",
                  targetBR === br
                    ? "bg-gradient-to-b from-[#F57C00] to-[#E65100] border-[#FFA726] text-white font-bold shadow"
                    : "bg-[#11161D] border-[#2E4259] text-slate-300 hover:text-white"
                )}
              >
                {formatBR(br)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Exact BR:</span>
            <select
              value={targetBR}
              onChange={(e) => setTargetBR(Number(e.target.value))}
              className="bg-[#11161D] border border-[#2E4259] rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#3B82F6]"
            >
              {WT_BR_VALUES.map((br) => (
                <option key={br} value={br}>
                  {formatBR(br)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lineup Telemetry Status Card */}
      <div className="rounded-2xl bg-[#171E27] border border-[#2E4259] p-6 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        {/* Left: Summary */}
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">{nationInfo?.flag}</span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {nationInfo?.name} {formatBR(lineup.effectiveBR)} Lineup
            </h3>
            {lineup.hasCASGroundBRSplit && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40">
                Ground RB Aircraft Split Applied
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            {lineup.summary}
          </p>
        </div>

        {/* Right: Metrics Bento */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-[#11161D] rounded-xl p-3 border border-[#2E4259] flex flex-col text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">SYNERGY SCORE</span>
            <span className="text-xl font-mono font-bold text-emerald-400 mt-1">{lineup.synergyScore}/100</span>
            <span className="text-[10px] font-mono text-slate-500">Combined Arms</span>
          </div>

          <div className="bg-[#11161D] rounded-xl p-3 border border-[#2E4259] flex flex-col text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">MATCHMAKER SPREAD</span>
            <span className="text-sm font-mono font-bold text-white mt-1">
              {formatBR(lineup.matchmakerRange.min)} &rarr; {formatBR(lineup.matchmakerRange.max)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">±1.0 BR Match</span>
          </div>

          <div className="bg-[#11161D] rounded-xl p-3 border border-[#2E4259] flex flex-col text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">CREW SLOTS</span>
            <span className="text-xl font-mono font-bold text-[#F5B841] mt-1">{lineup.slots.length}</span>
            <span className="text-[10px] font-mono text-slate-500">Filled Units</span>
          </div>
        </div>
      </div>

      {/* Crew Slot Cards Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-[#F57C00]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CREW HANGAR SLOTS ({lineup.slots.length})
            </h3>
          </div>
        </div>

        {lineup.slots.length === 0 ? (
          <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-8 text-center text-xs font-mono text-slate-400">
            No viable vehicles found for this nation and battle rating combination.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {lineup.slots.map((slot, index) => {
              const roleIcons: Record<string, React.ReactNode> = {
                mbt_1: <Shield className="w-3.5 h-3.5 text-blue-400" />,
                mbt_2: <Shield className="w-3.5 h-3.5 text-blue-300" />,
                light_scout: <Zap className="w-3.5 h-3.5 text-amber-400" />,
                spaa_sam: <Crosshair className="w-3.5 h-3.5 text-emerald-400" />,
                cas_aircraft: <Plane className="w-3.5 h-3.5 text-purple-400" />,
                helicopter: <Target className="w-3.5 h-3.5 text-red-400" />,
              };

              return (
                <div key={slot.slotRole} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-mono font-semibold text-slate-300">
                    <span className="flex items-center gap-1">
                      {roleIcons[slot.slotRole] ?? <Shield className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{slot.roleLabel}</span>
                    </span>
                    <span className="text-slate-500">Slot {index + 1}</span>
                  </div>

                  <VehicleSlotCard
                    vehicle={slot.vehicle}
                    activeMode={activeMode}
                    onClick={() => onSelectVehicle(slot.vehicle)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lineup Synergy Analysis Breakdown */}
      {lineup.slots.length > 0 && (
        <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-4 flex flex-col gap-2">
          <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F5B841]" />
            <span>Tactical Combined Arms Synergy Breakdown</span>
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono text-slate-300 mt-1">
            <div className="bg-[#11161D] p-3 rounded-lg border border-[#2E4259]/60">
              <strong className="text-blue-400 block mb-1">Armor & Frontline (MBTs):</strong>
              {lineup.slots.filter((s) => s.slotRole.startsWith("mbt")).length} dedicated frontline brawlers ensure spawn point accumulation and cap contention.
            </div>
            <div className="bg-[#11161D] p-3 rounded-lg border border-[#2E4259]/60">
              <strong className="text-amber-400 block mb-1">Scouting & Flank (Light):</strong>
              {lineup.slots.filter((s) => s.slotRole === "light_scout").length > 0
                ? "Active scout unit reduces air spawn SP costs and highlights targets for teammates."
                : "No dedicated scout unit present. Consider bringing a light tank to lower CAS spawn points."}
            </div>
            <div className="bg-[#11161D] p-3 rounded-lg border border-[#2E4259]/60">
              <strong className="text-purple-400 block mb-1">Air Superiority & CAS:</strong>
              {lineup.slots.filter((s) => s.slotRole === "cas_aircraft" || s.slotRole === "helicopter").length > 0
                ? "Air defense and precision strike capabilities cover ground troops against hostile bombers and helicopters."
                : "Missing air cover. Vulnerable to enemy high-altitude guided munitions."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
