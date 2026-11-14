import api from "./api"
import type { Topic } from "../types/topic"

export const getTopics = async () => {
  const res = await api.get<{ data: Topic[] }>("/topics")
  return res.data.data
}

export const getTopicById = async (id: string) => {
  const res = await api.get<{ data: Topic }>(`/topics/${id}`)
  return res.data.data
}