# Feature Specification: ChatOps Reminder Chrome Extension

**Feature Branch**: `001-chatops-reminder-ext`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "Xây dựng Chrome Extension giúp người dùng tạo nhắc nhở (reminder) trực tiếp từ tin nhắn trên Mattermost, quản lý reminder qua popup, nhận thông báo hệ thống với snooze/recurring support."

## Clarifications

### Session 2026-03-27

- Q: What happens to a reminder after its notification fires and the user interacts with it? → A: Move to "Completed" tab — reminder stays in storage, shown in a separate "Completed" section in the popup, clearable manually by the user.
- Q: Can a reminder have one tag or multiple tags? → A: Multiple tags — each reminder can have zero or more tags, displayed as multiple colored badges.
- Q: Does the extension work on any Mattermost instance or a specific pre-configured URL? → A: Any Mattermost instance — the extension auto-detects Mattermost pages by URL pattern or DOM markers, no configuration needed.
- Q: What language should the extension UI use? → A: Bilingual — support both English and Vietnamese with a language toggle in settings.
- Q: How long are completed reminders retained before cleanup? → A: Auto-purge completed reminders older than 30 days.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Reminder from Chat Message (Priority: P1)

A team member (developer, PM, QC, or HR) is browsing Mattermost chat and sees an important message they need to follow up on later. They click the three-dot action menu on that message and select "Remind Me ⏰". A modal form appears overlaying the chat interface, pre-filled with the message link. The user enters a title, selects a date/time, and saves the reminder. The system stores the reminder and confirms creation.

**Why this priority**: This is the core value proposition — creating reminders without leaving the chat. Without this, the extension has no purpose.

**Independent Test**: Can be fully tested by navigating to Mattermost, opening a message action menu, clicking "Remind Me", filling out the form, and verifying the reminder is saved in storage.

**Acceptance Scenarios**:

1. **Given** a user is viewing Mattermost web interface with the extension installed, **When** they open the three-dot action menu on any message, **Then** a "Remind Me ⏰" button is visible in the menu.
2. **Given** the user clicks "Remind Me ⏰", **When** the modal form appears, **Then** the message link is automatically pre-filled in the form.
3. **Given** the user fills in a title and selects a future date/time, **When** they click Save, **Then** the reminder is stored and a confirmation is shown.
4. **Given** the user fills in a title but selects a past date/time, **When** they click Save, **Then** a validation error is displayed preventing the save.

---

### User Story 2 - Receiving Timely Notifications (Priority: P1)

When the scheduled reminder time arrives (or X minutes before, based on pre-reminder setting), the user receives a Chrome native notification. Clicking the notification body opens the original Mattermost message in a new tab. The user can also snooze the notification for 5 or 10 minutes using action buttons on the notification.

**Why this priority**: Notifications are the delivery mechanism for reminders. Without them, saved reminders have no way to alert the user.

**Independent Test**: Can be tested by creating a reminder set for 1 minute in the future, waiting for it to fire, verifying the notification appears, clicking it to verify the link opens, and testing snooze functionality.

**Acceptance Scenarios**:

1. **Given** a reminder is scheduled for a specific time, **When** that time arrives, **Then** a Chrome native notification is displayed with the reminder title and message link.
2. **Given** a reminder has a pre-reminder set to 5 minutes, **When** the time is 5 minutes before the scheduled time, **Then** a notification is displayed.
3. **Given** a notification is displayed, **When** the user clicks the notification body, **Then** a new browser tab opens navigating to the saved Mattermost message link.
4. **Given** a notification is displayed with Snooze buttons, **When** the user clicks "Snooze 5 mins", **Then** the notification is dismissed and a new notification fires 5 minutes later.
5. **Given** a notification is displayed with Snooze buttons, **When** the user clicks "Snooze 10 mins", **Then** the notification is dismissed and a new notification fires 10 minutes later.

---

### User Story 3 - Managing Reminders via Popup (Priority: P2)

The user clicks the extension icon in the Chrome toolbar to open the popup. They see a list of all pending reminders, sorted by time or filterable by tag. They can edit a reminder's title, time, or tags, or delete a reminder entirely.

**Why this priority**: Managing existing reminders is essential for a complete workflow but is secondary to creating and receiving reminders.

**Independent Test**: Can be tested by creating several reminders, opening the popup, verifying the list displays correctly, editing one reminder's time, deleting another, and confirming changes persist.

