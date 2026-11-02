"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { ImageFolder, Vehicle, VehicleBranch, VehicleClass } from "@/types";
import { withBasePath } from "@/lib/constants";

interface VehicleImageProps {
  vehicle?: Pick<Vehicle, "id" | "name" | "vehicleClass" | "branch"> & {
    imageFolder?: ImageFolder;
    imageId?: string;
  };
  vehicleId?: string;
  vehicleName?: string;
  vehicleClass?: VehicleClass;
  branch?: VehicleBranch;
  imageFolder?: ImageFolder;
  imageId?: string;
  className?: string;
  alt?: string;
}

export function getVehicleCascadeUrls(params: {
  id: string;
  imageFolder?: ImageFolder;
  imageId?: string;
  branch?: VehicleBranch;
  vehicleClass?: VehicleClass;
}): string[] {
  const cleanId = (params.imageId ?? params.id).toLowerCase();

  // Resolve folder
  let folder: ImageFolder = params.imageFolder ?? "tanks";
  if (!params.imageFolder) {
    if (params.branch === "aviation" || params.branch === "helicopters") {
      folder = "aircrafts";
    } else if (params.branch === "fleet") {
      folder = "ships";
    } else {
      folder = "tanks";
    }
  }

  // Determine SVG placeholder type
  let placeholderType = "tank";
  if (params.vehicleClass === "spaa") {
    placeholderType = "spaa";
  } else if (params.branch === "helicopters" || params.vehicleClass === "helicopter") {
    placeholderType = "helicopter";
  } else if (
    params.branch === "aviation" ||
    params.vehicleClass === "fighter" ||
    params.vehicleClass === "strike_aircraft" ||
    params.vehicleClass === "attacker" ||
    params.vehicleClass === "bomber"
  ) {
    placeholderType = "aircraft";
  } else if (
    params.branch === "fleet" ||
    params.vehicleClass === "bluewater" ||
    params.vehicleClass === "coastal"
  ) {
    placeholderType = "ship";
  }

  return [
    // Stage 1: Official Game Unit Icon from Datamine
    `https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/tex.vromfs.bin_u/${folder}/${cleanId}.png`,
    // Stage 2: Official War Thunder Wiki / Encyclopedia High-Res Render
    `https://static.encyclopedia.warthunder.com/images/${cleanId}.png`,
    // Stage 3: WT Wiki 3.0 Static Files CDN
    `https://staticfiles.warthunder.com/upload/image/!_wiki_images/unit_cards/${cleanId}.png`,
    // Stage 4: WT Vehicles API Mirror
    `https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${cleanId}.png`,
    // Stage 5: High-detail War Thunder hangar silhouette SVG
    withBasePath(`/placeholders/${placeholderType}.svg`),
  ];
}

export function VehicleImage({
  vehicle,
  vehicleId,
  vehicleName,
  vehicleClass,
  branch,
  imageFolder,
  imageId,
  className,
  alt,
}: VehicleImageProps) {
  const [stageIndex, setStageIndex] = useState(0);

  const effectiveId = vehicle?.id ?? vehicleId ?? "unknown";
  const effectiveName = vehicle?.name ?? vehicleName ?? effectiveId;
  const effectiveClass = vehicle?.vehicleClass ?? vehicleClass ?? "medium_tank";
  const effectiveBranch = vehicle?.branch ?? branch ?? "army";
  const effectiveFolder = vehicle?.imageFolder ?? imageFolder;
  const effectiveImageId = vehicle?.imageId ?? imageId ?? effectiveId;

  const urls = getVehicleCascadeUrls({
    id: effectiveId,
    imageFolder: effectiveFolder,
    imageId: effectiveImageId,
    branch: effectiveBranch,
    vehicleClass: effectiveClass,
  });

  const currentSrc = urls[stageIndex] ?? urls[urls.length - 1];

  const handleError = () => {
    if (stageIndex < urls.length - 1) {
      setStageIndex((prev) => prev + 1);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt ?? effectiveName}
      loading="lazy"
      onError={handleError}
      className={clsx("object-contain transition-opacity duration-200 select-none", className)}
    />
  );
}
