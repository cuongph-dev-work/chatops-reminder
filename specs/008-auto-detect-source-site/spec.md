# Feature Specification: Auto-Detect Source Site

**Feature Branch**: `008-auto-detect-source-site`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "Khi tôi tạo reminder thì có thể biết được tôi tạo từ url nào (từ website nào) => tự động điền vào link. Ngoài ra ở setting có thể có phần Map Link với Name Site (mặc định) phần name site sẽ tự động lấy theo document.title của link đó. Sau đó khi hiển thị ở Notification thì có thể xem được reminder được tạo bởi website nào."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auto-Fill Current Page URL (Priority: P1)

As a user, when I open the "New Reminder" form from the popup or from the content script modal, I want the current browser tab's URL to be automatically filled into the Link field, so I don't have to manually copy-paste the page URL.

**Why this priority**: Core convenience feature — eliminates the most common friction point in reminder creation.

**Independent Test**: Open any website, click "New Reminder" in the popup, and verify the Link field is pre-populated with the current tab URL.

**Acceptance Scenarios**:

1. **Given** the user is on `https://example.com/page`, **When** they open the New Reminder form from the popup, **Then** the Link field is automatically filled with `https://example.com/page`.
2. **Given** the user is on a Mattermost page and clicks the injected "Remind Me" button, **When** the modal opens, **Then** the Link field is filled with the Mattermost permalink (existing behavior preserved).
3. **Given** the auto-filled link is present, **When** the user modifies or clears the Link field, **Then** the user's manual input takes precedence.

---

### User Story 2 - Site Name Mapping in Settings (Priority: P2)

As a user, I want to manage a list of "Site Mappings" in Settings where each mapping associates a URL domain/pattern with a friendly site name. By default, the site name is automatically derived from the page's `document.title`. I can edit the name to something custom (e.g., "Jira", "Mattermost", "Confluence").

**Why this priority**: Enables the personalized labeling that makes the notification source meaningful.

**Independent Test**: Open Settings, observe the auto-populated site mapping list, edit a site name, and verify it persists.

**Acceptance Scenarios**:

1. **Given** the user has created reminders from various websites, **When** they open Settings, **Then** a "Site Mappings" section lists all unique domains with their auto-detected names.
2. **Given** a site mapping entry shows `https://jira.company.com` with name "JIRA Board - Sprint 42", **When** the user edits the name to "Jira", **Then** the custom name is saved and used in all future notifications for that domain.
3. **Given** a new reminder is created from an unvisited domain, **When** the site mapping does not exist, **Then** a new entry is automatically added using the page's `document.title` as the default name.

---

### User Story 3 - Show Source Site in Notification (Priority: P3)

As a user, when a reminder notification appears, I want to see which website it was created from (using the friendly site name), so I can quickly understand the context of the reminder.

**Why this priority**: Completes the feature loop — the information gathered in US1 and US2 is surfaced at the critical moment.

**Independent Test**: Create a reminder from a known site, wait for its notification, and verify the source site name is displayed.

**Acceptance Scenarios**:

1. **Given** a reminder was created from `https://jira.company.com` with site name "Jira", **When** the notification fires, **Then** the notification displays "From: Jira" as a subtitle.
2. **Given** a reminder was created manually without any URL, **When** the notification fires, **Then** no source site label is shown (graceful fallback).
3. **Given** a reminder was created from a domain that has no custom name, **When** the notification fires, **Then** the auto-detected `document.title` or the domain name is displayed.

---

### Edge Cases

- What happens when the popup is opened from `chrome://extensions` or `chrome://newtab`? The Link field should remain empty for non-http(s) URLs.
- What happens if `document.title` is empty? Fall back to the domain name (e.g., `example.com`).
- What happens if the user clears the auto-filled Link? The reminder is saved without a source site.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST auto-detect the current browser tab URL when the reminder creation form is opened.
- **FR-002**: System MUST auto-fill the Link field with the detected URL (only for `http://` and `https://` schemes).
- **FR-003**: System MUST allow users to override or clear the auto-filled Link.
- **FR-004**: System MUST capture the page title (`document.title`) of the source URL at reminder creation time.
- **FR-005**: System MUST maintain a persistent list of Site Mappings (domain → friendly name) in Settings.
- **FR-006**: Site Mappings MUST be auto-populated when reminders are created from new domains.
- **FR-007**: Users MUST be able to edit the friendly name of any site mapping.
- **FR-008**: The custom notification MUST display the source site's friendly name when available.
- **FR-009**: System MUST gracefully handle reminders without a source site (no label shown).

### Key Entities

- **SiteMapping**: Represents a domain-to-name association. Key attributes: `domain` (hostname), `name` (friendly name), `autoDetected` (boolean indicating if name was auto-derived).
- **Reminder** (extended): Adds `sourceSiteName` — resolved from SiteMapping at creation time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of reminders created while browsing an http(s) page have the Link field auto-filled.
- **SC-002**: Users can identify the source website of a reminder from the notification within 1 second (no need to click or expand).
- **SC-003**: Site name customizations persist across browser sessions and extension reloads.
- **SC-004**: Creating a reminder from a new domain takes zero extra steps compared to a known domain.

## Assumptions

- Auto-detection only works for `http://` and `https://` URLs; internal Chrome pages (`chrome://`, `about:`) are excluded.
- The extension already has the `tabs` permission required to read the active tab URL.
- Site Mappings are stored locally using the existing `@plasmohq/storage` adapter.
- The `document.title` is captured via `chrome.tabs.query()` which provides the tab's title without requiring additional content script injection.
