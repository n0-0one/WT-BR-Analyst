import { GameMode, Nation, VehicleClass, VehicleBranch } from "@/types";

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

export const BRANCHES: { id: VehicleBranch; name: string; icon: string }[] = [
  { id: "army", name: "Army (Ground)", icon: "🛡️" },
  { id: "aviation", name: "Aviation", icon: "✈️" },
  { id: "helicopters", name: "Helicopters", icon: "🚁" },
  { id: "fleet", name: "Fleet (Naval)", icon: "⚓" },
];

export const GAME_MODES: { id: GameMode; name: string; short: string; description: string }[] = [
  { id: "rb", name: "Realistic Battles", short: "RB", description: "Standard tactical meta with realistic flight & tank physics" },
  { id: "ab", name: "Arcade Battles", short: "AB", description: "Fast-paced action with boosted engine power & lead markers" },
  { id: "sb", name: "Simulator Battles", short: "SB", description: "Strict cockpit/commander view with manual aircraft control" },
];

export const BLACK_HOLE_BRS: readonly number[] = [3.7, 5.7, 6.7, 8.7, 10.3, 11.7, 12.7, 13.0, 14.0] as const;

export const VEHICLE_CLASS_LABELS: Record<
  VehicleClass,
  { label: string; icon: string; category: "ground" | "air" | "heli" | "naval" }
> = {
  medium_tank: { label: "Medium Tank / MBT", icon: "🛡️", category: "ground" },
  heavy_tank: { label: "Heavy Tank", icon: "🏰", category: "ground" },
  light_tank: { label: "Light Tank / Scout", icon: "⚡", category: "ground" },
  spaa: { label: "SPAA / SAM", icon: "🎯", category: "ground" },
  tank_destroyer: { label: "Tank Destroyer", icon: "💥", category: "ground" },
  fighter: { label: "Fighter / Interceptor", icon: "✈️", category: "air" },
  strike_aircraft: { label: "Strike Aircraft", icon: "🚀", category: "air" },
  attacker: { label: "Attacker", icon: "💣", category: "air" },
  bomber: { label: "Bomber", icon: "🛫", category: "air" },
  helicopter: { label: "Attack Helicopter", icon: "🚁", category: "heli" },
  bluewater: { label: "Bluewater Ship", icon: "🚢", category: "naval" },
  coastal: { label: "Coastal Vessel", icon: "🚤", category: "naval" },
};

/**
 * Converts integer rank to authentic War Thunder Roman Numeral.
 */
export function toRomanNumeral(rank: number): string {
  const romanMap: Record<number, string> = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
  };
  return romanMap[rank] ?? `${rank}`;
}

/**
 * Prepends basePath when deployed on GitHub Pages.
 */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

/**
 * Returns primary official Encyclopedia/Wiki CDN URL.
 */
export function getVehicleImageUrl(vehicleId: string): string {
  const cleanId = vehicleId.toLowerCase();
  return `https://static.encyclopedia.warthunder.com/images/${cleanId}.png`;
}

/**
 * Returns secondary mirror CDN URL.
 */
export function getVehicleSecondaryImageUrl(vehicleId: string): string {
  const cleanId = vehicleId.toLowerCase();
  return `https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${cleanId}.png`;
}

/**
 * Returns placeholder silhouette SVG based on vehicle class.
 */
export function getVehiclePlaceholderUrl(vehicleClass: VehicleClass): string {
  if (
    vehicleClass === "fighter" ||
    vehicleClass === "strike_aircraft" ||
    vehicleClass === "attacker" ||
    vehicleClass === "bomber"
  ) {
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
