import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"

const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({ baseURL: BASE_URL })

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"]

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// attach the access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// on 401: try to refresh once, then retry the original request
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const isPublic = PUBLIC_PATHS.some((p) => original?.url?.includes(p))

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isPublic
    ) {
      original._retry = true
      const refreshToken = localStorage.getItem("refresh_token")

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken
          })
          const newToken = res.data.data.accessToken
          localStorage.setItem("access_token", newToken)
          original.headers.Authorization = `Bearer ${newToken}`
          return api(original)
        } catch {
          // refresh failed, fall through to logout
        }
      }

      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)

export default api