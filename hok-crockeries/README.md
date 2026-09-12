# Hok Crockeries

A multi-tenant SaaS for running a wholesale distribution business. Stock into
the store, stock out to sales reps, sales in the market, cash back to the
office, and the month's expenses — on one ledger that reconciles.

Each business signs up and gets its own private workspace. **The purchase price
is visible only to the owner** — it is removed at the API boundary, not hidden
in the UI.

---

## Deploy to Vercel

1. **Push this repository to GitHub**, then import it in Vercel. If the app
   lives in a subdirectory, set **Root Directory** to `hok-crockeries`.

2. **Add a Postgres database.** In the project's **Storage** tab, create a Neon
   database. Vercel sets `DATABASE_URL` for you. Any Postgres works — Supabase,
   Railway, or your own server.

3. **Set `AUTH_SECRET`** in Settings → Environment Variables:

   ```bash
   openssl rand -base64 32
   ```

4. **Deploy.** `npm run build` runs pending migrations before building, so the
   schema is in place before the first request.

5. Open the deployment, click **Start free**, and create your workspace. The
   first account becomes the owner.

There is no seed step in production — an empty workspace walks you through
setup on the dashboard.

### Why the pooled driver

Vercel functions are serverless, but a stock ledger must never record an
invoice without its line items. Neon's HTTP driver cannot run interactive
transactions, so this app uses the pooled WebSocket driver instead. Slightly
slower to connect, correct under concurrency.

---

## Run it locally

```bash
npm install
cp .env.example .env.local     # set AUTH_SECRET; leave DATABASE_URL empty
npm run seed                   # optional: a demo workspace with 3 months of data
npm run dev                    # http://localhost:3000
```

**No database to install.** With `DATABASE_URL` empty, the app runs an embedded
Postgres (PGlite) in-process and keeps it in `.data/pg`. It is real Postgres 18,
so the SQL you write locally is the SQL that runs in production.

`npm run seed` prints the credentials it creates. Re-run with
`npm run seed:reset` to rebuild the demo workspace.

### Self-hosting on one server

The embedded database also works in production on a single machine:

```bash
ALLOW_EMBEDDED_DB=1 npm run build && ALLOW_EMBEDDED_DB=1 npm start
```

It stores everything in one directory, so it cannot be used anywhere that runs
more than one instance. Back up `.data/pg`. For anything beyond one server, use
a real `DATABASE_URL`.

---

## How tenancy works

Every business row carries an `orgId`, and every query filters on the caller's
organisation. Unique constraints are scoped per-organisation too, so two
businesses can both have a product with SKU `HC-1001`.

- **Sign-up** is the only route that creates an organisation. The first account
  becomes its owner.
- **Everyone else joins by invitation.** The owner creates a single-use link;
  the invitee sets their own password. Role, salary and territory come from the
  invitation, never from the request body, so nobody can promote themselves.
- **Sessions carry the organisation id**, and it is re-checked against the
  database on every request. A token minted for one workspace cannot unlock
  another.
- **Deleting an organisation** cascades to everything it owns and touches
  nothing else.

---

## The four roles

| Role | Sees | Can do |
| --- | --- | --- |
| **Owner** | Everything, including purchase cost and profit | Invite staff, pay salaries, set prices, everything below |
| **Manager** | Everything **except** purchase cost and profit | Run the store, issue challans, receive deposits, book expenses, approve demand |
| **Sales Rep** | Only their own stock, invoices and cash | Sell at the rate the office set, raise demand, deposit cash |
| **Dealer** | Catalogue with market price and availability | Nothing — read-only |

Permissions are named capabilities in `src/lib/permissions.ts`. Every API route
checks one; the navigation and UI read the same list, so they cannot drift.

### How the purchase price stays private

`cost.view` belongs to the owner alone. Without it:

- `costPrice` is **deleted** from every product record before the response is
  sent — the key is absent, not zero.
- Profit, margin, cost of goods sold and stock-at-cost are never computed.
- Per-unit costs and invoice totals are dropped from store-intake records.
- `PRODUCT` expense lines are excluded entirely, because a supplier invoice
  total is the purchase price in aggregate.
- A manager recording a delivery enters quantities only. Any unit cost they
  submit is discarded server-side and the owner's standing price is used for
  valuation, so the books stay right without showing them the figure.

---

## The three prices

Every product carries three, for three audiences:

| Price | Who sees it |
| --- | --- |
| Purchase cost | Owner only |
| SR rate | Everyone signed in — what reps charge shops |
| Market price | Everyone signed in — suggested retail |

---

## How stock moves

```
supplier ──► Store intake ──► Challan ──► Sale ──► delivered
                  │              │          │
                  │              └── Return ─┘
                  └──► PRODUCT expense (owner-only)
```

Stock is never a counter someone edits. It is derived from the documents that
moved it:

```
in store = received − assigned + returned
with SRs = assigned − returned − sold
```

Two rules are enforced inside the transaction that writes the document, not
just in the form:

- A challan cannot hand out more than the store physically holds.
- A rep cannot invoice goods that are not in their van.

A cancelled invoice returns its goods to the rep's van and drops out of every
total.

