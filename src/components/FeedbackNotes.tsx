import type { Feedback } from "../types/explanation"
import ScoreBar from "./ScoreBar"

type NoteListProps = {
  title: string
  items: string[]
  tone: "flag" | "marker" | "plain"
  emptyText: string
}

function NoteList({ title, items, tone, emptyText }: NoteListProps) {
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
          {items.map((item) => (
            <li
              key={item}
              className={`rounded-r-md border-l-4 px-4 py-3 font-serif leading-relaxed ${toneClass}`}
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
}

export default function FeedbackNotes({ feedback, previousScore = null }: Props) {
  const score = feedback.clarityScore
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
        <span>{score} out of 100</span>
      </div>
      <div className="mt-2">
        <ScoreBar
          value={score}
          label={label}
          previous={previousScore ?? undefined}
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

      <p className="mt-5 font-serif text-lg leading-relaxed">{feedback.summary}</p>

      <NoteList
        title="Not quite right"
        items={feedback.misconceptions}
        tone="flag"
        emptyText="Nothing wrong spotted."
      />
      <NoteList
        title="You did not mention"
        items={feedback.gaps}
        tone="marker"
        emptyText="No big gaps. Nice work."
      />
      <NoteList
        title="Try this next"
        items={feedback.suggestions}
        tone="plain"
        emptyText="No suggestions this time."
      />
    </div>
  )
}