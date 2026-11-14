import api from "./api"
import type { Topic, TopicInput } from "../types/topic"

export const getTopics = async () => {
  const res = await api.get<{ data: Topic[] }>("/topics")
  return res.data.data
}

export const getTopicById = async (id: string) => {
  const res = await api.get<{ data: Topic }>(`/topics/${id}`)
  return res.data.data
}

// admin only (the backend checks the role too)
export const createTopic = async (input: TopicInput) => {
  const res = await api.post<{ data: Topic }>("/topics", input)
  return res.data.data
}

export const updateTopic = async (id: string, input: TopicInput) => {
  const res = await api.put<{ data: Topic }>(`/topics/${id}`, input)
  return res.data.data
}

export const deleteTopic = async (id: string) => {
  await api.delete(`/topics/${id}`)
}