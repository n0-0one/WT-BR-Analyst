import React from "react";
import clsx from "clsx";

interface DotMatrixTitleProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
  dotPrefix?: boolean;
  pulsingRed?: boolean;
}

export function DotMatrixTitle({
  children,
  as: Component = "h2",
  className,
  dotPrefix = false,
  pulsingRed = false,
}: DotMatrixTitleProps) {
  return (
    <Component
      className={clsx(
        "font-dot tracking-wider uppercase flex items-center gap-2",
        className
      )}
    >
      {dotPrefix && (
        <span
          className={clsx(
            "inline-block w-2.5 h-2.5 rounded-full",
            pulsingRed ? "bg-nothing-red animate-pulse" : "bg-white"
          )}
        />
      )}
      {children}
    </Component>
  );
}
