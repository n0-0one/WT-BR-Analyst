import { describe, expect, it } from "vitest";
import { calculateImpactScore, analyzeMatchmakerShift } from "../src/lib/impact-scorer";
import { Vehicle } from "../src/types";

describe("Impact Scorer Engine (impact-scorer)", () => {
  const dummyVehicles: Vehicle[] = [
    {
      id: "germ_leopard_1a5",
      name: "Leopard 1A5",
      nation: "germany",
      rank: 6,
      br: { ab: 9.3, rb: 9.3, sb: 9.3 },
      vehicleClass: "medium_tank",
      branch: "army",
    },
    {
      id: "germ_tam_2ip",
      name: "TAM 2IP",
      nation: "germany",
      rank: 6,
      br: { ab: 9.0, rb: 9.0, sb: 9.0 },
      vehicleClass: "light_tank",
      branch: "army",
      isPremium: true,
    },
    {
      id: "germ_leopard_1",
      name: "Leopard 1",
      nation: "germany",
      rank: 5,
      br: { ab: 8.0, rb: 8.0, sb: 8.0 },
      vehicleClass: "medium_tank",
      branch: "army",
    },
    {
      id: "germ_gepard",
      name: "Flakpanzer Gepard",
      nation: "germany",
      rank: 6,
      br: { ab: 8.7, rb: 8.7, sb: 8.7 },
      vehicleClass: "spaa",
      branch: "army",
    },
    {
      id: "germ_tam_2c",
      name: "TAM 2C",
      nation: "germany",
      rank: 7,
      br: { ab: 10.0, rb: 10.0, sb: 10.0 },
      vehicleClass: "light_tank",
      branch: "army",
    },
  ];

  it("scores 0 for unchanged BR", () => {
    const res = calculateImpactScore(dummyVehicles[0]!, 9.3, 9.3, "rb", dummyVehicles);
    expect(res.score).toBe(0);
    expect(res.direction).toBe("unchanged");
  });

  it("awards black hole escape points when vehicle drops away from black hole reach", () => {
    // 9.3 to 9.0: 10.3 Black Hole reach is (10.3 - 1.0 = 9.3).
    // Pre-patch 9.3 faced 10.3 black hole. At 9.0, it escapes!
    const res = calculateImpactScore(dummyVehicles[0]!, 9.3, 9.0, "rb", dummyVehicles);

    expect(res.direction).toBe("buff");
    expect(res.score).toBeGreaterThanOrEqual(45); // Magnitude (15) + Black Hole (30) + etc.
    expect(res.reasons.some((r) => r.includes("Escapes 10.3 matchmaker black hole"))).toBe(true);
  });

  it("penalizes vehicle pulled into matchmaker black hole", () => {
    // 9.0 to 9.3: pulled into 10.3 Black hole reach (>= 9.3)
    const res = calculateImpactScore(dummyVehicles[1]!, 9.0, 9.3, "rb", dummyVehicles);

    expect(res.direction).toBe("nerf");
    expect(res.score).toBeGreaterThanOrEqual(55); // Magnitude + Black Hole (30) + Premium bonus (10)
    expect(res.reasons.some((r) => r.includes("Pulled into 10.3 matchmaker black hole range"))).toBe(true);
    expect(res.reasons.some((r) => r.includes("High-population vehicle"))).toBe(true);
  });

  it("handles multi-step shifts with high magnitude weight", () => {
    // 2-step shift (e.g. 10.3 to 11.0)
    const res = calculateImpactScore(dummyVehicles[4]!, 10.3, 11.0, "rb", dummyVehicles);
    expect(res.reasons.some((r) => r.includes("2-step BR adjustment"))).toBe(true);
  });

  it("identifies direct winner when vehicle drops in BR", () => {
    const shift = analyzeMatchmakerShift(dummyVehicles[0]!, 9.3, 9.0, "rb", dummyVehicles);
    expect(shift.category).toBe("direct_winner");
    expect(shift.categoryLabel).toContain("Direct Winner");
  });

  it("identifies biggest loser when vehicle rises in BR", () => {
    const shift = analyzeMatchmakerShift(dummyVehicles[0]!, 9.3, 9.7, "rb", dummyVehicles);
    expect(shift.category).toBe("biggest_loser");
    expect(shift.categoryLabel).toContain("Biggest Loser");
  });

  it("identifies untouched winner when top-tier ceiling decompresses", () => {
    const vehicles: Vehicle[] = [
      {
        id: "germ_leopard_2a5",
        name: "Leopard 2A5",
        nation: "germany",
        rank: 7,
        br: { ab: 11.7, rb: 11.7, sb: 11.7 },
        vehicleClass: "medium_tank",
        branch: "army",
      },
      {
        id: "germ_leopard_2a7v",
        name: "Leopard 2A7V",
        nation: "germany",
        rank: 8,
        br: { ab: 12.7, rb: 12.7, sb: 12.7 },
        vehicleClass: "medium_tank",
        branch: "army",
      },
    ];

    // 2A7V moved from 12.7 to 13.0, escaping 2A5's 11.7 reach (11.7 + 1.0 = 12.7)
    const changesMap = new Map([
      ["germ_leopard_2a7v", { brBefore: 12.7, brAfter: 13.0 }],
    ]);

    const shift = analyzeMatchmakerShift(
      vehicles[0]!,
      11.7,
      11.7,
      "rb",
      vehicles,
      changesMap
    );

    expect(shift.category).toBe("untouched_winner");
    expect(shift.threatsEscapedAbove.count).toBe(1);
    expect(shift.threatsEscapedAbove.examples).toContain("Leopard 2A7V");
  });
});
