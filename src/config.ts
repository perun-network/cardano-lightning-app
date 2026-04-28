export const RELAY_URL =
  (window as unknown as Record<string, string>).RELAY_URL ||
  import.meta.env.VITE_RELAY_URL ||
  'https://cardano-ln.perun.network:30305'

export const EXPLORER_BASE = 'https://preprod.cardanoscan.io/transaction/'

export const POLL_INTERVAL_MS = 5000
