import { useState } from "react"
import type { FormEvent } from "react"
import type { AxiosError } from "axios"
import { Link, useNavigate } from "react-router-dom"
import AuthLayout from "../components/AuthLayout"
import Button from "../components/Button"
import TextField from "../components/TextField"
import { useAppDispatch } from "../hooks/redux"
import { registerUser } from "../service/auth"
import { login } from "../store/authSlice"

export default function Register() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Use at least 6 characters for your password.")
      return
    }

    setSubmitting(true)
    try {
      await registerUser({ name, email, password })
      const result = await dispatch(login({ email, password }))
      navigate(login.fulfilled.match(result) ? "/dashboard" : "/login", {
        replace: true
      })
    } catch (err) {
      const message = (err as AxiosError<{ message?: string }>).response?.data
        ?.message
      setError(message ?? "Could not create your account. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start explaining, and see what you are missing."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ink underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          label="Name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 6 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p
            role="alert"
            className="rounded-md bg-flag-wash px-3.5 py-3 text-sm text-flag"
          >
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}