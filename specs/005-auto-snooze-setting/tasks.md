# Tasks: Auto-Snooze Setting and Badge Cleanup

**Input**: Design documents from `/specs/005-auto-snooze-setting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No general setup required for this feature branch as it builds upon the existing extension structure)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Update `Settings` interface with `autoSnooze` and `autoSnoozeMinutes` and `Reminder` interface with `hasAutoSnoozed` in `src/shared/types.ts`
- [x] T002 Update `DEFAULT_SETTINGS` to include `autoSnooze: false` and `autoSnoozeMinutes: 5` in `src/shared/storage.ts`

**Checkpoint**: Foundation ready - data models established.

---

## Phase 3: User Story 1 - Remove Snooze from Reminder Cards (Priority: P1) 🎯 MVP

**Goal**: Users should no longer see the Snooze action button on the inline reminder cards within the popup.

**Independent Test**: Open the popup and verify the Snooze button is removed from all `ReminderCard` items.

### Implementation for User Story 1

- [x] T003 [P] [US1] Remove the "Snooze" action button rendering from `src/popup/components/ReminderCard.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Configure Auto-Snooze in Settings (Priority: P1)

**Goal**: Users can enable/disable an auto-snooze feature and configure its duration within the global Settings panel.

**Independent Test**: Open the Settings panel, change the auto-snooze toggle and duration, and verify it persists across reloads.

### Implementation for User Story 2

- [x] T004 [P] [US2] Implement "Auto-Snooze" toggle and "Duration" (5m, 10m, 15m) select inputs in `src/popup/components/SettingsPanel.tsx`

**Checkpoint**: Settings UI successfully updates global configuration

---

## Phase 5: User Story 3 - Auto-Snooze Ignored Notifications (Priority: P1)

**Goal**: If a notification times out or is closed without explicit completion, auto-snooze exactly 1 time based on settings.

**Independent Test**: Let a notification time out, observe it transitions to snoozed state and fires again exactly once after the duration.

### Implementation for User Story 3

- [x] T005 [US3] Create an `autoSnoozeReminder` helper function in `src/background/index.ts` that checks the settings, verifies `!hasAutoSnoozed`, and applies snooze logic.
- [x] T006 [US3] Update the system OS `chrome.notifications.onClosed` event listener in `src/background/index.ts` to call `autoSnoozeReminder`.
- [x] T007 [US3] Update CSUI timeout/dismiss handlers (where the user closes/ignores the CSUI notification) and bridge it to trigger `autoSnoozeReminder` in `src/background/index.ts`.

**Checkpoint**: Auto-snooze logic fully functional across both OS and custom UI notifications.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T008 Code cleanup and verify that clicking complete during an auto-snooze accurately clears alarms.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel

### Parallel Opportunities

- T003 (US1) and T004 (US2) can be executed in parallel once T001 and T002 are done.
- T005-T007 (US3) can be executed independently of the UI updates.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T002)
2. Complete Phase 3: User Story 1 (T003)
3. STOP and VALIDATE: Verify Snooze button is removed.

### Incremental Delivery

1. Foundation ready
2. Add US1 → Test independently
3. Add US2 → Test independently
4. Add US3 → Test independently
5. Each story adds value without breaking previous stories
