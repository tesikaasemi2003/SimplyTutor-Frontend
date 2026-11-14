export interface Feedback {
  clarityScore: number
  summary: string
  misconceptions: string[]
  gaps: string[]
  suggestions: string[]
}

export interface Explanation {
  _id: string
  text: string
  feedback: Feedback
  createdAt: string
}