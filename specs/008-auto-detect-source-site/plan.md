# Implementation Plan: Auto-Detect Source Site

**Branch**: `008-auto-detect-source-site` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-auto-detect-source-site/spec.md`

## Summary

When users create a reminder (from popup or content script modal), the extension auto-detects the current tab's URL and page title, filling the Link field and capturing the source site. A "Site Mappings" section in Settings lets users customize domain-to-friendly-name mappings. Notifications display the resolved site name (e.g., "From: Jira").

## Technical Context

**Language/Version**: TypeScript 5+
**Primary Dependencies**: React (Plasmo CSUI), TailwindCSS, react-select, react-icons
**Storage**: `@plasmohq/storage` (Chrome local storage)
**Testing**: `pnpm tsc --noEmit`
**Target Platform**: Chrome Extension (Manifest V3)
**Project Type**: Browser Extension
**Constraints**: Shadow DOM (`important: true`), `tabs` permission already granted

## Constitution Check

*GATE: Passed*
- Dropdowns: `react-select` for any new selects ✅
- Icons: `react-icons` for any new icons ✅
- Styling: Tailwind with Blue/Slate palette ✅
- Architecture: Background as source of truth, popup/CSUI as presentational ✅

## Project Structure

### Documentation (this feature)

```text
specs/008-auto-detect-source-site/
├── plan.md
├── research.md
├── data-model.md
└── quickstart.md
```

### Source Code

```text
src/
├── shared/
│   ├── types.ts          # Add SiteMapping interface, extend Reminder
│   ├── storage.ts        # Add getSiteMappings/saveSiteMappings CRUD
│   └── constants.ts      # Add STORAGE_KEYS.SITE_MAPPINGS
├── popup/
│   ├── components/
│   │   ├── ReminderForm.tsx    # Auto-fill Link from active tab
│   │   └── SettingsPanel.tsx   # Add Site Mappings management UI
│   └── index.tsx               # Pass activeTabInfo to ReminderForm
├── contents/
│   ├── custom-notification.tsx # Display "From: SiteName" subtitle
│   └── reminder-modal.tsx      # Already captures messageLink from Mattermost
└── background/
    └── messages.ts             # Resolve site name on CREATE_REMINDER
```

**Structure Decision**: Extension of existing files. No new files needed — all changes fit within the current architecture.

## Implementation Approach

### Phase 1: Data Model
- Add `SiteMapping` interface (`domain`, `name`, `autoDetected`)
- Add `sourceSiteName?: string` to `Reminder`
- Add storage CRUD for site mappings

### Phase 2: Auto-Fill (US1)
- In `popup/index.tsx`, query `chrome.tabs` for active tab URL+title when opening ReminderForm
- Pass `defaultLink` and `defaultSiteTitle` as props to ReminderForm
- ReminderForm pre-populates the Link field (only for http/https)

### Phase 3: Site Mapping Resolution (US2)
- In `handleCreate` (messages.ts), extract domain from `messageLink`, look up SiteMapping
- If no mapping exists, auto-create one using the page title
- Store resolved `sourceSiteName` on the Reminder

### Phase 4: Settings UI (US2)
- Add a "Site Mappings" section to SettingsPanel
- List all mappings with editable name field
- Delete mapping capability

### Phase 5: Notification Display (US3)
- In `custom-notification.tsx`, display "From: {sourceSiteName}" subtitle below description/tags
