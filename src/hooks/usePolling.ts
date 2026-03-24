import { useEffect, useRef, useCallback } from 'react'

/**
 * Polls `fn` every `intervalMs` milliseconds.
 * Stops when `fn` returns `true` (terminal state) or `enabled` becomes `false`.
 * Cleans up on unmount.
 */
export function usePolling(
  fn: () => Promise<boolean>,
  intervalMs: number,
  enabled: boolean,
) {
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  })

  const stableFn = useCallback(() => fnRef.current(), [])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const poll = async () => {
      if (cancelled) return
      try {
        const done = await stableFn()
        if (done || cancelled) return
      } catch {
        // retry on next interval
      }
      if (!cancelled) {
        setTimeout(poll, intervalMs)
      }
    }

    // Start first poll after one interval
    const timer = setTimeout(poll, intervalMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [intervalMs, enabled, stableFn])
}
