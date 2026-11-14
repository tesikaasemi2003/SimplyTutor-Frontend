import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Button from "../components/Button"
import { apiError } from "../service/errors"
import { generateQuiz, submitAttempt } from "../service/quiz"
import { getTopicById } from "../service/topic"
import type { AttemptResult, QuizData } from "../types/quiz"
import type { Topic } from "../types/topic"

const COUNTS = [3, 5, 8]

const verdict = (percentage: number): string => {
  if (percentage >= 80) return "Strong. You understand this well."
  if (percentage >= 50) return "Getting there. Read the ones you missed below."
  return "Worth another pass. Read the answers below, then explain the topic again."
}

export default function Quiz() {
  const { id } = useParams()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [count, setCount] = useState(5)
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState<AttemptResult | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const start = async () => {
    if (!topic) return
    setError(null)
    setBusy(true)
    try {
      const created = await generateQuiz(topic._id, count)
      setQuiz(created)
      setAnswers(created.questions.map(() => null))
      setCurrent(0)
      setResult(null)
    } catch (err) {
      setError(apiError(err, "Could not create the quiz. Try again."))
    } finally {
      setBusy(false)
    }
  }

  const submit = async () => {
    if (!quiz || answers.some((a) => a === null)) return
    setError(null)
    setBusy(true)
    try {
      setResult(await submitAttempt(quiz.id, answers as number[]))
    } catch (err) {
      setError(apiError(err, "Could not submit your answers. Try again."))
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setQuiz(null)
    setResult(null)
    setError(null)
  }

  const select = (optionIndex: number) =>
    setAnswers((prev) => prev.map((a, i) => (i === current ? optionIndex : a)))

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
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
    return <p className="mx-auto max-w-2xl px-6 py-12 text-ink-soft">Loading...</p>
  }

  const stage = result ? "result" : quiz ? "taking" : "intro"
  const total = quiz?.questions.length ?? 0
  const picked = answers[current] ?? null
  const isLastQuestion = current === total - 1
  const allAnswered = answers.length > 0 && answers.every((a) => a !== null)

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        to={`/topics/${topic._id}/explain`}
        className="text-sm font-semibold underline"
      >
        Back to explanation
      </Link>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
        {topic.title}
      </h1>

      {stage === "intro" && (
        <div className="mt-6">
          <p className="font-serif text-xl leading-relaxed text-ink-soft">
            A short quiz built around the gaps in your latest explanation. If you
            have not explained this topic yet, it covers the main ideas.
          </p>

          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">How many questions?</legend>
            <div className="mt-2 flex gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={count === n}
                  onClick={() => setCount(n)}
                  className={`min-w-12 rounded-md border px-4 py-2 font-semibold transition-colors ${
                    count === n
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-sheet hover:border-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
            >
              {error}
            </p>
          )}

          <Button
            onClick={start}
            loading={busy}
            loadingText="Your tutor is writing questions..."
            className="mt-8"
          >
            Start quiz
          </Button>
        </div>
      )}

      {stage === "taking" && quiz && (
        <div className="mt-8">
          <div aria-hidden="true" className="flex gap-1.5">
            {quiz.questions.map((q, i) => (
              <span
                key={q.question}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= current ? "bg-ink" : "bg-line"
                }`}
              />
            ))}
          </div>

          <fieldset className="mt-6">
            <p className="text-sm font-semibold text-ink-soft">
              Question {current + 1} of {total}
              {quiz.questions[current].type === "SCENARIO" ? ", scenario" : ""}
            </p>
            <legend className="mt-2 font-serif text-2xl leading-snug">
              {quiz.questions[current].question}
            </legend>

            <div className="mt-6 space-y-3">
              {quiz.questions[current].options.map((option, i) => (
                <label
                  key={`${current}-${i}`}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-sheet px-4 py-3 transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-marker/30"
                >
                  <input
                    type="radio"
                    name={`question-${current}`}
                    checked={picked === i}
                    onChange={() => select(i)}
                    className="mt-1.5 accent-ink"
                  />
                  <span className="font-serif text-lg">{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
            >
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="quiet"
              onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
              disabled={current === 0}
            >
              Back
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={submit}
                loading={busy}
                loadingText="Marking..."
                disabled={!allAnswered}
              >
                Submit quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrent((c) => c + 1)}
                disabled={picked === null}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}

      {stage === "result" && quiz && result && (
        <div className="mt-8">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {result.score} out of {result.total} correct
          </h2>

          <div
            role="img"
            aria-label={`Score ${result.percentage} percent`}
            className="mt-3 h-3 overflow-hidden rounded-full border border-ink bg-sheet"
          >
            <div
              className="h-full bg-marker"
              style={{ width: `${result.percentage}%` }}
            />
          </div>
          <p className="mt-4 font-serif text-lg leading-relaxed">
            {verdict(result.percentage)}
          </p>

          <ol className="mt-8 space-y-5">
            {result.review.map((item, i) => {
              const options = quiz.questions[i].options
              return (
                <li
                  key={item.question}
                  className={`rounded-r-md border-l-4 px-5 py-4 ${
                    item.isCorrect
                      ? "border-good bg-good-wash"
                      : "border-flag bg-flag-wash"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    Question {i + 1}: {item.isCorrect ? "Correct" : "Not quite"}
                  </p>
                  <p className="mt-1 font-serif text-lg">{item.question}</p>

                  {!item.isCorrect && (
                    <p className="mt-3">
                      <span className="font-semibold">Your answer: </span>
                      {options[item.yourAnswer]}
                    </p>
                  )}
                  <p className="mt-1">
                    <span className="font-semibold">Correct answer: </span>
                    {options[item.correctIndex]}
                  </p>
                  {item.explanation && (
                    <p className="mt-3 font-serif text-ink-soft">
                      {item.explanation}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button onClick={reset}>Try another quiz</Button>
            <Link
              to={`/topics/${topic._id}/explain`}
              className="inline-flex items-center justify-center rounded-md border border-line bg-sheet px-5 py-3 font-semibold hover:border-ink"
            >
              Explain it again
            </Link>
            <Link
              to="/topics"
              className="inline-flex items-center justify-center rounded-md border border-line bg-sheet px-5 py-3 font-semibold hover:border-ink"
            >
              Back to topics
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}