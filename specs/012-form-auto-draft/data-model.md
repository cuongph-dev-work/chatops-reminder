# Data Model: Form Auto-Draft

**Feature**: Form Auto-Draft  
**Created**: 2026-03-28  
**Reference**: [spec.md](./spec.md)

## Entities

### `DraftState` (Stored in `chrome.storage.local` under key `chatops-reminder-new-draft`)

Represents the unsubmitted state of the "New Reminder" form.

**Fields**:
- `title` (string): The title being typed.
- `description` (string | undefined): The description text.
- `scheduledAt` (string): ISO string of the date.
- `messageLink` (string | undefined): The URL link.
- `tagIds` (string[]): Array of selected tag UUIDs.
- `preReminderMinutes` (number): 0, 5, 10, 15, or 30.
- `recurrence` (RecurrenceRule | null): Any set recurrence logic.
- `lastUpdatedAt` (number): Epoch timestamp (e.g. `Date.now()`) used for the 15-minute expiration check.

**Rules**:
1. Written to storage whenever any of the above form fields change.
2. If `Date.now() - lastUpdatedAt > 15 * 60 * 1000`, the entire object is ignored on load and removed from storage.
3. Automatically deleted from storage when a Reminder is successfully created.
