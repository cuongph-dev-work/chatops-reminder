# Feature Specification: Notification OK Button & Auto-Snooze Fallback

**Feature Branch**: `007-notification-ok-auto-snooze`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "ở layout notification tôi cần thêm 1 button OK. để khi user click vào thì sẽ biết là user đã read. ngoài ra có cơ chế auto snooze thêm x phút (x) có cấu hình sẵn nếu user ko bấm vào ok đó hoặc k bấm vào snooze"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acknowledge and Complete Reminder (Priority: P1)

As a user, I want an explicit "OK" button on the notification popup so that I can quickly acknowledge and mark the reminder as read/completed without opening the extension.

**Why this priority**: Core interaction that allows users to seamlessly resolve tasks without context switching.

**Independent Test**: Can be tested by waiting for a notification, clicking "OK", and verifying the reminder is moved to the "Completed" tab in the popup.

**Acceptance Scenarios**:

1. **Given** a custom notification is displayed, **When** the user clicks the "OK" button, **Then** the notification dismisses and the reminder status updates to "completed".

---

### User Story 2 - Auto-Snooze on Inaction (Priority: P2)

As a busy user, I want the system to automatically snooze a reminder by a configurable amount of minutes if I ignore the notification (let it time out or close it via X) instead of marking it as completed.

**Why this priority**: Prevents lost reminders when users are away from their keyboard or momentarily distracted.

**Independent Test**: Can be tested by triggering a notification, letting the 15-second progress bar run out, and verifying the reminder is rescheduled rather than marked completed.

**Acceptance Scenarios**:

1. **Given** a custom notification is displayed, **When** the auto-dismiss timer expires, **Then** the system checks user preferences and auto-snoozes the reminder for the configured duration (e.g., 5, 10, 15 minutes).
2. **Given** a custom notification is displayed, **When** the user clicks the "Close (X)" button, **Then** the system treats it as inaction and triggers the auto-snooze flow.

### Edge Cases

- What happens if the user has auto-snooze disabled in settings? The reminder remains pending but is just dismissed visually? (Assumption: It remains pending without rescheduling).
- What happens if the message has a "View in Chat" button? The "OK" button should be displayed alongside it and the "Snooze" button.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The custom notification UI MUST include an "OK" button prominently.
- **FR-002**: Clicking the "OK" button MUST mark the reminder's status as "completed" and remove the active alarm.
- **FR-003**: The system MUST implement an Auto-Snooze fallback mechanism.
- **FR-004**: If the notification is ignored (progress bar completes or 'X' is clicked), the system MUST automatically snooze the reminder by the user's configured default snooze duration.
- **FR-005**: Users MUST be able to configure the auto-snooze duration (x minutes) in the extension settings.

### Key Entities

- **Settings**: Contains `autoSnooze` (boolean) and `autoSnoozeMinutes` (number).
- **Reminder**: Contains `status` and `hasAutoSnoozed` flag to prevent infinite auto-snoozing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can mark reminders as completed directly from the notification with 1 click.
- **SC-002**: 100% of ignored/timed-out notifications correctly trigger the auto-snooze fallback logic if enabled in settings.
- **SC-003**: The "OK" button works independently of the "View in Chat" context.

## Assumptions

- Auto-snooze configuration (enable/disable and duration) is managed globally via the existing Settings tab.
- We assume "inaction" means allowing the 15s notification progress bar to deplete without clicking Snooze, OK, or View in Chat.
