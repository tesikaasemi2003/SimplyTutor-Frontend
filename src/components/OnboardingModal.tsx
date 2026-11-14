import { useEffect, useRef, useState } from "react"
import type { CSSProperties, KeyboardEvent } from "react"
import Button from "./Button"

type Slide = {
  label: string
  title: string
  body: string
  quote?: string
  quoteBy?: string
}

const SLIDES: Slide[] = [
  {
    label: "The idea",
    title: "Can you explain it to a 12-year-old?",
    body: "That is the Feynman Technique. You learn a concept by explaining it in plain words. Wherever you get stuck, you have found something you do not understand yet."
  },
  {
    label: "The name behind it",
    title: "Richard Feynman",
    body: "A physicist who won the 1965 Nobel Prize in Physics and became famous for explaining hard ideas in plain language. The method is named after the way he learned and taught.",
    quote: "What I cannot create, I do not understand.",
    quoteBy: "Richard Feynman"
  },
  {
    label: "Step 1 of 4",
    title: "Pick a concept",
    body: "Choose one topic from the list. Start with something you are studying right now."
  },
  {
    label: "Step 2 of 4",
    title: "Explain it simply",
    body: "Write it in your own words, as if you were teaching a 12-year-old. No jargon, no copying from your notes."
  },
  {
    label: "Step 3 of 4",
    title: "Find your gaps",
    body: "Your AI tutor marks what is unclear, what is wrong, and which important ideas you missed."
  },
  {
    label: "Step 4 of 4",
    title: "Test and refine",
    body: "Take a short quiz built around your gaps, then explain the topic again, simpler this time."
  }
]

// where each card sits relative to the active card
const cardStyle = (i: number, active: number): CSSProperties => {
  const offset = i - active

  if (offset < 0) {
    // already seen: rotates off to the left
    return {
      transform: "translateX(-115%) rotate(-14deg)",
      opacity: 0,
      pointerEvents: "none",
      zIndex: 0
    }
  }
  if (offset === 0) {
    return { transform: "translateX(0) rotate(0deg)", opacity: 1, zIndex: 10 }
  }
  if (offset <= 2) {
    // waiting behind: a small tilted pile
    return {
      transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.04}) rotate(${offset % 2 ? 2.5 : -2.5}deg)`,
      opacity: 1,
      zIndex: 10 - offset
    }
  }
  return { transform: "translateY(24px) scale(0.9)", opacity: 0, zIndex: 0 }
}

type Props = {
  // true when the learner pressed "Let's go"
  onClose: (goToDashboard: boolean) => void
}

export default function OnboardingModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(0)
  const isLast = index === SLIDES.length - 1

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  const next = () => setIndex((i) => Math.min(i + 1, SLIDES.length - 1))
  const back = () => setIndex((i) => Math.max(i - 1, 0))

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowRight") next()
    if (e.key === "ArrowLeft") back()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="How SimplyTutor works"
      onKeyDown={handleKeyDown}
      onCancel={(e) => {
        e.preventDefault()
        onClose(false)
      }}
      className="m-auto max-h-[92vh] w-[min(92vw,34rem)] overflow-y-auto rounded-xl border border-line bg-paper p-5 text-ink backdrop:bg-ink/60 sm:p-7"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold tracking-tight">
          Welcome to SimplyTutor
        </h2>
        <button
          type="button"
          onClick={() => onClose(false)}
          className="rounded text-sm font-semibold text-ink-soft underline hover:text-ink"
        >
          Skip
        </button>
      </div>

      <div className="relative mt-6 h-[26rem] sm:h-[22rem]">
        {SLIDES.map((slide, i) => (
          <article
            key={slide.title}
            aria-hidden={i !== index}
            style={cardStyle(i, index)}
            className="absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-line bg-sheet p-5 transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none"
          >
            <p className="text-sm font-semibold text-ink-soft">{slide.label}</p>
            <div className="mt-3 border-t-2 border-flag/70" />

            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
              {slide.title}
            </h3>
            <p className="mt-3 font-serif text-base leading-relaxed sm:text-lg">
              {slide.body}
            </p>

            {slide.quote && (
              <blockquote className="mt-auto border-l-4 border-marker pl-4 font-serif italic">
                {slide.quote}
                <footer className="mt-1 font-sans text-sm text-ink-soft not-italic">
                  {slide.quoteBy}
                </footer>
              </blockquote>
            )}
          </article>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Card {index + 1} of {SLIDES.length}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="quiet" onClick={back} disabled={index === 0}>
          Back
        </Button>

        <div className="flex items-center">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Go to card ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="group rounded p-1.5"
            >
              <span
                className={`block h-2.5 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-ink"
                    : "w-2.5 bg-line group-hover:bg-ink-soft"
                }`}
              />
            </button>
          ))}
        </div>

        {isLast ? (
          <Button onClick={() => onClose(true)}>Let's go</Button>
        ) : (
          <Button onClick={next}>Next</Button>
        )}
      </div>
    </dialog>
  )
}