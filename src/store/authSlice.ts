import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { AxiosError } from "axios"
import { getMe, loginUser } from "../service/auth"
import type { User } from "../types/user"

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
  error: null
}

const errorMessage = (err: unknown, fallback: string) =>
  (err as AxiosError<{ message?: string }>).response?.data?.message ?? fallback

export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await loginUser(email, password)
    localStorage.setItem("access_token", res.data.access_token)
    localStorage.setItem("refresh_token", res.data.refresh_token)
    const me = await getMe()
    return me.data
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Login failed"))
  }
})

// runs once when the app loads: restores the session after a page refresh
export const fetchMe = createAsyncThunk<User | null>(
  "auth/fetchMe",
  async () => {
    if (!localStorage.getItem("access_token")) return null
    try {
      const me = await getMe()
      return me.data
    } catch {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      return null
    }
  }
)

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? "Login failed"
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.initialized = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.initialized = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  }
})

export default authSlice.reducer