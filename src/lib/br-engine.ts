/**
 * Discrete Battle Rating Step Math Engine
 * In War Thunder, BRs follow 40 discrete steps (economicRank 0 to 39):
 * 1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, ..., 13.7, 14.0.
 */

// Generate the 40 discrete standard War Thunder BR values exactly
export const WT_BR_VALUES: readonly number[] = (() => {
  const values: number[] = [];
  for (let rank = 0; rank <= 39; rank++) {
    const whole = Math.floor(rank / 3) + 1;
    const remainder = rank % 3;
    let br: number;
    if (remainder === 0) {
      br = whole;
    } else if (remainder === 1) {
      br = whole + 0.3;
    } else {
      br = whole + 0.7;
    }
    values.push(Number(br.toFixed(1)));
  }
  return Object.freeze(values);
})();

/**
 * Maps game internal economicRank (0..39) to exact War Thunder Battle Rating.
 */
export function economicRankToBR(rank: number): number {
  if (rank < 0) return WT_BR_VALUES[0] ?? 1.0;
  if (rank >= WT_BR_VALUES.length) return WT_BR_VALUES[WT_BR_VALUES.length - 1] ?? 14.0;
  return WT_BR_VALUES[rank] ?? 1.0;
}

/**
 * Finds the closest discrete economicRank for a given decimal BR.
 */
export function brToEconomicRank(br: number): number {
  const rounded = Number(br.toFixed(1));
  const exactIndex = WT_BR_VALUES.indexOf(rounded);
  if (exactIndex !== -1) return exactIndex;

  // Fallback to closest match
  let closestIndex = 0;
  let minDiff = Math.abs(WT_BR_VALUES[0]! - rounded);
  for (let i = 1; i < WT_BR_VALUES.length; i++) {
    const diff = Math.abs(WT_BR_VALUES[i]! - rounded);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

/**
 * Calculates step delta using index differences in WT_BR_VALUES.
 * Example:
 * 7.0 -> 7.3 = +1
 * 7.3 -> 7.7 = +1
 * 7.0 -> 7.7 = +2
 * 10.3 -> 10.0 = -1
 */
export function getBRStepDelta(brBefore: number, brAfter: number): number {
  const indexBefore = brToEconomicRank(brBefore);
  const indexAfter = brToEconomicRank(brAfter);
  return indexAfter - indexBefore;
}

/**
 * Returns raw numeric delta rounded to 1 decimal place (e.g. +0.3, -0.4).
 */
export function getNumericDelta(brBefore: number, brAfter: number): number {
  return Number((brAfter - brBefore).toFixed(1));
}

/**
 * Checks if a vehicle is within standard War Thunder 1.0 BR matchmaker spread:
 * vehicleBR <= targetBR && (targetBR - vehicleBR) <= 1.0
 */
export function isVehicleInSpread(vehicleBR: number, targetBR: number): boolean {
  const roundedVehicle = Number(vehicleBR.toFixed(1));
  const roundedTarget = Number(targetBR.toFixed(1));
  return roundedVehicle <= roundedTarget && Number((roundedTarget - roundedVehicle).toFixed(1)) <= 1.0;
}

/**
 * Formats BR to clean standard string, e.g. 10.0, 7.3, 11.7
 */
export function formatBR(br: number): string {
  return br.toFixed(1);
}

/**
 * Formats delta badge, e.g. "+1 STEP", "-2 STEPS", "NO CHANGE"
 */
export function formatStepBadge(stepDelta: number): string {
  if (stepDelta === 0) return "UNCHANGED";
  const abs = Math.abs(stepDelta);
  const sign = stepDelta > 0 ? "+" : "-";
  return `${sign}${abs} ${abs === 1 ? "STEP" : "STEPS"}`;
}

/**
 * Returns the matchmaker range [min, max] a lineup at targetBR can see (±1.0 BR).
 */
export function getMatchmakerRange(targetBR: number): { downtierMin: number; target: number; uptierMax: number } {
  const targetRank = brToEconomicRank(targetBR);
  // In War Thunder, ±1.0 BR is exactly 3 discrete steps (e.g. 10.3 down to 9.3 = 3 steps, up to 11.3 = 3 steps)
  const minRank = Math.max(0, targetRank - 3);
  const maxRank = Math.min(WT_BR_VALUES.length - 1, targetRank + 3);

  return {
    downtierMin: WT_BR_VALUES[minRank]!,
    target: Number(targetBR.toFixed(1)),
    uptierMax: WT_BR_VALUES[maxRank]!,
  };
}
