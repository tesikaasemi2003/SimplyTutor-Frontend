import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import type { RecentAttempt } from "../types/dashboard"

const INK = "#16213E"
const SOFT = "#5B6478"
const LINE = "#D9DEE8"
const MARKER = "#FFE066"

export default function QuizTrendChart({
  attempts
}: {
  attempts: RecentAttempt[]
}) {
  // the API sends newest first, the chart reads oldest to newest
  const data = [...attempts].reverse().map((a) => ({
    label: new Date(a.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short"
    }),
    score: a.percentage
  }))

  if (data.length < 2) {
    return (
      <p className="text-ink-soft">
        Take at least two quizzes to see your trend.
      </p>
    )
  }

  const summary = data.map((d) => `${d.score} percent`).join(", ")

  return (
    <div
      role="img"
      aria-label={`Your last ${data.length} quiz scores: ${summary}`}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
        >
          <CartesianGrid stroke={LINE} vertical={false} />
          <XAxis dataKey="label" stroke={SOFT} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            stroke={SOFT}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={{ border: `1px solid ${LINE}`, borderRadius: 6 }} />
          <Line
            type="monotone"
            dataKey="score"
            name="Score (%)"
            stroke={INK}
            strokeWidth={2.5}
            dot={{ r: 5, fill: MARKER, stroke: INK, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}