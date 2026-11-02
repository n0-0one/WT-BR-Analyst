"use client";

import React from "react";
import clsx from "clsx";
import { GameMode } from "@/types";
import {
  Flame,
  BarChart3,
  Trophy,
  FolderTree,
  ShieldAlert,
  Swords,
  Table,
} from "lucide-react";

export type WTTab =
  | "overview"
  | "winners-losers"
  | "tech-tree"
  | "lineup-checker"
  | "lineup-builder"
  | "full-table";

interface WTHeaderProps {
  activeTab: WTTab;
  onTabChange: (tab: WTTab) => void;
  activeMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  totalVehiclesCount: number;
}

export function WTHeader({
  activeTab,
  onTabChange,
  activeMode,
  onModeChange,
  totalVehiclesCount,
}: WTHeaderProps) {
  const navTabs: { id: WTTab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Patch Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "winners-losers", label: "Winners & Losers", icon: <Trophy className="w-4 h-4" /> },
    { id: "tech-tree", label: `Vehicles (${totalVehiclesCount})`, icon: <FolderTree className="w-4 h-4" /> },
    { id: "lineup-checker", label: "Lineup Survival", icon: <ShieldAlert className="w-4 h-4" /> },
    { id: "lineup-builder", label: "Lineup Builder", icon: <Swords className="w-4 h-4" /> },
    { id: "full-table", label: "Official Changes", icon: <Table className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#11161D]/95 backdrop-blur-md border-b border-[#2E4259] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 py-2.5">
        {/* Brand & Live Sync Telemetry */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={() => onTabChange("overview")}
            className="cursor-pointer flex items-center gap-2 group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#FF8A00] to-[#E65100] border border-[#FFA726] flex items-center justify-center shadow-lg shadow-orange-950/40">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider uppercase text-white flex items-center gap-1.5">
                <span>WAR THUNDER</span>
                <span className="text-[#F57C00]">BR ANALYST</span>
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8] -mt-1">
                Ecosystem & Lineup Intelligence
              </span>
            </div>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center bg-[#171E27] p-1 rounded-lg border border-[#2E4259] overflow-x-auto scrollbar-none">
            {(
              [
                { id: "rbGround", label: "Ground RB (Combined)" },
                { id: "rb", label: "Air RB" },
                { id: "ab", label: "Arcade" },
                { id: "sb", label: "Sim" },
              ] as const
            ).map((m) => {
              const isActive = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  type="button"
                  className={clsx(
                    "px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap",
                    isActive
                      ? "bg-gradient-to-b from-[#F57C00] to-[#E65100] text-white shadow"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto max-w-full pb-1 md:pb-0 gap-1.5 scrollbar-none">
          {navTabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                type="button"
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap border select-none",
                  isActive
                    ? "bg-[#1E2733] border-[#3B82F6] text-white shadow-md shadow-blue-950/30"
                    : "bg-[#171E27] border-[#2E4259] text-slate-300 hover:text-white hover:border-[#4A6B8F]"
                )}
              >
                <span className={clsx(isActive ? "text-[#38BDF8]" : "text-slate-400")}>
                  {t.icon}
                </span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
