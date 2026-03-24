export const RELAY_URL =
  (window as unknown as Record<string, string>).RELAY_URL ||
  import.meta.env.VITE_RELAY_URL ||
  'http://localhost:3000'

export const EXPLORER_BASE = 'https://preprod.cardanoscan.io/transaction/'

export const POLL_INTERVAL_MS = 5000
