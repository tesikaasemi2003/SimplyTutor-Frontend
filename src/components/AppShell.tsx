import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
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

export default function AppShell() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft md:inline">
              {user?.name}
            </span>
            <Button variant="quiet" onClick={() => setShowIntro(true)}>
              How it works
            </Button>
            <Button variant="quiet" onClick={() => dispatch(logout())}>
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