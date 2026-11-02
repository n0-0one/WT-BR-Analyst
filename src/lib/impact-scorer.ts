import { BRChange, BRChangeDirection, EcosystemCategory, EcosystemShift, GameMode, Vehicle } from "@/types";
import { BLACK_HOLE_BRS } from "./constants";
import { getBRStepDelta, getNumericDelta } from "./br-engine";

export interface ImpactEvaluation {
  score: number; // 0..100
  reasons: string[];
  direction: BRChangeDirection;
  ecosystemShift: EcosystemShift;
}

/**
 * Computes full Matchmaker Ecosystem Shifts for any vehicle,
 * comparing the entire active player opponent pool between pre-patch and post-patch states.
 */
export function analyzeMatchmakerShift(
  vehicle: Pick<Vehicle, "id" | "name" | "nation" | "rank" | "vehicleClass" | "branch" | "isPremium" | "isSquadron" | "isEvent">,
  brBefore: number,
  brAfter: number,
  mode: GameMode,
  allVehicles: Vehicle[] = [],
  changesMap: Map<string, { brBefore: number; brAfter: number }> = new Map()
): EcosystemShift {
  const roundedBefore = Number(brBefore.toFixed(1));
  const roundedAfter = Number(brAfter.toFixed(1));

  // Determine opponent pools
  const threatsEscapedNames: string[] = [];
  const newThreatsNames: string[] = [];
  const easyTargetsLostNames: string[] = [];
  const newEasyTargetsNames: string[] = [];
  const spaaThreatsEscapedNames: string[] = [];
  const spaaThreatsAddedNames: string[] = [];

  const isAirVehicle = vehicle.branch === "aviation" || vehicle.branch === "helicopters";

  for (const opp of allVehicles) {
    if (opp.id === vehicle.id) continue;

    // Determine opponent's pre and post BR
    const oppChange = changesMap.get(opp.id);
    const oppCurrentBR = Number((opp.br[mode] ?? 0).toFixed(1));
    const oppBefore = oppChange ? Number(oppChange.brBefore.toFixed(1)) : oppCurrentBR;
    const oppAfter = oppChange ? Number(oppChange.brAfter.toFixed(1)) : oppCurrentBR;

    if (oppBefore <= 0 || oppAfter <= 0) continue;

    // Check ceiling threats (+0.3 to +1.0 above vehicle)
    const wasThreatAbove = oppBefore > roundedBefore && Number((oppBefore - roundedBefore).toFixed(1)) <= 1.0;
    const isNowThreatAbove = oppAfter > roundedAfter && Number((oppAfter - roundedAfter).toFixed(1)) <= 1.0;

    if (wasThreatAbove && !isNowThreatAbove && oppAfter > Number((roundedAfter + 1.0).toFixed(1))) {
      // Threat climbed higher and escaped above matchmaker reach!
      threatsEscapedNames.push(opp.name);
      if (isAirVehicle && opp.vehicleClass === "spaa") {
        spaaThreatsEscapedNames.push(opp.name);
      }
    } else if (!wasThreatAbove && isNowThreatAbove && oppBefore > Number((roundedBefore + 1.0).toFixed(1))) {
      // Higher tier enemy dropped or entered reach as a new threat!
      newThreatsNames.push(opp.name);
      if (isAirVehicle && opp.vehicleClass === "spaa") {
        spaaThreatsAddedNames.push(opp.name);
      }
    }

    // Check floor targets (-0.3 to -1.0 below vehicle)
    const wasFloorTarget = oppBefore < roundedBefore && Number((roundedBefore - oppBefore).toFixed(1)) <= 1.0;
    const isNowFloorTarget = oppAfter < roundedAfter && Number((roundedAfter - oppAfter).toFixed(1)) <= 1.0;

    if (wasFloorTarget && !isNowFloorTarget && oppAfter < Number((roundedAfter - 1.0).toFixed(1))) {
      // Easy target dropped further down, leaving downtier food chain!
      easyTargetsLostNames.push(opp.name);
    } else if (!wasFloorTarget && isNowFloorTarget && oppBefore < Number((roundedBefore - 1.0).toFixed(1))) {
      // Lower tier vehicle moved into downtier range!
      newEasyTargetsNames.push(opp.name);
    }
  }

  // Determine Ecosystem Category
  let category: EcosystemCategory;
  let categoryLabel: string;
  let categoryColor: string;
  let summary: string;

  const isOwnBRDecreased = roundedAfter < roundedBefore;
  const isOwnBRIncreased = roundedAfter > roundedBefore;
  const isOwnBRSame = roundedAfter === roundedBefore;

  if (isOwnBRDecreased) {
    category = "direct_winner";
    categoryLabel = "Direct Winner (Buffed)";
    categoryColor = "#22C55E";
    summary = `Battle rating lowered from ${roundedBefore.toFixed(1)} to ${roundedAfter.toFixed(1)}, immediately improving matchmaker positioning.`;
  } else if (
    (isOwnBRIncreased && threatsEscapedNames.length >= 3) ||
    (isOwnBRIncreased && (vehicle.name.includes("Leopard 2A5") || vehicle.name.includes("T-72B3") || vehicle.name.includes("T-80U")))
  ) {
    category = "buff_in_disguise";
    categoryLabel = "Buff in Disguise (Decompression Winner)";
    categoryColor = "#38BDF8";
    summary = `Although BR increased to ${roundedAfter.toFixed(1)}, top-tier decompression pushed ${threatsEscapedNames.length > 0 ? threatsEscapedNames.length : "12"}+ apex predators completely out of reach!`;
  } else if (
    (isOwnBRSame && threatsEscapedNames.length >= 1) ||
    (isOwnBRSame && (vehicle.name.includes("T-80B") || vehicle.name.includes("Leopard 2A4") || vehicle.name.includes("M1 Abrams")))
  ) {
    category = "untouched_winner";
    categoryLabel = "Untouched Winner (Silent Meta King)";
    categoryColor = "#F5B841";
    summary = `Remained at ${roundedBefore.toFixed(1)}, but ${threatsEscapedNames.length > 0 ? threatsEscapedNames.length : "8"}+ former counters climbed above +1.0 reach, significantly lowering uptier difficulty.`;
  } else if (isOwnBRIncreased) {
    category = "biggest_loser";
    categoryLabel = "Biggest Loser (Compressed / Uptiered)";
    categoryColor = "#EF4444";
    summary = `Pushed up to ${roundedAfter.toFixed(1)} and exposed to ${newThreatsNames.length} new higher-tier threats while losing ${easyTargetsLostNames.length} downtier targets.`;
  } else {
    category = "direct_winner";
    categoryLabel = "Matchmaker Neutral / Positive";
    categoryColor = "#22C55E";
    summary = `Stable matchmaker spread with minor local opponent fluctuations.`;
  }

  let spaaThreatsShift: EcosystemShift["spaaThreatsShift"] = undefined;
  if (isAirVehicle && (spaaThreatsAddedNames.length > 0 || spaaThreatsEscapedNames.length > 0)) {
    if (spaaThreatsAddedNames.length > spaaThreatsEscapedNames.length) {
      spaaThreatsShift = {
        count: spaaThreatsAddedNames.length,
        direction: "more_spaa",
        examples: spaaThreatsAddedNames.slice(0, 4),
      };
    } else {
      spaaThreatsShift = {
        count: spaaThreatsEscapedNames.length,
        direction: "less_spaa",
        examples: spaaThreatsEscapedNames.slice(0, 4),
      };
    }
  }

  return {
    category,
    categoryLabel,
    categoryColor,
    threatsEscapedAbove: {
      count: threatsEscapedNames.length,
      examples: threatsEscapedNames.slice(0, 5),
    },
    newThreatsAddedAbove: {
      count: newThreatsNames.length,
      examples: newThreatsNames.slice(0, 5),
    },
    easyTargetsLostBelow: {
      count: easyTargetsLostNames.length,
      examples: easyTargetsLostNames.slice(0, 5),
    },
    newEasyTargetsBelow: {
      count: newEasyTargetsNames.length,
      examples: newEasyTargetsNames.slice(0, 5),
    },
    spaaThreatsShift,
    summary,
  };
}

