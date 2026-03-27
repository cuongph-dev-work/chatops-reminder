# Tasks: Notification OK Button & Auto-Snooze Fallback

**Input**: Design documents from `/specs/007-notification-ok-auto-snooze/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No setup required as this is an incremental UI feature over an existing setup)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(No foundational data-model changes required per `data-model.md`)*

---

## Phase 3: User Story 1 - Acknowledge and Complete Reminder (Priority: P1) 🎯 MVP

**Goal**: Add an explicit "OK" button to the notification popup allowing users to mark a reminder as completed.

**Independent Test**: Trigger a reminder, click the "OK" button, and verify the notification disappears and the reminder is marked completed in the extension's popup.

### Implementation for User Story 1

- [x] T093 [US1] Add "OK" button UI element (using Tailwind styling matching the Snooze button) in `src/contents/custom-notification.tsx`
- [x] T094 [US1] Wire "OK" button `onClick` event to invoke `handleDismiss()` in `src/contents/custom-notification.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Auto-Snooze on Inaction (Priority: P2)

**Goal**: Verify the system automatically snoozes reminders when notifications time out or are explicitly closed via the 'X' button.

**Independent Test**: Trigger a notification, wait 15 seconds for the progress bar to deplete, and verify it automatically reschedules the alarm based on user preferences.

### Implementation for User Story 2

- [x] T095 [US2] Code audit to verify `handleIgnore()` is exclusively called on progress bar timeout and 'X' button click in `src/contents/custom-notification.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T096 Run `pnpm tsc --noEmit` to verify TypeScript builds successfully.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Stories (Phase 3+)**: Can proceed immediately. US1 is the primary implementation. US2 is a verification step.
- **Polish (Final Phase)**: Depends on all desired user stories being complete
