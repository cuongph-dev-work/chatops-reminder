# Feature Specification: Mattermost Remind Me Action

**Feature Branch**: `010-mattermost-remind-action`  
**Created**: 2026-03-27  
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remind Me from More Actions Menu (Priority: P1)

As a user browsing Mattermost, I want to click "Remind Me" in the "More Actions" (three-dot) dropdown of any chat message, so that a reminder is created with the permalink to that specific message automatically filled in.

**Why this priority**: Core value — zero-friction reminder creation directly from chat context.

**Acceptance Scenarios**:

1. **Given** I am on a Mattermost channel page, **When** I click the three-dot "More Actions" menu on any message, **Then** I see a "Remind Me" option in the dropdown.
2. **Given** the "Remind Me" option is visible, **When** I click it, **Then** the dropdown closes and the extension's reminder creation form opens with the Link field pre-filled with the permalink to that specific chat message.
3. **Given** I clicked "Remind Me", **When** the reminder form opens, **Then** the title field is focused and ready for input (the user only needs to add a title, time, and save).
4. **Given** the message is in a direct message channel, **When** I click "Remind Me", **Then** the permalink still points to the correct message.

---

### User Story 2 - Visual Consistency (Priority: P2)

As a user, I want the "Remind Me" button to look visually consistent with other items in the Mattermost dropdown menu, so it feels like a native feature.

**Acceptance Scenarios**:

1. **Given** the "More Actions" dropdown is open, **When** "Remind Me" appears, **Then** it matches the font size, padding, icon style, and hover behavior of other menu items.
2. **Given** I hover over "Remind Me", **When** inspecting visually, **Then** the hover state matches the other native dropdown items.

---

### Edge Cases

- If the post ID cannot be extracted from the DOM, the Link field should fall back to the current page URL.
- If the user is not on a Mattermost page, no "Remind Me" button should be injected.
- The button must not be injected more than once per dropdown opening.
- The reminder form must open within the extension popup (not inline in Mattermost).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A "Remind Me" menu item MUST be injected into the Mattermost "More Actions" dropdown for every message.
- **FR-002**: Clicking "Remind Me" MUST close the dropdown and open the extension's reminder creation form.
- **FR-003**: The Link field in the reminder form MUST be pre-filled with the permalink to the clicked message (format: `{origin}/{team}/pl/{postId}`).
- **FR-004**: Opening the reminder form from "Remind Me" MUST focus the title input field.
- **FR-005**: The system MUST detect Mattermost pages via URL patterns and DOM markers before injecting any UI.
- **FR-006**: Duplicate "Remind Me" buttons MUST NOT appear if the dropdown is opened multiple times.

## Success Criteria *(mandatory)*

- **SC-001**: Users can create a reminder from any Mattermost message in under 3 clicks (More Actions → Remind Me → fill title + time → Save).
- **SC-002**: The extracted permalink correctly links back to the original message 100% of the time for standard Mattermost deployments.
- **SC-003**: The "Remind Me" button is visually indistinguishable from native Mattermost dropdown items.

## Assumptions

- The existing content script (`mattermost-injector.ts`) already handles Mattermost page detection, MutationObserver setup, permalink extraction, and button injection.
- The `chatops:open-reminder-modal` custom event is dispatched but currently has no listener — the popup needs a mechanism to receive this event and open with the pre-filled link.
- Since Chrome extension popups cannot be opened programmatically from content scripts, the approach will likely involve storing the link in extension storage and then having the popup read it on open.
