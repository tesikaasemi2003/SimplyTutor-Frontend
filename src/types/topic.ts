export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

export interface Topic {
  _id: string
  title: string
  description: string
  category: string
  difficulty: Difficulty
}