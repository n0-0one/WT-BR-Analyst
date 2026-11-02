"use client";

import React from "react";
import { BRChange, GameMode, PatchMetadata, Vehicle } from "@/types";
import { HeatmapWidget } from "../infographics/HeatmapWidget";
import { VehicleSlotCard } from "../vehicles/VehicleSlotCard";
import {
  Trophy,
  TrendingDown,
  Sparkles,
  Crown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Flame,
} from "lucide-react";

interface PatchOverviewViewProps {
  metadata: PatchMetadata;
  changes: BRChange[];
  vehicles: Vehicle[];
  activeMode: GameMode;
  onSelectVehicle: (v: Vehicle) => void;
  onNavigateTab: (tab: "winners-losers" | "tech-tree" | "lineup-checker" | "lineup-builder" | "full-table") => void;
}

export function PatchOverviewView({
  metadata,
  changes,
  vehicles,
  activeMode,
  onSelectVehicle,
  onNavigateTab,
}: PatchOverviewViewProps) {
  const modeChanges = changes.filter((c) => c.mode === activeMode);

  // Filter 4 Analytical Categories
  const directWinners = modeChanges.filter((c) => c.ecosystemShift?.category === "direct_winner").slice(0, 3);
  const buffsInDisguise = modeChanges.filter((c) => c.ecosystemShift?.category === "buff_in_disguise").slice(0, 3);
  const untouchedWinners = modeChanges.filter((c) => c.ecosystemShift?.category === "untouched_winner").slice(0, 3);
  const biggestLosers = modeChanges.filter((c) => c.ecosystemShift?.category === "biggest_loser").slice(0, 3);

  // Find corresponding vehicles
  const vehicleMap = new Map<string, Vehicle>(vehicles.map((v) => [v.id, v]));

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Top Hero Telemetry Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#171E27] via-[#1E2733] to-[#171E27] border border-[#2E4259] p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#E65100]/20 border border-[#F57C00] text-[#F57C00] text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>OFFICIAL DECOMPRESSION WAVE</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3,380+ DATAMINE VERIFIED</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mt-1">
              {metadata.title}
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-300 leading-relaxed">
              War Thunder Battle Rating Ecosystem Analyzer. Tracking top-tier decompressions up to 13.3 Ground and 14.0+ Air,
              matchmaker black hole gravitational pull, and true threat shifts across all 10 nations.
            </p>
          </div>

          {/* Quick Metrics Bento Box */}
          <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto">
            <div className="bg-[#11161D] rounded-xl p-3 border border-[#2E4259] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">VEHICLES TRACKED</span>
              <span className="text-2xl font-mono font-bold text-white">{vehicles.length}</span>
              <span className="text-[10px] font-mono text-slate-500">10 Full Tech Trees</span>
            </div>
            <div className="bg-[#11161D] rounded-xl p-3 border border-[#2E4259] flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">PATCH BR SHIFTS</span>
              <span className="text-2xl font-mono font-bold text-[#F5B841]">{metadata.totalChangesCount}</span>
              <span className="text-[10px] font-mono text-slate-500">AB / RB / SB / Split</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Decompression & Density Heatmap */}
      <HeatmapWidget
        vehicles={vehicles}
        activeMode={activeMode}
      />

      {/* 4 Video-Style Analytical Spotlight Grids */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F57C00]" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">
              MATCHMAKER SPOTLIGHT CATEGORIES
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab("winners-losers")}
            className="text-xs font-semibold text-[#38BDF8] hover:underline flex items-center gap-1"
          >
            <span>View Complete Ecosystem Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Direct Winners */}
          <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-4 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between border-b border-[#2E4259] pb-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase">
                <TrendingDown className="w-4 h-4" />
                <span>DIRECT WINNERS</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                BUFFED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Vehicles whose BR decreased, granting direct matchmaker positioning advantages.
            </p>
            <div className="flex flex-col gap-2">
              {directWinners.map((c) => {
                const v = vehicleMap.get(c.vehicleId);
                if (!v) return null;
                return (
                  <VehicleSlotCard
                    key={c.vehicleId}
                    vehicle={v}
                    activeMode={activeMode}
                    highlightDelta={{ before: c.brBefore, after: c.brAfter }}
                    onClick={() => onSelectVehicle(v)}
                  />
                );
              })}
            </div>
          </div>

          {/* 2. Buffs in Disguise */}
          <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-4 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between border-b border-[#2E4259] pb-2">
              <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold text-xs uppercase">
                <Sparkles className="w-4 h-4" />
                <span>BUFFS IN DISGUISE</span>
              </div>
              <span className="text-[10px] font-mono bg-sky-500/10 text-[#38BDF8] px-2 py-0.5 rounded font-bold">
                DECOMPRESSED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              BR climbed, but top-tier decompressed higher, ridding them of 15+ apex predators!
            </p>
            <div className="flex flex-col gap-2">
              {buffsInDisguise.map((c) => {
                const v = vehicleMap.get(c.vehicleId);
                if (!v) return null;
                return (
                  <VehicleSlotCard
                    key={c.vehicleId}
                    vehicle={v}
                    activeMode={activeMode}
                    highlightDelta={{ before: c.brBefore, after: c.brAfter }}
                    onClick={() => onSelectVehicle(v)}
                  />
                );
              })}
            </div>
          </div>

          {/* 3. Untouched Winners */}
          <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-4 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between border-b border-[#2E4259] pb-2">
              <div className="flex items-center gap-1.5 text-[#F5B841] font-bold text-xs uppercase">
                <Crown className="w-4 h-4" />
                <span>UNTOUCHED WINNERS</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 text-[#F5B841] px-2 py-0.5 rounded font-bold">
                SILENT KINGS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Their BR stayed unchanged, but top counters climbed away out of reach!
            </p>
            <div className="flex flex-col gap-2">
              {untouchedWinners.map((c) => {
                const v = vehicleMap.get(c.vehicleId);
                if (!v) return null;
                return (
                  <VehicleSlotCard
                    key={c.vehicleId}
                    vehicle={v}
                    activeMode={activeMode}
                    onClick={() => onSelectVehicle(v)}
                  />
                );
              })}
            </div>
          </div>

          {/* 4. Biggest Losers */}
          <div className="rounded-xl bg-[#171E27] border border-[#2E4259] p-4 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between border-b border-[#2E4259] pb-2">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>BIGGEST LOSERS</span>
              </div>
              <span className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-bold">
                COMPRESSED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Pushed into new predator brackets or SAM umbrellas while losing downtier prey.
            </p>
            <div className="flex flex-col gap-2">
              {biggestLosers.map((c) => {
                const v = vehicleMap.get(c.vehicleId);
                if (!v) return null;
                return (
                  <VehicleSlotCard
                    key={c.vehicleId}
                    vehicle={v}
                    activeMode={activeMode}
                    highlightDelta={{ before: c.brBefore, after: c.brAfter }}
                    onClick={() => onSelectVehicle(v)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
