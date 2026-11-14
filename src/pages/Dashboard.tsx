import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Button from "../components/Button"
import QuizTrendChart from "../components/QuizTrendChart"
import ScoreBar from "../components/ScoreBar"
import TopicScoresChart from "../components/TopicScoresChart"
import WeekStrip from "../components/WeekStrip"
import { useAppSelector } from "../hooks/redux"
import { getDashboard } from "../service/dashboard"
import { apiError } from "../service/errors"
import type { DashboardData, TopicMastery } from "../types/dashboard"

const LEVEL_LABEL: Record<TopicMastery["level"], string> = {
  MASTERED: "Mastered",
  LEARNING: "Learning",
  NEEDS_WORK: "Needs work"
}

const LEVEL_STYLE: Record<TopicMastery["level"], string> = {
  MASTERED: "text-good",
  LEARNING: "text-ink",
  NEEDS_WORK: "text-flag"
}

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    getDashboard()
      .then((result) => {
        if (!active) return
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (active) setError(apiError(err, "Could not load your progress."))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  const retry = () => {
    setLoading(true)
    setReloadKey((key) => key + 1)
  }

  if (!user) return null

  if (loading) {
    return (
      <p className="mx-auto max-w-5xl px-6 py-14 text-ink-soft">
        Loading your progress...
      </p>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-14">
        <p role="alert" className="rounded-md bg-flag-wash px-3.5 py-3 text-flag">
          {error ?? "Could not load your progress."}
        </p>
        <Button variant="quiet" className="mt-4" onClick={retry}>
          Try again
        </Button>
      </div>
    )
  }

  const { streak, totals, topics, activityLast7Days, recentAttempts } = data

  const today = activityLast7Days[activityLast7Days.length - 1]
  const doneToday = today ? today.explanations + today.quizzes > 0 : false

  let streakText = "Explain a topic today to start a streak."
  if (streak.current > 0) {
    streakText = doneToday
      ? `You are on a ${streak.current}-day streak.`
      : `You are on a ${streak.current}-day streak. Do something today to keep it going.`
  }

  const stats = [
    { label: "Explanations", value: String(totals.explanations) },
    { label: "Quizzes taken", value: String(totals.quizAttempts) },
    {
      label: "Average quiz score",
      value: totals.quizAttempts ? `${totals.avgQuizScore}%` : "None yet"
    },
    {
      label: "Average clarity (out of 100)",
      value: totals.explanations ? String(totals.avgClarityScore) : "None yet"
    }
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Welcome back, {user.name}.
      </h1>
      <p className="mt-3 font-serif text-xl leading-relaxed text-ink-soft">
        {streakText}
      </p>

      <div className="mt-6">
        <WeekStrip days={activityLast7Days} />
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-sm text-ink-soft">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-extrabold tracking-tight">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {topics.length === 0 ? (
        <section className="mt-14 border-t border-line pt-8">
          <h2 className="text-xl font-bold">Nothing here yet</h2>
          <p className="mt-2 max-w-xl font-serif text-lg leading-relaxed text-ink-soft">
            Explain your first topic and your progress will show up here.
          </p>
          <Link
            to="/topics"
            className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 font-semibold text-white hover:bg-[#2a3860]"
          >
            Browse topics
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-14">
            <h2 className="text-2xl font-extrabold tracking-tight">Your topics</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Mastery blends your quiz score (60%) with how clear your
              explanations were (40%).
            </p>

            <ul className="mt-4 border-t border-line">
              {topics.map((topic) => (
                <li
                  key={topic.topicId}
                  className="grid gap-4 border-b border-line py-5 md:grid-cols-[1.2fr_1fr_auto] md:items-center md:gap-8"
                >
                  <div>
                    <Link
                      to={`/topics/${topic.topicId}/explain`}
                      className="text-lg font-bold hover:underline"
                    >
                      {topic.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {topic.category}, {plural(topic.explanations, "explanation", "explanations")},{" "}
                      {plural(topic.attempts, "quiz", "quizzes")}
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                      <span className={`font-semibold ${LEVEL_STYLE[topic.level]}`}>
                        {LEVEL_LABEL[topic.level]}
                      </span>
                      <span>{topic.mastery} out of 100</span>
                    </div>
                    <ScoreBar
                      value={topic.mastery}
                      label={`Mastery ${topic.mastery} out of 100`}
                    />
                  </div>

                  <div className="flex gap-4 text-sm font-semibold">
                    <Link
                      to={`/topics/${topic.topicId}/explain`}
                      className="underline"
                    >
                      Explain again
                    </Link>
                    <Link
                      to={`/topics/${topic.topicId}/quiz`}
                      className="underline"
                    >
                      Take quiz
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-14 grid gap-12 lg:grid-cols-2">
            <section>
              <h2 className="text-xl font-bold">Recent quiz scores</h2>
              <div className="mt-4">
                <QuizTrendChart attempts={recentAttempts} />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold">Quiz score and clarity by topic</h2>
              <div className="mt-4">
                <TopicScoresChart topics={topics} />
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}