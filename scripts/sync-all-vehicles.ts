import fs from "fs";
import path from "path";
import { Nation, Vehicle, VehicleBranch, VehicleClass } from "../src/types";
import { economicRankToBR } from "../src/lib/br-engine";

interface WPCostUnit {
  economicRankArcade?: number;
  economicRankHistorical?: number;
  economicRankSimulation?: number;
  economicRankTankHistorical?: number;
  rank?: number;
  country?: string;
  unitClass?: string;
  spawnType?: string;
  unitMoveType?: string;
  type?: string;
  value?: number;
  costGold?: number;
  gift?: boolean;
  premPack?: boolean;
  isClanVehicle?: boolean;
  event?: boolean;
  isGift?: boolean;
}

const COUNTRY_MAP: Record<string, Nation> = {
  country_usa: "usa",
  country_germany: "germany",
  country_ussr: "ussr",
  country_britain: "britain",
  country_japan: "japan",
  country_china: "china",
  country_italy: "italy",
  country_france: "france",
  country_sweden: "sweden",
  country_israel: "israel",
};

function cleanName(raw: string): string {
  return raw
    .replace(/^"/, "")
    .replace(/"$/, "")
    .replace(/ /g, " ")
    .replace(/\\/g, "")
    .trim();
}

async function syncAllVehicles() {
  console.log("=== War Thunder Complete ~2,600+ Vehicle Ingestion Pipeline ===");
  const dataDir = path.resolve(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 1. Fetch Localization File (units.csv)
  console.log("Fetching units.csv localization from datamine...");
  const englishNamesMap = new Map<string, string>();
  const rolesMap = new Map<string, string>();

  try {
    const csvRes = await fetch(
      "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/lang.vromfs.bin_u/lang/units.csv",
      { signal: AbortSignal.timeout(20000) }
    );
    if (csvRes.ok) {
      const csvText = await csvRes.text();
      const lines = csvText.split("\n");
      for (const line of lines) {
        if (!line || !line.includes(";")) continue;
        const parts = line.split(";");
        const rawId = parts[0];
        const rawEn = parts[1];
        if (!rawId || !rawEn) continue;

        const id = cleanName(rawId);
        const english = cleanName(rawEn);

        if (id.endsWith("_shop") || id.endsWith("_0")) {
          const baseId = id.replace(/_shop$/, "").replace(/_0$/, "");
          if (!englishNamesMap.has(baseId)) {
            englishNamesMap.set(baseId, english);
          }
        } else if (id.endsWith("_2")) {
          const baseId = id.replace(/_2$/, "");
          rolesMap.set(baseId, english.toLowerCase());
        }
      }
      console.log(`Parsed ${englishNamesMap.size} English names and ${rolesMap.size} roles.`);
    }
  } catch (err: unknown) {
    console.warn("Could not fetch units.csv, will fallback to ID formatting:", (err as Error).message);
  }

  // 2. Fetch Authoritative Game Parameters (wpcost.blkx)
  console.log("Fetching wpcost.blkx from datamine...");
  let rawData: Record<string, WPCostUnit> = {};
  try {
    const costRes = await fetch(
      "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/char.vromfs.bin_u/config/wpcost.blkx",
      { signal: AbortSignal.timeout(30000) }
    );
    if (costRes.ok) {
      rawData = (await costRes.json()) as Record<string, WPCostUnit>;
      console.log(`Downloaded ${Object.keys(rawData).length} total raw game definitions.`);
    } else {
      throw new Error(`HTTP ${costRes.status}`);
    }
  } catch (err: unknown) {
    console.error("Failed to fetch wpcost.blkx:", (err as Error).message);
    process.exit(1);
  }

  // 3. Process every vehicle
  const vehicles: Vehicle[] = [];
  const processedIds = new Set<string>();

  for (const [unitId, unit] of Object.entries(rawData)) {
    if (!unit || typeof unit !== "object") continue;

    // Filter out dummy/killstreak/nuclear/test units
    if (!unit.country || unit.country === "country_0") continue;
    if (
      unitId.includes("killstreak") ||
      unitId.includes("dummy") ||
      unitId.includes("football") ||
      unitId.includes("nuclear") ||
      unitId.includes("_tutorial") ||
      unitId.startsWith("sample_")
    ) {
      continue;
    }
    if (unit.economicRankHistorical === undefined) continue;

    const nation = COUNTRY_MAP[unit.country];
    if (!nation) continue;

    const rank = unit.rank ?? 1;

    // BR conversions
    const ab = unit.economicRankArcade !== undefined ? economicRankToBR(unit.economicRankArcade) : 1.0;
    const rb = unit.economicRankHistorical !== undefined ? economicRankToBR(unit.economicRankHistorical) : 1.0;
    const sb = unit.economicRankSimulation !== undefined ? economicRankToBR(unit.economicRankSimulation) : 1.0;
    const rbGround =
      unit.economicRankTankHistorical !== undefined
        ? economicRankToBR(unit.economicRankTankHistorical)
        : undefined;

    // Classification & Branch
    let branch: VehicleBranch = "army";
    let vehicleClass: VehicleClass = "medium_tank";

    const uc = unit.unitClass ?? "";
    const role = rolesMap.get(unitId) ?? "";

    if (uc === "exp_fighter") {
      branch = "aviation";
      vehicleClass = "fighter";
    } else if (uc === "exp_assault") {
      branch = "aviation";
      vehicleClass = "strike_aircraft";
    } else if (uc === "exp_bomber") {
      branch = "aviation";
      vehicleClass = "bomber";
    } else if (uc === "exp_helicopter" || unit.unitMoveType === "helicopter") {
      branch = "helicopters";
      vehicleClass = "helicopter";
    } else if (uc === "exp_SPAA") {
      branch = "army";
      vehicleClass = "spaa";
    } else if (uc === "exp_tank_destroyer") {
      branch = "army";
      vehicleClass = "tank_destroyer";
    } else if (uc === "exp_heavy_tank" || role.includes("heavy tank")) {
      branch = "army";
      vehicleClass = "heavy_tank";
    } else if (uc === "exp_destroyer" || uc === "exp_cruiser") {
      branch = "fleet";
      vehicleClass = "bluewater";
    } else if (
      uc === "exp_gun_boat" ||
      uc === "exp_torpedo_boat" ||
      uc === "exp_submarine_chaser" ||
      uc === "exp_naval_ferry_barge" ||
      uc === "exp_torpedo_gun_boat"
    ) {
      branch = "fleet";
      vehicleClass = "coastal";
    } else {
      // Regular exp_tank
      branch = "army";
      if (role.includes("light tank") || unit.unitMoveType === "wheeled_vehicle") {
        vehicleClass = "light_tank";
      } else {
        vehicleClass = "medium_tank";
      }
    }

    // Special vehicle statuses
    const isPremium =
      unit.costGold !== undefined ||
      unit.gift === true ||
      unit.isGift === true ||
      unit.premPack === true ||
      (unit.value === 0 && rank > 1 && !unitId.includes("_clan"));

    const isSquadron =
      unit.isClanVehicle === true ||
      unitId.includes("_clan") ||
      (unit.value !== undefined && unit.value > 0 && unit.costGold === undefined && unitId.includes("squadron"));

    const isEvent = unit.event === true;

    // Display Name
    let name = englishNamesMap.get(unitId);
    if (!name) {
      // Clean fallback formatting
      name = unitId
        .replace(/^(us|germ|ussr|uk|jp|cn|it|fr|sw|il)_/, "")
        .replace(/_/g, " ")
        .toUpperCase();
    }

    const cleanId = unitId.toLowerCase();
    if (processedIds.has(cleanId)) continue;
    processedIds.add(cleanId);

    vehicles.push({
      id: cleanId,
      name,
      nation,
      rank,
      br: {
        ab,
        rb,
        sb,
        rbGround,
      },
      vehicleClass,
      branch,
      isPremium,
      isSquadron,
      isEvent,
      imageUrl: `https://static.encyclopedia.warthunder.com/images/${cleanId}.png`,
      wikiUrl: `https://wiki.warthunder.com/unit/${cleanId}`,
    });
  }

  // Sort by nation, then branch, then BR descending
  vehicles.sort((a, b) => {
    if (a.nation !== b.nation) return a.nation.localeCompare(b.nation);
    if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
    return (b.br.rb ?? 0) - (a.br.rb ?? 0);
  });

  console.log(`Successfully compiled ${vehicles.length} complete War Thunder vehicles!`);

  const vehiclesFile = path.join(dataDir, "vehicles.json");
  fs.writeFileSync(vehiclesFile, JSON.stringify(vehicles, null, 2), "utf-8");
  console.log(`Saved full vehicle database to ${vehiclesFile}`);
}

syncAllVehicles().catch((err) => {
  console.error("Error in sync-all-vehicles:", err);
  process.exit(1);
});
