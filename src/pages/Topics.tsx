import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import DifficultyMark from "../components/DifficultyMark"
import { apiError } from "../service/errors"
import { getTopics } from "../service/topic"
import type { Topic } from "../types/topic"

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState("All")

  useEffect(() => {
    let active = true
    getTopics()
      .then((data) => active && setTopics(data))
      .catch((err) => active && setError(apiError(err, "Could not load topics.")))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(topics.map((t) => t.category))).sort()],
    [topics]
  )

  const visible =
    category === "All" ? topics : topics.filter((t) => t.category === category)

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Pick a concept</h1>
      <p className="mt-3 font-serif text-xl leading-relaxed text-ink-soft">
        Choose one and explain it in your own words.
      </p>

      {categories.length > 2 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
              className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
                category === name
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-sheet hover:border-ink"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6">
        {loading && <p className="py-8 text-ink-soft">Loading topics...</p>}

        {error && (
          <p role="alert" className="rounded-md bg-flag-wash px-3.5 py-3 text-flag">
            {error}
          </p>
        )}

        {!loading && !error && visible.length === 0 && (
          <p className="py-8 text-ink-soft">
            No topics yet. An admin needs to add some.
          </p>
        )}

        <ul className="border-t border-line">
          {visible.map((topic) => (
            <li key={topic._id}>
              <Link
                to={`/topics/${topic._id}/explain`}
                className="group grid gap-3 border-b border-line py-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
              >
                <div>
                  <h2 className="text-xl font-bold group-hover:underline">
                    {topic.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 font-serif text-ink-soft">
                    {topic.description}
                  </p>
                </div>
                <div className="flex flex-col gap-1 sm:items-end">
                  <span className="text-sm font-semibold">{topic.category}</span>
                  <DifficultyMark level={topic.difficulty} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}