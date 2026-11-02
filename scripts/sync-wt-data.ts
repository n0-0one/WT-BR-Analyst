import fs from "fs";
import path from "path";
import { ImageFolder, Nation, Vehicle, VehicleBranch, VehicleClass } from "../src/types";
import { WT_BR_TABLE, economicRankToBR } from "../src/lib/br-engine";

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
  image?: string;
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

/**
 * Cleans localized English name, stripping Gaijin control chars and special unicode prefixes.
 */
function cleanLocalizedName(raw: string): string {
  return raw
    .replace(/^"/, "")
    .replace(/"$/, "")
    .replace(/[\u2417\u2400-\u241F\u0000-\u001F]/g, "") // Strip control characters & symbol fonts
    .replace(/\u00A0/g, " ") // Non-breaking space
    .replace(/\\/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Filter out non-playable dummy units.
 */
function isPlayableUnit(id: string, unit: any): boolean {
  if (!unit || typeof unit !== "object") return false;
  if (!unit.country || !COUNTRY_MAP[unit.country]) return false;
  if (typeof unit.rank !== "number" || unit.rank < 1 || unit.rank > 8) return false;

  const lower = id.toLowerCase();

  // Exclude dummy / bot / test / tutorial / nuclear carrier units
  const dummySubstrings = [
    "_killstreak",
    "_tutorial",
    "_bot",
    "_target",
    "_race",
    "_football",
    "_event_tornado",
    "ucav_",
    "_nuclear",
    "_football",
    "dummy_",
    "_dummy",
    "test_",
    "_artillery",
    "_carrier",
    "_zeppelin",
  ];

  for (const s of dummySubstrings) {
    if (lower.includes(s)) return false;
  }

  // Must have at least one valid economicRank
  if (
    unit.economicRankArcade === undefined &&
    unit.economicRankHistorical === undefined &&
    unit.economicRankSimulation === undefined
  ) {
    return false;
  }

  return true;
}

/**
 * Resolves exact ImageFolder ("tanks" | "aircrafts" | "ships") and lowercase imageId.
 */
function resolveImageDetails(
  unitId: string,
  unit: WPCostUnit,
  branch: VehicleBranch
): { imageFolder: ImageFolder; imageId: string } {
  const cleanId = unitId.toLowerCase();

  if (unit.image && typeof unit.image === "string") {
    // e.g. "#ui/units/tanks/germ_leopard_2a7v#" or "#ui/units/aircrafts/jp_f_2a_adtw#"
    const match = unit.image.match(/#ui\/units\/(tanks|aircrafts|ships)\/([a-zA-Z0-9_\-]+)#/);
    if (match && match[1] && match[2]) {
      return {
        imageFolder: match[1] as ImageFolder,
        imageId: match[2].toLowerCase(),
      };
    }
  }

  // Fallback to branch mapping
  if (branch === "aviation" || branch === "helicopters") {
    return { imageFolder: "aircrafts", imageId: cleanId };
  } else if (branch === "fleet") {
    return { imageFolder: "ships", imageId: cleanId };
  } else {
    return { imageFolder: "tanks", imageId: cleanId };
  }
}

/**
 * Determines vehicle branch and class with high precision.
 */
function resolveVehicleClassification(
  id: string,
  unit: WPCostUnit,
  roleName?: string
): { branch: VehicleBranch; vehicleClass: VehicleClass } {
  const move = unit.unitMoveType ?? "";
  const cls = unit.unitClass ?? "";
  const role = (roleName ?? "").toLowerCase();

  // 1. Helicopters
  if (move === "helicopter" || cls.includes("helicopter") || role.includes("helicopter")) {
    return { branch: "helicopters", vehicleClass: "helicopter" };
  }

  // 2. Aviation
  if (move === "air" || cls.startsWith("exp_fighter") || cls.startsWith("exp_assault") || cls.startsWith("exp_bomber")) {
    if (cls.includes("assault") || role.includes("strike") || role.includes("attacker")) {
      return { branch: "aviation", vehicleClass: "strike_aircraft" };
    }
    if (cls.includes("bomber") || role.includes("bomber")) {
      return { branch: "aviation", vehicleClass: "bomber" };
    }
    return { branch: "aviation", vehicleClass: "fighter" };
  }

  // 3. Fleet / Naval
  if (move === "ship" || move === "fast_ship" || move === "slow_ship" || cls.includes("destroyer") || cls.includes("cruiser") || cls.includes("boat")) {
    if (cls.includes("cruiser") || cls.includes("destroyer") || cls.includes("battleship") || role.includes("destroyer") || role.includes("cruiser")) {
      return { branch: "fleet", vehicleClass: "bluewater" };
    }
    return { branch: "fleet", vehicleClass: "coastal" };
  }

  // 4. Ground (Army)
  if (cls === "exp_SPAA" || role.includes("spaa") || role.includes("anti-aircraft") || role.includes("air defence")) {
    return { branch: "army", vehicleClass: "spaa" };
  }
  if (cls === "exp_tank_destroyer" || role.includes("tank destroyer") || role.includes("spg")) {
    return { branch: "army", vehicleClass: "tank_destroyer" };
  }
  if (cls === "exp_heavy_tank" || role.includes("heavy tank")) {
    return { branch: "army", vehicleClass: "heavy_tank" };
  }
  if (
    role.includes("light tank") ||
    role.includes("scout") ||
    cls.includes("light_tank") ||
    move === "wheeled_vehicle" ||
    id.includes("bmp_") ||
    id.includes("bmd_") ||
    id.includes("bradley") ||
    id.includes("tam_") ||
    id.includes("rooikat") ||
    id.includes("centauro")
  ) {
    return { branch: "army", vehicleClass: "light_tank" };
  }

  return { branch: "army", vehicleClass: "medium_tank" };
}

export async function syncWarThunderData() {
  console.log("=== War Thunder Datamine Verified Sync Pipeline ===");
  const dataDir = path.resolve(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 1. Fetch Localization File (units.csv)
  console.log("Fetching units.csv from datamine...");
  const englishNamesMap = new Map<string, string>();
  const rolesMap = new Map<string, string>();

  const csvUrls = [
    "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/lang.vromfs.bin_u/lang/units.csv",
    "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/aces.vromfs.bin_u/gamedata/lang/units.csv",
  ];

  for (const csvUrl of csvUrls) {
    try {
      const csvRes = await fetch(csvUrl, { signal: AbortSignal.timeout(25000) });
      if (csvRes.ok) {
        const csvText = await csvRes.text();
        const lines = csvText.split("\n");
        for (const line of lines) {
          if (!line || !line.includes(";")) continue;
          const parts = line.split(";");
          const rawId = parts[0]?.trim();
          const rawEn = parts[1]?.trim();
          if (!rawId || !rawEn) continue;

          const id = cleanLocalizedName(rawId);
          const english = cleanLocalizedName(rawEn);

          if (id.endsWith("_shop")) {
            const baseId = id.replace(/_shop$/, "");
            englishNamesMap.set(baseId, english);
          } else if (id.endsWith("_0")) {
            const baseId = id.replace(/_0$/, "");
            if (!englishNamesMap.has(baseId)) {
              englishNamesMap.set(baseId, english);
            }
          } else if (id.endsWith("_2")) {
            const baseId = id.replace(/_2$/, "");
            rolesMap.set(baseId, english.toLowerCase());
          }
        }
        console.log(`Parsed ${englishNamesMap.size} English names from ${csvUrl}`);
        break;
      }
    } catch (err: unknown) {
      console.warn(`Could not fetch from ${csvUrl}:`, (err as Error).message);
    }
  }

  // 2. Fetch Authoritative Game Parameters (wpcost.blkx)
  console.log("Fetching wpcost.blkx from datamine...");
  const costRes = await fetch(
    "https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/char.vromfs.bin_u/config/wpcost.blkx",
    { signal: AbortSignal.timeout(35000) }
  );

  if (!costRes.ok) {
    throw new Error(`Failed to fetch wpcost.blkx: ${costRes.status} ${costRes.statusText}`);
  }

  const rawData: Record<string, WPCostUnit> = await costRes.json();
  const rawKeys = Object.keys(rawData);
  console.log(`Raw units in wpcost.blkx: ${rawKeys.length}`);

  const vehicles: Vehicle[] = [];

  for (const unitId of rawKeys) {
    const unit = rawData[unitId];
    if (!unit || !isPlayableUnit(unitId, unit)) continue;

    const nation = COUNTRY_MAP[unit.country!];
    if (!nation) continue;

    // Localized name resolution: _shop first, then _0, then cleaned ID fallback
    let displayName = englishNamesMap.get(unitId);
    if (!displayName) {
      // Try stripping nation prefix if present (e.g. us_f_16c -> f_16c)
      const parts = unitId.split("_");
      if (parts.length > 1) {
        const withoutNation = parts.slice(1).join("_");
        displayName = englishNamesMap.get(withoutNation);
      }
    }
    if (!displayName) {
      displayName = unitId
        .replace(/^[a-z]{2,4}_/, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Role and classification
    const role = rolesMap.get(unitId);
    const { branch, vehicleClass } = resolveVehicleClassification(unitId, unit, role);

    // Exact 4-mode BR calculations using WT_BR_TABLE lookup
    const ab = economicRankToBR(unit.economicRankArcade);
    const rb = economicRankToBR(unit.economicRankHistorical);
    const sb = economicRankToBR(unit.economicRankSimulation);

    // Ground RB Aircraft Split BR
    let rbGround: number | undefined = undefined;
    if (branch === "aviation" || branch === "helicopters") {
      rbGround = economicRankToBR(unit.economicRankTankHistorical ?? unit.economicRankHistorical);
    }

    // Image details
    const { imageFolder, imageId } = resolveImageDetails(unitId, unit, branch);
    const imageUrl = `https://raw.githubusercontent.com/gszabi99/War-Thunder-Datamine/master/tex.vromfs.bin_u/${imageFolder}/${imageId}.png`;
    const wikiUrl = `https://wiki.warthunder.com/unit/${unitId}`;

    // Premium / Squadron / Event detection
    const isPremium = !!(unit.costGold && unit.costGold > 0) || !!unit.premPack || !!unit.gift;
    const isSquadron = !!unit.isClanVehicle;
    const isEvent = !!unit.event || !!unit.isGift;

    vehicles.push({
      id: unitId,
      name: displayName,
      nation,
      rank: unit.rank!,
      br: {
        ab,
        rb,
        sb,
        ...(rbGround !== undefined && rbGround !== rb ? { rbGround } : {}),
      },
      vehicleClass,
      branch,
      imageFolder,
      imageId,
      isPremium,
      isSquadron,
      isEvent,
      imageUrl,
      wikiUrl,
    });
  }

  // Sort vehicles by nation, rank descending, then BR descending
  vehicles.sort((a, b) => {
    if (a.nation !== b.nation) return a.nation.localeCompare(b.nation);
    if (b.rank !== a.rank) return b.rank - a.rank;
    return b.br.rb - a.br.rb;
  });

  console.log(`Successfully verified and mapped ${vehicles.length} playable vehicles across all 10 nations.`);

  const outputPath = path.resolve(dataDir, "vehicles.json");
  fs.writeFileSync(outputPath, JSON.stringify(vehicles, null, 2), "utf-8");
  console.log(`Saved clean vehicle dataset to ${outputPath}`);

  return vehicles;
}

if (require.main === module) {
  syncWarThunderData().catch((err) => {
    console.error("Fatal sync error:", err);
    process.exit(1);
  });
}
