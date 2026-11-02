import { describe, expect, it } from "vitest";
import { buildOptimalLineup, evaluateLineupSurvival } from "../src/lib/lineup-engine";
import { BRChange, Vehicle } from "../src/types";

describe("Lineup Engine (lineup-engine)", () => {
  const mockVehicles: Vehicle[] = [
    {
      id: "ussr_t_80b",
      name: "T-80B",
      nation: "ussr",
      rank: 7,
      br: { ab: 10.3, rb: 10.3, sb: 10.3 },
      vehicleClass: "medium_tank",
      branch: "army",
    },
    {
      id: "ussr_2s38",
      name: "2S38",
      nation: "ussr",
      rank: 7,
      br: { ab: 10.3, rb: 10.3, sb: 10.3 },
      vehicleClass: "light_tank",
      branch: "army",
      isPremium: true,
    },
    {
      id: "ussr_t_72av_turms",
      name: "T-72AV (TURMS-T)",
      nation: "ussr",
      rank: 7,
      br: { ab: 10.3, rb: 10.3, sb: 10.3 },
      vehicleClass: "medium_tank",
      branch: "army",
      isPremium: true,
    },
    {
      id: "ussr_bmp_3",
      name: "BMP-3",
      nation: "ussr",
      rank: 6,
      br: { ab: 9.0, rb: 9.0, sb: 9.0 },
      vehicleClass: "light_tank",
      branch: "army",
    },
    {
      id: "ussr_su_25k",
      name: "Su-25K",
      nation: "ussr",
      rank: 6,
      br: { ab: 10.3, rb: 10.3, sb: 10.3 },
      vehicleClass: "strike_aircraft",
      branch: "aviation",
      isPremium: true,
    },
    {
      id: "ussr_2s6_tunguska",
      name: "2S6 Tunguska",
      nation: "ussr",
      rank: 7,
      br: { ab: 10.7, rb: 10.7, sb: 10.7 },
      vehicleClass: "spaa",
      branch: "army",
    },
  ];

  it("evaluates lineup survival and isolates dropped nerfed vehicles", () => {
    // Simulate 2S38 being nerfed from 10.3 to 10.7
    const patchChanges: BRChange[] = [
      {
        vehicleId: "ussr_2s38",
        vehicleName: "2S38",
        nation: "ussr",
        vehicleClass: "light_tank",
        branch: "army",
        rank: 7,
        mode: "rb",
        brBefore: 10.3,
        brAfter: 10.7,
        stepDelta: 1,
        numericDelta: 0.4,
        direction: "nerf",
        impactScore: 75,
        impactReasons: ["Nerfed above 10.3"],
      },
    ];

    const result = evaluateLineupSurvival("ussr", "rb", 10.3, mockVehicles, patchChanges);

    // 2S38 was 10.3 and is now 10.7, so it must be dropped
    expect(result.droppedVehicles.some((v) => v.id === "ussr_2s38")).toBe(true);

    // T-80B, T-72AV, Su-25K remain surviving anchors
    expect(result.survivingVehicles.some((v) => v.id === "ussr_t_80b")).toBe(true);
    expect(result.survivingVehicles.some((v) => v.id === "ussr_t_72av_turms")).toBe(true);

    // Since surviving vehicles >= 3, lineup status is 'weakened'
    expect(result.status).toBe("weakened");

    // Check simulated "What if I keep nerfed vehicles?" calculations
    expect(result.simulatedMaxBR).toBe(10.7);
    expect(result.simulatedUptierMax).toBe(11.7); // 10.7 + 1.0 = 11.7
    expect(result.simulatedExposedVehicles).toBeDefined();
  });

  it("builds an optimal combined arms lineup with ground + CAS", () => {
    const optimal = buildOptimalLineup("ussr", "rb", 10.3, mockVehicles, []);

    expect(optimal.nation).toBe("ussr");
    expect(optimal.targetBR).toBe(10.3);
    expect(optimal.groundVehicles.length).toBeGreaterThanOrEqual(1);

    // Must include the MBT
    expect(optimal.roleCompleteness.hasMBT).toBe(true);

    // Must include Su-25K as CAS
    expect(optimal.roleCompleteness.hasCAS).toBe(true);
    expect(optimal.casVehicles.some((c) => c.id === "ussr_su_25k")).toBe(true);

    // Score should be high
    expect(optimal.score).toBeGreaterThanOrEqual(50);
    expect(optimal.strengths.length).toBeGreaterThan(0);
  });
});
