# Data Model: Reminders

## Changes to Existing Entities

No new entities are introduced. We are modifying the existing `Reminder` type to accommodate manual creation.

### `Reminder`
```typescript
interface Reminder {
  id: string;
  title: string;
  author?: string;      // [MODIFIED] Now optional for manual reminders
  messageId?: string;   // [MODIFIED] Now optional
  permalink?: string;   // [MODIFIED] Now optional
  channelName?: string; // [MODIFIED] Now optional
  teamId?: string;      // [MODIFIED] Now optional
  scheduledAt: string;
  createdAt: string;
  status: "pending" | "completed" | "snoozed";
  snoozedUntil?: string;
  preReminderMinutes?: number;
  tagIds: string[];
  recurrence?: RecurrenceRule;
}
```
Validation rules:
- At least a `title` and `scheduledAt` must be present.
- If it is a manual reminder, the `permalink` field is optional. If provided, it should ideally be a valid Mattermost link, but validation can be relaxed to just general URL format since it's user-provided.
