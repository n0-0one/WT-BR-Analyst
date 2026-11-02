import React from "react";
import clsx from "clsx";

export interface Option<T extends string = string> {
  id: T;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface PillSegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PillSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: PillSegmentedControlProps<T>) {
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full bg-[#1A1A1E] p-1 border border-white/[0.08] shadow-inner",
        className
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            type="button"
            className={clsx(
              "flex items-center gap-2 rounded-full font-mono transition-all duration-200 select-none",
              size === "sm" && "px-3 py-1 text-xs",
              size === "md" && "px-4 py-1.5 text-xs sm:text-sm",
              size === "lg" && "px-6 py-2.5 text-sm",
              isSelected
                ? "bg-white text-black font-bold shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            {opt.icon && <span>{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={clsx(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                  isSelected
                    ? "bg-black text-white"
                    : "bg-white/10 text-zinc-300"
                )}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
