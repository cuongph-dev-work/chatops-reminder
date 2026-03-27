# Tasks: Auto-Detect Source Site

**Input**: Design documents from `/specs/008-auto-detect-source-site/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Data model and storage layer extensions

- [ ] T097 [P] Add `SiteMapping` interface and extend `Reminder` with `sourceSiteName` and `sourcePageTitle` in `src/shared/types.ts`
- [ ] T098 [P] Add `STORAGE_KEYS.SITE_MAPPINGS` constant in `src/shared/constants.ts`
- [ ] T099 Add `getSiteMappings`, `saveSiteMappings`, `upsertSiteMapping` CRUD functions in `src/shared/storage.ts`

---

## Phase 2: User Story 1 - Auto-Fill Current Page URL (Priority: P1) 🎯 MVP

**Goal**: Automatically populate the Link field with the active tab's URL when opening the reminder form.

**Independent Test**: Open any http(s) page → click New Reminder → verify Link is pre-filled.

### Implementation for User Story 1

- [ ] T100 [US1] Query `chrome.tabs` for active tab URL + title in `src/popup/index.tsx` and pass as props to `ReminderForm`
- [ ] T101 [US1] Accept `defaultLink` and `defaultSiteTitle` props in `ReminderForm` and pre-populate the Link field (http/https only) in `src/popup/components/ReminderForm.tsx`
- [ ] T102 [US1] Include `sourcePageTitle` in `CREATE_REMINDER` payload from `ReminderForm` in `src/popup/components/ReminderForm.tsx`

**Checkpoint**: Link auto-fill working from popup

---

## Phase 3: User Story 2 - Site Mapping Resolution & Settings (Priority: P2)

**Goal**: Auto-create/resolve site mappings on reminder creation and provide editable Site Mappings UI in Settings.

**Independent Test**: Create reminders from different sites → open Settings → verify domains listed with page titles → edit a name → verify it persists.

### Implementation for User Story 2

- [ ] T103 [US2] In `handleCreate` (messages.ts), extract domain from `messageLink`, upsert `SiteMapping`, and set `sourceSiteName` on the new Reminder in `src/background/messages.ts`
- [ ] T104 [US2] Add `sourcePageTitle` handling to `CreateReminderPayload` in `src/shared/types.ts`
- [ ] T105 [US2] Add "Site Mappings" management section (list, inline edit name, delete) to `src/popup/components/SettingsPanel.tsx`

**Checkpoint**: Site mappings auto-created and editable in Settings

---

## Phase 4: User Story 3 - Show Source Site in Notification (Priority: P3)

**Goal**: Display the source site name in the custom notification UI.

**Independent Test**: Create a reminder from a known site → wait for notification → verify "From: SiteName" subtitle.

### Implementation for User Story 3

- [ ] T106 [US3] Display "From: {sourceSiteName}" subtitle in `src/contents/custom-notification.tsx` (below tags, only if available)

**Checkpoint**: Notifications show source site label

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Build verification

- [ ] T107 Run `pnpm tsc --noEmit` to verify TypeScript builds successfully

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on T097 (types)
- **Phase 3 (US2)**: Depends on T097, T098, T099 (storage CRUD)
- **Phase 4 (US3)**: Depends on T097 (Reminder type extension)
- **Phase 5 (Polish)**: After all phases

### Parallel Opportunities

- T097, T098 can run in parallel (different files)
- US1 and US3 can proceed in parallel once Phase 1 is complete
