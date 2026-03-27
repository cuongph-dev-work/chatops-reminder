# Data Model: Auto Snooze Setting

## Entities

### `Settings` (Updates)
- `autoSnooze` (boolean): Master toggle for the feature. Default: `false`.
- `autoSnoozeMinutes` (number): Configured duration for the automatic snooze. Default: `5`.

### `Reminder` (Updates)
- `hasAutoSnoozed` (boolean, optional): Flag indicating whether the reminder has already consumed its one-time automatic snooze allowance.
