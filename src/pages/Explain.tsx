import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import Button from "../components/Button"
import DifficultyMark from "../components/DifficultyMark"
import FeedbackNotes from "../components/FeedbackNotes"
import { useAppSelector } from "../hooks/redux"
import { apiError } from "../service/errors"
import { submitExplanation } from "../service/explanation"
import { getMyExplanations } from "../service/history"
import { getTopicById } from "../service/topic"
import type { Feedback } from "../types/explanation"
import type { ExplanationItem } from "../types/history"
import type { Topic } from "../types/topic"

const MIN = 30
const MAX = 3000

// the draft lives only in this browser, one per learner and topic
const readDraft = (key: string): string => {
  try {
    return localStorage.getItem(key) ?? ""
  } catch {
    return ""
  }
}

const writeDraft = (key: string, value: string) => {
  try {
    if (value.trim()) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // storage blocked: the draft just will not survive a refresh
  }
}

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" })

function ExplainContent({ topicId }: { topicId: string }) {
  const userId = useAppSelector((state) => state.auth.user?.id)
  const draftKey = `simplytutor:draft:${userId ?? "anon"}:${topicId}`

  const [topic, setTopic] = useState<Topic | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [past, setPast] = useState<ExplanationItem[]>([])

  const [initialDraft] = useState(() => readDraft(draftKey))
  const [text, setText] = useState(initialDraft)
  const [showRestored, setShowRestored] = useState(initialDraft.length > 0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [previousScore, setPreviousScore] = useState<number | null>(null)
  const notesRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    let active = true

    getTopicById(topicId)
      .then((data) => active && setTopic(data))
      .catch((err) => active && setLoadError(apiError(err, "Topic not found.")))

    getMyExplanations(topicId)
      .then((data) => active && setPast(data))
      .catch(() => {
        // earlier explanations are a bonus, the page works without them
      })

    return () => {
      active = false
    }
  }, [topicId])

  // move focus to the tutor notes when feedback arrives (screen readers)
  useEffect(() => {
    if (feedback) notesRef.current?.focus()
  }, [feedback])

  const count = text.trim().length

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setShowRestored(false)
    writeDraft(draftKey, e.target.value)
  }

  const startFromLast = () => {
    if (past.length === 0) return
    setText(past[0].text)
    setShowRestored(false)
    writeDraft(draftKey, past[0].text)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!topic) return
    setError(null)
    setSubmitting(true)
    try {
      const before = past[0]?.feedback.clarityScore ?? null
      const result = await submitExplanation(topic._id, text.trim())

      writeDraft(draftKey, "")
      setShowRestored(false)
      setPreviousScore(before)
      setPast((list) => [
        {
          ...result,
          topic: { _id: topic._id, title: topic.title, category: topic.category }
        },
        ...list
      ])
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
        <>
          <form onSubmit={handleSubmit} className="mt-10">
            <label htmlFor="explanation" className="block text-lg font-bold">
              Explain it as if you were teaching a 12-year-old
            </label>
            <p className="mt-1 text-ink-soft">
              Use your own words. No jargon, and no copying from your notes.
            </p>

            {showRestored && (
              <p
                role="status"
                className="mt-3 rounded-md bg-marker/30 px-3.5 py-2.5 text-sm font-semibold"
              >
                We restored your unsent draft.
              </p>
            )}

            {past.length > 0 && text.trim() === "" && (
              <Button
                type="button"
                variant="quiet"
                size="sm"
                className="mt-3"
                onClick={startFromLast}
              >
                Start from my last explanation
              </Button>
            )}

            <textarea
              id="explanation"
              value={text}
              maxLength={MAX}
              onChange={handleChange}
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

          {past.length > 0 && (
            <section
              aria-labelledby="earlier-title"
              className="mt-14 border-t border-line pt-6"
            >
              <h2 id="earlier-title" className="text-lg font-bold">
                Your earlier explanations
              </h2>
              <ul className="mt-3">
                {past.slice(0, 5).map((item) => (
                  <li
                    key={item._id}
                    className="flex flex-wrap justify-between gap-x-6 border-b border-line py-2.5 text-sm"
                  >
                    <span>{shortDate(item.createdAt)}</span>
                    <span className="font-semibold">
                      Clarity {item.feedback.clarityScore} out of 100
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/history"
                className="mt-3 inline-block text-sm font-semibold underline"
              >
                Read the full feedback in History
              </Link>
            </section>
          )}
        </>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_1fr]">
          <section aria-labelledby="your-explanation">
            <h2 id="your-explanation" className="text-lg font-bold">
              Your explanation
            </h2>
            <p className="graph-paper mt-3 rounded-md border border-line p-5 font-serif text-lg leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="quiet" onClick={() => setFeedback(null)}>
                Edit and try again
              </Button>
              <Link
                to={`/topics/${topic._id}/quiz`}
                className="inline-flex items-center justify-center rounded-md bg-ink px-5 py-3 font-semibold text-white hover:bg-[#2a3860]"
              >
                Take a quiz on my gaps
              </Link>
            </div>
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
              <FeedbackNotes feedback={feedback} previousScore={previousScore} />
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default function Explain() {
  const { id } = useParams()
  if (!id) return <Navigate to="/topics" replace />

  // key={id}: a different topic gets a fresh component (and its own draft)
  return <ExplainContent key={id} topicId={id} />
}