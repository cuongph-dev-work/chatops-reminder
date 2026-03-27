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

export interface SiteMapping {
  domain: string      // hostname, e.g. "jira.company.com"
  name: string        // friendly display name, e.g. "Jira"
  autoDetected: boolean // true if name was derived from page title
}

export interface Reminder {
  id: string
  title: string
  messageLink?: string // Mattermost message permalink (optional for manual creation)
  scheduledAt: string // ISO 8601
  preReminderMinutes: 0 | 5 | 10 | 15 | 30
  tagIds: string[]
  recurrence: RecurrenceRule | null
  status: ReminderStatus
  createdAt: string // ISO 8601
  completedAt: string | null
  snoozedUntil: string | null
  hasAutoSnoozed?: boolean // Flag to prevent infinite auto-snooze loops
  sourceInstanceUrl?: string // Mattermost instance base URL (optional for manual creation)
  description?: string // Optional note/description for the reminder
  sourceSiteName?: string // Friendly name of the site where reminder was created
  sourcePageTitle?: string // Raw document.title of the source page
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
  autoSnooze?: boolean
  autoSnoozeMinutes?: number
}

// Message passing contracts between content scripts and background
export type MessageType =
  | "CREATE_REMINDER"
  | "UPDATE_REMINDER"
  | "DELETE_REMINDER"
  | "CLEAR_COMPLETED"
  | "IGNORE_NOTIFICATION"

export interface CreateReminderPayload {
  title: string
  messageLink?: string
  scheduledAt: string
  preReminderMinutes: 0 | 5 | 10 | 15 | 30
  tagIds: string[]
  recurrence: RecurrenceRule | null
  description?: string
  sourcePageTitle?: string // Raw document.title to auto-create SiteMapping
}

export interface UpdateReminderPayload {
  id: string
  title?: string
  messageLink?: string
  scheduledAt?: string
  preReminderMinutes?: 0 | 5 | 10 | 15 | 30
  tagIds?: string[]
  recurrence?: RecurrenceRule | null
  description?: string
}

export interface DeleteReminderPayload {
  id: string
}

export interface ClearCompletedPayload {
  id?: string // omit to clear all
}

export interface SnoozeNotificationPayload {
  reminderId: string
  minutes: number
}

export interface DismissNotificationPayload {
  reminderId: string
}

export interface IgnoreNotificationPayload {
  reminderId: string
}

export interface PendingReminderData {
  link: string
  pageTitle: string
}

export type BackgroundMessage =
  | { type: "CREATE_REMINDER"; payload: CreateReminderPayload }
  | { type: "UPDATE_REMINDER"; payload: UpdateReminderPayload }
  | { type: "DELETE_REMINDER"; payload: DeleteReminderPayload }
  | { type: "CLEAR_COMPLETED"; payload: ClearCompletedPayload }
  | { type: "SNOOZE_NOTIFICATION"; payload: SnoozeNotificationPayload }
  | { type: "DISMISS_NOTIFICATION"; payload: DismissNotificationPayload }
  | { type: "IGNORE_NOTIFICATION"; payload: IgnoreNotificationPayload }
  | { type: "OPEN_POPUP_WITH_REMINDER"; payload: PendingReminderData }

export type BackgroundResponse =
  | { success: true; reminder: Reminder }
  | { success: true; clearedCount: number }
  | { success: true }
  | { success: false; error: string }
