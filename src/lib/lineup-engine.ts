import { BRChange, GameMode, LineupEvaluation, LineupRoleCheck, Nation, OptimalLineup, Vehicle } from "@/types";
import { brToEconomicRank, formatBR, getMatchmakerRange, isVehicleInSpread, WT_BR_VALUES } from "./br-engine";

/**
 * Lineup Survival Checker Engine
 * Evaluates whether a player's core bracket lineup (e.g. 10.3 USSR or 6.7 Germany)
 * survives the latest BR changes without forcing an unwanted uptier.
 */
export function evaluateLineupSurvival(
  nation: Nation,
  mode: GameMode,
  targetBR: number,
  allVehicles: Vehicle[],
  patchChanges: BRChange[] = []
): LineupEvaluation {
  const roundedTarget = Number(targetBR.toFixed(1));

  // Build a lookup of changes for fast access: vehicleId -> BRChange
  const changesMap = new Map<string, BRChange>();
  for (const change of patchChanges) {
    if (change.mode === mode) {
      changesMap.set(change.vehicleId, change);
    }
  }

  // Same nation vehicles
  const nationVehicles = allVehicles.filter((v) => v.nation === nation);

  const droppedVehicles: Vehicle[] = [];
  const newReinforcements: Vehicle[] = [];
  const survivingVehicles: Vehicle[] = [];

  // Determine pre-patch and post-patch BR for each vehicle
  for (const v of nationVehicles) {
    const change = changesMap.get(v.id);
    const currentBR = Number((v.br[mode] ?? 0).toFixed(1));
    const oldBR = change ? Number(change.brBefore.toFixed(1)) : currentBR;
    const newBR = change ? Number(change.brAfter.toFixed(1)) : currentBR;

    // Check if vehicle was part of targetBR lineup pre-patch
    // A core anchor vehicle is at targetBR or within -0.3
    const wasInAnchor = oldBR <= roundedTarget && Number((roundedTarget - oldBR).toFixed(1)) <= 0.3;
    const isNowAboveTarget = newBR > roundedTarget;

    if (wasInAnchor && isNowAboveTarget) {
      // Vehicle was nerfed above targetBR -> Dropped to preserve bracket!
      droppedVehicles.push({
        ...v,
        br: { ...v.br, [mode]: newBR },
      });
    } else if (oldBR > roundedTarget && newBR === roundedTarget) {
      // Vehicle was above targetBR and buffed down directly into targetBR -> New Reinforcement!
      newReinforcements.push({
        ...v,
        br: { ...v.br, [mode]: newBR },
      });
    } else if (newBR <= roundedTarget && Number((roundedTarget - newBR).toFixed(1)) <= 0.3) {
      // Surviving core anchor vehicle
      survivingVehicles.push({
        ...v,
        br: { ...v.br, [mode]: newBR },
      });
    }
  }

  // Sort surviving vehicles by BR descending, then rank descending
  survivingVehicles.sort((a, b) => (b.br[mode] ?? 0) - (a.br[mode] ?? 0) || b.rank - a.rank);

  // Check if all core target vehicles shifted up together
  const wereAtExactTarget = nationVehicles.filter((v) => {
    const c = changesMap.get(v.id);
    const oldBR = c ? Number(c.brBefore.toFixed(1)) : Number((v.br[mode] ?? 0).toFixed(1));
    return oldBR === roundedTarget;
  });

  const allShiftedTogether =
    wereAtExactTarget.length > 0 &&
    wereAtExactTarget.every((v) => {
      const c = changesMap.get(v.id);
      return c && c.direction === "nerf" && c.brAfter === wereAtExactTarget[0]?.br[mode];
    });

  let status: LineupEvaluation["status"];
  let statusMessage: string;

  if (allShiftedTogether && survivingVehicles.length === 0) {
    status = "shifted";
    statusMessage = `All anchor vehicles migrated together to ${wereAtExactTarget[0]?.br[mode].toFixed(1)}. Consider moving your whole lineup bracket up.`;
  } else if (droppedVehicles.length === 0 || newReinforcements.length >= droppedVehicles.length) {
    status = "survives";
    if (newReinforcements.length > 0) {
      statusMessage = `Lineup fortified! Gained ${newReinforcements.length} new vehicle(s) buffed down into ${roundedTarget.toFixed(1)}.`;
    } else {
      statusMessage = `Core ${roundedTarget.toFixed(1)} bracket untouched by the patch. All anchors intact.`;
    }
  } else if (survivingVehicles.length >= 3) {
    status = "weakened";
    statusMessage = `Lost ${droppedVehicles.length} vehicle(s) to higher BRs, but ${survivingVehicles.length} viable vehicles maintain the bracket.`;
  } else {
    status = "broken";
    statusMessage = `Critical anchor loss: Only ${survivingVehicles.length} vehicle(s) remain at or near ${roundedTarget.toFixed(1)}. Bracket lacks sufficient depth.`;
  }

  // Calculate simulated "What if I keep nerfed vehicles?" impact
  let simulatedMaxBR: number | undefined;
  let simulatedUptierMax: number | undefined;
  let simulatedExposedVehicles: Vehicle[] | undefined;

  if (droppedVehicles.length > 0) {
    simulatedMaxBR = Math.max(...droppedVehicles.map((v) => v.br[mode] ?? roundedTarget));
    const range = getMatchmakerRange(simulatedMaxBR);
    simulatedUptierMax = range.uptierMax;
    simulatedExposedVehicles = survivingVehicles;
  }

  // Nerfed patch changes for this lineup
  const nerfedVehicles = patchChanges.filter(
    (c) =>
      c.nation === nation &&
      c.mode === mode &&
      c.direction === "nerf" &&
      c.brBefore <= roundedTarget &&
      c.brAfter > roundedTarget
  );

  // Recommended replacements at exact targetBR from vehicles not already in surviving
  const survivingIds = new Set(survivingVehicles.map((v) => v.id));
  const recommendedReplacements = nationVehicles.filter(
    (v) =>
      !survivingIds.has(v.id) &&
      Number((v.br[mode] ?? 0).toFixed(1)) === roundedTarget
  ).slice(0, 6);

  return {
    nation,
    mode,
    targetBR: roundedTarget,
    status,
    statusMessage,
    survivalReason: statusMessage,
    nerfedVehicles,
    droppedVehicles,
    newReinforcements,
    survivingVehicles,
    recommendedReplacements,
    allLineupVehicles: [...survivingVehicles, ...newReinforcements],
    simulatedMaxBR,
    simulatedUptierMax,
    simulatedExposedVehicles,
  };
}

