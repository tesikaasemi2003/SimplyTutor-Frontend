import { useCountUp } from "../hooks/useCountUp"
import type { Feedback } from "../types/explanation"
import ScoreBar from "./ScoreBar"

type NoteListProps = {
  title: string
  items: string[]
  tone: "flag" | "marker" | "plain"
  emptyText: string
  animated: boolean
  // milliseconds before the first note appears
  base: number
}

function NoteList({
  title,
  items,
  tone,
  emptyText,
  animated,
  base
}: NoteListProps) {
  const toneClass = {
    flag: "border-flag bg-flag-wash",
    marker: "border-marker bg-marker/25",
    plain: "border-line bg-sheet"
  }[tone]

  return (
    <div className="mt-6">
      <h4 className="font-bold">{title}</h4>
      {items.length === 0 ? (
        <p className="mt-2 text-ink-soft">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item, i) => (
            <li
              key={item}
              className={`rounded-r-md border-l-4 px-4 py-3 font-serif leading-relaxed ${toneClass} ${
                animated ? "note-in" : ""
              }`}
              style={
                animated ? { animationDelay: `${base + i * 90}ms` } : undefined
              }
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const deltaText = (diff: number): string => {
  if (diff > 0) return `${diff} points higher than your last explanation`
  if (diff < 0) return `${-diff} points lower than your last explanation`
  return "Same score as your last explanation"
}

type Props = {
  feedback: Feedback
  // clarity score of the explanation before this one, if there was one
  previousScore?: number | null
  // play the reveal sequence (bar fills, score counts up, notes slide in)
  animated?: boolean
}

export default function FeedbackNotes({
  feedback,
  previousScore = null,
  animated = false
}: Props) {
  const score = feedback.clarityScore
  const shown = useCountUp(score, animated)
  const diff = previousScore === null ? null : score - previousScore

  const label =
    previousScore === null
      ? `Clarity ${score} out of 100`
      : `Clarity ${score} out of 100, last time ${previousScore}`

  const deltaTone =
    diff === null || diff === 0
      ? "text-ink-soft"
      : diff > 0
        ? "text-good"
        : "text-flag"

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm font-semibold">
        <span>Clarity</span>
        <span>
          <span aria-hidden={animated}>{shown} out of 100</span>
          {animated && <span className="sr-only">{score} out of 100</span>}
        </span>
      </div>
      <div className="mt-2">
        <ScoreBar
          value={score}
          label={label}
          previous={previousScore ?? undefined}
          animate={animated}
        />
      </div>

      {diff !== null && (
        <p className="mt-2 text-sm">
          <span className={`font-semibold ${deltaTone}`}>{deltaText(diff)}.</span>{" "}
          <span className="text-ink-soft">
            The dark line on the bar is your last score.
          </span>
        </p>
      )}

      <p
        className={`mt-5 font-serif text-lg leading-relaxed ${
          animated ? "rise-in" : ""
        }`}
        style={animated ? { animationDelay: "500ms" } : undefined}
      >
        {feedback.summary}
      </p>

      <NoteList
        title="Not quite right"
        items={feedback.misconceptions}
        tone="flag"
        emptyText="Nothing wrong spotted."
        animated={animated}
        base={900}
      />
      <NoteList
        title="You did not mention"
        items={feedback.gaps}
        tone="marker"
        emptyText="No big gaps. Nice work."
        animated={animated}
        base={1250}
      />
      <NoteList
        title="Try this next"
        items={feedback.suggestions}
        tone="plain"
        emptyText="No suggestions this time."
        animated={animated}
        base={1600}
      />
    </div>
  )
}