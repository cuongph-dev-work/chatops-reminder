# Data Model: ChatOps Reminder Chrome Extension

**Branch**: `001-chatops-reminder-ext` | **Date**: 2026-03-27

## Entities

### Reminder

Represents a scheduled notification tied to a Mattermost message.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✅ | Unique identifier |
| `title` | string | ✅ | User-provided title or note |
| `messageLink` | string (URL) | ✅ | Mattermost message permalink |
| `scheduledAt` | string (ISO 8601) | ✅ | Date/time when the reminder should fire |
| `preReminderMinutes` | number | ✅ | Minutes before `scheduledAt` to fire (0 = on time, 5, 10, 15, 30) |
| `tagIds` | string[] | ❌ | Array of Tag IDs (zero or more) |
| `recurrence` | RecurrenceRule \| null | ❌ | Recurrence configuration (null = one-time) |
| `status` | ReminderStatus | ✅ | Current lifecycle state |
| `createdAt` | string (ISO 8601) | ✅ | Creation timestamp |
| `completedAt` | string (ISO 8601) \| null | ❌ | When the reminder was marked completed |
| `snoozedUntil` | string (ISO 8601) \| null | ❌ | If snoozed, when the snooze alarm fires |
| `sourceInstanceUrl` | string (URL) | ✅ | Base URL of the Mattermost instance (for display) |

**Status Enum (`ReminderStatus`)**:

| Value | Description |
|-------|-------------|
| `pending` | Waiting to fire |
| `snoozed` | Currently snoozed, will re-fire at `snoozedUntil` |
| `completed` | Notification has fired (or snooze chain ended); visible in Completed tab |

**State Transitions**:

```
                    ┌─── snooze ───┐
                    │              │
  [created] → pending → completed
                    ▲              │
                    └── snooze ────┘
                       fires again
```

- `pending` → `snoozed`: User clicks Snooze on notification
- `snoozed` → `pending`: Snooze alarm fires, notification re-displayed
- `pending` → `completed`: Notification fires and user does not snooze (or clicks/dismisses)
- For recurring: `completed` → new `pending` reminder auto-created for next occurrence

### RecurrenceRule

Defines the recurrence pattern for a reminder.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'daily'` \| `'weekly'` \| `'monthly'` | ✅ | Recurrence frequency |
| `dayOfWeek` | number (0-6) \| null | ❌ | For weekly: day of week (0=Sunday). Null for daily/monthly. |
| `dayOfMonth` | number (1-31) \| null | ❌ | For monthly: day of month. Null for daily/weekly. |

### Tag

Represents a categorization label with a color.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✅ | Unique identifier |
| `name` | string | ✅ | Display name (e.g., "Bug", "Meeting", "Task") |
| `color` | string (hex) | ✅ | Badge color in hex format (e.g., `#3B82F6`) |
| `createdAt` | string (ISO 8601) | ✅ | Creation timestamp |

**Constraints**:
- Tag names must be unique (case-insensitive)
- A tag can be associated with zero or more reminders
- A reminder can have zero or more tags
- When a tag is deleted, it is removed from all associated reminders' `tagIds` arrays

### NotificationEvent

Represents a fired notification instance (for tracking/debugging).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | ✅ | Unique identifier |
| `reminderId` | string (UUID) | ✅ | Reference to the Reminder |
| `firedAt` | string (ISO 8601) | ✅ | When the notification was displayed |
| `action` | `'clicked'` \| `'snoozed'` \| `'dismissed'` | ✅ | User action taken |
| `snoozeMinutes` | number \| null | ❌ | If snoozed, how many minutes (5 or 10) |

## Storage Schema

All data stored under `chrome.storage.local` via `@plasmohq/storage`:

| Key | Type | Description |
|-----|------|-------------|
| `reminders` | `Reminder[]` | Array of all reminders (pending + completed) |
| `tags` | `Tag[]` | Array of all tags |
| `settings` | `Settings` | User preferences |

### Settings

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `language` | `'en'` \| `'vi'` | Auto-detect from `navigator.language` | UI language |

## Validation Rules

1. `title` must be non-empty and ≤ 200 characters
2. `scheduledAt` must be in the future at creation time
3. `preReminderMinutes` must be one of: `0, 5, 10, 15, 30`
4. `recurrence.dayOfWeek` required when `recurrence.type === 'weekly'`
5. `recurrence.dayOfMonth` required when `recurrence.type === 'monthly'`
6. Tag names must be unique (case-insensitive comparison)
7. `tagIds` entries must reference existing Tag IDs
