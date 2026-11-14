import api from "./api"
import type { User } from "../types/user"

export interface LoginResponse {
  message: string
  data: {
    email: string
    roles: string[]
    access_token: string
    refresh_token: string
  }
}

export const registerUser = async (data: {
  name: string
  email: string
  password: string
}) => {
  const res = await api.post<{ message: string }>("/auth/register", data)
  return res.data
}

export const loginUser = async (email: string, password: string) => {
  const res = await api.post<LoginResponse>("/auth/login", { email, password })
  return res.data
}

export const getMe = async () => {
  const res = await api.get<{ message: string; data: User }>("/auth/me")
  return res.data
}