import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import type { TopicMastery } from "../types/dashboard"

const INK = "#16213E"
const SOFT = "#5B6478"
const LINE = "#D9DEE8"
const MARKER = "#FFE066"

export default function TopicScoresChart({
  topics
}: {
  topics: TopicMastery[]
}) {
  const data = topics.map((t) => ({
    name: t.title.length > 18 ? `${t.title.slice(0, 17)}...` : t.title,
    quiz: t.avgQuizScore,
    clarity: t.avgClarityScore
  }))

  const summary = topics
    .map(
      (t) =>
        `${t.title}: quiz ${t.avgQuizScore ?? "none"}, clarity ${t.avgClarityScore ?? "none"}`
    )
    .join(". ")

  return (
    <div
      role="img"
      aria-label={`Quiz score and clarity by topic. ${summary}`}
      style={{ height: Math.max(220, topics.length * 72 + 56) }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke={LINE} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke={SOFT}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            stroke={SOFT}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(22, 33, 62, 0.05)" }}
            contentStyle={{ border: `1px solid ${LINE}`, borderRadius: 6 }}
          />
          <Legend iconType="square" />
          <Bar
            dataKey="quiz"
            name="Quiz score"
            fill={INK}
            radius={[0, 4, 4, 0]}
            barSize={14}
          />
          <Bar
            dataKey="clarity"
            name="Clarity"
            fill={MARKER}
            stroke={INK}
            radius={[0, 4, 4, 0]}
            barSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}