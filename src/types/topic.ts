export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export type Visibility = "PUBLIC" | "PRIVATE"

// NONE = no request yet (or already public), PENDING = waiting for admin,
// REJECTED = admin said no (see rejectionReason)
export type PublishStatus = "NONE" | "PENDING" | "REJECTED"

export interface Topic {
  _id: string
  title: string
  description: string
  category: string
  difficulty: Difficulty
  createdBy: string
  // topics saved before this feature have no visibility: they are public
  visibility?: Visibility
  publishStatus?: PublishStatus
  rejectionReason?: string
}

export type TopicInput = Pick<
  Topic,
  "title" | "description" | "category" | "difficulty"
>

// what the admin sees in the review queue (createdBy is populated)
export type TopicRequest = Omit<Topic, "createdBy"> & {
  createdBy: { _id: string; name: string } | null
}

// same limits as the backend
export const TOPIC_LIMITS = {
  title: 100,
  description: 1000,
  category: 40,
  maxPrivate: 15
}