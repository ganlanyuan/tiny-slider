# হক ক্রোকারিজ — Hok Crockeries

Distribution, inventory, sales-rep and accounts management for a crockery &
houseware wholesaler. Stock into the store, stock out to reps, sales in the
market, cash back to the office, and the month's expenses — all on one ledger
that reconciles.

The owner's purchase price is visible **only** to the owner. It is removed at
the API boundary, not hidden in the UI.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then set AUTH_SECRET to a long random string
npm run seed                   # creates the owner account + demo data
npm run dev                    # http://localhost:3000
```

`npm run seed` prints the sign-in credentials it created. Re-run it with
`npm run seed:reset` to wipe and reseed.

### Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `AUTH_SECRET` | yes | Signs session JWTs. At least 32 characters. |
| `DATA_DIR` | no | Where `db.json` lives. Defaults to `.data`. |
| `SEED_ADMIN_PHONE` | no | Owner login for the seeder. Defaults to `01700000000`. |
| `SEED_ADMIN_PASSWORD` | no | Owner password for the seeder. Defaults to `admin1234`. |

**Change the seeded passwords before putting this in front of real users.**

---

## The four roles

| Role | Bangla | Sees | Can do |
| --- | --- | --- | --- |
| **Owner / Admin** | মালিক | Everything, including purchase price and profit | Appoint staff, pay salaries, set prices, everything below |
| **Manager** | ম্যানেজার | Everything **except** purchase cost and profit | Run the store, issue challans, receive deposits, book expenses, approve demand |
| **Sales Rep** | এসআর | Only their own stock, invoices and cash | Sell at the SR rate, raise demand, deposit cash |
| **Dealer** | ডিলার | Catalogue with market price and availability | Nothing — read-only |

Permissions are named capabilities in `src/lib/permissions.ts`. Every API route
checks one; the navigation and UI read the same list, so they cannot drift apart.

### How the purchase price stays private

`cost.view` belongs to the owner alone. Without it:

- `costPrice` is **deleted** from every product record before the response is
  sent — the key is absent, not zero.
- Profit, margin, cost of goods sold and stock-at-cost are omitted from finance
  summaries and reports.
- Purchase-cost columns and totals are dropped from store-intake records.
- `PRODUCT` expense lines are excluded entirely, because a supplier invoice
  total is the purchase price in aggregate.
- A manager recording a delivery enters quantities only; any unit cost they
  submit is discarded server-side and the owner's standing price is used for
  valuation.

---

## The three prices

Every product carries three, and they serve different audiences:

| Price | Bangla | Who sees it |
| --- | --- | --- |
| Purchase price | কেনা মূল্য | Owner only |
| SR rate | এসআর রেট | Everyone signed in — the rate reps charge shops |
| Market price | বাজার দর | Everyone signed in — suggested retail |

---

## How stock moves

```
supplier ──► Store intake ──► SR challan ──► Sale ──► delivered
                  │                │            │
                  │                └──► Return ──┘
                  └──► PRODUCT expense (owner-only)
```

Nothing edits stock directly. The ledger is derived from the documents, so the
numbers always add up:

```
in store  = received − assigned + returned
with SRs  = assigned − returned − sold
on hand   = in store + with SRs
```

Two rules are enforced server-side, not just in the form:

- A challan cannot hand out more than the store physically holds.
- A rep cannot invoice goods that are not in their van.

A cancelled invoice returns its goods to the rep's stock and is excluded from
every total.

## How money moves

```
Sale total ──► cash collected by rep ──► deposit to office
     │                   │
     └──► market due     └──► cash in hand = collected − deposited
