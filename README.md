# WT // NOTHING — War Thunder Battle Rating & Lineup Intelligence

> Pure Nothing OS minimalism meets authoritative, datamine-verified War Thunder Battle Rating analytics.

🌐 **Live Application:** [https://n0-0one.github.io/WT-BR-Analyst/](https://n0-0one.github.io/WT-BR-Analyst/)

---

## Overview

**WT // NOTHING** (WT BR Analyst) is an autonomous tactical intelligence platform engineered for War Thunder players. Instead of messy military radar clutter or guessed statistics, it brings pure Nothing Phone / Nothing OS 3.0 industrial design to the game's battle rating economy.

The platform provides mathematically exact 40-step discrete Battle Rating analysis, matchmaker black hole gravitational tracking, anchor-preserving lineup survival checks, and combined arms lineup building across all 10 in-game nations (USA, Germany, USSR, Great Britain, Japan, China, Italy, France, Sweden, and Israel).

---

## Key Features

- **Discrete BR Step Engine:** War Thunder Battle Ratings do not follow continuous decimal math—they move in 40 discrete steps (`economicRank` 0 to 39 from 1.0 to 14.0). All calculations compute true step index differences (e.g. 7.0 &rarr; 7.3 is +1 step; 7.3 &rarr; 7.7 is also +1 step; 7.0 &rarr; 7.7 is +2 steps).
- **Matchmaker Black Hole & Impact Scorer:** Ranks every patch shift from 0 to 100. Pinpoints high-population brackets (3.7, 5.7, 6.7, 8.7, 10.3, 11.7, 13.0) that pull `-1.0 BR` vehicles into constant full uptiers, instantly distinguishing true Meta Winners (escaping a black hole) from Meta Losers (dragged into one).
- **Anchor-Preserving Lineup Survival Checker:** When vehicles in your 10.3 or 9.0 lineup get nerfed to a higher BR, experienced players drop the nerfed vehicle rather than dragging four lower-tier tanks into harsh uptiers. The engine classifies lineups into *Survives*, *Weakened*, *Shifted*, or *Broken*.
- **"What If I Keep Nerfed Vehicles?" Simulator:** Toggleable simulator mode revealing how retaining nerfed vehicles shifts your squad's matchmaking ceiling and exposes your surviving roster to severe full uptiers.
- **Combined Arms Optimal Lineup Builder:** Synthesizes the highest-scoring Ground roster (MBTs, Light Scouts, SPAA, and Tank Destroyers) paired with Close Air Support (CAS strike aircraft, fighters, and attack helicopters) within optimal BR spreads.
- **Pure Nothing OS 3.0 Aesthetic:** Pitch-black OLED background (`#000000`), bento card surfaces (`#121214`), subtle dot-matrix patterns, pill controls, monospace telemetry typography, and signature Nothing Red (`#D71921`) accents.

---

## How Data Stays Accurate (Zero Hallucinations)

Data integrity is handled autonomously:

1. **Official Game Datamine Verification:** Vehicle parameters and economic ranks are extracted directly from `gszabi99/War-Thunder-Datamine` (`char.vromfs.bin_u/config/wpcost.blkx` and `lang.vromfs.bin_u/lang/units.csv`).
2. **Planned Changes Scraper:** Planned BR adjustments are sourced from official War Thunder Forum announcements and Gaijin's published spreadsheets.
3. **Autonomous 6-Hour Pipeline:** A GitHub Actions workflow (`.github/workflows/autonomous-sync-deploy.yml`) runs every 6 hours, re-syncs datasets, executes the full Vitest suite, builds the static export, and deploys directly to GitHub Pages.

---

## Architecture & Tech Stack

```text
├── .github/workflows/
│   └── autonomous-sync-deploy.yml   # 6h cron sync, vitest, and GitHub Pages deployment
├── data/
│   ├── vehicles.json                # Verified vehicle database across all 10 nations
│   ├── index.json                   # Patch index metadata
│   └── br-changes/latest-patch.json # Enriched BR adjustments with impact scoring
├── public/
│   ├── .nojekyll                    # Ensures GitHub Pages serves _next/ assets
│   └── placeholders/                # Minimal Nothing OS dot-matrix SVG silhouettes
├── scripts/
│   ├── sync-wt-data.ts              # Datamine sync pipeline
│   └── scrape-br-changes.ts         # Forum & spreadsheet BR scraper
├── src/
│   ├── types/                       # Strict TypeScript interfaces
│   ├── lib/
│   │   ├── br-engine.ts             # 40-step discrete BR math & matchmaker spread logic
│   │   ├── impact-scorer.ts         # Black hole gravity & winner/loser ranking engine
│   │   ├── lineup-engine.ts         # Lineup survival & combined arms builder
│   │   └── data-loader.ts           # Type-safe build & client data provider
│   ├── components/
│   │   ├── layout/                  # Floating pill header, footer
│   │   ├── ui/                      # Bento cards, telemetry gauges, segmented pills
│   │   ├── vehicles/                # Vehicle cards, image fallback, filter bars
│   │   ├── lineups/                 # Lineup survival view, builder view, simulator toggle
│   │   └── diff/                    # Raw changelog diff comparison table
│   └── app/                         # Next.js 14 App Router routes & static pages
└── tests/
    ├── br-engine.test.ts            # Discrete step and index math unit tests
    ├── impact-scorer.test.ts        # Gravity and score validation
    └── lineup-engine.test.ts        # Survival classification & combined arms builder tests
```

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/n0-0one/WT-BR-Analyst.git
cd WT-BR-Analyst

# Install dependencies
npm install

# Run verified data synchronization
npm run sync-data
npm run scrape-changes

# Run unit tests
npm run test

# Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Static Production Build

```bash
npm run build
```

The static HTML/CSS/JS export is generated in the `out/` directory, ready to be hosted on any static web host or GitHub Pages.