**Acceptance Scenarios**:

1. **Given** the user has multiple pending reminders, **When** they click the extension icon, **Then** the popup displays all pending reminders in a list.
2. **Given** the popup is open with reminders listed, **When** the user selects "Sort by time", **Then** reminders are ordered chronologically (nearest first).
3. **Given** the popup is open with reminders listed, **When** the user selects "Sort by tag", **Then** reminders are grouped by their assigned tags.
4. **Given** the user clicks Edit on a reminder, **When** they change the title and time and save, **Then** the reminder is updated and the alarm is rescheduled.
5. **Given** the user clicks Delete on a reminder, **When** they confirm deletion, **Then** the reminder is removed from storage and its alarm is cancelled.

---

### User Story 4 - Categorizing with Tags & Colors (Priority: P2)

The user creates or selects tags (e.g., Bug, Task, Meeting, HR) with associated colors when setting up a reminder. Tags appear as colored badges on reminders in the popup, making it easy to visually distinguish different types of tasks.

**Why this priority**: Tags enhance organization and usability but are not critical for the core remind-and-notify flow.

**Independent Test**: Can be tested by creating a reminder with a new tag and color, verifying it appears in the popup with the correct badge, then managing (creating/editing/deleting) tags from the tag management interface.

**Acceptance Scenarios**:

1. **Given** the user is creating a reminder, **When** they open the Tag selector, **Then** they see existing tags and an option to create a new tag.
2. **Given** the user creates a new tag "Meeting" with a blue color, **When** they save the reminder, **Then** the tag is stored and displayed as a blue badge on the reminder.
3. **Given** the popup shows reminders with tags, **When** the user views the list, **Then** each reminder displays its tag as a colored badge.
4. **Given** the user navigates to Tag Management, **When** they delete a tag, **Then** the tag is removed from all associated reminders.

---

### User Story 5 - Setting Recurring Reminders (Priority: P3)

The user creates a reminder with a recurring schedule (daily, weekly on a specific day, or monthly). After each notification fires, the system automatically schedules the next occurrence without user intervention. The user can stop recurrence by editing or deleting the reminder.

**Why this priority**: Recurring reminders are a power-user feature that adds significant value but is not needed for the basic use case.

**Independent Test**: Can be tested by creating a daily recurring reminder, verifying it fires, then checking that the next occurrence is automatically scheduled.

**Acceptance Scenarios**:

1. **Given** the user is creating a reminder, **When** they enable "Recurring" and select "Daily", **Then** the reminder is configured to repeat every day at the set time.
2. **Given** the user enables "Recurring" and selects "Weekly on Monday", **When** they save, **Then** the reminder fires every Monday at the set time.
3. **Given** a recurring reminder fires, **When** the notification is displayed, **Then** the next occurrence is automatically scheduled without user action.
4. **Given** the user edits a recurring reminder and disables recurrence, **When** they save, **Then** only the current reminder remains and no future occurrences are scheduled.

---

### Edge Cases

