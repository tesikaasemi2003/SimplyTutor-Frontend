export interface QuizQuestion {
  type: "MCQ" | "SCENARIO"
  question: string
  options: string[]
}

export interface QuizData {
  id: string
  topic: string
  questions: QuizQuestion[]
}

export interface ReviewItem {
  question: string
  yourAnswer: number
  correctIndex: number
  isCorrect: boolean
  explanation: string
}

export interface AttemptResult {
  attemptId: string
  score: number
  total: number
  percentage: number
  review: ReviewItem[]
}