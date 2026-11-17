import { useEffect, useState } from "react"

const LINES = ["92%", "78%", "86%", "54%"]

export default function TutorReading() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div role="status" className="mt-6 rounded-md border border-line bg-sheet p-5">
      <p className="font-semibold">Your tutor is reading your explanation...</p>
      <div aria-hidden="true" className="mt-4 space-y-3">
        {LINES.map((width, i) => (
          <div
            key={width}
            className="reading-line h-3.5 rounded-sm bg-line"
            style={{ width, animationDelay: `${i * 350}ms` }}
          />
        ))}
      </div>
      {slow && (
        <p className="mt-4 text-sm text-ink-soft">
          This is taking longer than usual. Your tutor is still working, so
          please keep this page open.
        </p>
      )}
    </div>
  )
}