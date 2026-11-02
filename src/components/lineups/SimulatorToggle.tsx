"use client";

import React from "react";
import clsx from "clsx";
import { AlertTriangle } from "lucide-react";

interface SimulatorToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

export function SimulatorToggle({ enabled, onToggle, disabled = false }: SimulatorToggleProps) {
  return (
    <div
      onClick={() => !disabled && onToggle(!enabled)}
      className={clsx(
        "flex items-center justify-between gap-4 rounded-2xl p-4 border transition-all duration-300 select-none",
        disabled && "opacity-40 cursor-not-allowed bg-zinc-900/50 border-white/[0.04]",
        !disabled && enabled
          ? "bg-amber-500/10 border-amber-500/30 cursor-pointer shadow-lg shadow-amber-500/5"
          : !disabled && "bg-[#141416] border-white/[0.08] hover:border-white/20 cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "p-2 rounded-xl border",
            enabled
              ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
              : "bg-white/[0.04] border-white/[0.08] text-zinc-400"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            SIMULATOR: &quot;What if I keep nerfed vehicles?&quot;
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {enabled
              ? "Active: Exposes entire lineup to higher uptier ceilings"
              : "Inactive: Strict anchor preservation (drops nerfed tanks)"}
          </span>
        </div>
      </div>

      {/* Switch pill */}
      <div
        className={clsx(
          "w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5",
          enabled ? "bg-amber-500" : "bg-zinc-800"
        )}
      >
        <div
          className={clsx(
            "w-5 h-5 rounded-full bg-black shadow-md transition-transform duration-200",
            enabled ? "translate-x-6" : "translate-x-0"
          )}
        />
      </div>
    </div>
  );
}
