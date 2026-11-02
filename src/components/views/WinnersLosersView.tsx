"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";
import { BRChange, EcosystemCategory, GameMode, Nation, Vehicle, VehicleBranch } from "@/types";
import { NATIONS, BRANCHES, toRomanNumeral, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { formatBR, formatStepBadge } from "@/lib/br-engine";
import { VehicleSlotCard } from "../vehicles/VehicleSlotCard";
import { MatchmakerWindowBar } from "../infographics/MatchmakerWindowBar";
import {
  Trophy,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Crown,
  Search,
  Filter,
  ArrowRight,
  Plane,
  Crosshair,
  Shield,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type FilterTab = "all_winners" | "direct_winner" | "buff_in_disguise" | "untouched_winner" | "biggest_loser" | "cas_spaa" | "all";

interface WinnersLosersViewProps {
  changes: BRChange[];
  vehicles: Vehicle[];
  activeMode: GameMode;
  onSelectVehicle: (v: Vehicle) => void;
  initialTab?: FilterTab;
}

export function WinnersLosersView({
  changes,
  vehicles,
  activeMode,
  onSelectVehicle,
  initialTab = "all_winners",
}: WinnersLosersViewProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const [selectedNation, setSelectedNation] = useState<Nation | "all">("all");
  const [selectedBranch, setSelectedBranch] = useState<VehicleBranch | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedThreats, setExpandedThreats] = useState<Record<string, boolean>>({});

  const vehicleMap = useMemo(() => new Map<string, Vehicle>(vehicles.map((v) => [v.id, v])), [vehicles]);

  const modeChanges = useMemo(() => changes.filter((c) => c.mode === activeMode), [changes, activeMode]);

  // Counts for tab badges
  const counts = useMemo(() => {
    let direct = 0;
    let disguise = 0;
    let untouched = 0;
    let losers = 0;
    let cas = 0;

    for (const c of modeChanges) {
      const cat = c.ecosystemShift?.category;
      if (cat === "direct_winner") direct++;
      else if (cat === "buff_in_disguise") disguise++;
      else if (cat === "untouched_winner") untouched++;
      else if (cat === "biggest_loser") losers++;

      if (c.branch === "aviation" || c.branch === "helicopters" || c.vehicleClass === "spaa") {
        cas++;
      }
    }

    return {
      allWinners: direct + disguise + untouched,
      direct,
      disguise,
      untouched,
      losers,
      cas,
      total: modeChanges.length,
    };
  }, [modeChanges]);

  // Filtered list
  const filteredChanges = useMemo(() => {
    return modeChanges.filter((c) => {
      // Tab filter
      if (activeTab === "all_winners") {
        const cat = c.ecosystemShift?.category;
        if (cat !== "direct_winner" && cat !== "buff_in_disguise" && cat !== "untouched_winner") return false;
      } else if (activeTab === "direct_winner") {
        if (c.ecosystemShift?.category !== "direct_winner") return false;
      } else if (activeTab === "buff_in_disguise") {
        if (c.ecosystemShift?.category !== "buff_in_disguise") return false;
      } else if (activeTab === "untouched_winner") {
        if (c.ecosystemShift?.category !== "untouched_winner") return false;
      } else if (activeTab === "biggest_loser") {
        if (c.ecosystemShift?.category !== "biggest_loser") return false;
      } else if (activeTab === "cas_spaa") {
        if (c.branch !== "aviation" && c.branch !== "helicopters" && c.vehicleClass !== "spaa") return false;
      }

      // Nation filter
      if (selectedNation !== "all" && c.nation !== selectedNation) return false;

      // Branch filter
      if (selectedBranch !== "all" && c.branch !== selectedBranch) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.vehicleName.toLowerCase().includes(q);
        const matchesId = c.vehicleId.toLowerCase().includes(q);
        const matchesNotes = c.notes?.toLowerCase().includes(q);
        const matchesSummary = c.ecosystemShift?.summary.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesNotes && !matchesSummary) return false;
      }

      return true;
    }).sort((a, b) => b.impactScore - a.impactScore);
  }, [modeChanges, activeTab, selectedNation, selectedBranch, searchQuery]);

  const toggleThreats = (id: string) => {
    setExpandedThreats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#171E27] via-[#1E2733] to-[#171E27] border border-[#2E4259] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]" />
            <h2 className="text-xl font-bold tracking-wide uppercase text-white flex items-center gap-2">
              <span>WINNERS & LOSERS</span>
              <span className="text-[#F57C00]">ECOSYSTEM INDEX</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Categorizing true competitive shifts: direct BR drops, decompression buffs in disguise, untouched kings, and trapped vehicles.
          </p>
        </div>

        {/* Quick stat pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            {counts.allWinners} WINNERS
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
            {counts.losers} LOSERS
          </span>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all_winners", label: "All Winners", count: counts.allWinners, icon: <Trophy className="w-4 h-4 text-emerald-400" /> },
          { id: "buff_in_disguise", label: "Buffs in Disguise", count: counts.disguise, icon: <Sparkles className="w-4 h-4 text-[#38BDF8]" /> },
          { id: "untouched_winner", label: "Untouched Kings", count: counts.untouched, icon: <Crown className="w-4 h-4 text-[#F5B841]" /> },
          { id: "biggest_loser", label: "Biggest Losers", count: counts.losers, icon: <TrendingDown className="w-4 h-4 text-red-400" /> },
          { id: "cas_spaa", label: "CAS vs SPAA Shifts", count: counts.cas, icon: <Plane className="w-4 h-4 text-purple-400" /> },
          { id: "all", label: "All Changes", count: counts.total, icon: <Filter className="w-4 h-4 text-slate-400" /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              type="button"
              className={clsx(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                isActive
                  ? "bg-[#1E2733] border-[#3B82F6] text-white shadow-md shadow-blue-950/30"
                  : "bg-[#171E27] border-[#2E4259] text-slate-300 hover:text-white hover:border-[#4A6B8F]"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={clsx(
                "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                isActive ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-400"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#171E27] border border-[#2E4259] p-3 rounded-xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicles, BR shifts, notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#11161D] border border-[#2E4259] rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        {/* Nation Filter Selector */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedNation("all")}
            type="button"
            className={clsx(
              "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all",
              selectedNation === "all"
                ? "bg-[#2E4259] border-[#3B82F6] text-white font-bold"
                : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
            )}
          >
            All Nations
          </button>
          {NATIONS.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNation(n.id)}
              type="button"
              title={n.name}
              className={clsx(
                "px-2 py-1 text-xs rounded-lg border transition-all flex items-center gap-1",
                selectedNation === n.id
                  ? "bg-[#2E4259] border-[#3B82F6] text-white shadow"
                  : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
              )}
            >
              <span>{n.flag}</span>
              <span className="hidden sm:inline font-mono">{n.name}</span>
            </button>
          ))}
        </div>

        {/* Branch Filter Selector */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setSelectedBranch("all")}
            type="button"
            className={clsx(
              "px-2 py-1 text-xs font-mono rounded-lg border transition-all",
              selectedBranch === "all"
                ? "bg-[#2E4259] border-[#3B82F6] text-white font-bold"
                : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
            )}
          >
            All Branches
          </button>
          {BRANCHES.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              type="button"
              className={clsx(
                "px-2 py-1 text-xs font-mono rounded-lg border transition-all flex items-center gap-1",
                selectedBranch === b.id
                  ? "bg-[#2E4259] border-[#3B82F6] text-white"
                  : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
              )}
            >
              <span>{b.icon}</span>
              <span className="hidden md:inline">{b.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Results Grid */}
      {filteredChanges.length === 0 ? (
        <div className="rounded-2xl bg-[#171E27] border border-[#2E4259] p-12 text-center flex flex-col items-center justify-center gap-3">
          <ShieldAlert className="w-10 h-10 text-slate-500" />
          <h3 className="text-base font-bold text-white">No vehicles found</h3>
          <p className="text-xs font-mono text-slate-400 max-w-sm">
            Try adjusting your search criteria, nation filter, or selecting a different ecosystem category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredChanges.map((change) => {
            const vehicle = vehicleMap.get(change.vehicleId);
            const isExpanded = !!expandedThreats[change.vehicleId];
            const shift = change.ecosystemShift;

            return (
              <div
                key={`${change.vehicleId}-${change.mode}`}
                className="rounded-2xl bg-[#171E27] border border-[#2E4259] hover:border-[#3B82F6]/60 transition-all p-4 flex flex-col gap-3 shadow-lg group"
              >
                {/* Top Row: Vehicle Slot Card + Category Badge */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {vehicle ? (
                    <div className="w-full sm:w-64 shrink-0">
                      <VehicleSlotCard
                        vehicle={vehicle}
                        activeMode={activeMode}
                        highlightDelta={{ before: change.brBefore, after: change.brAfter }}
                        onClick={() => onSelectVehicle(vehicle)}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{change.vehicleName}</span>
                      <span className="text-xs font-mono text-slate-400">{change.nation.toUpperCase()}</span>
                    </div>
                  )}

                  {/* Category Pill & Step Badge */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-2">
                      {shift && (
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${shift.categoryColor}20`,
                            color: shift.categoryColor,
                            border: `1px solid ${shift.categoryColor}50`,
                          }}
                        >
                          {shift.categoryLabel}
                        </span>
                      )}
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-xs font-mono font-bold border",
                          change.stepDelta < 0
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : change.stepDelta > 0
                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        )}
                      >
                        {formatStepBadge(change.stepDelta)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span>Impact Score:</span>
                      <span className="font-bold text-white">{change.impactScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Matchmaker Window Infographic Bar */}
                <MatchmakerWindowBar
                  br={change.brAfter}
                  groundBR={change.rbGroundAfter}
                  ecosystemShift={shift}
                />

                {/* Analytical Reasoning Summary */}
                {shift && (
                  <div className="rounded-lg bg-[#11161D] border border-[#2E4259] p-2.5 text-xs font-mono text-slate-300">
                    <span className="font-semibold text-white">Tactical Analysis: </span>
                    {shift.summary}
                  </div>
                )}

                {/* Expandable Threat Pool Detail */}
                {shift && (shift.threatsEscapedAbove.count > 0 || shift.newThreatsAddedAbove.count > 0) && (
                  <div className="flex flex-col">
                    <button
                      onClick={() => toggleThreats(change.vehicleId)}
                      type="button"
                      className="flex items-center justify-between text-xs font-mono text-slate-400 hover:text-white py-1 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Crosshair className="w-3.5 h-3.5 text-[#38BDF8]" />
                        <span>Threat Pool Breakdown</span>
                        <span className="text-[10px] text-slate-500">
                          ({shift.threatsEscapedAbove.count} escaped, {shift.newThreatsAddedAbove.count} added)
                        </span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-[#141B24] border border-[#2E4259] rounded-lg p-2.5 animate-fade-in">
                        {/* Escaped Threats */}
                        <div className="flex flex-col gap-1">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span>Escaped Threats Above:</span>
                            <span>({shift.threatsEscapedAbove.count})</span>
                          </span>
                          {shift.threatsEscapedAbove.examples.length > 0 ? (
                            <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                              {shift.threatsEscapedAbove.examples.map((name) => (
                                <li key={name} className="truncate">{name}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-500 text-[11px]">None</span>
                          )}
                        </div>

                        {/* New Threats Added */}
                        <div className="flex flex-col gap-1">
                          <span className="text-red-400 font-semibold flex items-center gap-1">
                            <span>New Threats Added:</span>
                            <span>({shift.newThreatsAddedAbove.count})</span>
                          </span>
                          {shift.newThreatsAddedAbove.examples.length > 0 ? (
                            <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                              {shift.newThreatsAddedAbove.examples.map((name) => (
                                <li key={name} className="truncate">{name}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-500 text-[11px]">None</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Inspect Button */}
                {vehicle && (
                  <button
                    onClick={() => onSelectVehicle(vehicle)}
                    type="button"
                    className="w-full mt-1 py-1.5 rounded-lg bg-[#1E2733] hover:bg-[#2E4259] border border-[#2E4259] hover:border-[#3B82F6] text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Full Matchmaker Pool (±1.0 BR)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#38BDF8]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
