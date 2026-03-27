# Tasks: Notification Layout Redesign

**Input**: Design documents from `/specs/011-notification-layout-redesign/`
**Prerequisites**: plan.md, spec.md

## Phase 1: User Story 1 - Professional Notification Card Layout (Priority: P1) 🎯 MVP

**Goal**: Redesign notification card to match mockup with left border, header, and updated buttons.

**Independent Test**: Trigger a reminder → verify notification matches mockup layout.

### Implementation

- [x] T118 [US1] Add `formatRelativeTime()` helper function in `src/contents/custom-notification.tsx`
- [x] T119 [US1] Restructure card: header with "ACTIVE REMINDER" + timestamp, body with circular icon + title + subtitle in `src/contents/custom-notification.tsx`
- [x] T120 [US1] Update buttons: filled "View in Chat", outlined "Snooze 5m", text "Dismiss" in `src/contents/custom-notification.tsx`

**Checkpoint**: Notification layout matches mockup

---

## Phase 2: User Story 2 - Dismiss Marks Completed (Priority: P1)

- [x] T121 [US2] Wire "Dismiss" button to `handleDismiss()` (existing function, marks completed) in `src/contents/custom-notification.tsx`

---

## Phase 3: User Story 3 - Auto-Dismiss Progress Bar (Priority: P2)

- [x] T122 [US3] Verify progress bar and auto-dismiss/auto-snooze logic retained unchanged

---

## Phase 4: Polish

- [ ] T123 Run `pnpm dev` to verify build passes
