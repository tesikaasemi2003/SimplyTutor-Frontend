import type { Difficulty } from "../types/topic"

const LEVELS: Record<Difficulty, { filled: number; label: string }> = {
  BEGINNER: { filled: 1, label: "Beginner" },
  INTERMEDIATE: { filled: 2, label: "Intermediate" },
  ADVANCED: { filled: 3, label: "Advanced" }
}

export default function DifficultyMark({ level }: { level: Difficulty }) {
  const { filled, label } = LEVELS[level]

  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span aria-hidden="true" className="flex items-end gap-0.5">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`w-1.5 rounded-sm ${n <= filled ? "bg-ink" : "bg-line"}`}
            style={{ height: `${6 + n * 4}px` }}
          />
        ))}
      </span>
      {label}
    </span>
  )
}