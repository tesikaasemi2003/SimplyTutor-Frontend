import type { ReactNode } from "react"
import Logo from "./Logo"

type Props = {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export default function AuthLayout({ title, subtitle, footer, children }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section
        aria-hidden="true"
        className="graph-paper order-2 flex items-center px-6 py-14 sm:px-12 lg:order-1 lg:px-20"
      >
        <div className="mx-auto w-full max-w-xl">
          <h2 className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl">
            Explain it simply.
            <br />
            Find what you missed.
          </h2>

          <div className="mt-10 space-y-5 font-serif text-lg leading-relaxed sm:text-xl">
            <p className="text-ink-soft">
              <span className="strike">
                Photosynthesis is the process by which chlorophyll-containing
                organisms convert light energy into chemical energy.
              </span>
            </p>
            <p>
              <span className="mark">
                Plants use sunlight to make their own food.
              </span>{" "}
              They take in water and air, and give out oxygen.
            </p>
            <p className="gap-note border-l-4 border-marker pl-4 font-sans text-base">
              Gap found: you say oxygen is given out, but not where it comes
              from.
            </p>
          </div>
        </div>
      </section>

      <main className="order-1 flex items-center justify-center bg-sheet px-6 py-12 lg:order-2">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-10 text-3xl font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-ink-soft">{footer}</p>
        </div>
      </main>
    </div>
  )
}