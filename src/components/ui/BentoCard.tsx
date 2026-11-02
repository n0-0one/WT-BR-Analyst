import React from "react";
import clsx from "clsx";

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  dotGrid?: boolean;
  elevated?: boolean;
  glowOnHover?: boolean;
}

export function BentoCard({
  children,
  className,
  dotGrid = false,
  elevated = false,
  glowOnHover = false,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={clsx(
        "relative rounded-3xl transition-all duration-300 border",
        elevated
          ? "bg-[#18181B] border-white/10"
          : "bg-[#121214] border-white/[0.08]",
        glowOnHover && "hover:border-white/20 hover:shadow-2xl hover:shadow-white/[0.02]",
        dotGrid && "bg-dot-matrix",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
