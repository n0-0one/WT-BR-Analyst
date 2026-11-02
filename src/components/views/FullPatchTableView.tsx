"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";
import { BRChange, GameMode, Nation, Vehicle, VehicleClass } from "@/types";
import { NATIONS, toRomanNumeral, VEHICLE_CLASS_LABELS, withBasePath } from "@/lib/constants";
import { formatBR, formatStepBadge } from "@/lib/br-engine";
import {
  Table,
  Search,
  ExternalLink,
  Download,
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Crown,
} from "lucide-react";

interface FullPatchTableViewProps {
  changes: BRChange[];
  vehicles: Vehicle[];
  activeMode: GameMode;
  forumUrl?: string;
  onSelectVehicle: (v: Vehicle) => void;
}

export function FullPatchTableView({
  changes,
  vehicles,
  activeMode,
  forumUrl = "https://forum.warthunder.com",
  onSelectVehicle,
}: FullPatchTableViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<GameMode | "all">(activeMode);
  const [selectedNation, setSelectedNation] = useState<Nation | "all">("all");
  const [directionFilter, setDirectionFilter] = useState<"all" | "buff" | "nerf">("all");

  const vehicleMap = useMemo(() => new Map<string, Vehicle>(vehicles.map((v) => [v.id, v])), [vehicles]);

  const filteredChanges = useMemo(() => {
    return changes.filter((c) => {
      // Mode filter
      if (filterMode !== "all" && c.mode !== filterMode) return false;

      // Nation filter
      if (selectedNation !== "all" && c.nation !== selectedNation) return false;

      // Direction filter
      if (directionFilter !== "all" && c.direction !== directionFilter) return false;

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
  }, [changes, filterMode, selectedNation, directionFilter, searchQuery]);

  // Export filtered changelog as CSV
  const handleExportCSV = () => {
    const headers = [
      "Vehicle ID",
      "Vehicle Name",
      "Nation",
      "Branch",
      "Class",
      "Rank",
      "Mode",
      "Old BR",
      "New BR",
      "Step Delta",
      "Numeric Delta",
      "Category",
      "Impact Score",
      "Ground RB BR",
      "Notes",
    ];

    const rows = filteredChanges.map((c) => [
      `"${c.vehicleId}"`,
      `"${c.vehicleName}"`,
      `"${c.nation}"`,
      `"${c.branch}"`,
      `"${c.vehicleClass}"`,
      c.rank,
      c.mode.toUpperCase(),
      c.brBefore.toFixed(1),
      c.brAfter.toFixed(1),
      c.stepDelta,
      c.numericDelta.toFixed(1),
      `"${c.ecosystemShift?.categoryLabel ?? c.direction}"`,
      c.impactScore,
      c.rbGroundAfter ? c.rbGroundAfter.toFixed(1) : "",
      `"${(c.ecosystemShift?.summary ?? c.notes ?? "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `WT_BR_Changes_${filterMode.toUpperCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#171E27] via-[#1E2733] to-[#171E27] border border-[#2E4259] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E65100]" />
            <h2 className="text-xl font-bold tracking-wide uppercase text-white flex items-center gap-2">
              <span>OFFICIAL PATCH CHANGELOG & AUDIT TABLE</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Comprehensive audit table of planned & datamine-verified Battle Rating adjustments across all modes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {forumUrl && (
            <a
              href={forumUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-[#1E2733] hover:bg-[#2E4259] border border-[#2E4259] px-3.5 py-2 text-xs font-mono text-slate-300 hover:text-white transition-all select-none"
            >
              <span>OFFICIAL FORUM THREAD</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={handleExportCSV}
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-[#F57C00] to-[#E65100] hover:from-[#FFA726] hover:to-[#F57C00] border border-[#FFA726] px-3.5 py-2 text-xs font-mono font-bold text-white transition-all shadow-md select-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#171E27] border border-[#2E4259] p-3 rounded-xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vehicle name, ID, or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#11161D] border border-[#2E4259] rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1">
          {(["all", "rb", "ab", "sb"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              type="button"
              className={clsx(
                "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all uppercase",
                filterMode === m
                  ? "bg-[#2E4259] border-[#3B82F6] text-white font-bold"
                  : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
              )}
            >
              {m === "all" ? "All Modes" : m}
            </button>
          ))}
        </div>

        {/* Direction Filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDirectionFilter("all")}
            type="button"
            className={clsx(
              "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all",
              directionFilter === "all"
                ? "bg-[#2E4259] border-[#3B82F6] text-white font-bold"
                : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
            )}
          >
            All
          </button>
          <button
            onClick={() => setDirectionFilter("buff")}
            type="button"
            className={clsx(
              "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all text-emerald-400",
              directionFilter === "buff"
                ? "bg-emerald-500/20 border-emerald-500/50 font-bold"
                : "bg-[#11161D] border-[#2E4259] hover:bg-slate-800"
            )}
          >
            Buffs ({changes.filter((c) => c.direction === "buff").length})
          </button>
          <button
            onClick={() => setDirectionFilter("nerf")}
            type="button"
            className={clsx(
              "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all text-red-400",
              directionFilter === "nerf"
                ? "bg-red-500/20 border-red-500/50 font-bold"
                : "bg-[#11161D] border-[#2E4259] hover:bg-slate-800"
            )}
          >
            Nerfs ({changes.filter((c) => c.direction === "nerf").length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#171E27] border border-[#2E4259] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-[#11161D] border-b border-[#2E4259] text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-3">Class & Rank</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-4 text-center">BR Transition</th>
                <th className="py-3 px-3 text-center">Step Delta</th>
                <th className="py-3 px-3">Ecosystem Category</th>
                <th className="py-3 px-4">Tactical Summary & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E4259]/60">
              {filteredChanges.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No Battle Rating changes found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredChanges.map((change) => {
                  const vehicle = vehicleMap.get(change.vehicleId);
                  const nation = NATIONS.find((n) => n.id === change.nation);
                  const classInfo = VEHICLE_CLASS_LABELS[change.vehicleClass];
                  const shift = change.ecosystemShift;

                  return (
                    <tr
                      key={`${change.vehicleId}-${change.mode}`}
                      onClick={() => vehicle && onSelectVehicle(vehicle)}
                      className="hover:bg-[#1E2733] transition-colors cursor-pointer group"
                    >
                      {/* Vehicle Name & Nation */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base shrink-0">{nation?.flag}</span>
                          <div className="flex flex-col">
                            <span className="font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                              {change.vehicleName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {nation?.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class & Rank */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-slate-300 flex items-center gap-1">
                            <span>{classInfo?.icon}</span>
                            <span>{classInfo?.label.split("/")[0]}</span>
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Rank {toRomanNumeral(change.rank)}
                          </span>
                        </div>
                      </td>

                      {/* Game Mode */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#11161D] border border-[#2E4259] text-slate-300">
                          {change.mode}
                        </span>
                      </td>

                      {/* BR Transition */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#11161D] px-2.5 py-1 rounded-lg border border-[#2E4259]">
                          <span className="text-slate-400 line-through">
                            {formatBR(change.brBefore)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-white text-sm">
                            {formatBR(change.brAfter)}
                          </span>
                        </div>
                        {change.rbGroundAfter && (
                          <div className="text-[10px] text-amber-400 mt-0.5">
                            Ground RB: {formatBR(change.rbGroundAfter)}
                          </div>
                        )}
                      </td>

                      {/* Step Delta */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-xs font-bold border",
                            change.stepDelta < 0
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : change.stepDelta > 0
                              ? "bg-red-500/20 text-red-400 border-red-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          )}
                        >
                          {formatStepBadge(change.stepDelta)}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3">
                        {shift ? (
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap"
                            style={{
                              backgroundColor: `${shift.categoryColor}20`,
                              color: shift.categoryColor,
                              border: `1px solid ${shift.categoryColor}50`,
                            }}
                          >
                            {shift.categoryLabel}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Summary & Notes */}
                      <td className="py-3 px-4">
                        <p className="text-[11px] text-slate-300 line-clamp-2 max-w-md">
                          {shift?.summary ?? change.notes ?? "Standard Battle Rating adjustment."}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
