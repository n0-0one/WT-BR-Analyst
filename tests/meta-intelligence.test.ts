import { describe, expect, it } from "vitest";
import {
  detectMetaWallShift,
  generateStatSharkTelemetry,
  generateCommunityIntelligence,
} from "../src/lib/meta-intelligence";
import { getVehicleCascadeUrls } from "../src/components/vehicles/VehicleImage";
import { Vehicle } from "../src/types";

describe("Tactical Meta-Wall & Post-Patch Intelligence (meta-intelligence)", () => {
  it("detects Fox-3 / ARH missile wall escape for aircraft around 12.0–13.0", () => {
    const shift = detectMetaWallShift(
      {
        id: "f_2a_adtw",
        name: "F-2A ADTW",
        branch: "aviation",
        vehicleClass: "fighter",
        nation: "japan",
        rank: 8,
      },
      12.7,
      13.0,
      "rb"
    );

    expect(shift).toBeDefined();
    expect(shift?.wallType).toBe("fox3_arh_wall");
    expect(shift?.title).toContain("Fox-3 / ARH Missile Wall Escape");
  });

  it("detects Ground 13.3 Decompression Safe-Zone for 11.7–12.0 ground vehicles", () => {
    const shift = detectMetaWallShift(
      {
        id: "uk_challenger_2_megatron",
        name: "Challenger 2 (2F)",
        branch: "army",
        vehicleClass: "medium_tank",
        nation: "britain",
        rank: 8,
      },
      11.7,
      12.0,
      "rb"
    );

    expect(shift).toBeDefined();
    expect(shift?.wallType).toBe("ground_decompression_13_3");
    expect(shift?.title).toContain("13.3 Top-Tier Decompression Ceiling");
  });

  it("detects Top-Tier SAM Radar Belt traps for strike aircraft", () => {
    const shift = detectMetaWallShift(
      {
        id: "saab_ajs37",
        name: "AJS37",
        branch: "aviation",
        vehicleClass: "strike_aircraft",
        nation: "sweden",
        rank: 8,
      },
      10.7,
      11.7,
      "rb"
    );

    expect(shift).toBeDefined();
    expect(shift?.wallType).toBe("sam_radar_belt");
    expect(shift?.title).toContain("Top-Tier SAM Radar Belt Trap");
  });

  it("detects Untouched Anchor Kings when BR did not change but threats escaped", () => {
    const shift = detectMetaWallShift(
      {
        id: "ussr_t_80ud",
        name: "T-80UD",
        branch: "army",
        vehicleClass: "medium_tank",
        nation: "ussr",
        rank: 7,
      },
      10.0,
      10.0,
      "rb"
    );

    expect(shift).toBeDefined();
    expect(shift?.wallType).toBe("untouched_anchor");
    expect(shift?.title).toContain("Untouched Meta Anchor King");
  });

  it("detects Compression Victims when climbing across thermal/missile thresholds", () => {
    const shift = detectMetaWallShift(
      {
        id: "us_xm1_gm",
        name: "XM1 (GM)",
        branch: "army",
        vehicleClass: "medium_tank",
        nation: "usa",
        rank: 6,
      },
      9.3,
      9.7,
      "rb"
    );

    expect(shift).toBeDefined();
    expect(shift?.wallType).toBe("compression_victim");
    expect(shift?.title).toContain("Matchmaker Compression Trap");
  });

  it("generates realistic StatShark telemetry with positive delta for Fox-3 escape", () => {
    const metaWall = {
      wallType: "fox3_arh_wall" as const,
      title: "Fox-3 / ARH Missile Wall Escape",
      description: "Escaped ARH missiles",
    };

    const telemetry = generateStatSharkTelemetry(
      {
        id: "f_2a_adtw",
        name: "F-2A ADTW",
        rank: 8,
        branch: "aviation",
        vehicleClass: "fighter",
      },
      12.7,
      13.0,
      "rb",
      undefined,
      metaWall
    );

    expect(telemetry.winRateDelta).toBeGreaterThan(0);
    expect(telemetry.winRateAfter).toBeGreaterThan(telemetry.winRateBefore);
    expect(telemetry.kdDelta).toBeGreaterThan(0);
    expect(telemetry.telemetrySource).toContain("StatShark");
  });

  it("generates realistic StatShark telemetry with negative delta for SAM belt trap", () => {
    const metaWall = {
      wallType: "sam_radar_belt" as const,
      title: "Top-Tier SAM Radar Belt Trap",
      description: "Pushed into Pantsir envelope",
    };

    const telemetry = generateStatSharkTelemetry(
      {
        id: "saab_ajs37",
        name: "AJS37",
        rank: 8,
        branch: "aviation",
        vehicleClass: "strike_aircraft",
      },
      10.7,
      11.7,
      "rb",
      undefined,
      metaWall
    );

    expect(telemetry.winRateDelta).toBeLessThan(0);
    expect(telemetry.winRateAfter).toBeLessThan(telemetry.winRateBefore);
    expect(telemetry.kdDelta).toBeLessThan(0);
  });

  it("generates comprehensive community consensus verdicts and tags", () => {
    const intel = generateCommunityIntelligence(
      {
        id: "f_2a_adtw",
        name: "F-2A ADTW",
        rank: 8,
        branch: "aviation",
        vehicleClass: "fighter",
      },
      12.7,
      13.0,
      "rb",
      undefined,
      {
        wallType: "fox3_arh_wall",
        title: "Fox-3 / ARH Missile Wall Escape",
        description: "Test",
      }
    );

    expect(intel.consensusVerdict).toContain("+8.3% WR");
    expect(intel.consensusVerdict).toContain("+0.57 K/D");
    expect(intel.communityTags).toContain("📈 StatShark Telemetry");
    expect(intel.communityTags).toContain("🎥 YouTube Meta Consensus");
    expect(intel.communityTags).toContain("💬 r/Warthunder & Forum");
  });
});

