# Tasks: History Tab

**Input**: Design documents from `/specs/009-history-tab/`
**Prerequisites**: plan.md, spec.md

## Phase 1: User Story 1 - View Completed Reminders in History Tab (Priority: P1) 🎯 MVP

**Goal**: Add a "History" tab displaying all completed reminders sorted by completion date.

**Independent Test**: Complete a reminder → open popup → click History tab → verify it appears.

### Implementation for User Story 1

- [ ] T108 [US1] Extend `Tab` type to include `"History"` and add History tab button to tab bar in `src/popup/index.tsx`
- [ ] T109 [US1] Add History tab content section displaying `completed` reminders sorted by `completedAt` desc, with empty state, in `src/popup/index.tsx`

**Checkpoint**: History tab visible and showing completed reminders

---

## Phase 2: User Story 2 - Clear History (Priority: P2)

**Goal**: Allow users to clear all completed reminders from History.

**Independent Test**: Have completed reminders → click "Clear All" in History tab → verify cleared.

### Implementation for User Story 2

- [ ] T110 [US2] Add "Clear All" button in the History tab header that calls `clearCompleted()` in `src/popup/index.tsx`

**Checkpoint**: Clear All button removes completed reminders

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Build verification

- [ ] T111 Run `pnpm tsc --noEmit` to verify TypeScript builds successfully

---

## Dependencies & Execution Order

- **Phase 1 (US1)**: No dependencies — start immediately
- **Phase 2 (US2)**: Depends on T108 (tab must exist)
- **Phase 3**: After all phases

### Notes

- US3 (card details) is already handled by existing `ReminderList`/`ReminderCard` components which display title, tags, source site, and link.
- No new files needed — all changes in `popup/index.tsx`.
