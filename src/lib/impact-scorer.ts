import { BRChange, BRChangeDirection, GameMode, Nation, Vehicle } from "@/types";
import { BLACK_HOLE_BRS } from "./constants";
import { getBRStepDelta, getNumericDelta } from "./br-engine";

export interface ImpactEvaluation {
  score: number; // 0..100
  reasons: string[];
  direction: BRChangeDirection;
}

/**
 * Calculates the competitive impact score (0-100) for a War Thunder BR change,
 * taking into account discrete step magnitude, Matchmaker Black Holes,
 * lineup anchor synergies, and rank/accessibility factors.
 */
export function calculateImpactScore(
  vehicle: Pick<Vehicle, "id" | "name" | "nation" | "rank" | "isPremium" | "isSquadron" | "isEvent">,
  brBefore: number,
  brAfter: number,
  mode: GameMode,
  allVehicles: Vehicle[] = []
): ImpactEvaluation {
  const stepDelta = getBRStepDelta(brBefore, brAfter);
  const numericDelta = getNumericDelta(brBefore, brAfter);
  const reasons: string[] = [];

  if (stepDelta === 0) {
    return {
      score: 0,
      reasons: ["Battle rating remained unchanged."],
      direction: "unchanged",
    };
  }

  const direction: BRChangeDirection = stepDelta < 0 ? "buff" : "nerf";
  const absSteps = Math.abs(stepDelta);
  let totalScore = 0;

  // 1. BR Step Magnitude (0 - 35 pts)
  let magnitudePts = 0;
  if (absSteps === 1) {
    magnitudePts = 15;
    reasons.push(`${absSteps} discrete BR step shift (${numericDelta > 0 ? "+" : ""}${numericDelta.toFixed(1)})`);
  } else if (absSteps === 2) {
    magnitudePts = 28;
    reasons.push(`Significant 2-step BR adjustment (${numericDelta > 0 ? "+" : ""}${numericDelta.toFixed(1)})`);
  } else {
    magnitudePts = 35;
    reasons.push(`Massive ${absSteps}-step BR rebalance (${numericDelta > 0 ? "+" : ""}${numericDelta.toFixed(1)})`);
  }
  totalScore += magnitudePts;

  // 2. Matchmaker Black Hole Gravity (0 - 30 pts)
  let blackHolePts = 0;
  for (const blackHole of BLACK_HOLE_BRS) {
    const blackHoleReach = Number((blackHole - 1.0).toFixed(1));

    if (direction === "buff") {
      // Escaping a black hole: was facing it (>= blackHole - 1.0), now lower than it (< blackHole - 1.0)
      if (brBefore >= blackHoleReach && brAfter < blackHoleReach) {
        blackHolePts = 30;
        reasons.push(`Escapes ${blackHole.toFixed(1)} matchmaker black hole — avoids constant full uptiers`);
        break;
      }
    } else {
      // Pulled into a black hole: was safe (< blackHole - 1.0), now pulled into reach (>= blackHole - 1.0)
      if (brBefore < blackHoleReach && brAfter >= blackHoleReach) {
        blackHolePts = 30;
        reasons.push(`Pulled into ${blackHole.toFixed(1)} matchmaker black hole range`);
        break;
      }
    }
  }
  totalScore += blackHolePts;

  // 3. Lineup Anchor Synergy (0 - 20 pts)
  let anchorPts = 0;
  if (allVehicles.length > 0) {
    const sameNationVehicles = allVehicles.filter(
      (v) => v.nation === vehicle.nation && v.id !== vehicle.id
    );

    const anchorBeforeCount = sameNationVehicles.filter(
      (v) => Number((v.br[mode] ?? 0).toFixed(1)) === Number(brBefore.toFixed(1))
    ).length;

    const anchorAfterCount = sameNationVehicles.filter(
      (v) => Number((v.br[mode] ?? 0).toFixed(1)) === Number(brAfter.toFixed(1))
    ).length;

    if (direction === "nerf" && anchorBeforeCount >= 2) {
      anchorPts = 20;
      reasons.push(`Breaks away from core ${brBefore.toFixed(1)} lineup anchor (${anchorBeforeCount + 1} vehicles)`);
    } else if (direction === "buff" && anchorAfterCount >= 2) {
      anchorPts = 20;
      reasons.push(`Reinforces ${brAfter.toFixed(1)} lineup with a new meta option (${anchorAfterCount} existing vehicles)`);
    } else if (anchorBeforeCount >= 1 || anchorAfterCount >= 1) {
      anchorPts = 10;
      if (direction === "buff") {
        reasons.push(`Aligns with established ${brAfter.toFixed(1)} vehicles`);
      } else {
        reasons.push(`Separates from ${brBefore.toFixed(1)} squadron/lineup partners`);
      }
    }
  } else {
    // Fallback if full vehicle DB is not passed
    anchorPts = 10;
  }
  totalScore += anchorPts;

  // 4. Rank & Accessibility Weight (0 - 15 pts)
  let accessibilityPts = 0;
  const isSpecial = vehicle.isPremium || vehicle.isSquadron || vehicle.isEvent;
  if (isSpecial) {
    accessibilityPts += 10;
    reasons.push("High-population vehicle — immediate matchmaker impact");
  }

  if (vehicle.rank >= 6) {
    accessibilityPts += 5;
    reasons.push(`High/Top-tier meta vehicle (Rank ${vehicle.rank})`);
  } else if (vehicle.rank >= 4) {
    accessibilityPts += 2;
  }
  totalScore += accessibilityPts;

  // Cap score at 100
  const finalScore = Math.min(100, Math.max(1, totalScore));

  return {
    score: finalScore,
    reasons,
    direction,
  };
}

/**
 * Convenience helper to convert raw vehicle + BR change inputs into a fully enriched BRChange object.
 */
export function enrichBRChange(
  vehicle: Vehicle,
  brBefore: number,
  brAfter: number,
  mode: GameMode,
  allVehicles: Vehicle[] = []
): BRChange {
  const stepDelta = getBRStepDelta(brBefore, brAfter);
  const numericDelta = getNumericDelta(brBefore, brAfter);
  const { score, reasons, direction } = calculateImpactScore(
    vehicle,
    brBefore,
    brAfter,
    mode,
    allVehicles
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
  };
}
