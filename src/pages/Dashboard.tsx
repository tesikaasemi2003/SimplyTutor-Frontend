import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Button from "../components/Button"
import Mascot from "../components/Mascot"
import QuizTrendChart from "../components/QuizTrendChart"
import ScoreBar from "../components/ScoreBar"
import { SkeletonRows } from "../components/Skeleton"
import TopicScoresChart from "../components/TopicScoresChart"
import WeekStrip from "../components/WeekStrip"
import { useAppSelector } from "../hooks/redux"
import { useCountUp } from "../hooks/useCountUp"
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

type Stat = {
  label: string
  value: number | null
  suffix?: string
  hint: string
  icon: string
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const hasValue = stat.value !== null
  const shown = useCountUp(stat.value ?? 0, hasValue)

  return (
    <div
      className="lift rise-in rounded-lg border border-line bg-sheet p-4"
      style={{ animationDelay: `${160 + index * 80}ms` }}
    >
      <dt className="flex items-center gap-2 text-sm text-ink-soft">
        <span aria-hidden="true">{stat.icon}</span>
        {stat.label}
      </dt>
      <dd className="mt-1 text-2xl font-extrabold tracking-tight">
        {hasValue ? (
          <>
            {shown}
            {stat.suffix}
          </>
        ) : (
          <span className="text-ink-soft">None yet</span>
        )}
      </dd>
      {!hasValue && (
        <p className="mt-1 text-xs text-ink-soft">{stat.hint}</p>
      )}
    </div>
  )
}

function NotebookArt() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 96"
      className="h-24 w-28 shrink-0"
    >
      <rect x="14" y="10" width="76" height="80" rx="6" fill="#fff" stroke="#16213e" strokeWidth="3" />
      <rect x="14" y="10" width="14" height="80" rx="4" fill="#ffe066" stroke="#16213e" strokeWidth="3" />
      <path d="M40 34h38M40 48h38M40 62h24" stroke="#d9dee8" strokeWidth="3" strokeLinecap="round" />
      <g className="wiggle">
        <path d="M84 70l22-38 8 5-22 38-10 4z" fill="#ffe066" stroke="#16213e" strokeWidth="3" strokeLinejoin="round" />
        <path d="M84 70l-2 10 10-4" fill="#16213e" />
      </g>
    </svg>
  )
}

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
      <div
        role="status"
        aria-label="Loading your progress"
        className="mx-auto max-w-5xl px-6 py-14"
      >
        <div className="skeleton h-10 w-2/3 rounded-sm" />
        <div className="skeleton mt-4 h-6 w-1/2 rounded-sm" />
        <div className="mt-10">
          <SkeletonRows count={3} />
        </div>
      </div>
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

  const mascotMessages = [
    streak.current > 0
      ? doneToday
        ? "Nice work today! Keep it up."
        : `Your ${streak.current}-day streak needs you today!`
      : "Hi, I'm Pip! Pick a topic and explain it to me.",
    "Explain it like you're teaching a 12-year-old.",
    "No jargon. Short, simple words win.",
    "Stuck? Try an example from everyday life."
  ]

  const stats: Stat[] = [
    {
      label: "Explanations",
      value: totals.explanations,
      hint: "",
      icon: "✎"
    },
    {
      label: "Quizzes taken",
      value: totals.quizAttempts,
      hint: "",
      icon: "?"
    },
    {
      label: "Average quiz score",
      value: totals.quizAttempts ? totals.avgQuizScore : null,
      suffix: "%",
      hint: "Take a quiz to see this.",
      icon: "%"
    },
    {
      label: "Average clarity (out of 100)",
      value: totals.explanations ? totals.avgClarityScore : null,
      hint: "Explain a topic to see this.",
      icon: "★"
    }
  ]

  return (
    <div className="graph-paper min-h-[calc(100vh-4rem)]">
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
        <div className="min-w-0 flex-1 basis-80">
          <h1 className="rise-in text-4xl font-extrabold tracking-tight">
            Welcome back,{" "}
            <span className="mark" style={{ animationDelay: "500ms" }}>
              {user.name}.
            </span>
          </h1>
          <p
            className="rise-in mt-3 font-serif text-xl leading-relaxed text-ink-soft"
            style={{ animationDelay: "80ms" }}
          >
            {streakText}
          </p>
        </div>
        <Mascot messages={mascotMessages} />
      </div>

      <div className="mt-6">
        <WeekStrip days={activityLast7Days} />
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </dl>

      {topics.length === 0 ? (
        <section
          className="rise-in mt-14 flex flex-col items-start gap-6 rounded-lg border border-dashed border-ink/40 bg-sheet p-8 sm:flex-row sm:items-center"
          style={{ animationDelay: "480ms" }}
        >
          <NotebookArt />
          <div>
            <h2 className="text-xl font-bold">Nothing here yet</h2>
            <p className="mt-2 max-w-xl font-serif text-lg leading-relaxed text-ink-soft">
              Explain your first topic and your progress will show up here.
            </p>
            <Link
              to="/topics"
              className="group mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition-colors hover:bg-[#2a3860]"
            >
              Browse topics
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </Link>
          </div>
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
              {topics.map((topic, index) => (
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
                      {topic.category},{" "}
                      {plural(topic.explanations, "explanation", "explanations")},{" "}
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
                      animate
                      delay={index * 90}
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
    </div>
  )
}