import type { DayActivity } from "../types/dashboard"

const format = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", options)

export default function WeekStrip({ days }: { days: DayActivity[] }) {
  return (
    <ol className="flex gap-2 sm:gap-3">
      {days.map((day, i) => {
        const count = day.explanations + day.quizzes
        const isToday = i === days.length - 1
        const fullDate = format(day.date, {
          weekday: "long",
          day: "numeric",
          month: "short"
        })
        const summary =
          count === 0
            ? "no activity"
            : `${count} ${count === 1 ? "activity" : "activities"}`

        let box = "border-dashed border-line bg-sheet/60 text-ink-soft"
        if (count > 0) box = "mark-box border-ink bg-sheet"
        else if (isToday) box = "today-ring border-ink bg-sheet text-ink"

        return (
          <li
            key={day.date}
            className="rise-in flex flex-col items-center gap-1.5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span
              role="img"
              aria-label={`${fullDate}: ${summary}`}
              className={`flex h-11 w-11 items-center justify-center rounded-md border text-sm font-bold sm:h-12 sm:w-12 ${box}`}
              style={count > 0 ? { animationDelay: `${i * 90}ms` } : undefined}
            >
              {count > 0 ? (
                <span
                  className="pop"
                  style={{ animationDelay: `${i * 90 + 300}ms` }}
                >
                  {count}
                </span>
              ) : isToday ? (
                <span aria-hidden="true">✎</span>
              ) : (
                ""
              )}
            </span>
            <span
              className={`text-xs ${isToday ? "font-bold" : "text-ink-soft"}`}
            >
              {isToday ? "Today" : format(day.date, { weekday: "short" })}
            </span>
          </li>
        )
      })}
    </ol>
  )
}