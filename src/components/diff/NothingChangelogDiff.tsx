"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { BRChange, GameMode } from "@/types";
import { formatBR, formatStepBadge } from "@/lib/br-engine";
import { NATIONS, VEHICLE_CLASS_LABELS } from "@/lib/constants";
import { BentoCard } from "@/components/ui/BentoCard";
import { Search, ArrowRight, ExternalLink } from "lucide-react";

interface NothingChangelogDiffProps {
  changes: BRChange[];
  activeMode: GameMode;
  forumUrl?: string;
  syncedAt?: string;
}

export function NothingChangelogDiff({
  changes,
  activeMode,
  forumUrl = "https://forum.warthunder.com",
  syncedAt,
}: NothingChangelogDiffProps) {
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"current" | "all">("current");

  const filtered = changes.filter((c) => {
    if (filterMode === "current" && c.mode !== activeMode) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.vehicleName.toLowerCase().includes(q) ||
      c.vehicleId.toLowerCase().includes(q) ||
      c.nation.toLowerCase().includes(q) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Header Card */}
      <BentoCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <h2 className="font-dot text-base sm:text-lg tracking-wider uppercase text-white">
                RAW PATCH CHANGELOG & DIFF TABLE
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-400">
              Audit all discrete Battle Rating transitions with verified datamine references.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {forumUrl && (
              <a
                href={forumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white transition-all select-none"
              >
                <span>OFFICIAL FORUM THREAD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter changes by name or notes..."
              className="w-full bg-[#141416] border border-white/[0.08] focus:border-white/20 rounded-full pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center rounded-full bg-[#141416] p-1 border border-white/[0.08]">
            <button
              onClick={() => setFilterMode("current")}
              type="button"
              className={clsx(
                "rounded-full px-3 py-1.5 text-xs font-mono transition-all",
                filterMode === "current"
                  ? "bg-white text-black font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              CURRENT MODE ({activeMode.toUpperCase()})
            </button>
            <button
              onClick={() => setFilterMode("all")}
              type="button"
              className={clsx(
                "rounded-full px-3 py-1.5 text-xs font-mono transition-all",
                filterMode === "all"
                  ? "bg-white text-black font-bold shadow"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              ALL MODES
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Diff Table */}
      <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[#121214]">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-[#161619] text-zinc-400 text-[11px] uppercase tracking-wider">
              <th className="py-4 px-6">VEHICLE</th>
              <th className="py-4 px-4">NATION</th>
              <th className="py-4 px-4">CLASS</th>
              <th className="py-4 px-4">MODE</th>
              <th className="py-4 px-4 text-center">BEFORE</th>
              <th className="py-4 px-4 text-center">AFTER</th>
              <th className="py-4 px-4 text-center">SHIFT</th>
              <th className="py-4 px-6">TACTICAL REASON & NOTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-500 italic">
                  No matching Battle Rating changes found.
                </td>
              </tr>
            ) : (
              filtered.map((c, i) => {
                const nationData = NATIONS.find((n) => n.id === c.nation);
                const classData = VEHICLE_CLASS_LABELS[c.vehicleClass];
                const isNerf = c.direction === "nerf";
                const isBuff = c.direction === "buff";

                return (
                  <tr
                    key={`${c.vehicleId}-${c.mode}-${i}`}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{c.vehicleName}</span>
                        {c.isPremium && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            PREM
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-zinc-300">
                      <span className="mr-1">{nationData?.flag}</span>
                      <span>{nationData?.name}</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-zinc-400">
                      {classData?.label}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">
                        {c.mode.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap text-zinc-400">
                      {formatBR(c.brBefore)}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap font-bold text-white">
                      {formatBR(c.brAfter)}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={clsx(
                          "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider inline-block",
                          isNerf && "bg-nothing-red/20 text-nothing-red border border-nothing-red/30",
                          isBuff && "bg-white/10 text-white border border-white/20",
                          !isNerf && !isBuff && "bg-zinc-800 text-zinc-400"
                        )}
                      >
                        {formatStepBadge(c.stepDelta)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 max-w-xs truncate">
                      {c.notes || c.impactReasons[0] || "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
