# Feature Specification: Popup UI Redesign

**Feature Branch**: `003-popup-ui-redesign`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "đây là giao diện popup mà tôi mong muốn" (accompanied by a UI mockup image).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Navigate Reminders (Priority: P1)

As a user, I want to view my reminders grouped into logical tabs (All, Today, Tags) so that I can easily find the tasks I need to focus on.

**Why this priority**: The primary function of the popup is to display active reminders clearly.

**Independent Test**: Can be fully tested by opening the popup and verifying that reminders are displayed correctly under the respective tabs, matching the new styling.

**Acceptance Scenarios**:

1. **Given** the user opens the extension popup, **When** the popup loads, **Then** the header "ChatOps Reminders" and a bell icon are displayed at the top.
2. **Given** the user is viewing the popup, **When** they look at the navigation area, **Then** three tabs ("All", "Today", "Tags") are visible and clickable.
3. **Given** the user is on the "All" tab, **When** they view the list, **Then** they see "ACTIVE STREAM" and a "Manage Tags" button above a scrollable list of reminder cards.

---

### User Story 2 - Interact with Reminder Cards (Priority: P1)

As a user, I want to see detailed, well-formatted reminder cards showing tags, relative time remaining, title, and exact scheduled time, so that I can quickly grasp my schedule.

**Why this priority**: Reminder cards are the core data representation of the application.

**Independent Test**: Can be fully tested by creating a reminder and verifying its rendering in the popup matches the exact design provided.

**Acceptance Scenarios**:

1. **Given** a pending reminder, **When** it is displayed in the list, **Then** it renders as a white card with rounded corners on a light background.
2. **Given** a reminder with tags, **When** it is displayed, **Then** the tags appear as colored pill badges at the top left of the card.
3. **Given** a reminder scheduled for the future, **When** it is displayed, **Then** a time-remaining badge (e.g., "2m left" or "Today") appears at the top right of the card.
4. **Given** any reminder, **When** it is displayed, **Then** the scheduled time is shown at the bottom with a corresponding clock or calendar icon.

---

### User Story 3 - Common Actions & Creation (Priority: P2)

As a user, I want a sticky footer area with quick access to settings, help, and a prominent button to manually create a new reminder.

**Why this priority**: Manual reminder creation and settings access are essential utility functions.

**Independent Test**: Can be tested independently by verifying the sticky footer presence and the functionality of its buttons.

**Acceptance Scenarios**:

1. **Given** the user has scrolled down a long list of reminders, **When** they look at the bottom of the popup, **Then** a fixed footer remains visible.
2. **Given** the sticky footer, **When** the user looks at it, **Then** there is a prominent blue "+ New Reminder" button on the right, and help/settings icons on the left.

## Edge Cases

- What happens when there are no reminders? (Should display a beautiful empty state).
- How does the system handle very long reminder titles? (Should truncate or wrap neatly within the card).
- How well does the UI scale or scroll when there are many tags on a single reminder? (Should hide overflow or wrap onto a new line).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a global header with the app icon, title "ChatOps Reminders", and a notification bell icon.
- **FR-002**: System MUST render three main navigation tabs: "All", "Today", and "Tags".
- **FR-003**: System MUST display a list header showing "ACTIVE STREAM" and a "Manage Tags" button.
- **FR-004**: System MUST render reminder cards with a tag row, a relative time indicator, the main title, and the scheduled time.
- **FR-005**: System MUST present a sticky footer at the bottom of the popup containing a Help icon (`?`), a Settings icon (`⚙`), and a primary "+ New Reminder" button.
- **FR-006**: System MUST adopt a modern, light UI theme (e.g., `bg-slate-50` for the body, white backgrounds for cards, specific typography matching the design).
- **FR-007**: System MUST use specific accent colors for tags (e.g., Green for PROJECT A, Blue for MARKETING) and time indicators (e.g., Orange text for urgent, Gray pill for today).
- **FR-008**: System MUST hide action options (Edit, Delete, Snooze, Complete) by default and display them over the right side of the card when the user hovers over a reminder card.

### Key Entities

- **Reminder Card Component**: Represents the visual structure of a single reminder item in the new design.
- **Popup Layout**: Represents the overall structural flex/grid layout of the popup (Header -> Tabs -> List -> Sticky Footer).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of all existing UI elements in the popup are replaced with the new design component structure.
- **SC-002**: Visual regression testing matches the provided user mockup precisely in terms of layout, padding, typography, and color palette.
- **SC-003**: All interactive elements (Tabs, Manage Tags, Settings, New Reminder) trigger the correct existing state transitions or views within 100ms.

## Assumptions

- The core data structure for Reminders and Tags remains unchanged; this is purely a presentation layer redesign.
- Missing screens (e.g., the Settings page or Tag Manager popup) will inherit the same global styling conventions (rounded corners, standard colors).
- Emojis/Icons used in the mockup will be translated to `react-icons` matching the Material or FontAwesome sets already in use.
