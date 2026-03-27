# Tasks: Mattermost Remind Me Action

**Input**: Design documents from `/specs/010-mattermost-remind-action/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Storage Bridge Infrastructure)

**Purpose**: Add the storage key and message type for content script → popup communication.

- [ ] T112 [P] Add `STORAGE_KEYS.PENDING_REMINDER` constant in `src/shared/constants.ts`
- [ ] T113 [P] Add `OPEN_POPUP_WITH_REMINDER` message type definition in `src/shared/types.ts`

---

## Phase 2: User Story 1 - Remind Me from More Actions Menu (Priority: P1) 🎯 MVP

**Goal**: Clicking "Remind Me" in Mattermost → opens extension popup with chat permalink pre-filled.

**Independent Test**: Open Mattermost → click three-dot menu → click "Remind Me" → verify popup opens with link filled.

### Implementation for User Story 1

- [ ] T114 [US1] Replace `CustomEvent` dispatch with storage write + `chrome.runtime.sendMessage` in `src/contents/mattermost-injector.ts`
- [ ] T115 [US1] Add `OPEN_POPUP_WITH_REMINDER` listener in background to attempt `chrome.action.openPopup()` with badge fallback in `src/background/index.ts`
- [ ] T116 [US1] Read `pendingReminder` on popup mount — if set, auto-open ReminderForm with link pre-filled, then clear key in `src/popup/index.tsx`

**Checkpoint**: End-to-end flow working: Mattermost "Remind Me" → popup → link pre-filled

---

## Phase 3: Polish & Cross-Cutting Concerns

- [ ] T117 Run `pnpm tsc --noEmit` to verify TypeScript builds successfully

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: No dependencies — T112, T113 run in parallel
- **Phase 2 (US1)**: Depends on T112, T113
  - T114 → T115 → T116 (sequential within phase)
- **Phase 3 (Polish)**: After all phases
