# Tasks: ChatOps Reminder Chrome Extension

**Input**: Design documents from `/specs/001-chatops-reminder-ext/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the specification — test tasks are omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Plasmo scaffold

- [ ] T001 Initialize Plasmo project with React + TypeScript + TailwindCSS at repository root
- [ ] T002 [P] Configure TailwindCSS with Shadow DOM support in `tailwind.config.js`
- [ ] T003 [P] Configure TypeScript strict mode and path aliases in `tsconfig.json`
- [ ] T004 [P] Add development dependencies (Vitest, Playwright, @plasmohq/storage) in `package.json`
- [ ] T005 [P] Create extension icon assets in `src/assets/icon.png` (16x16, 48x48, 128x128)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared modules that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Define TypeScript interfaces (Reminder, Tag, RecurrenceRule, NotificationEvent, ReminderStatus, Settings) in `src/shared/types.ts`
- [ ] T007 Define constants (PRE_REMINDER_OPTIONS, RECURRENCE_TYPES, STORAGE_KEYS, MESSAGE_TYPES, defaults) in `src/shared/constants.ts`
- [ ] T008 Implement storage adapter wrapping `@plasmohq/storage` with typed get/set for reminders, tags, and settings in `src/shared/storage.ts`
- [ ] T009 [P] Create English translation file with all UI labels in `src/shared/i18n/en.json`
- [ ] T010 [P] Create Vietnamese translation file with all UI labels in `src/shared/i18n/vi.json`
- [ ] T011 Implement i18n context provider with locale detection and language switching in `src/shared/i18n/index.ts`
- [ ] T012 Implement background message handler scaffold (router for CREATE/UPDATE/DELETE_REMINDER, CLEAR_COMPLETED) in `src/background/messages.ts`
- [ ] T013 Create background service worker entry that registers alarm and notification listeners in `src/background/index.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Quick Reminder from Chat Message (Priority: P1) 🎯 MVP

**Goal**: Users can create reminders directly from Mattermost message action menus

**Independent Test**: Navigate to Mattermost, open a message action menu, click "Remind Me", fill out the form, and verify the reminder is saved in storage

### Implementation for User Story 1

- [ ] T014 [US1] Implement Mattermost page auto-detection logic (URL pattern + DOM markers) in `src/contents/mattermost-injector.ts`
- [ ] T015 [US1] Implement MutationObserver to detect message action menu opening and inject "Remind Me ⏰" button in `src/contents/mattermost-injector.ts`
- [ ] T016 [US1] Implement message permalink extraction from Mattermost DOM in `src/contents/mattermost-injector.ts`
- [ ] T017 [US1] Create reminder modal form React component (title, date/time, pre-reminder dropdown, save/cancel) with Shadow DOM isolation in `src/contents/reminder-modal.tsx`
- [ ] T018 [US1] Add TailwindCSS styles for the modal via Plasmo `getStyle()` export in `src/contents/reminder-modal.tsx`
- [ ] T019 [US1] Implement form validation (future date required, title required) in `src/contents/reminder-modal.tsx`
- [ ] T020 [US1] Implement CREATE_REMINDER message handler in background — validate, generate ID, save to storage, schedule alarm in `src/background/messages.ts`
- [ ] T021 [US1] Implement alarm scheduling logic using `chrome.alarms.create` with pre-reminder offset in `src/background/index.ts`
- [ ] T022 [US1] Wire modal form submit to send CREATE_REMINDER message to background and show confirmation in `src/contents/reminder-modal.tsx`

**Checkpoint**: User Story 1 complete — users can create reminders from Mattermost messages

---

## Phase 4: User Story 2 — Receiving Timely Notifications (Priority: P1) 🎯 MVP

**Goal**: Users receive browser notifications at scheduled time with click-to-open and snooze

**Independent Test**: Create a reminder set for 1 minute in the future, wait for notification, click to verify link opens, test snooze buttons

### Implementation for User Story 2

