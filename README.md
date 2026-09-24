# SooqRoot

**The Procurement Operating System for UAE Local Food**

> One Order. Many Farms. Confirmed Before Harvest.

SooqRoot converts commercial buyer demand into pre-harvest commitments across UAE farms,
intelligently coordinates fulfilment, and gives buyers auditable proof of local sourcing.

```
BUYER DEMAND → SOOQROOT → FARM NETWORK → PRE-HARVEST COMMITMENT → FULFILMENT → PROOF
```

2nd place, Universities Hackathon: Farm to Market.

---

## This repository is a demonstration build

There is **no database and no backend**. Everything runs in the browser against a typed,
centrally maintained demo dataset under `src/data/`. Every farm, buyer, volume, price and
impact figure is illustrative and was authored for demonstration, a **Demo Data** indicator
is visible throughout the interface, and Settings has a **Reset demo data** control.

Sign-in is a demo gate, not a secure authentication service.

| | |
|---|---|
| Username | `Awaiz` |
| Password | `123` |

The session lives in `sessionStorage` (closing the tab signs you out). Interface state and
anything you create during a demo persists to `localStorage` so a demo survives a refresh.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type check + production build into dist/
npm run preview  # serve the production build
```

---

## What is in the product

| Area | Page | What it does |
|---|---|---|
| Overview | Control Tower | Network position: local procurement share, open commitments, match rate, at-risk orders, the farm/buyer network canvas, exceptions and upcoming harvests |
| Procurement | Buyer Demand | Structured demand builder plus the **AI Demand Translator**, which reads a buyer's plain sentence and produces a commitable demand record |
| | Procurement Cycles | Demand → Commitment → Harvest → Fulfilment → Proof, per window |
| | Orders | The full order book with commitment coverage, value and delivery dates |
| | Commitment Engine | Deterministic pre-harvest allocation across the farm network |
| Supply Network | Farms / Farm profile | Capacity, harvest windows, grade probability, fulfilment history, certifications |
| | Supply Digital Twin | Live model of what the network can deliver and which demand it already carries |
| | Harvest Calendar | Every scheduled field operation behind the live commitments |
| Operations | Exceptions | Shortfalls, capacity, quality, logistics and weather, each with a recommended action |
| | Fulfilment | Harvest → grading → packing → collection → consolidation → delivery |
| | Batch Passports | Auditable per-batch proof of origin, custody and impact |
| Intelligence | Local Procurement Index | The measured local share of buyer spend against target |
| | Analytics | Commitments, fill rate, farmgate income, producer performance |
| | Sustainability Impact | CO₂e avoided, water saved, food miles, farmgate income |
| Communication | Farmer Copilot | Commitments and harvest instructions to farms over WhatsApp/SMS, in Arabic or English |
| System | Demo Scenario | An eight-step run sheet for presenting the product |
| | Recognition | Awards, engagements and network milestones |
| | Settings | Profile, appearance and demo data controls |

---

## The commitment engine

`src/lib/engine.ts` is the core of the product and is **fully deterministic**, the same
inputs always produce the same commitment pack, with no randomness anywhere in the
allocation path.

For a given order it scores every harvest window in the network on seven weighted signals:

| Signal | Weight |
|---|---|
| Reliability index | 22% |
| Historical fulfilment | 20% |
| Grade compatibility | 18% |
| Collection distance | 14% |
| Harvest date fit | 12% |
| Packaging capability | 8% |
| Uncommitted headroom | 6% |

It then allocates under four explicit rules:

- **Freshness gate**, a harvest window closing more than one product shelf life before the
  delivery date cannot serve the order at all.
- **Primary gate**, a farm whose window closes after the delivery date, or whose grade
  probability is under 60%, is held as backup cover rather than primary supply.
- **Concentration limit (23%)**, no single farm carries more than 23% of one order, but
  never less than an even split across the eligible pool, so the cap can never cause an
  under-fill.
- **Backup cover limit (5%)**, no single backup farm stands behind more than 5% of an
  order. Backup cover is contingent and does not consume network capacity.

The demo order book in `src/data/orders.ts` is built by running this engine against a
working copy of the farm network, so two orders can never commit the same kilogram twice and
`expected harvest = committed + reserve + available` holds for every farm on every screen.

---

## Stack

Vite 5 · React 18 · TypeScript · Tailwind CSS 3 · Recharts · lucide-react · React Router
(hash routing, so the build runs from any static host with no rewrite rules).

## Deployment

Pushes to `main` build and publish to GitHub Pages via `.github/workflows/deploy.yml`.
`vite.config.ts` sets `base: './'`, so the same build also runs from a domain root or any
other static host.
