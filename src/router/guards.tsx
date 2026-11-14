import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAppSelector } from "../hooks/redux"
import type { UserRole } from "../types/user"

const Loading = () => <p className="p-6 text-ink-soft">Loading...</p>

// only logged-in users (and optionally only certain roles)
export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { user, initialized } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (!initialized) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

// login / register are for logged-out users only
export function GuestOnly() {
  const { user, initialized } = useAppSelector((state) => state.auth)

  if (!initialized) return <Loading />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}