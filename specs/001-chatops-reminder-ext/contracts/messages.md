# Contracts: ChatOps Reminder Chrome Extension

**Branch**: `001-chatops-reminder-ext` | **Date**: 2026-03-27

## Message Passing Contracts

The extension uses Chrome's message passing for communication between content scripts and the background service worker.

### Content Script → Background

#### `CREATE_REMINDER`

Create a new reminder from the Mattermost page.

**Request**:
```typescript
{
  type: 'CREATE_REMINDER',
  payload: {
    title: string,              // Reminder title
    messageLink: string,        // Mattermost message permalink
    scheduledAt: string,        // ISO 8601 datetime
    preReminderMinutes: number, // 0 | 5 | 10 | 15 | 30
    tagIds: string[],           // Array of Tag IDs
    recurrence: {
      type: 'daily' | 'weekly' | 'monthly',
      dayOfWeek?: number,       // 0-6 for weekly
      dayOfMonth?: number       // 1-31 for monthly
    } | null
  }
}
```

**Response**:
```typescript
{
  success: true,
  reminder: Reminder           // Created reminder object
} | {
  success: false,
  error: string                // Validation error message
}
```

---

#### `UPDATE_REMINDER`

Update an existing reminder.

**Request**:
```typescript
{
  type: 'UPDATE_REMINDER',
  payload: {
    id: string,                 // Reminder ID
    title?: string,
    scheduledAt?: string,
    preReminderMinutes?: number,
    tagIds?: string[],
    recurrence?: RecurrenceRule | null
  }
}
```

**Response**:
```typescript
{
  success: true,
  reminder: Reminder
} | {
  success: false,
  error: string
}
```

---

#### `DELETE_REMINDER`

Delete a reminder and cancel its alarm.

**Request**:
```typescript
{
  type: 'DELETE_REMINDER',
  payload: {
    id: string
  }
}
```

**Response**:
```typescript
{
  success: true
} | {
  success: false,
  error: string
}
```

---

#### `CLEAR_COMPLETED`

Clear all completed reminders or a specific one.

**Request**:
```typescript
{
  type: 'CLEAR_COMPLETED',
  payload: {
    id?: string   // Optional: specific reminder ID. If omitted, clears all completed.
  }
}
```

**Response**:
```typescript
{
  success: true,
  clearedCount: number
}
```

---

### Background → Content Script / Popup

#### Storage-based Sync

No explicit message passing needed for data sync. `@plasmohq/storage` provides real-time reactive updates to all contexts (content script, popup, background) when storage changes.

### Notification Interaction Events

Handled internally by the background service worker:

| Event | Handler | Action |
|-------|---------|--------|
| `chrome.notifications.onClicked` | Open `messageLink` in new tab | `chrome.tabs.create({ url: reminder.messageLink })` |
| `chrome.notifications.onButtonClicked` (button 0) | Snooze 5 min | Reschedule alarm +5 min, set status to `snoozed` |
| `chrome.notifications.onButtonClicked` (button 1) | Snooze 10 min | Reschedule alarm +10 min, set status to `snoozed` |
| `chrome.notifications.onClosed` | Mark completed | Set status to `completed`, set `completedAt` |
| `chrome.alarms.onAlarm` | Fire notification | Display notification, handle recurring scheduling |
