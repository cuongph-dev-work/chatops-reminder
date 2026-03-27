# Tasks: Fix New Reminder Button

**Input**: Design documents from `/specs/004-fix-new-reminder-btn/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [ ] T001 Setup is already complete from previous phases.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Make Mattermost-specific fields optional in `Reminder` interface in `src/shared/types.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Generic Reminder from Popup (Priority: P1) 🎯 MVP

**Goal**: Click the "New Reminder" button in the popup footer so that a new reminder can be created and saved locally without needing a Mattermost message.

**Independent Test**: Can be fully tested by opening the extension popup, clicking "New Reminder", and verifying that a creation interface appears and successfully saves.

### Implementation for User Story 1

- [x] T003 [US1] Create `ReminderForm` component UI in `src/popup/components/ReminderForm.tsx`
- [x] T004 [US1] Implement local state and save handling via `addReminder` prop in `src/popup/components/ReminderForm.tsx`
- [x] T005 [US1] Update `src/popup/index.tsx` to add `isCreating` state and render `ReminderForm` conditionally
- [x] T006 [US1] Attach onClick handler to the "New Reminder" button in `src/popup/index.tsx` to toggle `isCreating` state

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T007 Run quickstart.md validation to ensure manual reminder flow works end-to-end
