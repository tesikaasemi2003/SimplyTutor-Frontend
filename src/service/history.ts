import api from "./api"
import type { AttemptItem, ExplanationItem } from "../types/history"

export const getMyExplanations = async (topicId?: string) => {
  const res = await api.get<{ data: ExplanationItem[] }>("/explanations/me", {
    params: topicId ? { topic: topicId } : {}
  })
  return res.data.data
}

export const getMyAttempts = async () => {
  const res = await api.get<{ data: AttemptItem[] }>("/quizzes/attempts/me")
  return res.data.data
}

export const deleteExplanation = async (id: string) => {
  await api.delete(`/explanations/${id}`)
}

export const deleteAttempt = async (id: string) => {
  await api.delete(`/quizzes/attempts/${id}`)
}