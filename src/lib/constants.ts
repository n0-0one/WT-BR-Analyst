import { GameMode, Nation, VehicleClass } from "@/types";

export const NATIONS: { id: Nation; name: string; flag: string; code: string }[] = [
  { id: "usa", name: "USA", flag: "🇺🇸", code: "us" },
  { id: "germany", name: "Germany", flag: "🇩🇪", code: "germ" },
  { id: "ussr", name: "USSR", flag: "🇷🇺", code: "ussr" },
  { id: "britain", name: "Great Britain", flag: "🇬🇧", code: "uk" },
  { id: "japan", name: "Japan", flag: "🇯🇵", code: "jp" },
  { id: "china", name: "China", flag: "🇨🇳", code: "cn" },
  { id: "italy", name: "Italy", flag: "🇮🇹", code: "it" },
  { id: "france", name: "France", flag: "🇫🇷", code: "fr" },
  { id: "sweden", name: "Sweden", flag: "🇸🇪", code: "sw" },
  { id: "israel", name: "Israel", flag: "🇮🇱", code: "il" },
];

export const GAME_MODES: { id: GameMode; name: string; short: string; description: string }[] = [
  { id: "rb", name: "Realistic Battles", short: "RB", description: "Standard tactical meta with realistic physics & CAS" },
  { id: "ab", name: "Arcade Battles", short: "AB", description: "Fast-paced action with boosted engine power & lead markers" },
  { id: "sb", name: "Simulator Battles", short: "SB", description: "Cockpit/commander view with strict realism & manual flight" },
];

export const BLACK_HOLE_BRS: readonly number[] = [3.7, 5.7, 6.7, 8.7, 10.3, 11.7, 13.0, 14.0] as const;

export const VEHICLE_CLASS_LABELS: Record<VehicleClass, { label: string; icon: string; category: "ground" | "air" | "heli" }> = {
  medium_tank: { label: "Medium Tank", icon: "🛡️", category: "ground" },
  heavy_tank: { label: "Heavy Tank", icon: "🏰", category: "ground" },
  light_tank: { label: "Light Tank", icon: "⚡", category: "ground" },
  spaa: { label: "SPAA", icon: "🎯", category: "ground" },
  tank_destroyer: { label: "Tank Destroyer", icon: "💥", category: "ground" },
  fighter: { label: "Fighter", icon: "✈️", category: "air" },
  strike_aircraft: { label: "Strike Aircraft", icon: "🚀", category: "air" },
  attacker: { label: "Attacker", icon: "💣", category: "air" },
  bomber: { label: "Bomber", icon: "🛫", category: "air" },
  helicopter: { label: "Attack Helicopter", icon: "🚁", category: "heli" },
};

/**
 * Prepends basePath when deployed on GitHub Pages or custom base path.
 */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

/**
 * Returns primary CDN image URL with fallback logic.
 */
export function getVehicleImageUrl(vehicleId: string): string {
  return `https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${vehicleId}.png`;
}

/**
 * Returns placeholder dot-matrix silhouette SVG path based on vehicle class.
 */
export function getVehiclePlaceholderUrl(vehicleClass: VehicleClass): string {
  if (vehicleClass === "fighter" || vehicleClass === "strike_aircraft" || vehicleClass === "attacker" || vehicleClass === "bomber") {
    return withBasePath("/placeholders/aircraft.svg");
  }
  if (vehicleClass === "helicopter") {
    return withBasePath("/placeholders/helicopter.svg");
  }
  if (vehicleClass === "spaa") {
    return withBasePath("/placeholders/spaa.svg");
  }
  return withBasePath("/placeholders/tank.svg");
}
