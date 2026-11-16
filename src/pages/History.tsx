import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Button from "../components/Button"
import FeedbackNotes from "../components/FeedbackNotes"
import ScoreBar from "../components/ScoreBar"
import { apiError } from "../service/errors"
import {
  deleteAttempt,
  deleteExplanation,
  getMyAttempts,
  getMyExplanations
} from "../service/history"
import type { AttemptItem, ExplanationItem } from "../types/history"

type Tab = "explanations" | "quizzes"

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

type ConfirmProps = {
  label: string
  busy: boolean
  onYes: () => void
  onNo: () => void
}

function ConfirmDelete({ label, busy, onYes, onNo }: ConfirmProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md bg-flag-wash px-3.5 py-3 text-sm">
      <span>{label}</span>
      <Button size="sm" onClick={onYes} loading={busy} loadingText="Deleting...">
        Yes, delete
      </Button>
      <Button size="sm" variant="quiet" onClick={onNo}>
        Keep it
      </Button>
    </div>
  )
}

export default function History() {
  const [tab, setTab] = useState<Tab>("explanations")
  const [explanations, setExplanations] = useState<ExplanationItem[]>([])
  const [attempts, setAttempts] = useState<AttemptItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [expl, att] = await Promise.all([
        getMyExplanations(),
        getMyAttempts()
      ])
      setExplanations(expl)
      setAttempts(att)
      setError(null)
    } catch (err) {
      setError(apiError(err, "Could not load your history."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const switchTab = (next: Tab) => {
    setTab(next)
    setConfirmId(null)
    setNotice(null)
  }

  const remove = async (kind: Tab, id: string) => {
    setError(null)
    setDeletingId(id)
    try {
      if (kind === "explanations") {
        await deleteExplanation(id)
        setExplanations((list) => list.filter((item) => item._id !== id))
        setNotice("Explanation deleted.")
      } else {
        await deleteAttempt(id)
        setAttempts((list) => list.filter((item) => item._id !== id))
        setNotice("Quiz attempt deleted.")
      }
      setConfirmId(null)
    } catch (err) {
      setError(apiError(err, "Could not delete. Try again."))
    } finally {
      setDeletingId(null)
    }
  }

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "explanations", label: "Explanations", count: explanations.length },
    { value: "quizzes", label: "Quizzes", count: attempts.length }
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">History</h1>
      <p className="mt-3 max-w-2xl font-serif text-xl leading-relaxed text-ink-soft">
        Everything you have explained and every quiz you have taken. Open an
        explanation to read the tutor notes again.
      </p>

      <div className="mt-8 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={tab === t.value}
            onClick={() => switchTab(t.value)}
            className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.value
                ? "border-ink bg-ink text-white"
                : "border-line bg-sheet hover:border-ink"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div role="status" aria-live="polite" className="mt-4 min-h-12">
        {notice && (
          <p className="rounded-md bg-good-wash px-3.5 py-3 text-sm font-semibold text-good">
            {notice}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 rounded-md bg-flag-wash px-3.5 py-3 text-flag">
          {error}
        </p>
      )}

      {loading && <p className="mt-4 text-ink-soft">Loading your history...</p>}

      {!loading && tab === "explanations" && (
        <section aria-labelledby="explanations-title" className="mt-2">
          <h2 id="explanations-title" className="sr-only">
            Your explanations
          </h2>

          {explanations.length === 0 ? (
            <p className="py-6 text-ink-soft">
              You have not explained anything yet.{" "}
              <Link to="/topics" className="font-semibold underline">
                Browse topics
              </Link>
            </p>
          ) : (
            <ul className="border-t border-line">
              {explanations.map((item) => {
                const title = item.topic?.title ?? "Deleted topic"
                return (
                  <li key={item._id} className="border-b border-line py-5">
                    <details className="group">
                      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold group-hover:underline">
                              {title}
                            </h3>
                            <p className="mt-0.5 text-sm text-ink-soft">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            Clarity {item.feedback.clarityScore} out of 100
                          </p>
                        </div>
                        <p className="mt-2 line-clamp-2 font-serif text-ink-soft group-open:hidden">
                          {item.text}
                        </p>
                        <span className="mt-2 inline-block text-sm font-semibold underline">
                          <span className="group-open:hidden">Show feedback</span>
                          <span className="hidden group-open:inline">
                            Hide feedback
                          </span>
                        </span>
                      </summary>

                      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                        <div>
                          <h4 className="font-bold">Your explanation</h4>
                          <p className="graph-paper mt-2 rounded-md border border-line p-4 font-serif leading-relaxed whitespace-pre-wrap">
                            {item.text}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-bold">Tutor notes</h4>
                          <div className="mt-2">
                            <FeedbackNotes feedback={item.feedback} />
                          </div>
                        </div>
                      </div>
                    </details>

                    <div className="mt-4 flex gap-5 text-sm font-semibold">
                      {item.topic && (
                        <Link
                          to={`/topics/${item.topic._id}/explain`}
                          className="underline"
                        >
                          Explain again
                        </Link>
                      )}
                      <button
                        type="button"
                        aria-label={`Delete explanation of ${title}`}
                        onClick={() => setConfirmId(item._id)}
                        className="text-flag underline"
                      >
                        Delete
                      </button>
                    </div>

                    {confirmId === item._id && (
                      <ConfirmDelete
                        label="Delete this explanation and its feedback?"
                        busy={deletingId === item._id}
                        onYes={() => remove("explanations", item._id)}
                        onNo={() => setConfirmId(null)}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {!loading && tab === "quizzes" && (
        <section aria-labelledby="quizzes-title" className="mt-2">
          <h2 id="quizzes-title" className="sr-only">
            Your quiz attempts
          </h2>

          {attempts.length === 0 ? (
            <p className="py-6 text-ink-soft">
              You have not taken a quiz yet. Explain a topic, then take the quiz
              from the tutor notes.
            </p>
          ) : (
            <ul className="border-t border-line">
              {attempts.map((item) => {
                const title = item.topic?.title ?? "Deleted topic"
                return (
                  <li key={item._id} className="border-b border-line py-5">
                    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center md:gap-8">
                      <div>
                        <h3 className="text-lg font-bold">{title}</h3>
                        <p className="mt-0.5 text-sm text-ink-soft">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="mb-1.5 text-sm font-semibold">
                          {item.score} out of {item.total} correct
                        </p>
                        <ScoreBar
                          value={item.percentage}
                          label={`Score ${item.percentage} percent`}
                        />
                      </div>

                      <div className="flex gap-5 text-sm font-semibold">
                        {item.topic && (
                          <Link
                            to={`/topics/${item.topic._id}/quiz`}
                            className="underline"
                          >
                            Retake quiz
                          </Link>
                        )}
                        <button
                          type="button"
                          aria-label={`Delete quiz attempt on ${title}`}
                          onClick={() => setConfirmId(item._id)}
                          className="text-flag underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {confirmId === item._id && (
                      <ConfirmDelete
                        label="Delete this quiz attempt? Your dashboard scores will update."
                        busy={deletingId === item._id}
                        onYes={() => remove("quizzes", item._id)}
                        onNo={() => setConfirmId(null)}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}