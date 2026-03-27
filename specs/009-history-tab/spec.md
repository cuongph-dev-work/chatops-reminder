# Feature Specification: History Tab

**Feature Branch**: `009-history-tab`  
**Created**: 2026-03-27  
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Completed Reminders in History Tab (Priority: P1)

As a user, I want a dedicated "History" tab in the popup that lists all reminders I've accepted/completed, so I can review what I've accomplished.

**Why this priority**: Core feature — users need visibility into past reminders.

**Acceptance Scenarios**:

1. **Given** the popup is open, **When** I click the "History" tab, **Then** I see a list of all completed reminders sorted by completion date (newest first).
2. **Given** no reminders have been completed, **When** I open the History tab, **Then** a friendly empty state message is displayed.
3. **Given** a completed reminder has tags, **When** it appears in History, **Then** the tags are displayed on the card.
4. **Given** a completed reminder has a source site, **When** it appears in History, **Then** the source site name is displayed.

---

### User Story 2 - Clear History (Priority: P2)

As a user, I want to clear all completed reminders from History, so I can keep a clean slate.

**Acceptance Scenarios**:

1. **Given** the History tab has completed reminders, **When** I click "Clear All", **Then** all completed reminders are removed.
2. **Given** I clear history, **When** I switch to the "All" tab, **Then** the pending reminders are unaffected.

---

### User Story 3 - Individual History Card Details (Priority: P2)

As a user, I want each History card to show key details (title, completion time, tags, source site), so I can quickly identify past reminders.

**Acceptance Scenarios**:

1. **Given** a completed reminder, **When** it appears in History, **Then** the card shows: title, completed date/time, tags (if any), source site (if any), and the original scheduled time.
2. **Given** a completed reminder had a link, **When** I click the card, **Then** I can navigate to the original link.

---

### Edge Cases

- Reminders auto-purged after 30 days should no longer appear in History.
- The History tab should handle hundreds of completed reminders without performance degradation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The popup MUST include a "History" tab accessible alongside existing tabs (All, Today, Tags).
- **FR-002**: The History tab MUST display all reminders with status "completed", sorted by `completedAt` descending.
- **FR-003**: Each History card MUST display: title, completed date/time, tags (if any), and source site name (if any).
- **FR-004**: Each History card SHOULD display the original scheduled time.
- **FR-005**: Users MUST be able to clear all completed reminders from History via a "Clear All" action.
- **FR-006**: The History tab MUST show a meaningful empty state when no completed reminders exist.
- **FR-007**: History cards with a link SHOULD allow the user to navigate to the original URL.

## Success Criteria *(mandatory)*

- **SC-001**: Users can find and review any completed reminder within 2 clicks (open popup → click History tab).
- **SC-002**: History tab loads and displays up to 100 completed reminders within 1 second.
- **SC-003**: Clearing history removes all completed reminders without affecting pending reminders.

## Assumptions

- The existing `completed` array from `useReminders` hook already provides the data needed for this tab.
- The existing `clearCompleted()` function handles the "Clear All" action.
- The tab layout follows the existing tab design pattern (All / Today / Tags).
- History cards reuse the existing `ReminderCard` component with minor styling adjustments for completed state.
