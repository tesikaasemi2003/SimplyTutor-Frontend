import { useEffect } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AppShell from "./components/AppShell"
import { useAppDispatch } from "./hooks/redux"
import AdminRequests from "./pages/AdminRequests"
import AdminTopics from "./pages/AdminTopics"
import Dashboard from "./pages/Dashboard"
import Explain from "./pages/Explain"
import History from "./pages/History"
import Login from "./pages/Login"
import MyTopics from "./pages/MyTopics"
import NotFound from "./pages/NotFound"
import Quiz from "./pages/Quiz"
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
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
          <Route path="/topics/:id/quiz" element={<Quiz />} />
          <Route path="/history" element={<History />} />

          {/* learners only: private topics (admins add public ones instead) */}
          <Route element={<RequireAuth roles={["LEARNER"]} />}>
            <Route path="/my-topics" element={<MyTopics />} />
          </Route>

          {/* admins only */}
          <Route element={<RequireAuth roles={["ADMIN"]} />}>
            <Route path="/admin/topics" element={<AdminTopics />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
          </Route>
        </Route>
      </Route>

      {/* anything else */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}