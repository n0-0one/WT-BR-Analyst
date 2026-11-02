export type GameMode = "ab" | "rb" | "sb";

export type Nation =
  | "usa"
  | "germany"
  | "ussr"
  | "britain"
  | "japan"
  | "china"
  | "italy"
  | "france"
  | "sweden"
  | "israel";

export type VehicleClass =
  | "medium_tank"
  | "heavy_tank"
  | "light_tank"
  | "spaa"
  | "tank_destroyer"
  | "fighter"
  | "strike_aircraft"
  | "attacker"
  | "bomber"
  | "helicopter";

export type VehicleBranch = "aviation" | "army" | "helicopters" | "fleet";

export interface Vehicle {
  id: string;
  name: string;
  nation: Nation;
  rank: number;
  br: Record<GameMode, number>;
  vehicleClass: VehicleClass;
  branch: VehicleBranch;
  isPremium?: boolean;
  isSquadron?: boolean;
  isEvent?: boolean;
  imageUrl?: string;
  wikiUrl?: string;
}

export type BRChangeDirection = "buff" | "nerf" | "unchanged";

export interface BRChange {
  vehicleId: string;
  vehicleName: string;
  nation: Nation;
  vehicleClass: VehicleClass;
  branch: VehicleBranch;
  rank: number;
  mode: GameMode;
  brBefore: number;
  brAfter: number;
  stepDelta: number; // e.g. +1, -1, +2, -2
  numericDelta: number; // e.g. +0.3, -0.4
  direction: BRChangeDirection;
  impactScore: number; // 0 - 100
  impactReasons: string[];
  isPremium?: boolean;
  isSquadron?: boolean;
  isEvent?: boolean;
  notes?: string;
}

export interface PatchMetadata {
  id: string;
  title: string;
  date: string;
  forumUrl: string;
  sheetUrl?: string;
  verifiedVehiclesCount: number;
  totalChangesCount: number;
  buffsCount: number;
  nerfsCount: number;
  syncedAt: string;
}

export interface PatchDataset {
  metadata: PatchMetadata;
  changes: BRChange[];
}

export interface LineupEvaluation {
  nation: Nation;
  mode: GameMode;
  targetBR: number;
  status: "survives" | "weakened" | "shifted" | "broken";
  statusMessage: string;
  droppedVehicles: Vehicle[];
  newReinforcements: Vehicle[];
  survivingVehicles: Vehicle[];
  allLineupVehicles: Vehicle[];
  simulatedMaxBR?: number;
  simulatedUptierMax?: number;
  simulatedExposedVehicles?: Vehicle[];
}

export interface LineupRoleCheck {
  hasMBT: boolean;
  hasLightScout: boolean;
  hasSPAA: boolean;
  hasTD: boolean;
  hasCAS: boolean;
}

export interface OptimalLineup {
  nation: Nation;
  mode: GameMode;
  targetBR: number;
  score: number;
  groundVehicles: Vehicle[];
  casVehicles: Vehicle[];
  roleCompleteness: LineupRoleCheck;
  anchorDensity: number;
  patchMomentum: number;
  strengths: string[];
}
