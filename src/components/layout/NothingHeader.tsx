"use client";

import React from "react";
import clsx from "clsx";
import { GameMode } from "@/types";
import { PillSegmentedControl } from "@/components/ui/PillSegmentedControl";
import { Activity, Shield, Layers, TrendingUp, Sliders, GitCompare } from "lucide-react";

export type ActiveTab =
  | "overview"
  | "winners-losers"
  | "lineup-checker"
  | "lineup-builder"
  | "explorer"
  | "diff";

interface NothingHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function NothingHeader({
  activeTab,
  onTabChange,
  activeMode,
  onModeChange,
}: NothingHeaderProps) {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "OVERVIEW", icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "winners-losers", label: "WINNERS & LOSERS", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "lineup-checker", label: "LINEUP SURVIVAL", icon: <Shield className="w-3.5 h-3.5" /> },
    { id: "lineup-builder", label: "COMBINED ARMS", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "explorer", label: "BR MATRIX", icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: "diff", label: "PATCH DIFF", icon: <GitCompare className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-8 max-w-7xl mx-auto mb-8">
      <div className="rounded-full bg-[#121214]/90 backdrop-blur-xl border border-white/10 px-4 py-2.5 sm:px-6 sm:py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        {/* Brand & Sync Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onTabChange("overview")}
            className="cursor-pointer group flex items-center gap-2 select-none"
          >
            <span className="font-dot text-base sm:text-lg tracking-widest text-white group-hover:text-zinc-300 transition-colors">
              WT // NOTHING
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Pulsing Live Sync Dot */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono tracking-wider text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nothing-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-nothing-red" />
            </span>
            <span className="hidden sm:inline">LIVE SYNC</span>
          </div>
        </div>

        {/* Center Nav Navigation */}
        <nav className="flex items-center overflow-x-auto py-1 max-w-full scrollbar-none">
          <div className="flex items-center rounded-full bg-[#1A1A1E] p-1 border border-white/[0.08] gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  type="button"
                  className={clsx(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono transition-all duration-200 whitespace-nowrap",
                    isActive
                      ? "bg-white text-black font-bold shadow"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Global Game Mode Pill Selector */}
        <div className="flex items-center">
          <PillSegmentedControl<GameMode>
            size="sm"
            value={activeMode}
            onChange={onModeChange}
            options={[
              { id: "rb", label: "RB" },
              { id: "ab", label: "AB" },
              { id: "sb", label: "SB" },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
