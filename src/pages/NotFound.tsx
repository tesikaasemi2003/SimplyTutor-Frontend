import { Link, useLocation } from "react-router-dom"
import Logo from "../components/Logo"
import { useAppSelector } from "../hooks/redux"

const primary =
  "inline-flex items-center justify-center rounded-md bg-ink px-5 py-3 font-semibold text-white hover:bg-[#2a3860]"
const quiet =
  "inline-flex items-center justify-center rounded-md border border-line bg-sheet px-5 py-3 font-semibold hover:border-ink"

export default function NotFound() {
  const { pathname } = useLocation()
  const user = useAppSelector((state) => state.auth.user)

  return (
    <main className="graph-paper flex min-h-screen flex-col px-6 py-8">
      <header>
        <Logo />
      </header>

      <div className="mx-auto my-auto w-full max-w-xl py-16">
        <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl">
          This page is not in your notes.
        </h1>

        <p className="mt-6 font-serif text-xl leading-relaxed">
          <span className="strike break-all text-ink-soft">{pathname}</span>{" "}
          does not exist. The link may be old, or the address has a typo.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className={primary}>
                Go to dashboard
              </Link>
              <Link to="/topics" className={quiet}>
                Browse topics
              </Link>
            </>
          ) : (
            <Link to="/login" className={primary}>
              Go to sign in
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}