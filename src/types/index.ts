export type GameMode = "ab" | "rb" | "sb" | "rbGround";

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
  | "helicopter"
  | "bluewater"
  | "coastal";

export type VehicleBranch = "aviation" | "army" | "helicopters" | "fleet";

export type ImageFolder = "tanks" | "aircrafts" | "ships";

export interface Vehicle {
  id: string;
  name: string;
  nation: Nation;
  rank: number;
  br: {
    ab: number;
    rb: number;
    sb: number;
    rbGround?: number; // Ground RB specific BR for aircraft
  };
  vehicleClass: VehicleClass;
  branch: VehicleBranch;
  imageFolder: ImageFolder;
  imageId: string;
  isPremium?: boolean;
  isSquadron?: boolean;
  isEvent?: boolean;
  imageUrl?: string;
  wikiUrl?: string;
}

export type BRChangeDirection = "buff" | "nerf" | "unchanged";

export type EcosystemCategory =
  | "direct_winner"
  | "buff_in_disguise"
  | "untouched_winner"
  | "biggest_loser";

export interface PerformanceTelemetry {
  winRateBefore: number; // e.g. 49.1
  winRateAfter: number; // e.g. 57.4
  winRateDelta: number; // e.g. +8.3
  kdBefore: number; // e.g. 1.15
  kdAfter: number; // e.g. 1.72
  kdDelta: number; // e.g. +0.57
  playRateDelta: number; // e.g. +38%
  telemetrySource: string; // "StatShark / Community Post-Patch Telemetry"
}

export type MetaWallType =
  | "fox3_arh_wall"
  | "sam_radar_belt"
  | "ground_decompression_13_3"
  | "untouched_anchor"
  | "compression_victim";

export interface MetaWallShift {
  wallType: MetaWallType;
  title: string;
  description: string;
}

export interface CommunityIntelligence {
  consensusVerdict: string;
  communityTags: string[]; // ["📈 StatShark Telemetry", "🎥 YouTube Meta Consensus", "💬 r/Warthunder & Forum"]
  threatEscapedCount: number;
  threatAddedCount: number;
  preyLostCount: number;
  preyGainedCount: number;
}

export interface EcosystemThreatDetail {
  count: number;
  examples: string[];
}

export interface EcosystemShift {
  category: EcosystemCategory;
  categoryLabel: string;
  categoryColor: string;
  threatsEscapedAbove: EcosystemThreatDetail;
  newThreatsAddedAbove: EcosystemThreatDetail;
  easyTargetsLostBelow: EcosystemThreatDetail;
  newEasyTargetsBelow: EcosystemThreatDetail;
  spaaThreatsShift?: {
    count: number;
    direction: "more_spaa" | "less_spaa" | "neutral";
    examples: string[];
  };
  summary: string;
}

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
  rbGroundBefore?: number;
  rbGroundAfter?: number;
  imageFolder?: ImageFolder;
  imageId?: string;
  ecosystemShift?: EcosystemShift;
  telemetry?: PerformanceTelemetry;
  metaWall?: MetaWallShift;
  community?: CommunityIntelligence;
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
  survivalReason: string;
  nerfedVehicles: BRChange[];
  droppedVehicles: Vehicle[];
  newReinforcements: Vehicle[];
  survivingVehicles: Vehicle[];
  recommendedReplacements: Vehicle[];
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

export interface LineupSlot {
  slotRole: string;
  roleLabel: string;
  vehicle: Vehicle;
}

export interface OptimalLineup {
  nation: Nation;
  mode: GameMode;
  targetBR: number;
  effectiveBR: number;
  hasCASGroundBRSplit: boolean;
  score: number;
  synergyScore: number;
  groundVehicles: Vehicle[];
  casVehicles: Vehicle[];
  slots: LineupSlot[];
  matchmakerRange: { min: number; max: number };
  roleCompleteness: LineupRoleCheck;
  anchorDensity: number;
  patchMomentum: number;
  strengths: string[];
  summary: string;
}
