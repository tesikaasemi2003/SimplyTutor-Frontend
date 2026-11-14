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
    </div>
  )
}