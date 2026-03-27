# Research: Auto Snooze Setting

## Handling Notification Dimissals
- Decision: Use `chrome.notifications.onClosed` to detect both timeouts and manual clicks of the 'X', as well as the CSUI timeout. 
- Rationale: The background script already has an event listener for `onClosed` (and `DISMISS_NOTIFICATION` for CSUI). When the notification times out (or is dismissed by user), it triggers these. We can evaluate auto-snooze logic uniformly here.
- Alternatives considered: Setting a separate timeout alarm just for reading notifications, but that's overly complex.

## Tracking Snooze Allowance
- Decision: Add `hasAutoSnoozed: boolean` to the `Reminder` interface.
- Rationale: To enforce the "remind EXACTLY 1 time" constraint, we need persistent state. Setting `hasAutoSnoozed = true` upon the first auto-snooze prevents an infinite loop.
- Alternatives considered: Relying solely on `snoozedUntil` or `createdAt`, but explicit state tracking is more robust.
