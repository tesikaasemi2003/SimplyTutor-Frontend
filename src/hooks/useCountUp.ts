import { useEffect, useState } from "react"

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

// counts from 0 up to `target` (used for the clarity score)
export function useCountUp(
  target: number,
  enabled = true,
  duration = 900
): number {
  const skip = !enabled || prefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (skip) return

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, skip])

  return skip ? target : value
}