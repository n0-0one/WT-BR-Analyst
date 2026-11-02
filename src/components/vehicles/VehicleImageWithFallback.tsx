"use client";

import React, { useState } from "react";
import { VehicleClass } from "@/types";
import { getVehiclePlaceholderUrl } from "@/lib/constants";
import clsx from "clsx";

interface VehicleImageWithFallbackProps {
  src?: string;
  alt: string;
  vehicleClass: VehicleClass;
  className?: string;
}

export function VehicleImageWithFallback({
  src,
  alt,
  vehicleClass,
  className,
}: VehicleImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const placeholderUrl = getVehiclePlaceholderUrl(vehicleClass);

  const finalSrc = !src || hasError ? placeholderUrl : src;

  return (
    <div className={clsx("relative flex items-center justify-center overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalSrc}
        alt={alt}
        onError={() => setHasError(true)}
        loading="lazy"
        className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
