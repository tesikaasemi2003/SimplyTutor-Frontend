type Props = {
  value: number
  label: string
}

export default function ScoreBar({ value, label }: Props) {
  const safe = Math.min(100, Math.max(0, value))

  return (
    <div
      role="img"
      aria-label={label}
      className="h-3 overflow-hidden rounded-full border border-ink bg-sheet"
    >
      <div className="h-full bg-marker" style={{ width: `${safe}%` }} />
    </div>
  )
}