describe("5-Stage Multi-CDN Image Cascade Resolution", () => {
  it("resolves primary Datamine tex.vromfs.bin_u URL with correct folder and imageId", () => {
    const tank: Vehicle = {
      id: "germ_leopard_2a7v",
      name: "Leopard 2A7V",
      nation: "germany",
      rank: 8,
      branch: "army",
      vehicleClass: "medium_tank",
      br: { ab: 12.0, rb: 12.0, sb: 12.0, rbGround: 12.0 },
      isPremium: false,
      isSquadron: false,
      isEvent: false,
      imageFolder: "tanks",
      imageId: "germ_leopard_2a7v",
    };

    const urls = getVehicleCascadeUrls(tank);
    expect(urls).toHaveLength(5);
    expect(urls[0]).toBe(
      "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/tex.vromfs.bin_u/tanks/germ_leopard_2a7v.png"
    );
    expect(urls[1]).toContain("encyclopedia.warthunder.com");
    expect(urls[2]).toContain("staticfiles.warthunder.com");
    expect(urls[3]).toContain("wtvehiclesapi.sgambe.serv00.net");
    expect(urls[4]).toBe("/placeholders/tank.svg");
  });

  it("resolves aircrafts folder correctly for aviation vehicles", () => {
    const jet: Vehicle = {
      id: "f_2a_adtw",
      name: "F-2A ADTW",
      nation: "japan",
      rank: 8,
      branch: "aviation",
      vehicleClass: "fighter",
      br: { ab: 12.7, rb: 13.0, sb: 12.7, rbGround: 12.7 },
      isPremium: true,
      isSquadron: false,
      isEvent: false,
      imageFolder: "aircrafts",
      imageId: "f_2a_adtw",
    };

    const urls = getVehicleCascadeUrls(jet);
    expect(urls[0]).toBe(
      "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/tex.vromfs.bin_u/aircrafts/f_2a_adtw.png"
    );
    expect(urls[4]).toBe("/placeholders/aircraft.svg");
  });

  it("resolves ships folder correctly for naval vehicles", () => {
    const battleship: Vehicle = {
      id: "ussr_battleship_parizhskaya_kommuna",
      name: "Parizhskaya Kommuna",
      nation: "ussr",
      rank: 6,
      branch: "fleet",
      vehicleClass: "bluewater",
      br: { ab: 7.0, rb: 7.0, sb: 7.0, rbGround: 7.0 },
      isPremium: false,
      isSquadron: false,
      isEvent: false,
      imageFolder: "ships",
      imageId: "ussr_battleship_parizhskaya_kommuna",
    };

    const urls = getVehicleCascadeUrls(battleship);
    expect(urls[0]).toBe(
      "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/tex.vromfs.bin_u/ships/ussr_battleship_parizhskaya_kommuna.png"
    );
    expect(urls[4]).toBe("/placeholders/ship.svg");
  });
});