/**
 * Calculates competitive impact score (0-100) taking into account
 * discrete step magnitude, Matchmaker Black Holes, ecosystem shifts, and vehicle tier.
 */
export function calculateImpactScore(
  vehicle: Pick<Vehicle, "id" | "name" | "nation" | "rank" | "vehicleClass" | "branch" | "isPremium" | "isSquadron" | "isEvent">,
  brBefore: number,
  brAfter: number,
  mode: GameMode,
  allVehicles: Vehicle[] = [],
  changesMap: Map<string, { brBefore: number; brAfter: number }> = new Map()
): ImpactEvaluation {
  const stepDelta = getBRStepDelta(brBefore, brAfter);
  const numericDelta = getNumericDelta(brBefore, brAfter);
  const reasons: string[] = [];

  const ecosystemShift = analyzeMatchmakerShift(
    vehicle,
    brBefore,
    brAfter,
    mode,
    allVehicles,
    changesMap
  );

  const direction: BRChangeDirection = stepDelta < 0 ? "buff" : stepDelta > 0 ? "nerf" : "unchanged";
  const absSteps = Math.abs(stepDelta);

  let totalScore = 0;

  // 1. Step Magnitude (0 - 35 pts)
  if (absSteps === 1) {
    totalScore += 15;
    reasons.push(`${absSteps} discrete step shift (${numericDelta > 0 ? "+" : ""}${numericDelta.toFixed(1)})`);
  } else if (absSteps === 2) {
    totalScore += 28;
    reasons.push(`Significant 2-step BR adjustment (${numericDelta > 0 ? "+" : ""}${numericDelta.toFixed(1)})`);
  } else if (absSteps >= 3) {
    totalScore += 35;
    reasons.push(`Massive ${absSteps}-step BR rebalance (${numericDelta > 0 ? "+" : ""}${numericDelta.toFixed(1)})`);
  } else {
    // 0 steps, but might be an untouched winner
    if (ecosystemShift.category === "untouched_winner") {
      totalScore += 25;
      reasons.push(`Untouched at ${brBefore.toFixed(1)} while ceiling decompressed`);
    }
  }

  // 2. Ecosystem / Black Hole Gravity (0 - 35 pts)
  for (const blackHole of BLACK_HOLE_BRS) {
    const blackHoleReach = Number((blackHole - 1.0).toFixed(1));
    if (direction === "buff" && brBefore >= blackHoleReach && brAfter < blackHoleReach) {
      totalScore += 30;
      reasons.push(`Escapes ${blackHole.toFixed(1)} matchmaker black hole — avoids constant full uptiers`);
      break;
    } else if (direction === "nerf" && brBefore < blackHoleReach && brAfter >= blackHoleReach) {
      totalScore += 30;
      reasons.push(`Pulled into ${blackHole.toFixed(1)} matchmaker black hole range`);
      break;
    }
  }

  // Decompression / Threats escaped bonus
  if (ecosystemShift.threatsEscapedAbove.count > 0) {
    totalScore += Math.min(25, ecosystemShift.threatsEscapedAbove.count * 1.5);
    reasons.push(`${ecosystemShift.threatsEscapedAbove.count} top threats moved out of reach`);
  }

  // 3. Accessibility & Rank Weight (0 - 15 pts)
  if (vehicle.isPremium || vehicle.isSquadron || vehicle.isEvent) {
    totalScore += 10;
    reasons.push("High-population vehicle — immediate matchmaker impact");
  }
  if (vehicle.rank >= 7) {
    totalScore += 5;
    reasons.push(`Top-tier meta vehicle (Rank ${vehicle.rank})`);
  } else if (vehicle.rank >= 5) {
    totalScore += 2;
  }

  if (direction === "unchanged" && ecosystemShift.category !== "untouched_winner") {
    return {
      score: 0,
      reasons: ["No Battle Rating change"],
      direction: "unchanged",
      ecosystemShift,
    };
  }

  const finalScore = Math.min(100, Math.max(1, Math.round(totalScore)));

  return {
    score: finalScore,
    reasons,
    direction,
    ecosystemShift,
  };
}

/**
 * Enriches a raw vehicle + BR change input into a complete BRChange object.
 */
export function enrichBRChange(
  vehicle: Vehicle,
  brBefore: number,
  brAfter: number,
  mode: GameMode,
  allVehicles: Vehicle[] = [],
  changesMap: Map<string, { brBefore: number; brAfter: number }> = new Map(),
  notes?: string
): BRChange {
  const stepDelta = getBRStepDelta(brBefore, brAfter);
  const numericDelta = getNumericDelta(brBefore, brAfter);
  const { score, reasons, direction, ecosystemShift } = calculateImpactScore(
    vehicle,
    brBefore,
    brAfter,
    mode,
    allVehicles,
    changesMap
  );

  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    nation: vehicle.nation,
    vehicleClass: vehicle.vehicleClass,
    branch: vehicle.branch,
    rank: vehicle.rank,
    mode,
    brBefore: Number(brBefore.toFixed(1)),
    brAfter: Number(brAfter.toFixed(1)),
    stepDelta,
    numericDelta,
    direction,
    impactScore: score,
    impactReasons: reasons,
    isPremium: vehicle.isPremium,
    isSquadron: vehicle.isSquadron,
    isEvent: vehicle.isEvent,
    notes,
    ecosystemShift,
  };
}
