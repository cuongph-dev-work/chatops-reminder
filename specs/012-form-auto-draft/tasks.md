# Tasks: Form Auto-Draft

**Input**: Design documents from `/specs/012-form-auto-draft/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user stories can be implemented

- [x] T124 Add draft storage key `STORAGE_KEYS.DRAFT_STATE` to `src/shared/constants.ts`
- [x] T125 Add `DraftState` interface to `src/shared/types.ts`

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 2: User Story 1 & 3 - Graceful Recovery & Clearance (Priority: P1) 🎯 MVP

**Goal**: Save form state continuously to storage and recover it on mount. Clear it upon successful save.

**Independent Test**: Type into form, close popup, reopen, data is restored. Save form, reopen, data is cleared.

### Implementation

- [x] T126 [P] [US1] Implement `useStorage` hook with `chatops-reminder-new-draft` key in `src/popup/components/ReminderForm.tsx`
- [x] T127 [US1] Update state initializers to load existing draft data on component mount in `src/popup/components/ReminderForm.tsx` (ensure passed-in props take precedence over draft where applicable)
- [x] T128 [US1] Add `useEffect` to sync form fields into the draft object whenever they change in `src/popup/components/ReminderForm.tsx`
- [x] T129 [US3] Add code to clear the draft object upon successful `handleSave()` execution in `src/popup/components/ReminderForm.tsx`

**Checkpoint**: At this point, the form saves, recovers, and clears properly.

---

## Phase 3: User Story 2 - Draft Expiration After 15 Minutes (Priority: P2)

**Goal**: Ensure stale drafts are discarded so the user has a fresh form when appropriate.

**Independent Test**: Create a draft, manipulate the timestamp in storage to be > 15m ago, reopen popup, form should be empty.

### Implementation

- [x] T130 [US2] Update mount/initialization logic in `src/popup/components/ReminderForm.tsx` to check if `Date.now() - draft.lastUpdatedAt > 15 * 60 * 1000`; if so, ignore the draft and reset storage.

**Checkpoint**: All user stories are functionally complete.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validations

- [x] T131 Verify build with `pnpm tsc --noEmit` and run `pnpm build`

---

## Dependencies & Execution Order

- **Phase 1** must be completed first to provide typing and key constants.
- **Phase 2** builds the core sync engine. T126-T128 must be done sequentially as they modify the same component linearly.
- **Phase 3** extends the logic from Phase 2 to add the expiration check.
- **Phase 4** validates the build.