- [ ] T023 [US2] Implement notification permission request flow (check on first reminder creation, prompt if not granted) in `src/background/index.ts`
- [ ] T024 [US2] Implement `chrome.alarms.onAlarm` handler to fire `chrome.notifications.create` with reminder title, message link, and Snooze buttons in `src/background/index.ts`
- [ ] T025 [US2] Implement `chrome.notifications.onClicked` handler to open message link in new tab via `chrome.tabs.create` in `src/background/index.ts`
- [ ] T026 [US2] Implement `chrome.notifications.onButtonClicked` handler for Snooze 5min (button 0) and Snooze 10min (button 1) — reschedule alarm and update status to `snoozed` in `src/background/index.ts`
- [ ] T027 [US2] Implement `chrome.notifications.onClosed` handler — mark reminder as `completed`, set `completedAt` timestamp in `src/background/index.ts`
- [ ] T028 [US2] Handle snoozed reminder re-fire: when snooze alarm triggers, re-display notification and set status back to `pending` in `src/background/index.ts`

**Checkpoint**: User Story 2 complete — full create → notify → click/snooze flow works

---

## Phase 5: User Story 3 — Managing Reminders via Popup (Priority: P2)

**Goal**: Users can view, sort, edit, and delete reminders from the extension popup

**Independent Test**: Create several reminders, open popup, verify list displays correctly, edit one reminder's time, delete another, confirm changes persist

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create ReminderCard component (displays title, time, message link, status badge, edit/delete buttons) in `src/popup/components/ReminderCard.tsx`
- [ ] T030 [P] [US3] Create ReminderList component (renders array of ReminderCards with sort controls) in `src/popup/components/ReminderList.tsx`
- [ ] T031 [US3] Create `useReminders` hook with storage-synced CRUD operations (list, update, delete) in `src/popup/hooks/useReminders.ts`
- [ ] T032 [US3] Build popup main page with Pending/Completed tabs and sort-by-time toggle in `src/popup/index.tsx`
- [ ] T033 [US3] Implement inline edit mode for ReminderCard (edit title, date/time, save/cancel) in `src/popup/components/ReminderCard.tsx`
- [ ] T034 [US3] Implement UPDATE_REMINDER message handler in background — validate, update storage, reschedule alarm in `src/background/messages.ts`
- [ ] T035 [US3] Implement DELETE_REMINDER message handler in background — remove from storage, cancel alarm via `chrome.alarms.clear` in `src/background/messages.ts`
- [ ] T036 [US3] Implement CLEAR_COMPLETED message handler in background — bulk or single clear of completed reminders in `src/background/messages.ts`
- [ ] T037 [US3] Add "Clear All Completed" button to the Completed tab in `src/popup/index.tsx`

**Checkpoint**: User Story 3 complete — full popup management with Pending/Completed tabs works

---

## Phase 6: User Story 4 — Categorizing with Tags & Colors (Priority: P2)

**Goal**: Users can create, assign, and manage colored tags on reminders

**Independent Test**: Create a reminder with a new tag and color, verify badge appears in popup, manage tags via tag management interface

### Implementation for User Story 4

- [ ] T038 [P] [US4] Create TagBadge component (colored badge with tag name) in `src/popup/components/TagBadge.tsx`
- [ ] T039 [P] [US4] Create TagManager component (list tags, create/edit/delete with color picker) in `src/popup/components/TagManager.tsx`
- [ ] T040 [US4] Create `useTags` hook with storage-synced CRUD operations for tags in `src/popup/hooks/useTags.ts`
- [ ] T041 [US4] Add multi-tag selector (dropdown with existing tags + "Create new" option) to reminder modal form in `src/contents/reminder-modal.tsx`
- [ ] T042 [US4] Display tag badges on ReminderCard component in `src/popup/components/ReminderCard.tsx`
- [ ] T043 [US4] Add "Sort by tag" option to ReminderList — group reminders by tag in `src/popup/components/ReminderList.tsx`
- [ ] T044 [US4] Add Tag Management navigation/tab to the popup in `src/popup/index.tsx`
- [ ] T045 [US4] Implement tag deletion cascade — remove deleted tag ID from all associated reminders' `tagIds` arrays in `src/popup/hooks/useTags.ts`
- [ ] T046 [US4] Add tag editing to ReminderCard inline edit mode (add/remove tags) in `src/popup/components/ReminderCard.tsx`

**Checkpoint**: User Story 4 complete — tags with colors work across creation and management

---

## Phase 7: User Story 5 — Setting Recurring Reminders (Priority: P3)

