import api from "./api"
import type { DashboardData } from "../types/dashboard"

export const getDashboard = async () => {
  const res = await api.get<{ data: DashboardData }>("/dashboard/me")
  return res.data.data
}