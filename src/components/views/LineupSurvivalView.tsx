"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { BRChange, GameMode, Nation, Vehicle } from "@/types";
import { evaluateLineupSurvival } from "@/lib/lineup-engine";
import { formatBR, WT_BR_VALUES } from "@/lib/br-engine";
import { NATIONS, toRomanNumeral, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { VehicleSlotCard } from "../vehicles/VehicleSlotCard";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowRight,
  Share2,
  Check,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface LineupSurvivalViewProps {
  vehicles: Vehicle[];
  changes: BRChange[];
  activeMode: GameMode;
  onSelectVehicle: (v: Vehicle) => void;
  initialNation?: Nation;
  initialBR?: number;
}

const QUICK_BRS = [3.7, 5.7, 6.7, 8.7, 9.3, 10.0, 10.3, 11.7, 12.0, 12.7];

export function LineupSurvivalView({
  vehicles,
  changes,
  activeMode,
  onSelectVehicle,
  initialNation = "ussr",
  initialBR = 10.3,
}: LineupSurvivalViewProps) {
  const [selectedNation, setSelectedNation] = useState<Nation>(initialNation);
  const [targetBR, setTargetBR] = useState<number>(initialBR);
  const [simKeepNerfed, setSimKeepNerfed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const evaluation = evaluateLineupSurvival(
    selectedNation,
    activeMode,
    targetBR,
    vehicles,
    changes
  );

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "lineup-checker");
    url.searchParams.set("nation", selectedNation);
    url.searchParams.set("br", targetBR.toString());
    url.searchParams.set("mode", activeMode);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSurvives = evaluation.status === "survives";
  const isWeakened = evaluation.status === "weakened";
  const isShifted = evaluation.status === "shifted";
  const isBroken = evaluation.status === "broken";

  // Effective simulated BR if keeping nerfed vehicles
  const simulatedMaxBR = simKeepNerfed && evaluation.nerfedVehicles.length > 0
    ? Math.max(targetBR, ...evaluation.nerfedVehicles.map((c) => c.brAfter))
    : targetBR;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#171E27] via-[#1E2733] to-[#171E27] border border-[#2E4259] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]" />
            <h2 className="text-xl font-bold tracking-wide uppercase text-white flex items-center gap-2">
              <span>LINEUP SURVIVAL CHECKER</span>
              <span className="text-[#F57C00]">& BR DRAG SIMULATOR</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Verify whether your core battle rating anchor survives the patch or if moved vehicles drag your entire lineup into higher uptier brackets.
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
            {QUICK_BRS.map((br) => (
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

      {/* Survival Verdict Banner */}
      <div
        className={clsx(
          "rounded-2xl p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl transition-all",
          isSurvives && "bg-emerald-950/20 border-emerald-500/40 text-emerald-200",
          isWeakened && "bg-amber-950/20 border-amber-500/40 text-amber-200",
          (isShifted || isBroken) && "bg-red-950/20 border-red-500/40 text-red-200"
        )}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {isSurvives && <ShieldCheck className="w-8 h-8 text-emerald-400" />}
            {isWeakened && <AlertTriangle className="w-8 h-8 text-amber-400" />}
            {(isShifted || isBroken) && <ShieldAlert className="w-8 h-8 text-red-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-wide uppercase">
                {isSurvives && "LINEUP SURVIVES INTACT"}
                {isWeakened && "LINEUP WEAKENED BUT VIABLE"}
                {isShifted && "LINEUP BR SHIFTED UPWARDS"}
                {isBroken && "LINEUP ANCHOR BROKEN"}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-black/40 border border-current">
                {evaluation.survivingVehicles.length} of {evaluation.survivingVehicles.length + evaluation.nerfedVehicles.length} Intact
              </span>
            </div>
            <p className="text-xs font-mono mt-1 text-slate-300 max-w-2xl leading-relaxed">
              {evaluation.survivalReason}
            </p>
          </div>
        </div>

        {/* Simulator Toggle */}
        {evaluation.nerfedVehicles.length > 0 && (
          <div className="flex flex-col items-end gap-1 shrink-0 bg-[#11161D]/80 p-3 rounded-xl border border-[#2E4259]">
            <span className="text-[10px] font-mono uppercase text-slate-400">BR DRAG SIMULATOR</span>
            <button
              onClick={() => setSimKeepNerfed(!simKeepNerfed)}
              type="button"
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border",
                simKeepNerfed
                  ? "bg-red-500/20 text-red-300 border-red-500/50"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              )}
            >
              {simKeepNerfed ? (
                <>
                  <ToggleRight className="w-4 h-4 text-red-400" />
                  <span>Keeping Nerfed: Lineup at {formatBR(simulatedMaxBR)}</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Simulate: Keep Nerfed Vehicles</span>
                </>
              )}
            </button>
            {simKeepNerfed && (
              <span className="text-[10px] font-mono text-red-400 mt-0.5">
                Forces full uptiers to {formatBR(Number((simulatedMaxBR + 1.0).toFixed(1)))}!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Surviving Vehicles Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              SURVIVING CORE VEHICLES AT {formatBR(targetBR)} ({evaluation.survivingVehicles.length})
            </h3>
          </div>
        </div>

        {evaluation.survivingVehicles.length === 0 ? (
          <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-8 text-center text-xs font-mono text-slate-400">
            No surviving vehicles remaining in this BR bracket.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {evaluation.survivingVehicles.map((v) => (
              <VehicleSlotCard
                key={v.id}
                vehicle={v}
                activeMode={activeMode}
                onClick={() => onSelectVehicle(v)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Displaced / Nerfed Vehicles Section */}
      {evaluation.nerfedVehicles.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              DISPLACED / UPRATED VEHICLES (PULLED OUT OF {formatBR(targetBR)}) ({evaluation.nerfedVehicles.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {evaluation.nerfedVehicles.map((c) => {
              const fullVehicle = vehicles.find((v) => v.id === c.vehicleId);
              return (
                <div
                  key={c.vehicleId}
                  className="rounded-xl bg-[#171E27] border border-red-500/30 p-3 flex flex-col justify-between gap-2 shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white truncate">{c.vehicleName}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                      {formatBR(c.brBefore)} &rarr; {formatBR(c.brAfter)}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-300">
                    {c.ecosystemShift?.summary ?? c.notes ?? "Moved up in Battle Rating."}
                  </p>

                  {fullVehicle && (
                    <button
                      onClick={() => onSelectVehicle(fullVehicle)}
                      type="button"
                      className="mt-1 py-1 rounded bg-[#1E2733] hover:bg-[#2E4259] text-[11px] font-mono text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1"
                    >
                      <span>Inspect Matchmaker</span>
                      <ArrowRight className="w-3 h-3 text-[#38BDF8]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Replacements Section */}
      {evaluation.recommendedReplacements.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F5B841]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              RECOMMENDED LINEUP REPLACEMENTS AT {formatBR(targetBR)}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {evaluation.recommendedReplacements.map((v) => (
              <VehicleSlotCard
                key={v.id}
                vehicle={v}
                activeMode={activeMode}
                onClick={() => onSelectVehicle(v)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
