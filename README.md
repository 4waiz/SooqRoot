# SooqRoot

**One order. Many farms. Confirmed before harvest.**

SooqRoot is an Arabic-first AI-assisted farm-to-market coordination platform that helps buyers place advance produce demand, helps farmers understand what the market needs, pools nearby farms when one farm cannot meet volume alone, and allocates orders before harvest.

Built for the UAE agriculture innovation hackathon.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- lucide-react icons
- recharts for impact charts
- No backend, no API keys, no external AI — all logic runs locally with rule-based simulation

## Run

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (default `http://localhost:5173`).

For a production build:

```bash
npm run build
npm run preview
```

## Features

- **Arabic-first** UI with one-click toggle to English (layout flips RTL ↔ LTR).
- **Dark / light mode** toggle with logo auto-swap.
- **Role selector** — Buyer / Farmer / Operator — each with its own dashboard.
- **Buyer dashboard**
  - Free-text demand input
  - AI demand translator (local rule-based parser with interpretation, confidence, reasoning)
  - Structured demand table
  - Order status tracker (Request → Delivered)
  - Buyer metrics (local sourcing, shortfall, waste risk reduction)
  - Buyer spec cards for each major product
- **Farmer dashboard**
  - Farm profile card
  - Supply declaration form
  - Arabic-first farmer copilot chat (advises on pool joining, grade, packaging, harvest timing)
  - Harvest instruction cards
  - Quality & packaging guide for vegetables / fish / honey
- **Operator dashboard**
  - Demand pool with per-order allocation
  - Rule-based allocation engine (grade match → confidence → location → distance)
  - Splits orders across multiple farms, with shortfall detection
  - Backup farms and substitute advisor
  - AI fulfillment risk score (with reasons and mitigations)
  - Farm supply pool
  - Local sourcing tracker
  - Batch passport modal with QR-style traceability card
  - Manual status advancement
- **Field Validation** page — voice of vegetable, fish, and honey producers
- **Impact / Investor dashboard** — realistic pilot numbers + charts
- **Business Model** page — full BMC summary
- **Pitch Mode** page — problem / solution / how / demo / why now / model / impact / final

All state persists to `localStorage`. Use the "reset" button in the header to restore the demo seed data.

## File map

```
public/
  darklogo.png          (used in light mode)
  lightlogo.png         (used in dark mode)
src/
  types.ts
  data/seed.ts          (farms, buyers, seed demands, impact stats)
  i18n/translations.ts  (full AR + EN dictionary)
  lib/
    ai.ts               (parseDemandText, generateFarmerAdvice, risk, substitutes, harvest)
    allocation.ts       (rule-based allocation engine + metrics)
    storage.ts
  context/AppContext.tsx
  components/
    ui/                 (Button, Card, Badge, Input, Modal, StatCard, EmptyState, FallbackImage)
    layout/             (AppShell, Header, Footer)
    landing/            Landing.tsx
    buyer/              BuyerDashboard.tsx + pieces
    farmer/             FarmerDashboard.tsx + pieces
    operator/           OperatorDashboard.tsx + pieces
    fieldvalidation/    FieldValidation.tsx
    impact/             ImpactDashboard.tsx
    business/           BusinessModel.tsx
    pitch/              PitchMode.tsx
```

## Demo script (60 seconds)

1. Start on the landing page → click **Enter Demo as Buyer**.
2. Buyer pastes the placeholder demand → click **Translate Demand with AI** → structured lines appear with interpretation + confidence.
3. Click **Submit Demand to Allocation** → auto-jumps to Operator.
4. On Operator, click **Run Allocation** on any order → allocation splits across Al Akhdar / Desert Leaf / Oasis Fresh; any shortfall shows backup farms and substitute suggestions; risk card reveals reasons and mitigations.
5. Open a **Batch Passport** from any allocation row.
6. Switch role to **Farmer**, pick Al Akhdar → see harvest instructions from the allocation; ask the Arabic Copilot _"I have 300kg tomatoes next week"_ and watch it reference open demand.
7. Browse **Impact**, **Business Model**, and **Pitch Mode** tabs.

**SooqRoot helps farmers sell smarter, not alone.**
