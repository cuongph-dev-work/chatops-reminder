# Feature Specification: Optional Reminder Description & Notification UI Tweaks

**Feature Branch**: `006-optional-description`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "Phần view in chat chỉ hiển thị khi có link kèm theo. Ngoài ra phần from Mattermost ko cần thiết. Hãy view là phần description từ reminder (thêm phần input này vào chức năng remider và là optional)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Reminder with Optional Description (Priority: P1)

Users want to be able to add an optional description/note to their reminders to retain additional context when they are reminded.

**Why this priority**: It is the core functional addition to the reminder creation process.

**Independent Test**: Can be tested by creating a reminder with a description and verifying the description is saved.

**Acceptance Scenarios**:

1. **Given** the user is viewing the Reminder Creation form (either inline or popup), **When** they fill out the new optional "Description" field and save, **Then** the reminder is saved with the given description.
2. **Given** the user leaves the "Description" field blank, **When** they save, **Then** the reminder is saved successfully without a description (optional validation passes).

---

### User Story 2 - Conditional Notification UI (Priority: P1)

Users want the notification popup to be cleaner, showing the custom description if available, and hiding irrelevant actions like "View in Chat" if the reminder did not originate from a chat link.

**Why this priority**: Directly addresses the UI cleanup requested by the user.

**Independent Test**: Can be tested by triggering notifications from reminders with/without links and with/without descriptions.

**Acceptance Scenarios**:

1. **Given** a reminder triggered without a `messageLink`, **When** the notification appears, **Then** the "View in Chat" button is not rendered in the UI.
2. **Given** a reminder triggered with a `messageLink`, **When** the notification appears, **Then** the "View in Chat" button is visible and functional.
3. **Given** a reminder has a description, **When** the notification appears, **Then** the description is displayed in place of the old "From Mattermost..." text.
4. **Given** a reminder has no description, **When** the notification appears, **Then** the description area is either empty or gracefully hidden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to input an optional string `description` when creating or editing a reminder.
- **FR-002**: System MUST persist the `description` field in the storage alongside the `Reminder` object.
- **FR-003**: System MUST NOT display the "From Mattermost: [author] requested this fix." text on the custom notification popup.
- **FR-004**: System MUST display the reminder's `description` on the custom notification popup in the space where the "From..." text used to be.
- **FR-005**: System MUST conditionally render the "View in Chat" action button; it must only be visible if the reminder's `messageLink` property exists.

### Key Entities

- **Reminder**: Needs a new optional attribute: `Description` (Text).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of newly created notifications do not show the hardcoded "From Mattermost" phrase.
- **SC-002**: Reminders created without chat context successfully suppress the "View in Chat" button.
- **SC-003**: Description text is visibly injected into the notification UI without clipping or breaking the layout (assuming reasonable text lengths).

## Assumptions

- We assume the description field should be a simple text input or textarea without rich text formatting.
- We assume existing reminders in storage (which don't have a description) will simply render without a description and will not crash the UI.
