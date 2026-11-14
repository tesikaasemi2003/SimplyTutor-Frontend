import type { ButtonHTMLAttributes } from "react"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet"
  size?: "md" | "sm"
  loading?: boolean
  loadingText?: string
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Please wait...",
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
  const sizes = size === "sm" ? "px-3 py-2 text-sm" : "px-5 py-3"
  const styles =
    variant === "primary"
      ? "bg-ink text-white hover:bg-[#2a3860]"
      : "border border-line bg-sheet text-ink hover:border-ink"

  return (
    <button
      className={`${base} ${sizes} ${styles} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? loadingText : children}
    </button>
  )
}