```

`cash in hand` and `market due` are running, all-time figures. They do not reset
when the month changes, because a rep's pocket does not empty on the 1st.

---

## Importing your product list

Products → **Import list**. Accepts JSON (a bare array, or `{"products": [...]}`),
CSV, TSV or a pasted spreadsheet. Drop a file or paste the text.

Column names are matched loosely, in English or Bangla — case, spaces and
underscores are ignored, so `Purchase Price`, `cost` and `ক্রয়মূল্য` all land in
the same field. Bengali digits (`১২৫০`) and currency prefixes (`৳ 1,250.50`,
`Tk. 99`) are converted automatically. Unrecognised columns are listed back to
you rather than silently dropped.

Only `name` is required. Recognised fields: `sku`, `name`, `nameBn`, `category`,
`unit`, `costPrice`, `srPrice`, `marketPrice`, `stock`, `lowStockThreshold`,
`imageUrl`, `description`, `brand`.

**Preview first.** The importer runs a dry run against the real data and shows
exactly which rows would be created, updated or skipped, and which categories
would be new. Nothing is written until you confirm.

```json
[
  {
    "sku": "HC-1001",
    "name": "Dinner Plate 10\"",
    "nameBn": "ডিনার প্লেট ১০ ইঞ্চি",
    "category": "Plates & Bowls",
    "unit": "dozen",
    "costPrice": 540,
    "srPrice": 720,
    "marketPrice": 950,
    "brand": "Monno"
  }
]
```

Opening stock from a price list is recorded as a figure only. Real stock still
arrives through a store-intake entry, which is what the ledger counts.

---

## Screens

| Screen | Bangla | What it is for |
| --- | --- | --- |
| Overview | ওভারভিউ | Revenue, expenses, profit, stock position, rep performance, month by month |
| Products | পণ্য | Catalogue, three prices, live stock, filtering, import/export |
| Store intake | স্টোরে মাল | Goods received from suppliers |
| SR challan | এসআর চালান | Stock handed to reps, and returns |
| Sales | বিক্রয় | Invoices, payment and delivery status |
| Demand | ডিমান্ড | What the field is asking for, and what the store can fill |
| Deposits | জমা | Cash coming back, and each rep's running position |
| Expenses | খরচ | Transport, rent, utilities, marketing |
| Payroll | বেতন | Salary plus commission on what each rep sold |
| Reports | রিপোর্ট | Per-product and per-rep performance, twelve-month trend, CSV export |
| Team | টিম | Appoint reps, managers and dealers |
| Settings | সেটিংস | Business details and the permission model |

---

## Stack

- **Next.js 15** (App Router, React 19, TypeScript strict)
- **Tailwind CSS** with a light/dark theme that follows the system
- **Framer Motion** for page, list and number transitions
- **Three.js** via react-three-fiber for the landing hero — every shape is
  generated from a lathe profile, so nothing is fetched at runtime
- **Recharts** for the trend, expense and performance charts
- **lucide-react** for icons
- **jose** for session JWTs, **bcryptjs** for password hashing, **zod** for
  input validation

### Data storage

A single JSON file (`.data/db.json`), written atomically through a serialised
write queue. No database server to install, and the whole dataset is one file
you can copy or back up.

`src/lib/db.ts` is the only module that touches storage. Moving to Postgres or
SQLite later means reimplementing `readDb` / `writeDb`, not rewriting the app.

> This suits a single-server deployment. It is not suitable for serverless
> platforms with ephemeral or multi-instance filesystems (Vercel, Netlify) —
> deploy to a VPS, or swap the storage layer first.

---

## Commands

```bash
npm run dev         # development server
npm run build       # production build
npm start           # serve the production build
npm test            # unit tests (35 of them)
npm run typecheck   # tsc --noEmit
npm run seed        # seed the database
npm run seed:reset  # wipe and reseed
```

Tests cover the parts where a mistake costs money: the stock ledger, SR cash
accounting, profit arithmetic, the permission model and the import parser.

---

## Project layout

```
src/
  app/
    api/            REST routes — each one checks a capability
    dashboard/      the twelve screens
    login/          sign-in
    page.tsx        public landing page
  components/
    dashboard/      shell, charts, line-item editor, month picker
    three/          the landing hero scene
    ui/             buttons, inputs, modal, table shells, stat cards
  lib/
    analytics.ts    stock ledger, SR accounts, finance summaries
    permissions.ts  capabilities, and the cost-price stripping
    import.ts       price-list parsing
    db.ts           JSON storage
    validation.ts   zod schemas
scripts/seed.mjs    demo data
tests/              unit tests
```

## Deploying

1. Set `AUTH_SECRET` to a long random string.
2. `npm run build && npm start` behind a reverse proxy with HTTPS.
3. Back up `.data/db.json` on a schedule — it is the whole business.
4. Sign in as the owner and change every seeded password.
