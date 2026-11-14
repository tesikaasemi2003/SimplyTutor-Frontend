import api from "./api"
import type { AttemptResult, QuizData } from "../types/quiz"

export const generateQuiz = async (topicId: string, count: number) => {
  const res = await api.post<{ data: QuizData }>("/quizzes/generate", {
    topicId,
    count
  })
  return res.data.data
}

export const submitAttempt = async (quizId: string, answers: number[]) => {
  const res = await api.post<{ data: AttemptResult }>(
    `/quizzes/${quizId}/attempts`,
    { answers }
  )
  return res.data.data
}