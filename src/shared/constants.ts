// src/shared/constants.ts
// Application-wide constants for the ChatOps Reminder Chrome Extension

export const PRE_REMINDER_OPTIONS = [
  { value: 0, label: "On time" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" }
] as const

export const PRE_REMINDER_VALUES = [0, 5, 10, 15, 30] as const

export const RECURRENCE_TYPES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
] as const

export const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
] as const

export const STORAGE_KEYS = {
  REMINDERS: "reminders",
  TAGS: "tags",
  SETTINGS: "settings",
  SITE_MAPPINGS: "siteMappings",
  PENDING_REMINDER: "pendingReminder"
} as const

export const MESSAGE_TYPES = {
  CREATE_REMINDER: "CREATE_REMINDER",
  UPDATE_REMINDER: "UPDATE_REMINDER",
  DELETE_REMINDER: "DELETE_REMINDER",
  CLEAR_COMPLETED: "CLEAR_COMPLETED"
} as const

export const NOTIFICATION_BUTTONS = {
  SNOOZE_5: { title: "Snooze 5 min" },
  SNOOZE_10: { title: "Snooze 10 min" }
} as const

export const SNOOZE_OPTIONS = [5, 10] as const // minutes

export const AUTO_PURGE_DAYS = 30 // completed reminders older than this are purged

export const MATTERMOST_PATTERNS = {
  URL_PATTERNS: [
    "//**/channels/**",
    "//**/direct-messages/**"
  ],
  SELECTOR_MARKERS: [
    ".MenuItem", // Mattermost action menu items
    ".dropdown-menu",
    "button.post__dropdown"
  ],
  REMIND_ME_BUTTON_ID: "chatops-remind-me-btn"
} as const

export const DEFAULTS = {
  LANGUAGE: "en" as const,
  PRE_REMINDER_MINUTES: 0 as const,
  RECURRENCE: null,
  AUTO_SNOOZE: true,
  AUTO_SNOOZE_MINUTES: 5
}

export const VALIDATION = {
  MAX_TITLE_LENGTH: 200
} as const

export const TAG_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316"  // orange
] as const
