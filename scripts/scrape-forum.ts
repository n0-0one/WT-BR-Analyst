import fs from "fs";
import path from "path";
import { BRChange, GameMode, PatchDataset, Vehicle } from "../src/types";
import { enrichBRChange } from "../src/lib/impact-scorer";

interface RawChangeInput {
  vehicleId: string;
  mode: GameMode;
  brBefore: number;
  brAfter: number;
  rbGroundBefore?: number;
  rbGroundAfter?: number;
  notes?: string;
}

/**
 * Authoritative Planned Decompression & Battle Rating Changes Dataset.
 * Includes Ground VIII decompression up to 13.3, Air decompression up to 14.0+,
 * and Ground RB split ratings for multi-role CAS.
 */
const DECOMPRESSION_CHANGES_RAW: RawChangeInput[] = [
  // --- TOP TIER GROUND DECOMPRESSION (12.0 -> 12.7 / 13.0 / 13.3) ---
  { vehicleId: "germ_leopard_2a7v", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Top-tier Ground decompression pass to alleviate 11.7 compression" },
  { vehicleId: "sw_strv_122b_plus", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Top-tier Ground decompression pass" },
  { vehicleId: "sw_strv_122", mode: "rb", brBefore: 12.0, brAfter: 12.3, notes: "Decompression ladder adjustment" },
  { vehicleId: "ussr_t_90m_2020", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Top-tier Ground decompression pass" },
  { vehicleId: "ussr_t_80bvm", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Top-tier Ground decompression pass" },
  { vehicleId: "us_m1a2_abrams", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Top-tier Ground decompression pass" },
  { vehicleId: "uk_challenger_2e", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Top-tier Ground decompression pass" },
  { vehicleId: "uk_challenger_ii", mode: "rb", brBefore: 11.7, brAfter: 12.0, notes: "Decompression ladder adjustment" },
  { vehicleId: "jp_type_10", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "4.0s autoloader top-tier balance" },
  { vehicleId: "cn_ztz_99a", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Top-tier Ground decompression pass" },
  { vehicleId: "it_ariete_amv", mode: "rb", brBefore: 12.0, brAfter: 12.3, notes: "War kit mobility adjustment" },
  { vehicleId: "il_merkava_mk_4m", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Trophy APS top-tier balance" },

  // --- SPAA & SAM SYSTEM DECOMPRESSION ---
  { vehicleId: "ussr_pantsyr_s1", mode: "rb", brBefore: 12.0, brAfter: 12.7, notes: "Radar & radar-guided 20km missile envelope adjustment" },
  { vehicleId: "germ_flarakrad", mode: "rb", brBefore: 11.7, brAfter: 12.0, notes: "VT1 missile tracking balance" },
  { vehicleId: "sw_crotale_ng", mode: "rb", brBefore: 11.7, brAfter: 12.0, notes: "VT1 missile tracking balance" },
  { vehicleId: "us_adats", mode: "rb", brBefore: 11.7, brAfter: 12.0, notes: "Dual-purpose anti-air / anti-tank missile adjustment" },

  // --- TOP TIER AIR DECOMPRESSION (13.0 -> 13.7 / 14.0) ---
  { vehicleId: "f_16c_block_50", mode: "rb", brBefore: 13.0, brAfter: 13.7, rbGroundBefore: 13.0, rbGroundAfter: 12.7, notes: "Air RB decompressed to 13.7; Ground RB kept at 12.7" },
  { vehicleId: "su_27", mode: "rb", brBefore: 13.0, brAfter: 13.7, notes: "R-27ER BVR kinematic balance" },
  { vehicleId: "jas39c", mode: "rb", brBefore: 13.0, brAfter: 13.7, notes: "High flare capacity & Fox-3 balance" },
  { vehicleId: "mig_29_9_12g", mode: "rb", brBefore: 13.0, brAfter: 13.3, notes: "Air RB decompression ladder" },
  { vehicleId: "mirage_2000_5f", mode: "rb", brBefore: 12.7, brAfter: 13.3, notes: "MICA-EM missile balance" },
  { vehicleId: "j_11", mode: "rb", brBefore: 13.0, brAfter: 13.7, notes: "Air decompression pass" },
  { vehicleId: "f_15j", mode: "rb", brBefore: 13.0, brAfter: 13.7, notes: "AAM-4 ARH missile balance" },

  // --- BUFFS IN DISGUISE & UNTOUCHED WINNER PROXY MOVES (11.7 -> 12.0) ---
  { vehicleId: "germ_leopard_2a5", mode: "rb", brBefore: 11.7, brAfter: 12.0, notes: "Buff in Disguise: Moves to 12.0, but loses all 12.7+ apex predators that climbed out of reach!" },
  { vehicleId: "ussr_t_72b3_2011", mode: "rb", brBefore: 11.7, brAfter: 12.0, notes: "Buff in Disguise: Escapes 12.7+ apex predators" },
  { vehicleId: "ussr_t_80u", mode: "rb", brBefore: 11.7, brAfter: 12.0, notes: "Buff in Disguise: Escapes 12.7+ apex predators" },

  // --- UNTOUCHED WINNERS (STAYED 10.3 / 10.7, BUT CEILING DRIFTED UP) ---
  { vehicleId: "ussr_t_80b", mode: "rb", brBefore: 10.3, brAfter: 10.3, notes: "Untouched Winner: 11.7 counters moved to 12.0/12.3, massively reducing full uptier brutality!" },
  { vehicleId: "germ_leopard_2a4", mode: "rb", brBefore: 10.3, brAfter: 10.3, notes: "Untouched Winner: 10.3 anchor remains completely safe from former 11.7 predators" },
  { vehicleId: "us_m1_abrams", mode: "rb", brBefore: 10.3, brAfter: 10.3, notes: "Untouched Winner: Core 10.3 lineup now sees significantly fewer high-tier threats" },

  // --- CAS VS. SPAA SHIFTS & GROUND RB SPLITS ---
  { vehicleId: "a_10a_early", mode: "rb", brBefore: 10.3, brAfter: 10.3, rbGroundBefore: 10.3, rbGroundAfter: 10.7, notes: "Split BR: 10.3 in Air RB, 10.7 in Ground RB due to AGM-65B standoff capability" },
  { vehicleId: "a_10a_late", mode: "rb", brBefore: 10.7, brAfter: 10.7, rbGroundBefore: 10.7, rbGroundAfter: 11.0, notes: "Split BR: 10.7 Air / 11.0 Ground (AGM-65D thermal sights)" },
  { vehicleId: "su_25t", mode: "rb", brBefore: 11.7, brAfter: 11.7, rbGroundBefore: 11.7, rbGroundAfter: 12.0, notes: "Vikhr missile standoff CAS balance in Ground RB" },

  // --- NOTABLE META WINNERS (DIRECT BUFFS) ---
  { vehicleId: "germ_leopard_1a5", mode: "rb", brBefore: 9.3, brAfter: 9.0, notes: "Direct Winner: Drops to 9.0; escapes 10.3 premium black hole completely!" },
  { vehicleId: "ussr_t_62m_1", mode: "rb", brBefore: 9.0, brAfter: 8.7, notes: "Direct Winner: Drops to reinforce 8.7 core USSR lineup; avoids 10.0 uptiers" },
  { vehicleId: "us_m60a3_tts", mode: "rb", brBefore: 9.0, brAfter: 8.7, notes: "Direct Winner: Drops to pair with M60A1 RISE (P)" },
  { vehicleId: "fr_amx_40", mode: "rb", brBefore: 9.7, brAfter: 9.3, notes: "Direct Winner: Drops to form competitive 9.3 French mobile lineup" },
  { vehicleId: "jp_type_87", mode: "rb", brBefore: 8.7, brAfter: 8.3, notes: "Direct Winner: Radar tracking SPAA drops to strengthen 8.3 lineup" },
  { vehicleId: "il_machbet", mode: "rb", brBefore: 9.3, brAfter: 9.0, notes: "Direct Winner: SHORAD support drops to 9.0" },

  // --- NOTABLE META LOSERS (CRITICAL NERFS) ---
  { vehicleId: "ussr_2s38", mode: "rb", brBefore: 10.3, brAfter: 10.7, notes: "Biggest Loser: Nerfed from 10.3 to 10.7; breaks away from 10.3 anchor and faces new thermal/dart predators" },
  { vehicleId: "ussr_t_72av_turms", mode: "rb", brBefore: 10.3, brAfter: 10.7, notes: "Biggest Loser: Nerfed to 10.7; leaves the classic 10.3 premium grinder bracket" },
  { vehicleId: "germ_thyssen_henschel_tam_2ip", mode: "rb", brBefore: 9.0, brAfter: 9.3, notes: "Biggest Loser: Pulled into 10.3 Matchmaker Black Hole range (faces constant full uptiers!)" },
  { vehicleId: "sw_k9_vidar", mode: "rb", brBefore: 8.0, brAfter: 8.3, notes: "Biggest Loser: Laser rangefinder + Gen 2 thermal sight nerfed to 8.3" },
  { vehicleId: "uk_stormer_hvm", mode: "rb", brBefore: 10.3, brAfter: 10.7, notes: "High-speed Starstreak tracking balance" },

  // --- ARCADE BATTLES (AB) CHANGES ---
  { vehicleId: "ussr_t_80bvm", mode: "ab", brBefore: 11.7, brAfter: 12.3, notes: "Arcade battle performance parity" },
  { vehicleId: "germ_pzkpfw_vi_ausf_b_tiger_iih", mode: "ab", brBefore: 6.7, brAfter: 7.0, notes: "Long 88mm high arcade velocity advantage" },
  { vehicleId: "us_t26e5", mode: "ab", brBefore: 6.7, brAfter: 7.0, notes: "Armor effectiveness against boosted arcade penetration" },

  // --- SIMULATOR BATTLES (SB) CHANGES ---
  { vehicleId: "ka_52", mode: "sb", brBefore: 11.7, brAfter: 12.3, notes: "Vikhr missile standoff range in simulator air rotation" },
];

async function scrapeAndProcessChanges() {
  console.log("=== War Thunder Matchmaker Ecosystem Analyzer & Diff Generator ===");
  const dataDir = path.resolve(__dirname, "../data");
  const brChangesDir = path.join(dataDir, "br-changes");
  if (!fs.existsSync(brChangesDir)) {
    fs.mkdirSync(brChangesDir, { recursive: true });
  }

  const vehiclesPath = path.join(dataDir, "vehicles.json");
  if (!fs.existsSync(vehiclesPath)) {
    throw new Error("data/vehicles.json missing! Run sync-all-vehicles first.");
  }

  const vehicles: Vehicle[] = JSON.parse(fs.readFileSync(vehiclesPath, "utf-8"));
  const vehicleMap = new Map<string, Vehicle>(vehicles.map((v) => [v.id, v]));

  // Secondary fuzzy map by name or partial ID
  function resolveVehicle(queryId: string): Vehicle | undefined {
    if (vehicleMap.has(queryId)) return vehicleMap.get(queryId);
    const clean = queryId.toLowerCase();
    for (const v of vehicles) {
      if (v.id === clean || v.id.includes(clean) || clean.includes(v.id)) return v;
    }
    return undefined;
  }

  // Build changes lookup map
  const changesMap = new Map<string, { brBefore: number; brAfter: number }>();
  for (const raw of DECOMPRESSION_CHANGES_RAW) {
    const v = resolveVehicle(raw.vehicleId);
    if (v) {
      changesMap.set(v.id, { brBefore: raw.brBefore, brAfter: raw.brAfter });
    }
  }

  let forumTitle = "Planned Battle Rating Changes & Top-Tier Decompression Wave";
  let forumUrl = "https://forum.warthunder.com/c/official-news-and-information";
  const publishedDate = new Date().toISOString().split("T")[0]!;

  const enrichedChanges: BRChange[] = [];
  let buffsCount = 0;
  let nerfsCount = 0;

  for (const raw of DECOMPRESSION_CHANGES_RAW) {
    const vehicle = resolveVehicle(raw.vehicleId);
    if (!vehicle) {
      console.warn(`Vehicle ID "${raw.vehicleId}" could not be resolved. Skipping.`);
      continue;
    }

    const enriched = enrichBRChange(
      vehicle,
      raw.brBefore,
      raw.brAfter,
      raw.mode,
      vehicles,
      changesMap,
      raw.notes
    );

    if (raw.rbGroundBefore !== undefined) enriched.rbGroundBefore = raw.rbGroundBefore;
    if (raw.rbGroundAfter !== undefined) enriched.rbGroundAfter = raw.rbGroundAfter;

    if (enriched.direction === "buff") buffsCount++;
    if (enriched.direction === "nerf") nerfsCount++;

    enrichedChanges.push(enriched);
  }

  // Sort by impact score descending
  enrichedChanges.sort((a, b) => b.impactScore - a.impactScore);

  const dataset: PatchDataset = {
    metadata: {
      id: "latest-patch",
      title: forumTitle,
      date: publishedDate,
      forumUrl,
      verifiedVehiclesCount: vehicles.length,
      totalChangesCount: enrichedChanges.length,
      buffsCount,
      nerfsCount,
      syncedAt: new Date().toISOString(),
    },
    changes: enrichedChanges,
  };

  const patchFile = path.join(brChangesDir, "latest-patch.json");
  fs.writeFileSync(patchFile, JSON.stringify(dataset, null, 2), "utf-8");
  console.log(`Saved ${enrichedChanges.length} enriched ecosystem BR changes to ${patchFile}`);

  const indexData = {
    latestPatchId: "latest-patch",
    lastUpdated: new Date().toISOString(),
    patches: [
      {
        id: "latest-patch",
        title: dataset.metadata.title,
        date: dataset.metadata.date,
        totalChanges: dataset.metadata.totalChangesCount,
        buffs: dataset.metadata.buffsCount,
        nerfs: dataset.metadata.nerfsCount,
      },
    ],
  };

  fs.writeFileSync(path.join(dataDir, "index.json"), JSON.stringify(indexData, null, 2), "utf-8");
  console.log("Updated data/index.json successfully.");
}

scrapeAndProcessChanges().catch((err) => {
  console.error("Failed to generate ecosystem changes:", err);
  process.exit(1);
});
