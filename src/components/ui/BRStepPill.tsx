import React from "react";
import clsx from "clsx";
import { formatBR, formatStepBadge } from "@/lib/br-engine";
import { ArrowRight } from "lucide-react";

interface BRStepPillProps {
  brBefore: number;
  brAfter: number;
  stepDelta: number;
  direction: "buff" | "nerf" | "unchanged";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BRStepPill({
  brBefore,
  brAfter,
  stepDelta,
  direction,
  size = "md",
  className,
}: BRStepPillProps) {
  const isNerf = direction === "nerf";
  const isBuff = direction === "buff";

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border font-mono select-none",
        size === "sm" && "px-3 py-1 text-xs",
        size === "md" && "px-4 py-1.5 text-xs sm:text-sm",
        size === "lg" && "px-5 py-2 text-sm sm:text-base",
        isNerf && "bg-nothing-red/10 border-nothing-red/30 text-white",
        isBuff && "bg-white/10 border-white/30 text-white",
        !isNerf && !isBuff && "bg-zinc-900 border-white/10 text-zinc-400",
        className
      )}
    >
      <span className="text-zinc-400 font-medium">{formatBR(brBefore)}</span>
      <ArrowRight
        className={clsx(
          "w-3.5 h-3.5 stroke-[2.5]",
          isNerf ? "text-nothing-red" : isBuff ? "text-white" : "text-zinc-500"
        )}
      />
      <span
        className={clsx(
          "font-bold",
          isNerf ? "text-nothing-red" : isBuff ? "text-white" : "text-zinc-300"
        )}
      >
        {formatBR(brAfter)}
      </span>
      <span
        className={clsx(
          "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider",
          isNerf
            ? "bg-nothing-red text-white"
            : isBuff
            ? "bg-white text-black"
            : "bg-zinc-800 text-zinc-400"
        )}
      >
        {formatStepBadge(stepDelta)}
      </span>
    </div>
  );
}
