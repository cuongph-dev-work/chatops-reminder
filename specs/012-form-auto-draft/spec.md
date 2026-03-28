# Feature Specification: Form Auto-Draft

**Feature Branch**: `012-form-auto-draft`  
**Created**: 2026-03-28  
**Status**: Draft  
**Input**: User description: "Option 3: Auto-draft reminder form and save for 15 minutes before deleting"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Graceful Recovery on Unintentional Close (Priority: P1)

As a busy user filling out a new reminder, if I accidentally click outside the extension popup (causing it to close), I want my work-in-progress to be saved so that I do not have to retype everything.

**Why this priority**: Chrome automatically closes extension popups aggressively when they lose focus. Losing typed data is a highly frustrating user experience.

**Independent Test**: Can be fully tested by typing data into the new reminder form, clicking away to close the popup, reopening the popup immediately, and verifying the data is still there.

**Acceptance Scenarios**:

1. **Given** the user is typing in the "New Reminder" form, **When** the popup is closed or loses focus, **Then** the current state of the form (title, description, date, links, tags) is saved locally as a draft.
2. **Given** a draft exists from a recently closed session, **When** the user reopens the extension and navigates to the "New Reminder" form, **Then** the form fields are automatically populated with the draft data.

---

### User Story 2 - Draft Expiration After 15 Minutes (Priority: P2)

As a user, if I abandon a draft and come back a long time later, I want a fresh empty form because my previous context is likely no longer relevant. 

**Why this priority**: Keeping stale drafts forever clutters the UI and causes confusion when users just want to quickly create a new reminder the next day. A 15-minute window is a perfect balance between short-term recovery and long-term freshness.

**Independent Test**: Can be tested by creating a draft, waiting 15+ minutes, reopening the extension, and verifying the form is empty.

**Acceptance Scenarios**:

1. **Given** a saved draft, **When** 15 minutes have passed since the draft was last updated, **Then** the draft is considered expired and is automatically deleted.
2. **Given** an expired draft in storage, **When** the user opens the "New Reminder" form, **Then** the form opens empty and the expired draft is cleaned up.

---

### User Story 3 - Draft Cleared on Success (Priority: P1)

As a user, once I successfully create a reminder, I expect the draft to be cleared so the next time I open the form it is empty.

**Why this priority**: Submitting the form means the work is done; preserving the draft afterwards would result in duplicate creation prompts next time.

**Independent Test**: Can be tested by filling the form, saving successfully, reopening the form, and ensuring it is blank.

**Acceptance Scenarios**:

1. **Given** an active draft populated in the form, **When** the user clicks "Save" and the reminder is successfully created, **Then** the draft is deleted from storage.

### Edge Cases

- What happens if the user was editing an *existing* reminder (not a new one) and the popup closes? The system should either save a draft specifically for that reminder ID, or simply not draft edit sessions (only new ones). *Assumption: Auto-draft only applies to creation of NEW reminders.*
- What happens if the form date/time is in the past by the time the popup is reopened? The validation should trigger normally when they try to save.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist the state of the "New Reminder" form to local storage (`chrome.storage.local`) whenever input values change.
- **FR-002**: System MUST associate a `lastUpdatedAt` timestamp with the saved draft.
- **FR-003**: System MUST check for an existing draft when mounting the "New Reminder" view.
- **FR-004**: System MUST populate the form with the draft data IF the draft was updated less than 15 minutes ago.
- **FR-005**: System MUST discard and clear the draft if the `lastUpdatedAt` timestamp is older than 15 minutes.
- **FR-006**: System MUST clear the draft from storage immediately after a successful "Save" action.
- **FR-007**: Auto-draft MUST NOT override or conflict with the context-menu pre-filled data (e.g. if the user clicks "Remind me about this page" on a new site, the newly passed URL/title should take precedence over an old draft).

### Key Entities

- **Draft State**: Contains form fields (`title`, `description`, `scheduledAt`, `messageLink`, `tagIds`, `recurrence`, `preReminderMinutes`) and metadata (`lastUpdatedAt`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% data recovery when popup is closed and reopened within the 15-minute window.
- **SC-002**: 0% stale data retention for drafts older than 15 minutes.
- **SC-003**: The save-to-storage operation must be performant and not cause noticeable input latency while typing (debounce may be necessary).

## Assumptions

- Users closing the popup and returning within 15 minutes intend to continue their previous work.
- Auto-drafting is only necessary for the creation of *new* reminders, as editing existing reminders is usually a quick, atomic action.
- Relying on `chrome.storage.local` is reliable and synchronous enough for popup tear-down.
