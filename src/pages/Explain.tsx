import { useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { Link, useParams } from "react-router-dom"
import Button from "../components/Button"
import DifficultyMark from "../components/DifficultyMark"
import { apiError } from "../service/errors"
import { submitExplanation } from "../service/explanation"
import { getTopicById } from "../service/topic"
import type { Feedback } from "../types/explanation"
import type { Topic } from "../types/topic"

const MIN = 30
const MAX = 3000

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
    <div className="mt-8">
      <h3 className="text-lg font-bold">{title}</h3>
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

export default function Explain() {
  const { id } = useParams()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const notesRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    getTopicById(id)
      .then((data) => active && setTopic(data))
      .catch((err) => active && setLoadError(apiError(err, "Topic not found.")))
    return () => {
      active = false
    }
  }, [id])

  // move focus to the tutor notes when feedback arrives (screen readers)
  useEffect(() => {
    if (feedback) notesRef.current?.focus()
  }, [feedback])

  const count = text.trim().length

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!topic) return
    setError(null)
    setSubmitting(true)
    try {
      const result = await submitExplanation(topic._id, text.trim())
      setFeedback(result.feedback)
    } catch (err) {
      setError(apiError(err, "Could not get feedback. Try again."))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p role="alert" className="rounded-md bg-flag-wash px-3.5 py-3 text-flag">
          {loadError}
        </p>
        <Link to="/topics" className="mt-6 inline-block font-semibold underline">
          Back to topics
        </Link>
      </div>
    )
  }

  if (!topic) {
    return <p className="mx-auto max-w-4xl px-6 py-12 text-ink-soft">Loading...</p>
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link to="/topics" className="text-sm font-semibold underline">
        Back to topics
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="text-sm font-semibold">{topic.category}</span>
        <DifficultyMark level={topic.difficulty} />
      </div>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">
        {topic.title}
      </h1>
      <p className="mt-3 max-w-2xl font-serif text-xl leading-relaxed text-ink-soft">
        {topic.description}
      </p>

      {!feedback ? (
        <form onSubmit={handleSubmit} className="mt-10">
          <label htmlFor="explanation" className="block text-lg font-bold">
            Explain it as if you were teaching a 12-year-old
          </label>
          <p className="mt-1 text-ink-soft">
            Use your own words. No jargon, and no copying from your notes.
          </p>

          <textarea
            id="explanation"
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            className="ruled mt-4 block h-80 w-full resize-y rounded-md border border-line px-4 font-serif text-lg focus:border-ink"
          />

          <div className="mt-2 flex justify-between text-sm text-ink-soft">
            <span>
              {count < MIN
                ? `Write at least ${MIN} characters`
                : "Ready for feedback"}
            </span>
            <span>
              {text.length} / {MAX}
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            loading={submitting}
            loadingText="Your tutor is reading..."
            disabled={count < MIN}
            className="mt-6"
          >
            Get feedback
          </Button>
        </form>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_1fr]">
          <section aria-labelledby="your-explanation">
            <h2 id="your-explanation" className="text-lg font-bold">
              Your explanation
            </h2>
            <p className="graph-paper mt-3 rounded-md border border-line p-5 font-serif text-lg leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
            <Button
              variant="quiet"
              className="mt-5"
              onClick={() => setFeedback(null)}
            >
              Edit and try again
            </Button>
          </section>

          <section aria-labelledby="tutor-notes">
            <h2
              id="tutor-notes"
              ref={notesRef}
              tabIndex={-1}
              className="text-2xl font-extrabold tracking-tight"
            >
              Tutor notes
            </h2>

            <div className="mt-4">
              <div className="flex items-baseline justify-between text-sm font-semibold">
                <span>Clarity</span>
                <span>{feedback.clarityScore} out of 100</span>
              </div>
              <div
                role="img"
                aria-label={`Clarity ${feedback.clarityScore} out of 100`}
                className="mt-2 h-3 overflow-hidden rounded-full border border-ink bg-sheet"
              >
                <div
                  className="h-full bg-marker"
                  style={{ width: `${feedback.clarityScore}%` }}
                />
              </div>
            </div>

            <p className="mt-5 font-serif text-lg leading-relaxed">
              {feedback.summary}
            </p>

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
          </section>
        </div>
      )}
    </div>
  )
}