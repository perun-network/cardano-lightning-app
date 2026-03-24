import { useEffect, useRef, useCallback } from 'react'

/**
 * Polls `fn` every `intervalMs` milliseconds.
 * Stops when `fn` returns `true` (terminal state) or `enabled` becomes `false`.
 * When `immediate` is true, the first poll runs right away instead of after one interval.
 * Cleans up on unmount.
 */
export function usePolling(
  fn: () => Promise<boolean>,
  intervalMs: number,
  enabled: boolean,
  immediate = false,
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

    const timer = immediate ? setTimeout(poll, 0) : setTimeout(poll, intervalMs)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [intervalMs, enabled, stableFn, immediate])
}