## How money moves

```
Sale total ──► cash collected by rep ──► deposit to office
     │                  │
     └──► market due    └──► cash in hand = collected − deposited
```

`cash in hand` and `market due` are running, all-time figures. They do not reset
when the month changes, because a rep's pocket does not empty on the 1st.

---

## Importing a product list

Products → **Import list**. Accepts JSON (a bare array or `{"products": [...]}`),
CSV, TSV, or a pasted spreadsheet.

Column names are matched loosely — case, spaces and underscores are ignored, so
`Purchase Price`, `cost` and `buying price` all land in the same field. Bengali
column headers and Bengali digits (`১২৫০`) are understood, as are currency
prefixes like `Tk. 1,250.50`. Unrecognised columns are listed back to you
rather than silently dropped.

Only `name` is required. Recognised: `sku`, `name`, `category`, `unit`,
`costPrice`, `srPrice`, `marketPrice`, `lowStockThreshold`, `imageUrl`,
`description`, `brand`.

**Preview first.** The importer runs the whole batch inside a transaction and
rolls it back, so the preview shows real outcomes — matched SKUs, categories
that would be created — not a guess. Nothing is written until you confirm.

```json
[
  {
    "sku": "HC-1001",
    "name": "Dinner Plate 10 inch",
    "category": "Plates & Bowls",
    "unit": "dozen",
    "costPrice": 540,
    "srPrice": 720,
    "marketPrice": 950,
    "brand": "Monno"
  }
]
```

---

## What each screen is for

| Screen | Purpose |
| --- | --- |
| Overview | Revenue, expenses, profit, stock position, rep performance, month by month |
| Products | Catalogue, three prices, live stock, filtering, import/export |
| Store intake | Goods received from suppliers |
| Challans | Stock handed to reps, and returns |
| Sales | Invoices, payment and delivery status |
| Demand | What the field is asking for, and what the store can fill |
| Deposits | Cash coming back, and each rep's running position |
| Expenses | Transport, rent, utilities, marketing |
| Payroll | Salary plus commission on what each rep sold |
| Reports | Per-product and per-rep performance, twelve-month trend, CSV export |
| Team | Invite reps, managers and dealers; manage accounts |
| Settings | Business details, currency, units, categories, password |

Currency, units of measure and product categories are all per-workspace and
editable in Settings. Change the currency and every figure in the app updates
at once.

---

## Stack

- **Next.js 15** — App Router, React 19, TypeScript strict
- **Postgres** via **Drizzle ORM** — Neon in production, PGlite locally
- **Tailwind CSS** — light and dark, following the system
- **Framer Motion** — page, list and number transitions
- **Three.js** (react-three-fiber) — the landing hero, generated from lathe
  profiles so nothing is fetched at runtime
- **Recharts** — trend, expense and performance charts
- **jose** for session JWTs, **bcryptjs** for password hashing, **zod** for
  input validation

---

## Commands

```bash
npm run dev          # development server
npm run build        # migrate, then build
npm start            # serve the production build
npm test             # 38 tests, including integration tests on real Postgres
npm run typecheck    # tsc --noEmit
npm run db:generate  # generate a migration after editing the schema
npm run db:migrate   # apply migrations to DATABASE_URL
npm run db:studio    # browse the database
npm run seed         # demo workspace
npm run seed:reset   # rebuild the demo workspace
```

### Tests

Unit tests cover the permission model, money arithmetic and the import parser.
Integration tests run against a real embedded Postgres and cover the stock
ledger, rep cash accounting, profit arithmetic, transaction rollback, and that
two tenants never see each other's data.

### Changing the schema

```bash
# edit src/db/schema.ts
npm run db:generate    # writes a new file to drizzle/
npm run db:migrate     # or just deploy — the build applies it
```

Migrations are applied once each and tracked in a `__hok_migrations` table.

---

## Project layout

```
src/
  app/
    api/            REST routes — each checks a capability
    dashboard/      the twelve screens
    signup/         create a workspace
    login/          sign in
    invite/[token]/ accept an invitation
    page.tsx        public landing page
  components/
    dashboard/      shell, charts, line-item editor, setup checklist
    three/          the landing hero scene
    ui/             buttons, inputs, modal, table shells, stat cards
    workspace.tsx   signed-in user, org and capabilities
  db/
    schema.ts       tables, indexes and relations
    connect.ts      driver selection (Neon or embedded)
    client.ts       the app's shared handle
    queries/        stock ledger, rep accounts, finance aggregates
  lib/
    permissions.ts  capabilities, and cost-price stripping
    money.ts        money and date arithmetic
    import.ts       price-list parsing
    validation.ts   zod schemas
drizzle/            generated SQL migrations
scripts/            migrate and seed
tests/              unit and integration tests
```

## Operating notes

- Back up your database. On Neon that is automatic; self-hosted, it is yours.
- Passwords are stored hashed. Nobody, including the owner, can read one — an
  owner can only reset a locked-out member's password.
- Every change is written to an audit trail, scoped to the workspace.
- There is no email server. Invitations produce a link the owner copies and
  sends however they normally reach their team.
