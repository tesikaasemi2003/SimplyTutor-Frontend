export function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border-b border-line py-6">
          <div className="skeleton h-5 w-2/5 rounded-sm" />
          <div className="skeleton mt-3 h-4 w-4/5 rounded-sm" />
        </div>
      ))}
    </div>
  )
}