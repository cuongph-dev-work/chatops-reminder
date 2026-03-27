# Data Model: Notification OK

No persistent database migration is needed. The "OK" button will reuse the existing `DISMISS_NOTIFICATION` IPC payload to mark the reminder as completed via `src/background/index.ts`.
