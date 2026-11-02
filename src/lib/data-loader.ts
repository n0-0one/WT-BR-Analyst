import { PatchDataset, Vehicle } from "@/types";
import vehiclesRaw from "../../data/vehicles.json";
import latestPatchRaw from "../../data/br-changes/latest-patch.json";
import indexRaw from "../../data/index.json";

export const allVehicles: Vehicle[] = vehiclesRaw as Vehicle[];
export const latestPatch: PatchDataset = latestPatchRaw as PatchDataset;
export const patchIndex = indexRaw;

/**
 * Returns all vehicles from local verified database.
 */
export function getAllVehicles(): Vehicle[] {
  return allVehicles;
}

/**
 * Finds a vehicle by ID.
 */
export function getVehicleById(id: string): Vehicle | undefined {
  return allVehicles.find((v) => v.id.toLowerCase() === id.toLowerCase());
}

/**
 * Returns the latest verified patch change dataset.
 */
export function getLatestPatch(): PatchDataset {
  return latestPatch;
}

/**
 * Returns all vehicles for a specific nation.
 */
export function getVehiclesByNation(nation: string): Vehicle[] {
  return allVehicles.filter((v) => v.nation === nation);
}