- What happens when the user's browser is closed at the scheduled reminder time? The reminder fires when Chrome is next launched.
- What happens when Mattermost's DOM structure updates (e.g., after a version upgrade)? The extension may fail to inject the "Remind Me" button; the user should still be able to manage existing reminders via the popup.
- What happens when the user tries to create a reminder for a message link that no longer exists? The reminder is created normally; clicking the notification opens the link (which may show a "message not found" on Mattermost's side).
- How does the system handle timezone changes (e.g., user travels)? Reminders use the browser's local timezone at the time of scheduling; if the timezone changes, existing reminders fire based on the original absolute time.
- What happens when storage quota is exceeded? The system displays an error message when saving, informing the user to delete old reminders.
- What happens if the user has notification permissions disabled in Chrome? The extension prompts the user to enable notifications when they first create a reminder.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST inject a "Remind Me ⏰" button into the action menu of each message on the Mattermost web interface.
- **FR-002**: System MUST detect when the Mattermost message action menu opens and inject the button dynamically.
- **FR-003**: System MUST display a modal form overlay (isolated from the host page styles) when the "Remind Me" button is clicked.
- **FR-004**: System MUST automatically extract and pre-fill the message permalink into the reminder form.
- **FR-005**: System MUST allow users to input a title, date/time, pre-reminder offset, one or more tags with colors, and recurring schedule when creating a reminder.
- **FR-006**: System MUST validate that the selected reminder time is in the future before saving.
- **FR-007**: System MUST persist all reminder data locally within the extension, ensuring data syncs between the in-page reminder creation and the popup management views in real-time.
- **FR-008**: System MUST schedule background alarms for each reminder at the specified time (or pre-reminder offset time).
- **FR-009**: System MUST display browser native notifications at the scheduled time, including the reminder title.
- **FR-010**: System MUST open the saved Mattermost message link in a new tab when the user clicks on a notification.
- **FR-011**: System MUST provide "Snooze 5 mins" and "Snooze 10 mins" action buttons on notifications.
- **FR-012**: System MUST reschedule the alarm when a snooze button is clicked, firing a new notification after the snooze duration.
- **FR-013**: System MUST display a list of all pending reminders in the extension popup, sortable by time or by tag.
- **FR-014**: System MUST allow users to edit existing reminders (title, time, tags, recurrence) from the popup.
- **FR-015**: System MUST allow users to delete reminders from the popup, cancelling associated alarms.
- **FR-016**: System MUST support recurring reminders (daily, weekly on a specific day, monthly) by automatically scheduling the next occurrence after each notification fires.
- **FR-017**: System MUST provide a tag management interface allowing users to create, edit, and delete tags with associated colors.
- **FR-018**: System MUST request notification permissions from the user if not already granted.
- **FR-019**: System MUST provide pre-reminder options: On time, 5 minutes, 10 minutes, 15 minutes, and 30 minutes before the scheduled time.
- **FR-020**: System MUST move fired reminders to a "Completed" section in the popup after the notification fires (or after the snooze chain ends), keeping them accessible for review and allowing users to manually clear them.
- **FR-021**: System MUST auto-detect Mattermost web pages (by URL pattern or DOM markers) and activate the "Remind Me" injection on any Mattermost instance without requiring user configuration.
- **FR-022**: System MUST support bilingual UI in English and Vietnamese, with all labels, notifications, and messages available in both languages.
- **FR-023**: System MUST provide a language toggle in extension settings allowing the user to switch between English and Vietnamese. The default language should follow the browser's locale (Vietnamese if locale is `vi`, English otherwise).
- **FR-024**: System MUST automatically purge completed reminders that are older than 30 days to prevent unbounded storage growth.

### Key Entities

- **Reminder**: Represents a scheduled notification. Key attributes: title, message link, scheduled date/time, pre-reminder offset, tag references (zero or more), recurrence rule, creation timestamp, status (pending/snoozed/completed). Lifecycle: pending → snoozed (if user snoozes) → pending (after snooze fires) → completed (after final notification fires or snooze chain ends). Completed reminders are shown in a separate "Completed" tab, can be manually cleared, and are auto-purged after 30 days.
- **Tag**: Represents a categorization label. Key attributes: name, display color. A tag can be associated with zero or more reminders, and a reminder can have zero or more tags.
- **Notification Event**: Represents a fired notification instance. Key attributes: associated reminder, fire time, user action taken (clicked/snoozed/dismissed).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a reminder from a Mattermost message in under 30 seconds (from clicking "Remind Me" to saving the form).
- **SC-002**: 100% of scheduled reminders fire a notification within 1 minute of the intended time when the browser is running.
- **SC-003**: Users can view, edit, or delete any reminder from the popup in under 3 clicks.
- **SC-004**: The extension loads and injects the "Remind Me" button within 2 seconds after Mattermost page load completes.
- **SC-005**: Reminder data persists across browser sessions and browser restarts without data loss.
- **SC-006**: The extension operates without visible interference with Mattermost's native layout or functionality.

## Assumptions

- Users have a modern Chromium-based browser installed and updated.
- Users access Mattermost via the web interface (not the desktop app).
- The Mattermost web interface uses a consistent DOM structure for message action menus across supported versions; the extension auto-detects any Mattermost instance without configuration.
- Local extension storage provides sufficient capacity for the expected number of reminders (typically under 1,000 active reminders per user).
- Users have a stable internet connection for accessing Mattermost message links when clicking notifications.
- Mobile support and cross-browser support (Firefox, Safari) are out of scope for v1.
- No server-side component is needed; all data is stored locally within the browser extension.
- Notification permissions will be requested at first use; if denied, the extension will still function for creating and managing reminders but cannot deliver notifications.