/**
 * Combined Arms Optimal Lineup Builder Engine
 * Selects the highest quality Ground + Close Air Support (CAS) lineup for any given BR,
 * maximizing anchor density, role coverage, and recent patch momentum.
 */
export function buildOptimalLineup(
  nation: Nation,
  mode: GameMode,
  targetBR: number,
  allVehicles: Vehicle[],
  patchChanges: BRChange[] = []
): OptimalLineup {
  const roundedTarget = Number(targetBR.toFixed(1));

  // Changes map for momentum
  const changesMap = new Map<string, BRChange>();
  for (const c of patchChanges) {
    if (c.mode === mode) changesMap.set(c.vehicleId, c);
  }

  const nationVehicles = allVehicles.filter((v) => v.nation === nation);

  // Ground candidates: within [targetBR - 0.3, targetBR]
  const groundClasses = new Set(["medium_tank", "heavy_tank", "light_tank", "spaa", "tank_destroyer"]);
  const groundCandidates = nationVehicles.filter((v) => {
    if (!groundClasses.has(v.vehicleClass)) return false;
    const br = Number((v.br[mode] ?? 0).toFixed(1));
    return br <= roundedTarget && Number((roundedTarget - br).toFixed(1)) <= 0.3;
  });

  // CAS candidates: aircraft and helicopters within [targetBR - 0.7, targetBR]
  const casClasses = new Set(["fighter", "strike_aircraft", "attacker", "helicopter"]);
  const casCandidates = nationVehicles.filter((v) => {
    if (!casClasses.has(v.vehicleClass)) return false;
    // For Ground RB, use split rbGround if present
    const br = Number(((mode === "rb" && v.br.rbGround !== undefined ? v.br.rbGround : v.br[mode]) ?? 0).toFixed(1));
    return br <= roundedTarget && Number((roundedTarget - br).toFixed(1)) <= 0.7;
  });

  // Sort ground candidates by BR descending, then rank descending, then premium bonus
  groundCandidates.sort((a, b) => {
    const brDiff = (b.br[mode] ?? 0) - (a.br[mode] ?? 0);
    if (brDiff !== 0) return brDiff;
    return b.rank - a.rank;
  });

  // Sort CAS candidates by effective Ground RB BR descending, then rank descending
  casCandidates.sort((a, b) => {
    const aBR = (mode === "rb" && a.br.rbGround !== undefined ? a.br.rbGround : a.br[mode]) ?? 0;
    const bBR = (mode === "rb" && b.br.rbGround !== undefined ? b.br.rbGround : b.br[mode]) ?? 0;
    const brDiff = bBR - aBR;
    if (brDiff !== 0) return brDiff;
    return b.rank - a.rank;
  });

  // Assemble balanced ground selection: up to 5 ground slots ensuring role diversity
  const selectedGround: Vehicle[] = [];
  const roleCheck: LineupRoleCheck = {
    hasMBT: false,
    hasLightScout: false,
    hasSPAA: false,
    hasTD: false,
    hasCAS: false,
  };

  // First pass: Pick best MBT/Medium/Heavy
  const mainBrawler = groundCandidates.find(
    (v) => v.vehicleClass === "medium_tank" || v.vehicleClass === "heavy_tank"
  );
  if (mainBrawler) {
    selectedGround.push(mainBrawler);
    roleCheck.hasMBT = true;
  }

  // Second pass: Pick best SPAA
  const bestSPAA = groundCandidates.find((v) => v.vehicleClass === "spaa");
  if (bestSPAA && !selectedGround.some((v) => v.id === bestSPAA.id)) {
    selectedGround.push(bestSPAA);
    roleCheck.hasSPAA = true;
  }

  // Third pass: Pick best Light Tank (Scouting / Flanking / SP reduction)
  const bestLight = groundCandidates.find((v) => v.vehicleClass === "light_tank");
  if (bestLight && !selectedGround.some((v) => v.id === bestLight.id)) {
    selectedGround.push(bestLight);
    roleCheck.hasLightScout = true;
  }

  // Fourth pass: Pick best Tank Destroyer / Sniper
  const bestTD = groundCandidates.find((v) => v.vehicleClass === "tank_destroyer");
  if (bestTD && !selectedGround.some((v) => v.id === bestTD.id)) {
    selectedGround.push(bestTD);
    roleCheck.hasTD = true;
  }

  // Fill remaining ground slots up to 5 with highest BR/quality vehicles
  for (const v of groundCandidates) {
    if (selectedGround.length >= 5) break;
    if (!selectedGround.some((item) => item.id === v.id)) {
      selectedGround.push(v);
      if (v.vehicleClass === "medium_tank" || v.vehicleClass === "heavy_tank") roleCheck.hasMBT = true;
      if (v.vehicleClass === "light_tank") roleCheck.hasLightScout = true;
      if (v.vehicleClass === "spaa") roleCheck.hasSPAA = true;
      if (v.vehicleClass === "tank_destroyer") roleCheck.hasTD = true;
    }
  }

  // Select up to 2 best CAS vehicles (e.g. 1 Strike/Attacker + 1 Air Superiority Fighter / Heli)
  const selectedCAS: Vehicle[] = [];
  for (const plane of casCandidates) {
    if (selectedCAS.length >= 2) break;
    selectedCAS.push(plane);
  }
  if (selectedCAS.length > 0) roleCheck.hasCAS = true;

  // Calculate Anchor Density: vehicles at exact targetBR
  const totalLineup = [...selectedGround, ...selectedCAS];
  const anchorCount = totalLineup.filter(
    (v) => Number((v.br[mode] ?? 0).toFixed(1)) === roundedTarget
  ).length;

  // Calculate Patch Momentum
  let patchMomentum = 0;
  for (const v of totalLineup) {
    const c = changesMap.get(v.id);
    if (c) {
      if (c.direction === "buff") patchMomentum += 1;
      if (c.direction === "nerf") patchMomentum -= 1;
    }
  }

  // Compute composite score (0-100)
  let score = 0;
  if (roleCheck.hasMBT) score += 10;
  if (roleCheck.hasSPAA) score += 10;
  if (roleCheck.hasLightScout) score += 8;
  if (roleCheck.hasCAS) score += 8;
  if (roleCheck.hasTD) score += 4;

  score += Math.min(30, anchorCount * 8);
  score += Math.min(20, totalLineup.length * 3);
  score += Math.max(-10, Math.min(10, patchMomentum * 5));

  const finalScore = Math.max(10, Math.min(100, score));

  // Check Ground RB split ratings among CAS vehicles
  const hasCASGroundBRSplit = mode === "rb" && selectedCAS.some((c) => c.br.rbGround !== undefined && c.br.rbGround !== c.br.rb);

  // Effective Lineup BR: max BR across all ground and CAS vehicles
  const vehicleEffectiveBRs = [
    ...selectedGround.map((v) => v.br[mode] ?? 0),
    ...selectedCAS.map((v) => (mode === "rb" && v.br.rbGround !== undefined ? v.br.rbGround : v.br[mode]) ?? 0),
  ];
  const effectiveBR = vehicleEffectiveBRs.length > 0 ? Math.max(...vehicleEffectiveBRs) : roundedTarget;

  // Strengths analysis
  const strengths: string[] = [];
  if (anchorCount >= 3) {
    strengths.push(`High Anchor Density: ${anchorCount} primary vehicles at exact ${roundedTarget.toFixed(1)} BR`);
  }
  if (roleCheck.hasSPAA) {
    strengths.push("Anti-Air Security: Dedicated SPAA protects from early CAS rushes");
  }
  if (roleCheck.hasLightScout) {
    strengths.push("Tactical Scouting: Light vehicle reduces CAS spawn costs via active scouting");
  }
  if (roleCheck.hasCAS) {
    strengths.push(`Air Superiority & CAS: ${selectedCAS.length} multirole aircraft ready`);
  }
  if (hasCASGroundBRSplit) {
    strengths.push("Aircraft Ground RB Rating: Tailored for combined arms matchmaker balance");
  }
  if (patchMomentum > 0) {
    strengths.push(`Patch Momentum: Boosted by ${patchMomentum} newly buffed vehicle(s)`);
  }

  // Slots construction
  const slots: OptimalLineup["slots"] = [];
  let mbtCount = 0;
  for (const v of selectedGround) {
    if ((v.vehicleClass === "medium_tank" || v.vehicleClass === "heavy_tank") && mbtCount < 2) {
      mbtCount++;
      slots.push({
        slotRole: `mbt_${mbtCount}`,
        roleLabel: `Main Battle Tank ${mbtCount}`,
        vehicle: v,
      });
    } else if (v.vehicleClass === "light_tank" && !slots.some((s) => s.slotRole === "light_scout")) {
      slots.push({
        slotRole: "light_scout",
        roleLabel: "Light Tank / Scout",
        vehicle: v,
      });
    } else if (v.vehicleClass === "spaa" && !slots.some((s) => s.slotRole === "spaa_sam")) {
      slots.push({
        slotRole: "spaa_sam",
        roleLabel: "SPAA / Air Defense",
        vehicle: v,
      });
    } else {
      slots.push({
        slotRole: `support_${slots.length + 1}`,
        roleLabel: "Support Vehicle",
        vehicle: v,
      });
    }
  }

  for (const c of selectedCAS) {
    if (c.vehicleClass === "helicopter" && !slots.some((s) => s.slotRole === "helicopter")) {
      slots.push({
        slotRole: "helicopter",
        roleLabel: "Attack Helicopter",
        vehicle: c,
      });
    } else if (!slots.some((s) => s.slotRole === "cas_aircraft")) {
      slots.push({
        slotRole: "cas_aircraft",
        roleLabel: "CAS Strike Aircraft",
        vehicle: c,
      });
    } else {
      slots.push({
        slotRole: `air_support_${slots.length + 1}`,
        roleLabel: "Air Superiority Fighter",
        vehicle: c,
      });
    }
  }

  const matchmakerRange = {
    min: Number(Math.max(1.0, effectiveBR - 1.0).toFixed(1)),
    max: Number((effectiveBR + 1.0).toFixed(1)),
  };

  const summary = `Tactically balanced ${formatBR(effectiveBR)} lineup with ${selectedGround.length} ground armor and ${selectedCAS.length} air support units.`;

  return {
    nation,
    mode,
    targetBR: roundedTarget,
    effectiveBR,
    hasCASGroundBRSplit,
    score: finalScore,
    synergyScore: finalScore,
    groundVehicles: selectedGround,
    casVehicles: selectedCAS,
    slots,
    matchmakerRange,
    roleCompleteness: roleCheck,
    anchorDensity: anchorCount,
    patchMomentum,
    strengths,
    summary,
  };
}
