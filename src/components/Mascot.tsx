import { useState } from "react"

type Props = {
  /** First message is shown by default; clicking the mascot cycles through the rest. */
  messages: string[]
}

const INK = "#16213e"
const MARKER = "#ffe066"

export default function Mascot({ messages }: Props) {
  const [index, setIndex] = useState(0)
  const [hops, setHops] = useState(0)

  const cheer = () => {
    setIndex((i) => (i + 1) % messages.length)
    setHops((h) => h + 1) // new key restarts the hop animation
  }

  return (
    <div className="flex w-52 flex-col items-center sm:w-72">
      <div
        aria-live="polite"
        className="relative rounded-lg border-2 border-ink bg-sheet px-4 py-2.5 text-center text-sm font-semibold leading-snug sm:text-base"
      >
        {messages[index]}
        <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-ink bg-sheet" />
      </div>

      <button
        type="button"
        onClick={cheer}
        aria-label="Pip the pencil. Click for a tip."
        className="mt-3 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <svg
          key={hops}
          aria-hidden="true"
          viewBox="0 0 160 200"
          className={`h-auto w-44 sm:w-56 ${hops > 0 ? "mascot-hop" : ""}`}
        >
          <ellipse
            className="mascot-shadow"
            cx="80"
            cy="188"
            rx="34"
            ry="6"
            fill={INK}
            opacity="0.15"
          />

          <g className="mascot-bob">
            {/* legs */}
            <path d="M68 160v18M92 160v18" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="64" cy="180" rx="9" ry="4.5" fill={INK} />
            <ellipse cx="96" cy="180" rx="9" ry="4.5" fill={INK} />

            {/* left arm */}
            <path d="M48 104Q32 114 34 134" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <circle cx="34" cy="136" r="5" fill={MARKER} stroke={INK} strokeWidth="3" />

            {/* body */}
            <rect x="48" y="62" width="64" height="100" rx="10" fill={MARKER} stroke={INK} strokeWidth="3" />
            <path d="M60 72v82M100 72v82" stroke="#e0b400" strokeWidth="2" strokeLinecap="round" />

            {/* tip */}
            <path d="M48 62L80 16l32 46z" fill="#f3d6a4" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
            <path d="M71 34l9-18 9 18z" fill={INK} />

            {/* face */}
            <g className="mascot-blink">
              <circle cx="68" cy="100" r="8" fill="#fff" stroke={INK} strokeWidth="2.5" />
              <circle cx="92" cy="100" r="8" fill="#fff" stroke={INK} strokeWidth="2.5" />
              <circle cx="69" cy="101" r="3.5" fill={INK} />
              <circle cx="93" cy="101" r="3.5" fill={INK} />
            </g>
            <circle cx="58" cy="118" r="4" fill="#ff9aa2" opacity="0.7" />
            <circle cx="102" cy="118" r="4" fill="#ff9aa2" opacity="0.7" />
            <path d="M70 116Q80 128 90 116" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />

            {/* waving right arm */}
            <g className="mascot-wave">
              <path d="M112 104Q134 96 136 74" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
              <circle cx="136" cy="72" r="5" fill={MARKER} stroke={INK} strokeWidth="3" />
            </g>
          </g>
        </svg>
      </button>
    </div>
  )
}