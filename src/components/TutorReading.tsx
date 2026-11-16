const LINES = ["92%", "78%", "86%", "54%"]

export default function TutorReading() {
  return (
    <div role="status" className="mt-6 rounded-md border border-line bg-sheet p-5">
      <p className="font-semibold">Your tutor is reading your explanation...</p>
      <div aria-hidden="true" className="mt-4 space-y-3">
        {LINES.map((width, i) => (
          <div
            key={width}
            className="reading-line h-3.5 rounded-sm bg-line"
            style={{ width, animationDelay: `${i * 350}ms` }}
          />
        ))}
      </div>
    </div>
  )
}