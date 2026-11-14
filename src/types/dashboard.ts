export interface DayActivity {
  date: string
  explanations: number
  quizzes: number
}

export interface TopicMastery {
  topicId: string
  title: string
  category: string
  avgQuizScore: number | null
  avgClarityScore: number | null
  attempts: number
  explanations: number
  mastery: number
  level: "MASTERED" | "LEARNING" | "NEEDS_WORK"
}

export interface RecentAttempt {
  _id: string
  score: number
  total: number
  percentage: number
  createdAt: string
  topic: { _id: string; title: string } | null
}

export interface DashboardData {
  streak: { current: number; lastActiveDate: string | null }
  totals: {
    explanations: number
    quizAttempts: number
    avgQuizScore: number
    avgClarityScore: number
  }
  topics: TopicMastery[]
  activityLast7Days: DayActivity[]
  recentAttempts: RecentAttempt[]
}