**Goal**: Users can set daily/weekly/monthly recurring reminders that auto-schedule

**Independent Test**: Create a daily recurring reminder, verify it fires, check next occurrence is automatically scheduled

### Implementation for User Story 5

- [ ] T047 [US5] Add recurrence selector (off/daily/weekly/monthly with day picker) to reminder modal form in `src/contents/reminder-modal.tsx`
- [ ] T048 [US5] Implement next-occurrence calculator for daily/weekly/monthly recurrence rules in `src/background/index.ts`
- [ ] T049 [US5] Update alarm onAlarm handler: after recurring reminder fires, auto-create next occurrence (new alarm + update `scheduledAt`) in `src/background/index.ts`
- [ ] T050 [US5] Add recurrence indicator (icon/label showing "Daily"/"Weekly Mon"/"Monthly") to ReminderCard in `src/popup/components/ReminderCard.tsx`
- [ ] T051 [US5] Add recurrence editing to ReminderCard inline edit mode (enable/disable/change recurrence) in `src/popup/components/ReminderCard.tsx`
- [ ] T052 [US5] Handle recurrence disable — stop auto-scheduling, keep only current reminder in `src/background/messages.ts`

**Checkpoint**: User Story 5 complete — recurring reminders auto-schedule next occurrence

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T053 [P] Create SettingsPanel component with language toggle (EN/VI) and locale persistence in `src/popup/components/SettingsPanel.tsx`
- [ ] T054 [P] Integrate i18n provider into popup and modal — replace all hardcoded strings with translation keys in `src/popup/index.tsx` and `src/contents/reminder-modal.tsx`
- [ ] T055 Implement auto-purge background job — on alarm/startup, delete completed reminders older than 30 days in `src/background/index.ts`
- [ ] T056 [P] Add edge case handling: browser closed at reminder time (fire on next launch) in `src/background/index.ts`
- [ ] T057 [P] Add edge case handling: storage quota exceeded (show error message on save) in `src/shared/storage.ts`
- [ ] T058 Style polish — ensure consistent TailwindCSS design across popup and modal with responsive layout in `src/styles/global.css`
- [ ] T059 Run quickstart.md validation — verify setup steps, dev server, and extension loading work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — No dependencies on other stories
- **US2 (Phase 4)**: Depends on US1 (needs reminder creation to test notifications)
- **US3 (Phase 5)**: Depends on Foundational — needs existing reminders but can create them manually
- **US4 (Phase 6)**: Depends on US1 + US3 (modal form for tag selector, popup for tag display)
- **US5 (Phase 7)**: Depends on US1 + US2 (needs creation + notification to test recurrence)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

```
Setup → Foundational → US1 (P1) → US2 (P1) ─┬→ US5 (P3) → Polish
                         │                    │
                         └→ US3 (P2) → US4 (P2) ─┘
```

### Within Each User Story

- Models/types before services
- Services before UI components
- Background handlers before UI integration
- Core implementation before polish

### Parallel Opportunities

- T002, T003, T004, T005 can all run in parallel (Phase 1)
- T009, T010 can run in parallel (i18n files)
- T029, T030 can run in parallel (popup components)
- T038, T039 can run in parallel (tag components)
- T053, T054, T056, T057 can run in parallel (polish tasks)
- US3 can start as soon as Foundational completes (parallel with US1 if needed)

---

## Parallel Example: User Story 3

```bash
# Launch parallel component creation:
Task: "Create ReminderCard component in src/popup/components/ReminderCard.tsx"
Task: "Create ReminderList component in src/popup/components/ReminderList.tsx"

# Then sequential (depends on above):
Task: "Create useReminders hook in src/popup/hooks/useReminders.ts"
Task: "Build popup main page in src/popup/index.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (create reminders)
4. Complete Phase 4: User Story 2 (receive notifications)
5. **STOP and VALIDATE**: Full create → notify → snooze flow works
6. Deploy/demo if ready — this is a usable MVP!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 + US2 → **MVP**: Create reminders + get notified
3. US3 → **v1.1**: Manage reminders via popup
4. US4 → **v1.2**: Tag organization
5. US5 → **v1.3**: Recurring reminders
6. Polish → **v1.4**: i18n, auto-purge, edge cases

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
