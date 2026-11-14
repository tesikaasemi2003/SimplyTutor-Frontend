import { Link } from "react-router-dom"
import { useAppSelector } from "../hooks/redux"

export default function Dashboard() {
  const user = useAppSelector((state) => state.auth.user)
  if (!user) return null

  const days = user.currentStreak

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-extrabold tracking-tight">
        Welcome back, {user.name}.
      </h1>

      <p className="mt-4 font-serif text-xl leading-relaxed text-ink-soft">
        {days > 0
          ? `You are on a ${days}-day streak. Pick a topic and explain it in your own words.`
          : "Pick a topic and explain it in your own words to start your streak."}
      </p>

      <Link
        to="/topics"
        className="mt-8 inline-flex rounded-md bg-ink px-5 py-3 font-semibold text-white hover:bg-[#2a3860]"
      >
        Browse topics
      </Link>
    </div>
  )
}