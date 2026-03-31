# Cardinal BTC

Web application for the Cardano-Lightning bridge. Swap between BTC (Lightning Network) and cBTC (Cardano) in both directions.

## Flows

**Onramp (BTC → cBTC)** — Enter amount + Cardano address → pay Lightning invoice → receive cBTC on Cardano.

**Offramp (cBTC → BTC)** — Enter amount + BOLT11 invoice → send cBTC to operator → receive BTC via Lightning.

Both directions are handled on a single Bridge page via a direction toggle.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 3** with custom design tokens (dark theme, glassmorphism)
- **React Router 7** (client-side routing)
- **Zustand** (state management)
- **Vitest** + **Testing Library** (67 tests)

## Routes

| Route | Page |
|---|---|
| `/` | Bridge — unified swap card (onramp/offramp) |
| `/invoice/:paymentHash` | Lightning invoice QR + status polling |
| `/progress/:type/:id` | Stepper for onramp (`swap`) and offramp (`offramp`) |
| `/offramp-deposit/:id` | Confirm cBTC deposit to operator |
| `/history` | Combined transaction history + metrics |

## Getting Started

```bash
npm install
npm run dev
```

The app connects to a [cardano-lightning-relay](../cardano-lightning-relay) instance. Configure the URL via environment variable:

```bash
VITE_RELAY_URL=http://localhost:3000 npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
  routes/          Page components (BridgePage, InvoicePage, ProgressPage, ...)
  components/      UI components organized by feature (bridge/, invoice/, progress/, ...)
  services/api.ts  Relay API client
  stores/          Zustand store (direction, form fields, pool info)
  hooks/           Custom hooks (usePolling)
  utils/           Pure helpers (formatCbtc, cbtcToBase, buildSwapSteps, ...)
  types/           TypeScript interfaces matching relay API responses
  config.ts        Centralized config (relay URL, explorer base, poll interval)
```

## Known Limitation

Deep-linking to `/invoice/:hash` or `/offramp-deposit/:id` in a new tab shows a fallback UI because the relay API does not include `bolt11` in `/swap/status` or `operator_address` in `/offramp/status`. A backend extension to add these fields would fully resolve this.
