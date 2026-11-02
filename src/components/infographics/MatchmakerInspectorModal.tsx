"use client";

import React from "react";
import { GameMode, Vehicle } from "@/types";
import {
  NATIONS,
  toRomanNumeral,
  VEHICLE_CLASS_LABELS,
} from "@/lib/constants";
import { formatBR, WT_BR_VALUES } from "@/lib/br-engine";
import { MatchmakerWindowBar } from "./MatchmakerWindowBar";
import { VehicleImage } from "../vehicles/VehicleImage";
import { X, ExternalLink, Shield, Crosshair, ArrowUp, ArrowDown } from "lucide-react";

interface MatchmakerInspectorModalProps {
  vehicle: Vehicle | null;
  activeMode: GameMode;
  allVehicles: Vehicle[];
  onClose: () => void;
}

export function MatchmakerInspectorModal({
  vehicle,
  activeMode,
  allVehicles,
  onClose,
}: MatchmakerInspectorModalProps) {
  if (!vehicle) return null;

  const nation = NATIONS.find((n) => n.id === vehicle.nation);
  const classInfo = VEHICLE_CLASS_LABELS[vehicle.vehicleClass];

  const currentBR = vehicle.br[activeMode] ?? 1.0;
  const splitGroundBR = vehicle.br.rbGround;

  // Calculate downtier targets and uptier threats in current active mode
  const floorBR = Math.max(1.0, Number((currentBR - 1.0).toFixed(1)));
  const ceilingBR = Number((currentBR + 1.0).toFixed(1));

  const uptierThreats = allVehicles
    .filter((v) => {
      const br = v.br[activeMode] ?? 0;
      return br > currentBR && br <= ceilingBR && v.nation !== vehicle.nation;
    })
    .slice(0, 8);

  const downtierTargets = allVehicles
    .filter((v) => {
      const br = v.br[activeMode] ?? 0;
      return br < currentBR && br >= floorBR && v.nation !== vehicle.nation;
    })
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#171E27] border-2 border-[#2E4259] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2E4259] bg-[#11161D]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nation?.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">{vehicle.name}</h3>
                {vehicle.isPremium && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3A2E14] text-[#F5B841] border border-[#D49B27]">
                    PREMIUM
                  </span>
                )}
                {vehicle.isSquadron && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#193322] text-[#4ADE80] border border-[#2E6F40]">
                    SQUADRON
                  </span>
                )}
              </div>
              <span className="text-xs font-mono text-slate-400">
                {classInfo?.label} • Rank {toRomanNumeral(vehicle.rank)} • {nation?.name}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg bg-[#1E2733] border border-[#2E4259] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 flex flex-col gap-6">
          {/* Top Banner: Vehicle Render + Official BR Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-44 rounded-xl bg-gradient-to-b from-[#1E2733] to-[#121922] border border-[#2E4259] p-4 flex items-center justify-center relative overflow-hidden">
              <VehicleImage
                vehicle={vehicle}
                alt={vehicle.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-xl"
              />
            </div>

            {/* Complete Official Battle Ratings Card */}
            <div className="flex flex-col gap-2.5 bg-[#11161D] rounded-xl p-4 border border-[#2E4259]">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                OFFICIAL BATTLE RATINGS
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#17202B] p-2 rounded border border-[#2E4259] flex items-center justify-between">
                  <span className="text-slate-400">Arcade (AB):</span>
                  <span className="font-bold text-white text-sm">{formatBR(vehicle.br.ab)}</span>
                </div>
                <div className="bg-[#17202B] p-2 rounded border border-[#2E4259] flex items-center justify-between">
                  <span className="text-slate-400">Realistic (Air RB):</span>
                  <span className="font-bold text-white text-sm">{formatBR(vehicle.br.rb)}</span>
                </div>
                {splitGroundBR && (
                  <div className="bg-[#1F281E] p-2 rounded border border-emerald-500/30 flex items-center justify-between col-span-2">
                    <span className="text-emerald-400 font-semibold">Ground RB (Combined):</span>
                    <span className="font-bold text-emerald-300 text-sm">{formatBR(splitGroundBR)}</span>
                  </div>
                )}
                <div className="bg-[#17202B] p-2 rounded border border-[#2E4259] flex items-center justify-between col-span-2">
                  <span className="text-slate-400">Simulator (SB):</span>
                  <span className="font-bold text-white text-sm">{formatBR(vehicle.br.sb)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px] truncate max-w-[180px]">
                  ID: {vehicle.id}
                </span>
                <a
                  href={`https://wiki.warthunder.com/unit/${vehicle.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#38BDF8] hover:underline"
                >
                  <span>Official Wiki Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Matchmaker Window Bar Infographic */}
          <MatchmakerWindowBar
            br={currentBR}
            groundBR={splitGroundBR}
          />

          {/* Opponent Pools Breakdown: Uptier Threats & Downtier Targets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uptier Threats */}
            <div className="bg-[#11161D] rounded-xl p-4 border border-[#2E4259] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#2E4259] pb-2">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>KEY UPTIER THREATS (+1.0)</span>
                </span>
                <span className="text-slate-500 text-[11px]">Facing in +1.0</span>
              </div>

              {uptierThreats.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">Top tier vehicle / no higher threats.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {uptierThreats.map((t) => (
                    <div key={t.id} className="bg-[#17202B] p-2 rounded border border-[#2E4259] flex items-center justify-between text-xs">
                      <span className="truncate max-w-[100px] text-slate-200 font-semibold">{t.name}</span>
                      <span className="text-red-400 font-mono font-bold text-[11px]">{formatBR(t.br[activeMode] ?? 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downtier Targets */}
            <div className="bg-[#11161D] rounded-xl p-4 border border-[#2E4259] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#2E4259] pb-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>DOWNTIER PREY (-1.0)</span>
                </span>
                <span className="text-slate-500 text-[11px]">Bullied in -1.0</span>
              </div>

              {downtierTargets.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">Lowest tier / bottom of matchmaker.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {downtierTargets.map((t) => (
                    <div key={t.id} className="bg-[#17202B] p-2 rounded border border-[#2E4259] flex items-center justify-between text-xs">
                      <span className="truncate max-w-[100px] text-slate-200 font-semibold">{t.name}</span>
                      <span className="text-emerald-400 font-mono font-bold text-[11px]">{formatBR(t.br[activeMode] ?? 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
