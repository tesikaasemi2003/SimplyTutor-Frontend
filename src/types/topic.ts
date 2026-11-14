export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export interface Topic {
  _id: string
  title: string
  description: string
  category: string
  difficulty: Difficulty
}

export type TopicInput = Omit<Topic, "_id">