type Props = {
  value: number
  label: string
  // optional: where the score was last time, drawn as a dark line
  previous?: number
}

const clamp = (n: number) => Math.min(100, Math.max(0, n))

export default function ScoreBar({ value, label, previous }: Props) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-3 overflow-hidden rounded-full border border-ink bg-sheet"
    >
      <div className="h-full bg-marker" style={{ width: `${clamp(value)}%` }} />
      {previous !== undefined && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-0.5 bg-ink"
          style={{ left: `${clamp(previous)}%` }}
        />
      )}
    </div>
  )
}