import type { Feedback } from "./explanation"

export interface TopicRef {
  _id: string
  title: string
  category: string
}

export interface ExplanationItem {
  _id: string
  text: string
  feedback: Feedback
  createdAt: string
  topic: TopicRef | null
}

export interface AttemptItem {
  _id: string
  score: number
  total: number
  percentage: number
  createdAt: string
  topic: TopicRef | null
}