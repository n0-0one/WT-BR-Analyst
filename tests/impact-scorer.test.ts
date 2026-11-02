import { describe, expect, it } from "vitest";
import { calculateImpactScore } from "../src/lib/impact-scorer";
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
});
