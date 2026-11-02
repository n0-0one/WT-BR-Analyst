"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { GameMode, Nation, Vehicle, VehicleClass } from "@/types";
import { formatBR, WT_BR_VALUES } from "@/lib/br-engine";
import { NATIONS, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { BentoCard } from "@/components/ui/BentoCard";
import { VehicleImageWithFallback } from "./VehicleImageWithFallback";
import { Search, ExternalLink } from "lucide-react";

interface MatrixExplorerViewProps {
  vehicles: Vehicle[];
  activeMode: GameMode;
}

export function MatrixExplorerView({ vehicles, activeMode }: MatrixExplorerViewProps) {
  const [query, setQuery] = useState("");
  const [selectedNation, setSelectedNation] = useState<Nation | "all">("all");
  const [selectedClass, setSelectedClass] = useState<VehicleClass | "all">("all");
  const [minBR, setMinBR] = useState<number>(1.0);
  const [maxBR, setMaxBR] = useState<number>(14.0);

  const filtered = vehicles.filter((v) => {
    if (selectedNation !== "all" && v.nation !== selectedNation) return false;
    if (selectedClass !== "all" && v.vehicleClass !== selectedClass) return false;
    const br = v.br[activeMode] ?? 1.0;
    if (br < minBR || br > maxBR) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
  });

  // Sort by BR descending
  filtered.sort((a, b) => (b.br[activeMode] ?? 0) - (a.br[activeMode] ?? 0));

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Filter Bento Card */}
      <BentoCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <h2 className="font-dot text-base sm:text-lg tracking-wider uppercase text-white">
                WAR THUNDER VEHICLE MATRIX EXPLORER
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Complete verified database of ground, air, and helicopter units across all 10 nations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              SHOWING <span className="text-white font-bold">{filtered.length}</span> / {vehicles.length} VEHICLES
            </span>
          </div>
        </div>

        {/* Search & BR Range Slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name (e.g. Leopard, T-80, Abrams, Gripen)..."
              className="w-full bg-[#141416] border border-white/[0.08] focus:border-white/20 rounded-full pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">MIN BR: {formatBR(minBR)}</span>
              <input
                type="range"
                min="1.0"
                max="14.0"
                step="0.3"
                value={minBR}
                onChange={(e) => setMinBR(Number(e.target.value))}
                className="accent-white cursor-pointer"
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">MAX BR: {formatBR(maxBR)}</span>
              <input
                type="range"
                min="1.0"
                max="14.0"
                step="0.3"
                value={maxBR}
                onChange={(e) => setMaxBR(Number(e.target.value))}
                className="accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Nation Filter Horizontal Pills */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedNation("all")}
              type="button"
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap border select-none",
                selectedNation === "all"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#141416] text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/20"
              )}
            >
              ALL NATIONS
            </button>

            {NATIONS.map((n) => {
              const isSelected = selectedNation === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNation(n.id)}
                  type="button"
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap border select-none",
                    isSelected
                      ? "bg-white text-black font-bold border-white"
                      : "bg-[#141416] text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/20"
                  )}
                >
                  <span>{n.flag}</span>
                  <span>{n.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Class Filter Pills */}
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedClass("all")}
              type="button"
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap border select-none",
                selectedClass === "all"
                  ? "bg-white text-black font-bold border-white"
                  : "bg-[#141416] text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/20"
              )}
            >
              ALL CLASSES
            </button>

            {(Object.keys(VEHICLE_CLASS_LABELS) as VehicleClass[]).map((cls) => {
              const isSelected = selectedClass === cls;
              const data = VEHICLE_CLASS_LABELS[cls];
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  type="button"
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap border select-none",
                    isSelected
                      ? "bg-white text-black font-bold border-white"
                      : "bg-[#141416] text-zinc-400 border-white/[0.06] hover:text-white hover:border-white/20"
                  )}
                >
                  <span>{data.icon}</span>
                  <span>{data.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </BentoCard>

      {/* Grid of Vehicles */}
      {filtered.length === 0 ? (
        <BentoCard className="p-12 text-center text-xs font-mono text-zinc-500 italic">
          No vehicles matched your filter parameters.
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((v) => {
            const nationData = NATIONS.find((n) => n.id === v.nation);
            const classData = VEHICLE_CLASS_LABELS[v.vehicleClass];
            const currentBR = v.br[activeMode] ?? 1.0;

            return (
              <div
                key={v.id}
                className="group rounded-3xl p-4 bg-[#121214] hover:bg-[#18181B] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-base">{nationData?.flag}</span>
                      <span className="text-xs font-mono font-bold text-white truncate max-w-[120px]">
                        {v.name}
                      </span>
                    </div>

                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold shrink-0">
                      {formatBR(currentBR)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-[10px] font-mono text-zinc-500">
                    <span>{classData?.label}</span>
                    <span>•</span>
                    <span>RANK {v.rank}</span>
                    {v.isPremium && (
                      <span className="text-amber-400 ml-auto font-bold">PREM</span>
                    )}
                  </div>
                </div>

                <div className="h-20 w-full my-2 flex items-center justify-center bg-black/40 rounded-2xl p-1 bg-dot-matrix-dense">
                  <VehicleImageWithFallback
                    src={`https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${v.id}.png`}
                    alt={v.name}
                    vehicleClass={v.vehicleClass}
                    className="w-full h-full"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2 pt-2 border-t border-white/[0.04]">
                  <span className="text-zinc-500 text-[10px] truncate max-w-[140px]">
                    {v.id}
                  </span>
                  <a
                    href={`https://wiki.warthunder.com/${encodeURIComponent(v.name.replace(/ /g, "_"))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors p-1"
                    title="View on Official War Thunder Wiki"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
