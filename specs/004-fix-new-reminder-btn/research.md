# Research: Manual Reminder Creation

## Scope
How to best implement the "New Reminder" form within the limited extension popup context.

## Decision 1: UI Component Reuse vs Custom Implementation
- **Decision**: Build a custom `ReminderForm.tsx` specific to the popup.
- **Rationale**: The existing `reminder-modal.tsx` is heavily coupled with Plasmo Content Scripts (CSUI) and Shadow DOM injection meant for the Mattermost DOM. Reusing it inside the popup `index.tsx` would be overly complex or impossible due to rendering context differences. Building a tailored React form using the existing Tailwind tokens ensures a perfect fit inside the `400x600px` popup constraints.
- **Alternatives considered**: Extracting a shared UI core from the CSUI. Rejected because the popup form logic is slightly different (optional link, no auto-injected author data).

## Decision 2: Routing/State Management
- **Decision**: Manage the form visibility via local component state (`isCreating`) in `index.tsx`.
- **Rationale**: The popup is simple enough that introducing a router like `react-router` is unnecessary overhead. Conditional rendering is sufficient.
