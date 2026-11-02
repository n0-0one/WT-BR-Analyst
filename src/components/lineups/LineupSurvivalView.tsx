"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { BRChange, GameMode, Nation, Vehicle } from "@/types";
import { evaluateLineupSurvival } from "@/lib/lineup-engine";
import { formatBR, WT_BR_VALUES } from "@/lib/br-engine";
import { NATIONS, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { BentoCard } from "@/components/ui/BentoCard";
import { SimulatorToggle } from "./SimulatorToggle";
import { VehicleImageWithFallback } from "../vehicles/VehicleImageWithFallback";
import { ShieldCheck, AlertCircle, AlertTriangle, ArrowUpRight, Share2, Check, ArrowRight } from "lucide-react";

interface LineupSurvivalViewProps {
  vehicles: Vehicle[];
  changes: BRChange[];
  activeMode: GameMode;
  initialNation?: Nation;
  initialBR?: number;
}

const QUICK_BRS = [5.7, 6.7, 8.7, 9.0, 9.3, 10.3, 10.7, 11.7, 12.0, 13.0];

export function LineupSurvivalView({
  vehicles,
  changes,
  activeMode,
  initialNation = "ussr",
  initialBR = 10.3,
}: LineupSurvivalViewProps) {
  const [selectedNation, setSelectedNation] = useState<Nation>(initialNation);
  const [targetBR, setTargetBR] = useState<number>(initialBR);
  const [simActive, setSimActive] = useState<boolean>(false);
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

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Configuration Bento Card */}
      <BentoCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-nothing-red" />
              <h2 className="font-dot text-base sm:text-lg tracking-wider uppercase text-white">
                LINEUP SURVIVAL CHECKER
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Verify if your core battle rating anchor holds without forcing unwanted uptiers.
            </p>
          </div>

          {/* Share Pill Button */}
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

        {/* Nation Selection Pills */}
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

        {/* Target BR Selector (Quick Pills + Dropdown) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              CORE TARGET BATTLE RATING
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_BRS.map((br) => {
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

          {/* Full Discrete BR selector */}
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

      {/* Lineup Status Verdict Banner */}
      <div
        className={clsx(
          "rounded-3xl p-6 border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
          isSurvives && "bg-white/[0.04] border-white/20 text-white",
          isWeakened && "bg-amber-500/10 border-amber-500/30 text-amber-200",
          isShifted && "bg-blue-500/10 border-blue-500/30 text-blue-200",
          isBroken && "bg-nothing-red/10 border-nothing-red/30 text-red-200"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center border shrink-0",
              isSurvives && "border-nothing-green/40 bg-nothing-green/10 text-nothing-green",
              isWeakened && "border-amber-500/40 bg-amber-500/10 text-amber-400",
              isShifted && "border-blue-400/40 bg-blue-400/10 text-blue-300",
              isBroken && "border-nothing-red/40 bg-nothing-red/10 text-nothing-red"
            )}
          >
            {isSurvives && <ShieldCheck className="w-5 h-5" />}
            {isWeakened && <AlertTriangle className="w-5 h-5" />}
            {isShifted && <ArrowUpRight className="w-5 h-5" />}
            {isBroken && <AlertCircle className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-dot text-sm sm:text-base tracking-wider uppercase font-bold">
                {evaluation.status.toUpperCase()}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10">
                {formatBR(targetBR)} {activeMode.toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-300 mt-0.5">
              {evaluation.statusMessage}
            </p>
          </div>
        </div>

        {/* Telemetry counters */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px]">SURVIVING</span>
            <span className="text-white font-bold text-base">{evaluation.survivingVehicles.length}</span>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px]">DROPPED</span>
            <span className="text-nothing-red font-bold text-base">{evaluation.droppedVehicles.length}</span>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px]">REINFORCED</span>
            <span className="text-nothing-green font-bold text-base">{evaluation.newReinforcements.length}</span>
          </div>
        </div>
      </div>

      {/* Simulator Toggle Control */}
      <SimulatorToggle
        enabled={simActive}
        onToggle={setSimActive}
        disabled={evaluation.droppedVehicles.length === 0}
      />

      {/* Active Simulation Uptier Warning Panel */}
      {simActive && evaluation.simulatedMaxBR && (
        <div className="rounded-3xl p-6 bg-amber-500/10 border border-amber-500/40 text-amber-200 animate-fade-in flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-dot text-xs sm:text-sm tracking-wider uppercase font-bold text-amber-400">
              SIMULATED UPTIER EXPOSURE: KEEPING NERFED VEHICLES
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-300 leading-relaxed">
            By retaining <span className="font-bold text-white">{evaluation.droppedVehicles.map(v => v.name).join(", ")}</span> in your lineup, your squad ceiling shifts from <span className="text-white font-bold">{formatBR(targetBR)}</span> to <span className="text-amber-400 font-bold">{formatBR(evaluation.simulatedMaxBR)}</span>.
            Your entire roster now risks matching into <span className="text-nothing-red font-bold">{formatBR(evaluation.simulatedUptierMax!)}</span> full uptiers!
          </p>
        </div>
      )}

      {/* Categorized Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Dropped Vehicles Column */}
        <BentoCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nothing-red" />
              <span className="font-dot text-xs tracking-wider uppercase text-zinc-200">
                DROPPED VEHICLES
              </span>
            </div>
            <span className="rounded-full bg-nothing-red/20 text-nothing-red px-2 py-0.5 text-[10px] font-mono font-bold">
              {evaluation.droppedVehicles.length}
            </span>
          </div>

          {evaluation.droppedVehicles.length === 0 ? (
            <p className="text-xs font-mono text-zinc-500 italic py-6 text-center">
              No vehicles were forced out of this bracket.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {evaluation.droppedVehicles.map((v) => {
                const classData = VEHICLE_CLASS_LABELS[v.vehicleClass];
                return (
                  <div
                    key={v.id}
                    className="rounded-2xl p-3 bg-[#18181B] border border-nothing-red/30 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 bg-black/40 rounded-xl p-1 shrink-0">
                        <VehicleImageWithFallback
                          src={`https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${v.id}.png`}
                          alt={v.name}
                          vehicleClass={v.vehicleClass}
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white block truncate max-w-[120px]">
                          {v.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {classData?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-zinc-500">{formatBR(targetBR)}</span>
                      <ArrowRight className="w-3 h-3 text-nothing-red" />
                      <span className="text-nothing-red font-bold">{formatBR(v.br[activeMode] ?? targetBR)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </BentoCard>

        {/* 2. New Reinforcements Column */}
        <BentoCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nothing-green" />
              <span className="font-dot text-xs tracking-wider uppercase text-zinc-200">
                NEW REINFORCEMENTS
              </span>
            </div>
            <span className="rounded-full bg-nothing-green/20 text-nothing-green px-2 py-0.5 text-[10px] font-mono font-bold">
              {evaluation.newReinforcements.length}
            </span>
          </div>

          {evaluation.newReinforcements.length === 0 ? (
            <p className="text-xs font-mono text-zinc-500 italic py-6 text-center">
              No vehicles were buffed down into this bracket.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {evaluation.newReinforcements.map((v) => {
                const classData = VEHICLE_CLASS_LABELS[v.vehicleClass];
                return (
                  <div
                    key={v.id}
                    className="rounded-2xl p-3 bg-[#18181B] border border-nothing-green/30 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 bg-black/40 rounded-xl p-1 shrink-0">
                        <VehicleImageWithFallback
                          src={`https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${v.id}.png`}
                          alt={v.name}
                          vehicleClass={v.vehicleClass}
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white block truncate max-w-[120px]">
                          {v.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {classData?.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-nothing-green font-bold">{formatBR(v.br[activeMode] ?? targetBR)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </BentoCard>

        {/* 3. Surviving Core Anchors Column */}
        <BentoCard className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="font-dot text-xs tracking-wider uppercase text-zinc-200">
                SURVIVING ANCHORS
              </span>
            </div>
            <span className="rounded-full bg-white/10 text-white px-2 py-0.5 text-[10px] font-mono font-bold">
              {evaluation.survivingVehicles.length}
            </span>
          </div>

          {evaluation.survivingVehicles.length === 0 ? (
            <p className="text-xs font-mono text-zinc-500 italic py-6 text-center">
              No core anchors remain at this bracket.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {evaluation.survivingVehicles.map((v) => {
                const classData = VEHICLE_CLASS_LABELS[v.vehicleClass];
                return (
                  <div
                    key={v.id}
                    className="rounded-2xl p-3 bg-[#18181B] border border-white/[0.06] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 bg-black/40 rounded-xl p-1 shrink-0">
                        <VehicleImageWithFallback
                          src={`https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${v.id}.png`}
                          alt={v.name}
                          vehicleClass={v.vehicleClass}
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white block truncate max-w-[120px]">
                          {v.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {classData?.label}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {formatBR(v.br[activeMode] ?? targetBR)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </BentoCard>
      </div>
    </div>
  );
}
