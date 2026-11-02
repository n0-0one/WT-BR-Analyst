import { describe, expect, it } from "vitest";
import {
  brToEconomicRank,
  economicRankToBR,
  formatBR,
  formatStepBadge,
  getBRStepDelta,
  getMatchmakerRange,
  getNumericDelta,
  isVehicleInSpread,
  WT_BR_VALUES,
} from "../src/lib/br-engine";

describe("Discrete Battle Rating Engine (br-engine)", () => {
  it("should have exactly 43 discrete steps from 1.0 to 15.0", () => {
    expect(WT_BR_VALUES).toHaveLength(43);
    expect(WT_BR_VALUES[0]).toBe(1.0);
    expect(WT_BR_VALUES[39]).toBe(14.0);
    expect(WT_BR_VALUES[42]).toBe(15.0);
    // Spot check key intermediate values
    expect(WT_BR_VALUES).toContain(5.7);
    expect(WT_BR_VALUES).toContain(6.7);
    expect(WT_BR_VALUES).toContain(7.0);
    expect(WT_BR_VALUES).toContain(7.3);
    expect(WT_BR_VALUES).toContain(7.7);
    expect(WT_BR_VALUES).toContain(10.3);
    expect(WT_BR_VALUES).toContain(11.7);
    expect(WT_BR_VALUES).toContain(12.0);
    expect(WT_BR_VALUES).toContain(13.0);
    expect(WT_BR_VALUES).toContain(13.7);
  });

  it("converts economicRank to Battle Rating correctly", () => {
    expect(economicRankToBR(0)).toBe(1.0);
    expect(economicRankToBR(1)).toBe(1.3);
    expect(economicRankToBR(2)).toBe(1.7);
    expect(economicRankToBR(3)).toBe(2.0);
    expect(economicRankToBR(17)).toBe(6.7);
    expect(economicRankToBR(28)).toBe(10.3);
    expect(economicRankToBR(39)).toBe(14.0);
  });

  it("converts decimal BR back to economicRank index", () => {
    expect(brToEconomicRank(1.0)).toBe(0);
    expect(brToEconomicRank(1.3)).toBe(1);
    expect(brToEconomicRank(1.7)).toBe(2);
    expect(brToEconomicRank(6.7)).toBe(17);
    expect(brToEconomicRank(10.3)).toBe(28);
    expect(brToEconomicRank(14.0)).toBe(39);
  });

  it("calculates discrete step deltas instead of linear float math", () => {
    // 7.0 to 7.3 (+0.3) is +1 step
    expect(getBRStepDelta(7.0, 7.3)).toBe(1);

    // 7.3 to 7.7 (+0.4) is ALSO +1 step
    expect(getBRStepDelta(7.3, 7.7)).toBe(1);

    // 7.0 to 7.7 (+0.7) is exactly +2 steps
    expect(getBRStepDelta(7.0, 7.7)).toBe(2);

    // Buffs (drops in BR)
    expect(getBRStepDelta(10.3, 10.0)).toBe(-1);
    expect(getBRStepDelta(10.3, 9.3)).toBe(-3);
    expect(getBRStepDelta(6.7, 6.7)).toBe(0);
  });

  it("calculates numeric delta rounded to 1 decimal place", () => {
    expect(getNumericDelta(7.0, 7.3)).toBe(0.3);
    expect(getNumericDelta(7.3, 7.7)).toBe(0.4);
    expect(getNumericDelta(10.3, 10.0)).toBe(-0.3);
    expect(getNumericDelta(9.0, 8.7)).toBe(-0.3);
  });

  it("verifies 1.0 BR matchmaker spread windows", () => {
    // 10.0 is in spread for 10.3 target (diff = 0.3 <= 1.0)
    expect(isVehicleInSpread(10.0, 10.3)).toBe(true);
    // 9.3 is in spread for 10.3 target (diff = 1.0 <= 1.0)
    expect(isVehicleInSpread(9.3, 10.3)).toBe(true);
    // 9.0 is NOT in spread for 10.3 target (diff = 1.3 > 1.0)
    expect(isVehicleInSpread(9.0, 10.3)).toBe(false);
    // 10.7 is higher than target 10.3, so NOT in spread
    expect(isVehicleInSpread(10.7, 10.3)).toBe(false);
  });

  it("formats step badge string cleanly", () => {
    expect(formatStepBadge(1)).toBe("+1 STEP");
    expect(formatStepBadge(2)).toBe("+2 STEPS");
    expect(formatStepBadge(-1)).toBe("-1 STEP");
    expect(formatStepBadge(-3)).toBe("-3 STEPS");
    expect(formatStepBadge(0)).toBe("UNCHANGED");
  });

  it("computes accurate matchmaker ranges with ±1.0 BR reach", () => {
    const range = getMatchmakerRange(10.3);
    expect(range.target).toBe(10.3);
    expect(range.downtierMin).toBe(9.3);
    expect(range.uptierMax).toBe(11.3);
  });
});
