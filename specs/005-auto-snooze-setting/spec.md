# Feature Specification: Auto-Snooze Setting and Badge Cleanup

**Feature Branch**: `005-auto-snooze-setting`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "btn snooze chỉ nên hiển thị ở phần layout notification thôi. hãy remove ở badge . ngoài ra hãy thêm cơ chế nếu 1 remider đến nhưng user ko nhấn complete thì sẽ tự động xp sẽ remind 1 lần. flag nhắc lại và thời gian nhắc lại sẽ được setting ở phần cài đặt , trang setting ngôn ngữ"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Snooze from Reminder Cards (Priority: P1)

Users should no longer see the Snooze action button on the inline reminder cards within the popup list view to simplify the interface.

**Why this priority**: Directly implements the user request to clean up the badge/card UI layout.

**Independent Test**: Can be fully tested by opening the extension popup, hovering over any reminder card, and verifying that the Snooze button is absent.

**Acceptance Scenarios**:

1. **Given** the extension popup is open, **When** the user hovers over an active pending reminder card, **Then** only the Edit, Complete, and Delete buttons should be visible (Snooze must not be present).
2. **Given** a reminder is currently snoozed, **When** viewing the card in the popup, **Then** it should reflect the snoozed time but still lack the Snooze button.

---

### User Story 2 - Configure Auto-Snooze in Settings (Priority: P1)

Users should be able to enable/disable an auto-snooze feature and configure its duration within the global Settings panel alongside the language settings.

**Why this priority**: Required for users to customize whether ignored notifications should bounce back to them.

**Independent Test**: Can be fully tested by opening the Settings panel and modifying the new preferences.

**Acceptance Scenarios**:

1. **Given** the settings panel is open, **When** looking below the language selector, **Then** an "Auto-Snooze" toggle and a "Duration" dropdown (e.g., 5m, 10m, 15m) should be visible.
2. **Given** the user toggles Auto-Snooze to ON and selects "10 minutes", **When** the settings are saved, **Then** these preferences should persist across extension reloads.

---

### User Story 3 - Auto-Snooze Ignored Notifications (Priority: P1)

If a notification pops up and the user does not take a definitive action (does not click Complete or manual Snooze) and lets it time out or closes it via the 'X' button, the system should automatically snooze it once for the configured duration.

**Why this priority**: Core value of the feature to ensure users do not miss reminders when they are busy and accidentally ignore notifications.

**Independent Test**: Can be fully tested by triggering a reminder, letting the CSUI notification time out, and observing if another notification appears after the configured auto-snooze duration.

**Acceptance Scenarios**:

1. **Given** Auto-snooze is ON (5 mins) and a reminder notification appears, **When** the user lets the 15-second notification timer run out, **Then** the reminder's status should change to `snoozed` and it should pop up again in 5 minutes.
2. **Given** a reminder has automatically snoozed once, **When** the SECOND notification appears and the user ignores it again, **Then** the reminder should NOT auto-snooze a second time (it remains indefinitely past-due or is removed based on logic).
3. **Given** Auto-snooze is OFF, **When** the user ignores a notification, **Then** the reminder simply expires and stays in the pending list as past-due without re-triggering.

### Edge Cases

- **What happens if the browser is closed before the auto-snooze alarm fires?** The system should catch missed pending reminders upon the next browser launch and fire them immediately.
- **What happens if a user ignores a notification, causing an auto-snooze, but then opens the popup and clicks Complete?** The existing mechanism must ensure that completing a reminder clears any pending snoozed alarms.
- **What happens if the user changes the Auto-Snooze duration in settings while an auto-snooze is already counting down?** The current countdown remains unaffected, and the new duration applies to future reminders.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT render the "Snooze 5m" action button in the `ReminderCard` component inside the popup layout.
- **FR-002**: System MUST add an "Auto-Snooze enabled" boolean toggle to the global `Settings` object.
- **FR-003**: System MUST add an "Auto-Snooze duration" number selector (minutes) to the global `Settings` object.
- **FR-004**: System MUST render UI controls for FR-002 and FR-003 within the `SettingsPanel` component.
- **FR-005**: System MUST detect when a CSUI notification is dismissed via timeout or the 'X' close button.
- **FR-006**: System MUST automatically trigger a snooze action for the configured duration if FR-005 occurs, Auto-Snooze is enabled, and the reminder has not been auto-snoozed yet.
- **FR-007**: System MUST track whether a reminder has already triggered an auto-snooze to ensure it only auto-snoozes a maximum of 1 time.
- **FR-008**: System MUST display the "Snooze" action explicitly within the CSUI Notification Layout.

### Key Entities

- **Settings**: Requires new attributes `autoSnooze` (boolean) and `autoSnoozeMinutes` (number).
- **Reminder**: Requires new attribute `hasAutoSnoozed` (boolean) to track if the one-time auto-snooze allowance has been consumed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% removal of the Snooze feature from the popup ReminderCard layout.
- **SC-002**: Users can successfully enable and define an auto-snooze duration within the Settings panel.
- **SC-003**: 100% of ignored/timed-out notifications are automatically re-scheduled accurately for one subsequent occurrence if the setting is enabled.
- **SC-004**: System successfully prevents infinite auto-snooze loops by capping the automatic action to exactly 1 time per reminder.

## Assumptions

- The custom CSUI notification's "timeout" or explicit "Close (X)" button both act as an "ignore" action, which triggers the auto-snooze logic.
- If the user clicks "Snooze Xm" directly on the notification, it counts as a manual snooze, and the auto-snooze allowance (`hasAutoSnoozed`) might not be consumed (or is irrelevant since the user took manual action).
- If the user closes the native OS notification fallback, it also attempts to apply the auto-snooze logic.
