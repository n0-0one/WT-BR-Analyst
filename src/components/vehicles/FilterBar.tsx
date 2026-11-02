"use client";

import React from "react";
import clsx from "clsx";
import { Nation } from "@/types";
import { NATIONS } from "@/lib/constants";
import { Search, X } from "lucide-react";

export type DirectionFilter = "all" | "buff" | "nerf";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedNation: Nation | "all";
  onNationChange: (nation: Nation | "all") => void;
  directionFilter: DirectionFilter;
  onDirectionChange: (dir: DirectionFilter) => void;
  minImpactScore: number;
  onMinImpactChange: (val: number) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedNation,
  onNationChange,
  directionFilter,
  onDirectionChange,
  minImpactScore,
  onMinImpactChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 w-full mb-8">
      {/* Top Search & Direction Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input with Nothing OS aesthetics */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search vehicle, class, or gun..."
            className="w-full bg-[#141416] border border-white/[0.08] focus:border-white/20 rounded-full pl-10 pr-9 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Direction Segmented Filter */}
        <div className="flex items-center rounded-full bg-[#141416] p-1 border border-white/[0.08] self-start sm:self-auto">
          {(
            [
              { id: "all", label: "ALL CHANGES" },
              { id: "buff", label: "BUFFS (WINNERS)" },
              { id: "nerf", label: "NERFS (LOSERS)" },
            ] as const
          ).map((item) => {
            const isSelected = directionFilter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onDirectionChange(item.id)}
                type="button"
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-mono transition-all duration-200",
                  isSelected
                    ? "bg-white text-black font-bold shadow"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nation Filter Horizontal Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onNationChange("all")}
          type="button"
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap border",
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
              onClick={() => onNationChange(n.id)}
              type="button"
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap border",
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
  );
}
