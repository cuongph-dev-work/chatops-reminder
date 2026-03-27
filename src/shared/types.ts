// src/shared/types.ts
// Core TypeScript interfaces for the ChatOps Reminder Chrome Extension

export type ReminderStatus = "pending" | "snoozed" | "completed"

export type RecurrenceType = "daily" | "weekly" | "monthly"

export interface RecurrenceRule {
  type: RecurrenceType
  dayOfWeek?: number | null // 0-6 for weekly; null for daily/monthly
  dayOfMonth?: number | null // 1-31 for monthly; null for daily/weekly
}

export interface Tag {
  id: string
  name: string
  color: string // hex, e.g. "#3B82F6"
  createdAt: string // ISO 8601
}

export interface Reminder {
  id: string
  title: string
  messageLink: string // Mattermost message permalink
  scheduledAt: string // ISO 8601
  preReminderMinutes: 0 | 5 | 10 | 15 | 30
  tagIds: string[]
  recurrence: RecurrenceRule | null
  status: ReminderStatus
  createdAt: string // ISO 8601
  completedAt: string | null
  snoozedUntil: string | null
  sourceInstanceUrl: string // Mattermost instance base URL
}

export interface NotificationEvent {
  id: string
  reminderId: string
  firedAt: string // ISO 8601
  action: "clicked" | "snoozed" | "dismissed"
  snoozeMinutes: number | null
}

export interface Settings {
  language: "en" | "vi"
}

// Message passing contracts between content scripts and background
export type MessageType =
  | "CREATE_REMINDER"
  | "UPDATE_REMINDER"
  | "DELETE_REMINDER"
  | "CLEAR_COMPLETED"

export interface CreateReminderPayload {
  title: string
  messageLink: string
  scheduledAt: string
  preReminderMinutes: 0 | 5 | 10 | 15 | 30
  tagIds: string[]
  recurrence: RecurrenceRule | null
}

export interface UpdateReminderPayload {
  id: string
  title?: string
  scheduledAt?: string
  preReminderMinutes?: 0 | 5 | 10 | 15 | 30
  tagIds?: string[]
  recurrence?: RecurrenceRule | null
}

export interface DeleteReminderPayload {
  id: string
}

export interface ClearCompletedPayload {
  id?: string // omit to clear all
}

export type BackgroundMessage =
  | { type: "CREATE_REMINDER"; payload: CreateReminderPayload }
  | { type: "UPDATE_REMINDER"; payload: UpdateReminderPayload }
  | { type: "DELETE_REMINDER"; payload: DeleteReminderPayload }
  | { type: "CLEAR_COMPLETED"; payload: ClearCompletedPayload }

export type BackgroundResponse =
  | { success: true; reminder: Reminder }
  | { success: true; clearedCount: number }
  | { success: true }
  | { success: false; error: string }
