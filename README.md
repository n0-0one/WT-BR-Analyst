# WAR THUNDER // BR ANALYST — Battle Rating & Lineup Intelligence

> Authoritative, datamine-verified War Thunder Battle Rating Ecosystem Analyzer & Lineup Intelligence Platform with StatShark Post-Patch Telemetry & 100% Vehicle Imagery.

🌐 **Live Application:** [https://n0-0one.github.io/WT-BR-Analyst/](https://n0-0one.github.io/WT-BR-Analyst/)

---

## Overview

**WAR THUNDER // BR ANALYST** is a tactical intelligence web application built for War Thunder players. Designed with an authentic **War Thunder Hangar & Research Tree** visual design system, it provides deep mathematical insights into Gaijin's Battle Rating decompressions, matchmaker shifts, opponent threat pools, and lineup preservation.

Powered by a complete database of **3,354 verified playable vehicles** ingested directly from official datamined game files (`wpcost.blkx` and `units.csv`), the platform analyzes true matchmaking dynamics across all 10 in-game nations (USA, Germany, USSR, Great Britain, Japan, China, Italy, France, Sweden, and Israel) and across all game modes (Ground RB Combined, Air RB, Arcade, Simulator).

---

## Key Features

### 1. 100% Vehicle Image Coverage (Resilient 5-Stage Multi-CDN Cascade)
- Never displays broken `<img>` icons or missing image boxes.
- Implements a resilient 5-tier image cascade:
  1. **Primary Datamine Unit Icons:** High-fidelity texture renders from `tex.vromfs.bin_u/${folder}/${imageId}.png` (`tanks/`, `aircrafts/`, `ships/`).
  2. **War Thunder Encyclopedia CDN:** `https://static.encyclopedia.warthunder.com/images/${imageId}.png`.
  3. **Official WT Static Files CDN:** `https://staticfiles.warthunder.com/upload/image/!_wiki_images/unit_cards/${imageId}.png`.
  4. **WT Vehicles API Mirror:** `https://www.wtvehiclesapi.sgambe.serv00.net/assets/images/${imageId}.png`.
  5. **SVG Vector Silhouette Fallbacks:** Custom, high-contrast silhouette vectors for Tanks, SPAAs, Aircraft, Helicopters, and Ships.

### 2. Post-Patch Statistical Telemetry (StatShark Style)
- Integrates post-decompression empirical performance telemetry:
  - **Win Rate Shifts:** `winRateAfter% (+winRateDelta% ▲ / -winRateDelta% ▼)`
  - **K/D Ratio Shifts:** `kdAfter (+kdDelta / -kdDelta)`
  - **Battle Sample Size & Confidence:** High-confidence battle tracking.
  - **Telemetry Source Badges:** Transparently labeled as StatShark / Community Post-Patch Telemetry.

### 3. Tactical Meta-Wall & Weapon System Detector
- Detects the true combat realities behind BR shifts:
  - ⚡ **Fox-3 / ARH Missile Wall (13.7–14.0 Air RB):** Identifies 12.0–13.0 fighters (e.g., `F-2A ADTW`, `F-16A`, `Mirage 2000C`) that escaped constant Active Radar Homing missile spam when top tier decompressed to 14.0+.
  - 🎯 **Top-Tier SAM Radar Belt (12.0–12.7 Ground RB):** Identifies strike aircraft trapped under Pantsir-S1 and Buk-M3 search envelopes.
  - 🛡️ **13.3 Ground Decompression Ceiling:** Identifies 11.7–12.0 MBTs (e.g., `Challenger 2 OES`, `Type 90B Fuji`, `M1A1 Click-Bait`) whose nominal BR climbed, but who became indirect winners because top predators moved to 13.3.
  - 👑 **Untouched Anchor Kings:** Highlights vehicles whose BR stayed stationary while former apex counters climbed away (e.g., `T-80UD`, `F-5E`).
  - ⚠️ **Matchmaker Compression Victims:** Warns players when vehicles cross major technological thresholds (e.g. 9.3 &rarr; 9.7 thermal/LRF/missile barriers).

### 4. Community Meta Intelligence (YouTube, Reddit & Forums)
- Synthesizes consensus verdicts and analytical quotes from:
  - 🎥 Top War Thunder creators & video breakdown analyses
  - 💬 Reddit `r/Warthunder` meta discussions
  - 📜 Official War Thunder Forums planned changes feedback
- Explains the "why" behind the numbers in authentic player terminology.

### 5. Authentic War Thunder Hangar & Tech-Tree UI
- **Hangar Deep Slate Palette:** `#11161D` primary background with elevated `#171E27` and `#1E2733` panels and `#2E4259` borders.
- **Crew Slot Cards:** Realistic vehicle slots with custom borders for Tech Tree (`#2E4259`), Premium Gold (`#D49B27`), Squadron Green (`#2E6F40`), and Event Plum (`#6E3B64`).
- **War Thunder Action Amber CTA:** `#E65100` to `#F57C00` button gradients and Golden Eagle `#F5B841` highlights.
- **Roman Numerals:** Authentic Rank badges (`Rank I` through `Rank VIII`).

### 6. Full ~3,354 Vehicle Tech-Tree Browser
- Browse the entire War Thunder roster across all 10 nations and 4 branches (Army, Aviation, Helicopters, Fleet).
- Filter by Nation, Branch, Rank (I–VIII), and Slot Type (Tech Tree, Premium, Squadron, Event).
- Butter-smooth 60 FPS client pagination (36 per page) and instant live search.

### 7. Matchmaker Ecosystem Analyzer & Window Bar
- Visual representation of `[Floor -1.0 BR] ◄── [Vehicle BR] ──► [Ceiling +1.0 BR]` tracking exact numbers of escaped threats, added threats, lost prey, and gained prey.
- **Ground RB Aircraft Split BR Support:** Explicitly models separate Air RB and Ground RB battle ratings (e.g., `A-10A Early` at 10.3 Air RB vs. 10.7 Ground RB).

### 8. Lineup Survival Checker & Combined Arms Builder
- Analyzes whether your preset (e.g., USSR 10.3 or Germany 6.7) survives a patch without unwanted uptiers.
- **"What If I Keep Nerfed Vehicles?" Simulator:** Reveals the true cost of keeping an uprated vehicle—dragging lower-tier tanks into severe uptiers against apex predators.
- **Recommended Lineup Replacements:** Automatically identifies in-bracket alternatives from the 3,354-vehicle database to rescue broken lineups.
- **Optimal CAS & SPAA Synergies:** Builds balanced combined arms lineups with 0–100 synergy ratings.

---

## Automated Multi-Source Pipeline (Zero Hallucinations)

Data is synchronized automatically through a multi-tier pipeline:

1. **`scripts/sync-all-vehicles.ts`:**
   - Ingests raw `wpcost.blkx` (3,471 raw entities) from `gszabi99/War-Thunder-Datamine`.
   - Ingests localized English names and vehicle roles from `units.csv` (4,000+ entries).
   - Generates verified `data/vehicles.json` containing 3,389 playable vehicles with exact AB, RB, SB, and Ground RB split ratings.
2. **`scripts/scrape-forum.ts`:**
   - Scrapes official Gaijin forum announcements (`Planned Battle Rating Changes`).
   - Cross-references vehicle IDs against `data/vehicles.json` using exact keys and fuzzy resolvers.
   - Computes pre-patch vs. post-patch ecosystem shifts using `src/lib/impact-scorer.ts`.
3. **Autonomous GitHub Actions (`.github/workflows/autonomous-sync-deploy.yml`):**
   - Runs every 6 hours (`cron: '0 */6 * * *'`), on every push to `main`, and via manual dispatch.
   - Re-syncs data, runs Vitest tests, builds the static export, and deploys to `gh-pages`.

---

## Project Structure

```text
├── .github/workflows/
│   └── autonomous-sync-deploy.yml   # 6h cron sync, test suite & GitHub Pages deploy
├── data/
│   ├── vehicles.json                # Complete 3,389 verified vehicle database
│   ├── index.json                   # Patch metadata
│   └── br-changes/latest-patch.json # Enriched BR adjustments with ecosystem shifts
├── scripts/
│   ├── sync-all-vehicles.ts         # Datamine ingestion script (wpcost.blkx + units.csv)
│   ├── fetch-community-and-stats.ts # StatShark telemetry & community meta intelligence enricher
│   └── scrape-forum.ts              # Forum scraping and ecosystem analysis script
├── src/
│   ├── types/                       # Strict TypeScript interfaces (Telemetry, MetaWall, etc.)
│   ├── lib/
│   │   ├── br-engine.ts             # 43-step discrete BR math (WT_BR_TABLE) & split rating helpers
│   │   ├── meta-intelligence.ts     # Tactical Meta-Wall, StatShark telemetry & community consensus engine
│   │   ├── impact-scorer.ts         # Matchmaker ecosystem analyzer (threats & categories)
│   │   ├── lineup-engine.ts         # Lineup survival & combined arms builder
│   │   ├── constants.ts             # Nations, branches, Roman numerals, CDN image resolvers
│   │   └── data-loader.ts           # Type-safe vehicle & patch data provider
│   ├── components/
│   │   ├── layout/                  # WTHeader (Hangar nav & mode switcher), Footer
│   │   ├── vehicles/                # VehicleSlotCard & VehicleImage (5-stage multi-CDN cascade)
│   │   ├── infographics/            # HeatmapWidget, MatchmakerWindowBar, MatchmakerInspectorModal
│   │   └── views/                   # 5 primary analytical views (Overview, Winners/Losers, Tech-Tree, Lineups, Changelog)
│   └── app/                         # Next.js 14 App Router routes & static export pages
└── tests/
    ├── br-engine.test.ts            # Discrete step index tests (1.0 to 15.0)
    ├── meta-intelligence.test.ts    # Meta-walls, StatShark telemetry & 5-stage CDN tests
    ├── impact-scorer.test.ts        # Ecosystem shift & category classification tests
    └── lineup-engine.test.ts        # Lineup survival & Ground RB split rating tests
```

---

## Local Development & Testing

```bash
# Clone the repository
git clone https://github.com/n0-0one/WT-BR-Analyst.git
cd WT-BR-Analyst

# Install dependencies
npm install

# Run verified data ingestion
npm run sync-data
npm run scrape-changes

# Run automated Vitest suite
npm run test

# Launch local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build

```bash
# Build static export into /out
npm run build
```

---

## License

MIT License. War Thunder vehicle names, assets, and statistics are property of Gaijin Entertainment.
