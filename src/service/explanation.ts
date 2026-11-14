import api from "./api"
import type { Explanation } from "../types/explanation"

export const submitExplanation = async (topicId: string, text: string) => {
  const res = await api.post<{ data: Explanation }>("/explanations", {
    topicId,
    text
  })
  return res.data.data
}