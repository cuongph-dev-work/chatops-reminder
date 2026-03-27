# Tasks: Optional Reminder Description & Notification UI Tweaks

**Input**: Design documents from `/specs/006-optional-description/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core data model updates that block the subsequent UI changes.

- [x] T087 Update `Reminder` and `CreateReminderPayload` interfaces with `description?: string` in `src/shared/types.ts`

**Checkpoint**: Foundation ready - UI implementation can now begin in parallel.

---

## Phase 2: User Story 1 - Create Reminder with Optional Description (Priority: P1) 🎯 MVP

**Goal**: Allow users to input an optional description when creating a reminder.

**Independent Test**: Create a reminder with description, verify it is saved successfully.

### Implementation for User Story 1

- [x] T088 [P] [US1] Add `<textarea>` field for Description in popup UI in `src/popup/components/ReminderForm.tsx`
- [x] T089 [P] [US1] Add `<textarea>` field for Description in Shadow DOM modal in `src/contents/reminder-modal.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 3: User Story 2 - Conditional Notification UI (Priority: P1)

**Goal**: Clean up the custom notification UI by hiding irrelevant links and displaying the description.

**Independent Test**: Trigger a notification with and without a description, with and without a message link, and verify UI rendering.

### Implementation for User Story 2

- [x] T090 [P] [US2] Hide "View in Chat" button if `messageLink` is absent in `src/contents/custom-notification.tsx`
- [x] T091 [US2] Replace "From Mattermost: [System]..." text with the reminder's `description` (if available) in `src/contents/custom-notification.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates and build validation.

- [x] T092 Run `pnpm tsc --noEmit` and confirm build passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: Must be completed first to provide accurate Typescript definitions.
- **User Stories (Phase 2 & 3)**: Depend on Foundational phase completion. Form tweaks (US1) and Notification tweaks (US2) can happen in parallel.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### Implementation Strategy

1. Complete Foundational Data Model tweak (T087).
2. Wire up forms in popup and CSUI (T088, T089).
3. Conditionally adjust notification layout (T090, T091).
4. Run final build check.
