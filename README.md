# WAR THUNDER // BR ANALYST — Battle Rating & Lineup Intelligence

> Authoritative, datamine-verified War Thunder Battle Rating Ecosystem Analyzer & Lineup Intelligence Platform.

🌐 **Live Application:** [https://n0-0one.github.io/WT-BR-Analyst/](https://n0-0one.github.io/WT-BR-Analyst/)

---

## Overview

**WAR THUNDER // BR ANALYST** is a tactical intelligence web application built for War Thunder players. Designed with an authentic **War Thunder Hangar & Research Tree** visual design system, it provides deep mathematical insights into Gaijin's Battle Rating decompressions, matchmaker shifts, opponent threat pools, and lineup preservation.

Powered by a complete database of **3,389 vehicles** ingested directly from official datamined game files (`wpcost.blkx` and `units.csv`), the platform analyzes true matchmaking dynamics across all 10 in-game nations (USA, Germany, USSR, Great Britain, Japan, China, Italy, France, Sweden, and Israel) and across all game modes (Realistic, Arcade, Simulator).

---

## Key Features

### 1. Authentic War Thunder Hangar & Tech-Tree UI
- **Hangar Deep Slate Palette:** `#11161D` primary background with elevated `#171E27` and `#1E2733` panels and `#2E4259` borders.
- **Crew Slot Cards:** Realistic vehicle slots with custom borders for Tech Tree (`#2E4259`), Premium Gold (`#D49B27`), Squadron Green (`#2E6F40`), and Event Plum (`#6E3B64`).
- **War Thunder Action Amber CTA:** `#E65100` to `#F57C00` button gradients and Golden Eagle `#F5B841` highlights.
- **Roman Numerals:** Authentic Rank badges (`Rank I` through `Rank VIII`).

### 2. Matchmaker Ecosystem Analyzer (Video-Style Infographics)
- **4 Analytical Categories:**
  - 🟢 **Direct Winners:** Vehicles receiving direct BR reductions with improved matchmaking.
  - 🔷 **Buffs in Disguise (Decompression Kings):** Vehicles whose BR increased (e.g. 11.7 &rarr; 12.0), but who won because the ceiling decompressed to 12.7 / 13.3, pushing dozens of apex predators completely out of reach.
  - 👑 **Untouched Winners:** Vehicles with unchanged BRs while the bracket above them moved up.
  - 🔴 **Biggest Losers:** Vehicles compressed or uprated into new hostile threat brackets.
- **Matchmaker Window Bar:** Visual representation of `[Floor -1.0 BR] ◄── [Vehicle BR] ──► [Ceiling +1.0 BR]` tracking exact numbers of escaped threats, added threats, lost prey, and gained prey.
- **Matchmaker Inspector Modal:** Click any vehicle to inspect its full specs, official Wiki link, and complete opponent threat pool.
- **Ground RB Aircraft Split BR Support:** Explicitly models separate Air RB and Ground RB battle ratings (e.g., A-10A Early at 10.3 Air RB vs. 10.7 Ground RB).

### 3. Full ~3,389 Vehicle Tech-Tree Browser
- Browse the entire War Thunder roster across all 10 nations and 4 branches (Army, Aviation, Helicopters, Fleet).
- Filter by Nation, Branch, Rank (I–VIII), and Slot Type (Tech Tree, Premium, Squadron, Event).
- Butter-smooth 60 FPS client pagination (36 per page) and instant live search.

### 4. Interactive Decompression & Density Heatmap
- Visualizes vehicle distribution and decompression shifts across all 43 discrete Battle Rating steps (1.0 to 15.0).
- Hover over any BR bucket to inspect vehicle counts and active patch shifts.

### 5. Lineup Survival Checker & BR Drag Simulator
- Analyzes whether your preset (e.g., USSR 10.3 or Germany 6.7) survives a patch without unwanted uptiers.
- **"What If I Keep Nerfed Vehicles?" Simulator:** Reveals the true cost of keeping an uprated vehicle—dragging lower-tier tanks into severe uptiers against apex predators.
- **Recommended Lineup Replacements:** Automatically identifies in-bracket alternatives from the 3,389-vehicle database to rescue broken lineups.

### 6. Combined Arms Lineup Builder
- Synthesizes optimal Ground + CAS lineups (MBTs, Light Tanks / Scouts, SPAA / Air Defense, and Strike Aircraft).
- Accounts for separate Ground RB aircraft ratings and evaluates combined arms synergy (0–100 score).

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
│   └── scrape-forum.ts              # Forum scraping and ecosystem analysis script
├── src/
│   ├── types/                       # Strict TypeScript interfaces
│   ├── lib/
│   │   ├── br-engine.ts             # 43-step discrete BR math & split rating helpers
│   │   ├── impact-scorer.ts         # Matchmaker ecosystem analyzer (threats & categories)
│   │   ├── lineup-engine.ts         # Lineup survival & combined arms builder
│   │   ├── constants.ts             # Nations, branches, Roman numerals, CDN image resolvers
│   │   └── data-loader.ts           # Type-safe vehicle & patch data provider
│   ├── components/
│   │   ├── layout/                  # WTHeader (Hangar nav & mode switcher), Footer
│   │   ├── vehicles/                # VehicleSlotCard (standard/premium/squadron/event)
│   │   ├── infographics/            # HeatmapWidget, MatchmakerWindowBar, MatchmakerInspectorModal
│   │   └── views/                   # 5 primary analytical views (Overview, Winners/Losers, Tech-Tree, Lineups, Changelog)
│   └── app/                         # Next.js 14 App Router routes & static export pages
└── tests/
    ├── br-engine.test.ts            # Discrete step index tests (1.0 to 15.0)
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
