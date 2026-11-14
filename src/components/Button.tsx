import type { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet"
  loading?: boolean
}

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
  const styles =
    variant === "primary"
      ? "bg-ink text-white hover:bg-[#2a3860]"
      : "border border-line bg-sheet text-ink hover:border-ink"

  return (
    <button
      className={`${base} ${styles} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Please wait..." : children}
    </button>
  )
}