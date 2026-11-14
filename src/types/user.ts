export type UserRole = "ADMIN" | "LEARNER"

export interface User {
  id: string
  name: string
  email: string
  roles: UserRole[]
  currentStreak: number
}