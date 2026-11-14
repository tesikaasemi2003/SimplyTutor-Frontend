import type { AxiosError } from "axios"

export const apiError = (err: unknown, fallback: string): string =>
  (err as AxiosError<{ message?: string }>).response?.data?.message ?? fallback