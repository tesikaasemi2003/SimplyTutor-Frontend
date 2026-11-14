import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks/redux"
import { logout } from "../store/authSlice"
import type { User } from "../types/user"
import Button from "./Button"
import Logo from "./Logo"
import OnboardingModal from "./OnboardingModal"

const seenKey = (user: User) => `simplytutor:onboarded:${user.id}`

// auto-open only for learners who have not seen it yet
const shouldAutoShow = (user: User): boolean => {
  if (user.roles.includes("ADMIN")) return false
  try {
    return localStorage.getItem(seenKey(user)) !== "1"
  } catch {
    return false
  }
}

// the active link looks highlighted, like the logo
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `font-semibold px-1 -mx-1 ${
    isActive
      ? "bg-[linear-gradient(transparent_55%,var(--color-marker)_55%)]"
      : "hover:underline"
  }`

export default function AppShell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const isAdmin = user?.roles.includes("ADMIN") ?? false
  const [showIntro, setShowIntro] = useState(() =>
    user ? shouldAutoShow(user) : false
  )

  const closeIntro = (goToDashboard: boolean) => {
    if (user) {
      try {
        localStorage.setItem(seenKey(user), "1")
      } catch {
        // storage blocked: the intro may show again next time, that is fine
      }
    }
    setShowIntro(false)
    if (goToDashboard) navigate("/dashboard")
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-sheet">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-3">
          <Logo />

          <nav
            aria-label="Main"
            className="order-3 flex w-full gap-6 md:order-none md:w-auto md:flex-1"
          >
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/topics" className={linkClass}>
              Topics
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/topics" className={linkClass}>
                Manage topics
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden pr-2 text-sm text-ink-soft lg:inline">
              {user?.name}
            </span>
            <Button variant="quiet" size="sm" onClick={() => setShowIntro(true)}>
              How it works
            </Button>
            <Button variant="quiet" size="sm" onClick={() => dispatch(logout())}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <Outlet />

      {showIntro && <OnboardingModal onClose={closeIntro} />}
    </div>
  )
}