import { useEffect } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AppShell from "./components/AppShell"
import { useAppDispatch } from "./hooks/redux"
import Dashboard from "./pages/Dashboard"
import Explain from "./pages/Explain"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Topics from "./pages/Topics"
import { GuestOnly, RequireAuth } from "./router/guards"
import { fetchMe } from "./store/authSlice"

export default function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  return (
    <Routes>
      {/* logged-out users only */}
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* logged-in users only */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:id/explain" element={<Explain />} />
        </Route>
      </Route>

      {/* anything else */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}