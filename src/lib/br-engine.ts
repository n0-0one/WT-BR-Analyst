/**
 * Discrete Battle Rating Step Math Engine
 * In War Thunder, BRs follow discrete steps (economicRank 0 to 42):
 * 1.0, 1.3, 1.7, 2.0, ..., 13.7, 14.0, 14.3, 14.7, 15.0.
 */

export const WT_BR_TABLE: readonly number[] = [
  1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0,
  4.3, 4.7, 5.0, 5.3, 5.7, 6.0, 6.3, 6.7, 7.0, 7.3,
  7.7, 8.0, 8.3, 8.7, 9.0, 9.3, 9.7, 10.0, 10.3, 10.7,
  11.0, 11.3, 11.7, 12.0, 12.3, 12.7, 13.0, 13.3, 13.7, 14.0, 14.3, 14.7, 15.0
];

export const WT_BR_VALUES: readonly number[] = WT_BR_TABLE;

/**
 * Maps game internal economicRank (0..42) to exact War Thunder Battle Rating.
 */
export function economicRankToBR(rank: number | undefined): number {
  if (rank === undefined || rank < 0) return 1.0;
  return WT_BR_TABLE[Math.min(rank, WT_BR_TABLE.length - 1)] ?? 1.0;
}

/**
 * Finds the closest discrete economicRank for a given decimal BR.
 */
export function brToEconomicRank(br: number): number {
  const rounded = Number(br.toFixed(1));
  const exactIndex = WT_BR_VALUES.indexOf(rounded);
  if (exactIndex !== -1) return exactIndex;

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
 */
export function getBRStepDelta(brBefore: number, brAfter: number): number {
  const indexBefore = brToEconomicRank(brBefore);
  const indexAfter = brToEconomicRank(brAfter);
  return indexAfter - indexBefore;
}

/**
 * Returns raw numeric delta rounded to 1 decimal place.
 */
export function getNumericDelta(brBefore: number, brAfter: number): number {
  return Number((brAfter - brBefore).toFixed(1));
}

/**
 * Checks if vehicle is within standard War Thunder 1.0 matchmaker spread.
 */
export function isVehicleInSpread(vehicleBR: number, targetBR: number): boolean {
  const roundedVehicle = Number(vehicleBR.toFixed(1));
  const roundedTarget = Number(targetBR.toFixed(1));
  return roundedVehicle <= roundedTarget && Number((roundedTarget - roundedVehicle).toFixed(1)) <= 1.0;
}

/**
 * Formats decimal BR (e.g. 10.3, 11.7).
 */
export function formatBR(br: number): string {
  return br.toFixed(1);
}

/**
 * Formats split Air and Ground RB ratings (e.g. "12.7 (Air) / 11.7 (Gnd)").
 */
export function formatSplitBR(airBR: number, groundBR?: number): string {
  if (groundBR !== undefined && Number(groundBR.toFixed(1)) !== Number(airBR.toFixed(1))) {
    return `${airBR.toFixed(1)} Air / ${groundBR.toFixed(1)} Gnd`;
  }
  return airBR.toFixed(1);
}

/**
 * Formats step count badge (e.g. "+1 STEP", "-2 STEPS").
 */
export function formatStepBadge(stepDelta: number): string {
  if (stepDelta === 0) return "UNCHANGED";
  const abs = Math.abs(stepDelta);
  const sign = stepDelta > 0 ? "+" : "-";
  return `${sign}${abs} ${abs === 1 ? "STEP" : "STEPS"}`;
}

/**
 * Returns the matchmaker range [min, max] that a lineup or vehicle sees (±1.0 BR).
 */
export function getMatchmakerRange(targetBR: number): { downtierMin: number; target: number; uptierMax: number } {
  const targetRank = brToEconomicRank(targetBR);
  const minRank = Math.max(0, targetRank - 3);
  const maxRank = Math.min(WT_BR_VALUES.length - 1, targetRank + 3);

  return {
    downtierMin: WT_BR_VALUES[minRank]!,
    target: Number(targetBR.toFixed(1)),
    uptierMax: WT_BR_VALUES[maxRank]!,
  };
}
