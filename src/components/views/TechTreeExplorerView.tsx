"use client";

import React, { useState, useMemo } from "react";
import clsx from "clsx";
import { GameMode, Nation, Vehicle, VehicleBranch } from "@/types";
import { NATIONS, BRANCHES, toRomanNumeral, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { VehicleSlotCard } from "../vehicles/VehicleSlotCard";
import { formatBR } from "@/lib/br-engine";
import {
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Shield,
  Sparkles,
  Users,
  Flame,
  Award,
} from "lucide-react";

interface TechTreeExplorerViewProps {
  vehicles: Vehicle[];
  activeMode: GameMode;
  onSelectVehicle: (v: Vehicle) => void;
  initialNation?: Nation;
}

const ITEMS_PER_PAGE = 36;

export function TechTreeExplorerView({
  vehicles,
  activeMode,
  onSelectVehicle,
  initialNation = "usa",
}: TechTreeExplorerViewProps) {
  const [selectedNation, setSelectedNation] = useState<Nation | "all">(initialNation);
  const [selectedBranch, setSelectedBranch] = useState<VehicleBranch | "all">("all");
  const [selectedRank, setSelectedRank] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "tech_tree" | "premium" | "squadron" | "event">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"br_desc" | "br_asc" | "rank_desc" | "name">("br_desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Nation vehicle count map
  const nationCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) {
      map.set(v.nation, (map.get(v.nation) ?? 0) + 1);
    }
    return map;
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Nation
      if (selectedNation !== "all" && v.nation !== selectedNation) return false;

      // Branch
      if (selectedBranch !== "all" && v.branch !== selectedBranch) return false;

      // Rank
      if (selectedRank !== "all" && v.rank !== selectedRank) return false;

      // Premium / Squadron / Event
      if (typeFilter === "tech_tree" && (v.isPremium || v.isSquadron || v.isEvent)) return false;
      if (typeFilter === "premium" && !v.isPremium) return false;
      if (typeFilter === "squadron" && !v.isSquadron) return false;
      if (typeFilter === "event" && !v.isEvent) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesId = v.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    }).sort((a, b) => {
      const brA = a.br[activeMode] ?? 0;
      const brB = b.br[activeMode] ?? 0;

      if (sortOrder === "br_desc") {
        if (brB !== brA) return brB - brA;
        return b.rank - a.rank;
      } else if (sortOrder === "br_asc") {
        if (brA !== brB) return brA - brB;
        return a.rank - b.rank;
      } else if (sortOrder === "rank_desc") {
        if (b.rank !== a.rank) return b.rank - a.rank;
        return brB - brA;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  }, [vehicles, selectedNation, selectedBranch, selectedRank, typeFilter, searchQuery, sortOrder, activeMode]);

  // Reset page when filters change
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVehicles, safeCurrentPage]);

  const handleNationChange = (nation: Nation | "all") => {
    setSelectedNation(nation);
    setCurrentPage(1);
  };

  const handleBranchChange = (branch: VehicleBranch | "all") => {
    setSelectedBranch(branch);
    setCurrentPage(1);
  };

  const handleRankChange = (rank: number | "all") => {
    setSelectedRank(rank);
    setCurrentPage(1);
  };

  const handleTypeChange = (type: "all" | "tech_tree" | "premium" | "squadron" | "event") => {
    setTypeFilter(type);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#171E27] via-[#1E2733] to-[#171E27] border border-[#2E4259] p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <h2 className="text-xl font-bold tracking-wide uppercase text-white flex items-center gap-2">
              <span>WAR THUNDER TECH-TREE DATABASE</span>
              <span className="text-[#38BDF8]">({vehicles.length} VEHICLES)</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-300">
            Browse verified vehicles across all 10 nations and Ranks I–VIII. Click any vehicle to inspect its full matchmaker ecosystem and opponent threats.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-[#1E2733] border border-[#2E4259] text-white">
            Matching: <strong className="text-[#38BDF8]">{filteredVehicles.length}</strong>
          </span>
        </div>
      </div>

      {/* Nation Tabs Bar (All 10 Nations) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-[#11161D] p-2 rounded-xl border border-[#2E4259]">
        <button
          onClick={() => handleNationChange("all")}
          type="button"
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border whitespace-nowrap",
            selectedNation === "all"
              ? "bg-[#2E4259] border-[#3B82F6] text-white shadow-md"
              : "bg-[#171E27] border-[#2E4259] text-slate-400 hover:text-white"
          )}
        >
          <span>🌐</span>
          <span>All Nations</span>
          <span className="text-[10px] text-slate-400">({vehicles.length})</span>
        </button>

        {NATIONS.map((n) => {
          const isActive = selectedNation === n.id;
          const count = nationCounts.get(n.id) ?? 0;
          return (
            <button
              key={n.id}
              onClick={() => handleNationChange(n.id)}
              type="button"
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border whitespace-nowrap",
                isActive
                  ? "bg-[#1E2733] border-[#F57C00] text-white shadow-md shadow-orange-950/20"
                  : "bg-[#171E27] border-[#2E4259] text-slate-300 hover:text-white hover:border-[#4A6B8F]"
              )}
            >
              <span className="text-sm">{n.flag}</span>
              <span className="font-mono">{n.name}</span>
              <span className={clsx(
                "text-[10px] font-mono px-1 rounded",
                isActive ? "bg-orange-500/20 text-[#F57C00]" : "text-slate-400"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls: Branch, Rank, Type, Search */}
      <div className="flex flex-col gap-3 bg-[#171E27] border border-[#2E4259] p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name (e.g. Leopard 2, T-80, F-15, Su-27)..."
              className="w-full pl-9 pr-3 py-2 bg-[#11161D] border border-[#2E4259] rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Branch Select */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleBranchChange("all")}
              type="button"
              className={clsx(
                "px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-all whitespace-nowrap",
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
                onClick={() => handleBranchChange(b.id)}
                type="button"
                className={clsx(
                  "px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-all flex items-center gap-1 whitespace-nowrap",
                  selectedBranch === b.id
                    ? "bg-[#2E4259] border-[#3B82F6] text-white font-bold"
                    : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
                )}
              >
                <span>{b.icon}</span>
                <span>{b.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs font-mono text-slate-400">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-[#11161D] border border-[#2E4259] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="br_desc">BR (High to Low)</option>
              <option value="br_asc">BR (Low to High)</option>
              <option value="rank_desc">Rank (VIII to I)</option>
              <option value="name">Name (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Ranks I-VIII and Vehicle Slot Types */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#2E4259]/60">
          {/* Rank Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-slate-400 mr-1">Rank:</span>
            <button
              onClick={() => handleRankChange("all")}
              type="button"
              className={clsx(
                "px-2 py-1 text-xs font-mono rounded border transition-all",
                selectedRank === "all"
                  ? "bg-[#2E4259] border-[#3B82F6] text-white font-bold"
                  : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
              )}
            >
              All
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((r) => (
              <button
                key={r}
                onClick={() => handleRankChange(r)}
                type="button"
                className={clsx(
                  "px-2 py-1 text-xs font-mono rounded border transition-all",
                  selectedRank === r
                    ? "bg-[#2E4259] border-[#3B82F6] text-white font-bold"
                    : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
                )}
              >
                {toRomanNumeral(r)}
              </button>
            ))}
          </div>

          {/* Slot Type Badges */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleTypeChange("all")}
              type="button"
              className={clsx(
                "px-2.5 py-1 text-xs font-mono rounded border transition-all",
                typeFilter === "all"
                  ? "bg-[#2E4259] border-[#3B82F6] text-white"
                  : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
              )}
            >
              All Types
            </button>
            <button
              onClick={() => handleTypeChange("tech_tree")}
              type="button"
              className={clsx(
                "px-2.5 py-1 text-xs font-mono rounded border transition-all",
                typeFilter === "tech_tree"
                  ? "bg-[#1E2B3A] border-[#3B82F6] text-white"
                  : "bg-[#11161D] border-[#2E4259] text-slate-400 hover:text-white"
              )}
            >
              Tech Tree Only
            </button>
            <button
              onClick={() => handleTypeChange("premium")}
              type="button"
              className={clsx(
                "px-2.5 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1",
                typeFilter === "premium"
                  ? "bg-[#3A2E14] border-[#D49B27] text-[#F5B841] font-bold"
                  : "bg-[#11161D] border-[#2E4259] text-amber-400/80 hover:text-amber-300"
              )}
            >
              <Award className="w-3 h-3" />
              <span>Premium</span>
            </button>
            <button
              onClick={() => handleTypeChange("squadron")}
              type="button"
              className={clsx(
                "px-2.5 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1",
                typeFilter === "squadron"
                  ? "bg-[#193322] border-[#2E6F40] text-[#4ADE80] font-bold"
                  : "bg-[#11161D] border-[#2E4259] text-emerald-400/80 hover:text-emerald-300"
              )}
            >
              <Users className="w-3 h-3" />
              <span>Squadron</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vehicle Grid (36 per page for 60 FPS performance) */}
      {paginatedVehicles.length === 0 ? (
        <div className="rounded-2xl bg-[#171E27] border border-[#2E4259] p-12 text-center flex flex-col items-center justify-center gap-3">
          <Layers className="w-10 h-10 text-slate-500" />
          <h3 className="text-base font-bold text-white">No vehicles found</h3>
          <p className="text-xs font-mono text-slate-400 max-w-sm">
            Try adjusting your search query, rank selection, or branch filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {paginatedVehicles.map((vehicle) => (
            <VehicleSlotCard
              key={vehicle.id}
              vehicle={vehicle}
              activeMode={activeMode}
              onClick={() => onSelectVehicle(vehicle)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#171E27] border border-[#2E4259] px-4 py-3 rounded-xl font-mono text-xs">
          <div className="text-slate-400">
            Showing <strong className="text-white">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
            <strong className="text-white">
              {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredVehicles.length)}
            </strong> of <strong className="text-white">{filteredVehicles.length}</strong> vehicles
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              type="button"
              className="p-1.5 rounded-lg bg-[#11161D] border border-[#2E4259] text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-slate-300 px-2">
              Page <strong className="text-white">{safeCurrentPage}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              type="button"
              className="p-1.5 rounded-lg bg-[#11161D] border border-[#2E4259] text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
