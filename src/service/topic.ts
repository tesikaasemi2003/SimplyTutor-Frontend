import api from "./api"
import type { Topic, TopicInput, TopicRequest } from "../types/topic"

export const getTopics = async () => {
  const res = await api.get<{ data: Topic[] }>("/topics")
  return res.data.data
}

export const getTopicById = async (id: string) => {
  const res = await api.get<{ data: Topic }>(`/topics/${id}`)
  return res.data.data
}

// admin: creates a public topic. learner: creates a private topic.
// (the backend decides from the role)
export const createTopic = async (input: TopicInput) => {
  const res = await api.post<{ data: Topic }>("/topics", input)
  return res.data.data
}

// admin: any topic. learner: only their own private topic.
export const updateTopic = async (id: string, input: TopicInput) => {
  const res = await api.put<{ data: Topic }>(`/topics/${id}`, input)
  return res.data.data
}

export const deleteTopic = async (id: string) => {
  await api.delete(`/topics/${id}`)
}

/* learner: "Suggest to everyone" */

export const requestPublish = async (id: string) => {
  const res = await api.post<{ data: Topic }>(`/topics/${id}/publish-request`)
  return res.data.data
}

export const cancelPublishRequest = async (id: string) => {
  const res = await api.delete<{ data: Topic }>(`/topics/${id}/publish-request`)
  return res.data.data
}

/* admin: review queue */

export const getPublishRequests = async () => {
  const res = await api.get<{ data: TopicRequest[] }>("/topics/publish-requests")
  return res.data.data
}

export const approveTopic = async (id: string) => {
  const res = await api.post<{ data: Topic }>(`/topics/${id}/approve`)
  return res.data.data
}

export const rejectTopic = async (id: string, reason: string) => {
  const res = await api.post<{ data: Topic }>(`/topics/${id}/reject`, { reason })
  return res.data.data
}