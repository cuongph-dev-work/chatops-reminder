# Feature Specification: New Reminder Button Fix

**Feature Branch**: `004-fix-new-reminder-btn`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "button new remider chưa work"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Generic Reminder from Popup (Priority: P1)

As an extension user, I want to click the "New Reminder" button in the popup footer so that I can create a new reminder even if I am not currently viewing a specific Mattermost message.

**Why this priority**: The button is prominently displayed in the new UI but currently lacks functionality, leading to a broken user experience.

**Independent Test**: Can be fully tested by opening the extension popup, clicking "New Reminder", and verifying that a creation interface appears.

**Acceptance Scenarios**:

1. **Given** the extension popup is open, **When** the user clicks the "New Reminder" button, **Then** a reminder creation interface should open.
2. **Given** the user fills out the new reminder form, **When** they submit it, **Then** a new pending reminder should be added to the list.

---

### Edge Cases

- What happens when the user clicks "New Reminder" while offline?
- How does the system handle an empty title for manual reminders?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST make the "New Reminder" button in the popup footer clickable and interactive.
- **FR-002**: System MUST render a reminder creation form when the "New Reminder" button is clicked. 
- **FR-003**: System MUST provide a mechanism to save the newly created reminder into the local storage without requiring a Mattermost message permalink. The form MUST include an optional field for users to paste a Mattermost link if they wish, or leave it blank to act as a standalone generic reminder.
- **FR-004**: System MUST return the user to the active popup tab view after successful creation or cancellation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of clicks on the "New Reminder" button successfully trigger the creation flow.
- **SC-002**: Users can complete the creation of a manual reminder in under 30 seconds.

## Assumptions

- We assume that the existing `Reminder` data model supports (or can be easily updated to support) reminders that do NOT have an associated Mattermost `author`, `messageId`, or `permalink`. 
- The UI for creating a reminder from the popup will reuse existing design tokens and validation logic from the content script modal.
