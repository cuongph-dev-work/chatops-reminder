# Feature Specification: Notification Layout Redesign

**Feature Branch**: `011-notification-layout-redesign`  
**Created**: 2026-03-28  
**Status**: Completed  
**Input**: User mockup image showing desired notification card layout

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Professional Notification Card Layout (Priority: P1)

As a user, I want the in-page notification to follow a professional card layout with clear visual hierarchy: a labeled header, alarm icon, prominent title, source site subtitle, and well-separated action buttons.

**Why this priority**: The notification is the primary interaction point when reminders fire. A clean, scannable layout reduces cognitive load.

**Acceptance Scenarios**:

1. **Given** a reminder fires, **When** the notification appears, **Then** it displays with a left blue border accent, an "ACTIVE REMINDER" label, and a relative timestamp ("Just now", "5m ago").
2. **Given** a reminder with a source site and description, **When** the notification appears, **Then** the source site name is shown in green with the description as a subtitle.
3. **Given** a reminder with a chat link, **When** the notification appears, **Then** "View in Chat" renders as a filled blue button, "Snooze 5m" as an outlined button, and "Dismiss" as a text-only link aligned right.
4. **Given** a reminder without a chat link, **When** the notification appears, **Then** only "Snooze 5m" and "Dismiss" buttons are shown.

---

### User Story 2 - Dismiss Marks Completed (Priority: P1)

As a user, when I click "Dismiss" I expect the reminder to be marked as completed (acknowledged).

**Acceptance Scenarios**:

1. **Given** a notification is shown, **When** the user clicks "Dismiss", **Then** the reminder status changes to "completed" and the notification closes.

---

### User Story 3 - Auto-Dismiss with Progress Bar (Priority: P2)

As a user, I want the notification to auto-dismiss after 15 seconds with a visible progress bar, triggering auto-snooze on inaction.

**Acceptance Scenarios**:

1. **Given** a notification is shown, **When** 15 seconds pass without user interaction, **Then** the progress bar depletes and the auto-snooze/ignore logic triggers.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Notification card MUST display a left blue border accent (5px solid blue-500).
- **FR-002**: Card header MUST show "ACTIVE REMINDER" label and relative timestamp.
- **FR-003**: Alarm clock icon MUST render in a circular blue-50 background.
- **FR-004**: Source site name MUST be displayed in emerald/green text followed by description.
- **FR-005**: "View in Chat" button MUST be filled blue (only if messageLink exists).
- **FR-006**: "Snooze 5m" button MUST be outlined (white bg, border).
- **FR-007**: "Dismiss" button MUST be text-only, right-aligned, and mark reminder as completed.
- **FR-008**: Progress bar for auto-dismiss MUST be retained.

## Success Criteria *(mandatory)*

- **SC-001**: Notification layout matches the provided user mockup in terms of structure and visual hierarchy.
- **SC-002**: All button actions work correctly (View in Chat, Snooze, Dismiss).
- **SC-003**: Progress bar auto-dismiss + auto-snooze still functions.
