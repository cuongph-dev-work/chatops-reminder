# Feature Specification: UI Tailwind Fix & React Icons

**Feature Branch**: `002-ui-tailwind-icons`  
**Created**: 2026-03-27  
**Status**: Draft  
**Input**: User description: "UI Cực xấu, hinh như ko nhận style tailwind ? ngoài ra ko dùng emoji mà hãy dùng icon của fontawesome hoặc reacticon"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pleasant and Consistent UI (Priority: P1)

As a user, I want the extension interface to be styled properly with TailwindCSS so that it looks professional, clean, and is easy to navigate.

**Why this priority**: Without proper styling, the extension is difficult to use and feels untrustworthy.

**Independent Test**: Can be fully tested by opening the extension popup and the reminder modal to verify that Tailwind utility classes are correctly applied.

**Acceptance Scenarios**:

1. **Given** the extension is loaded, **When** the user opens the popup, **Then** all layout, spacing, and colors defined by Tailwind classes should render correctly.
2. **Given** the user triggers the "Remind Me" action in Mattermost, **When** the modal appears, **Then** the modal form should be styled properly.

---

### User Story 2 - Professional Iconography (Priority: P2)

As a user, I want the extension to use standard vector icons (e.g., React Icons/Lucide) instead of native OS emojis, so that the UI looks consistent across different operating systems and browsers.

**Why this priority**: Emojis render differently on Windows vs macOS vs Linux, which can break the layout or look unprofessional. Standard icons provide a unified experience.

**Independent Test**: Can be fully tested by looking for standard SVG icons on buttons (edit, delete, snooze) instead of emojis.

**Acceptance Scenarios**:

1. **Given** the user is viewing the list of reminders, **When** observing the action buttons, **Then** the edit, delete, and recurrence indicators should be vector icons.
2. **Given** the user is interacting with the Tag Manager, **When** editing or deleting tags, **Then** the action buttons should use consistent vector icons instead of emojis.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render TailwindCSS styles in both the Popup UI and the Content Script UI (Shadow DOM).
- **FR-002**: System MUST use a standard React icon library (e.g., `react-icons` or `lucide-react`) for all UI iconography.
- **FR-003**: System MUST remove all hardcoded OS emojis (⏰, 🗑️, ✏️, 🔁, 💤, etc.) from the user interface.

### Key Entities

- N/A - This is purely a presentation layer update.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of emojis used as UI controls are replaced with vector icons.
- **SC-002**: The Tailwind compiled CSS file is successfully generated and applied without build errors.
- **SC-003**: UI renders consistently across different operating systems (Windows, macOS) without emoji discrepancies.

## Assumptions

- We assume that `lucide-react` or `react-icons` can be easily bundled with Plasmo without significant bundle size inflation.
- The missing Tailwind styles are due to a missing PostCSS configuration file (`postcss.config.js`), which is standard for Plasmo+Tailwind setups.
