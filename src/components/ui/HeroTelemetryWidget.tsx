import React from "react";
import { PatchMetadata } from "@/types";
import { ShieldCheck, TrendingDown, TrendingUp, Cpu } from "lucide-react";

interface HeroTelemetryWidgetProps {
  metadata: PatchMetadata;
  activeModeVehiclesCount: number;
}

export function HeroTelemetryWidget({
  metadata,
  activeModeVehiclesCount,
}: HeroTelemetryWidgetProps) {
  const total = metadata.buffsCount + metadata.nerfsCount;
  const buffsPct = total > 0 ? Math.round((metadata.buffsCount / total) * 100) : 50;
  const nerfsPct = 100 - buffsPct;

  return (
    <div className="relative rounded-3xl bg-[#121214] border border-white/10 p-6 sm:p-8 bg-dot-matrix overflow-hidden shadow-2xl">
      {/* Background glow micro-accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-nothing-red/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-nothing-red animate-pulse" />
            <span className="font-dot text-xs tracking-widest text-zinc-300 uppercase">
              ACTIVE INTELLIGENCE FEED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-nothing-green" />
              <span>WT WIKI + DATAMINE VERIFIED</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-400">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span>DISCRETE BR MATH</span>
            </div>
          </div>
        </div>

        {/* Patch Headline */}
        <div>
          <h1 className="font-dot text-xl sm:text-2xl md:text-3xl text-white tracking-wide uppercase leading-tight mb-2">
            {metadata.title}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl leading-relaxed">
            Real-time battle rating decompression impact analysis. Tracking matchmaker black hole gravitational pull,
            tactical lineup anchor survivability, and combined arms balance.
          </p>
        </div>

        {/* Key Metrics Bento Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {/* Total Vehicles Tracked */}
          <div className="rounded-2xl p-4 bg-black/40 border border-white/[0.06] flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
              DATABASE VEHICLES
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {metadata.verifiedVehiclesCount}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 mt-1">10 Nations Tracked</span>
          </div>

          {/* Total Changes in Patch */}
          <div className="rounded-2xl p-4 bg-black/40 border border-white/[0.06] flex flex-col">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
              PLANNED BR SHIFTS
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {metadata.totalChangesCount}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 mt-1">Across AB / RB / SB</span>
          </div>

          {/* Meta Buffs (Winners) */}
          <div className="rounded-2xl p-4 bg-black/40 border border-white/[0.06] flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
              <span>BUFFS (WINNERS)</span>
              <TrendingDown className="w-3.5 h-3.5 text-nothing-green" />
            </div>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {metadata.buffsCount}
            </span>
            <span className="text-[10px] font-mono text-nothing-green mt-1">BR Decreased</span>
          </div>

          {/* Meta Nerfs (Losers) */}
          <div className="rounded-2xl p-4 bg-black/40 border border-white/[0.06] flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
              <span>NERFS (LOSERS)</span>
              <TrendingUp className="w-3.5 h-3.5 text-nothing-red" />
            </div>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-nothing-red">
              {metadata.nerfsCount}
            </span>
            <span className="text-[10px] font-mono text-nothing-red/80 mt-1">BR Increased</span>
          </div>
        </div>

        {/* Buffs vs Nerfs Ratio Bar */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>BUFF RATIO: {buffsPct}%</span>
            <span>NERF RATIO: {nerfsPct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden flex">
            <div
              style={{ width: `${buffsPct}%` }}
              className="bg-white transition-all duration-500"
              title={`Buffs: ${buffsPct}%`}
            />
            <div
              style={{ width: `${nerfsPct}%` }}
              className="bg-nothing-red transition-all duration-500"
              title={`Nerfs: ${nerfsPct}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
