import type { InputHTMLAttributes } from "react"

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
}

export default function TextField({
  label,
  hint,
  id,
  className = "",
  ...rest
}: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full rounded-md border border-line bg-sheet px-3.5 py-3 text-base placeholder:text-ink-soft/70 focus:border-ink ${className}`}
        {...rest}
      />
      {hint && <p className="mt-1.5 text-sm text-ink-soft">{hint}</p>}
    </div>
  )
}