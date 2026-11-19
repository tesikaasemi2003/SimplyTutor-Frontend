import type { Topic } from "../types/topic"

// small label that explains who can see a topic
export default function TopicBadge({
  topic
}: {
  topic: Pick<Topic, "visibility" | "publishStatus">
}) {
  if (topic.visibility !== "PRIVATE") return null

  const base = "inline-block rounded-md px-2 py-0.5 text-xs font-semibold"

  if (topic.publishStatus === "PENDING") {
    return (
      <span className={`${base} bg-marker text-ink`}>
        Private · waiting for review
      </span>
    )
  }
  if (topic.publishStatus === "REJECTED") {
    return (
      <span className={`${base} bg-flag-wash text-flag`}>
        Private · not approved
      </span>
    )
  }
  return <span className={`${base} border border-line text-ink-soft`}>Private</span>
}