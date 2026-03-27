# Implementation Plan: ChatOps Reminder Chrome Extension

**Branch**: `001-chatops-reminder-ext` | **Date**: 2026-03-27 | **Spec**: [spec.md](file:///d:/chatops-reminder/specs/001-chatops-reminder-ext/spec.md)
**Input**: Feature specification from `/specs/001-chatops-reminder-ext/spec.md`

## Summary

Build a Chrome Extension (Manifest V3) using Plasmo framework with React + TypeScript that lets users create reminders directly from Mattermost chat messages. The extension injects a "Remind Me" button into Mattermost's message action menu, provides a modal form for creating reminders with tags/recurrence/pre-reminders, delivers Chrome native notifications with snooze support, and includes a popup manager for CRUD operations. Data is stored locally via `@plasmohq/storage`. Bilingual UI (EN/VI) with auto-detection.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18+)
**Primary Dependencies**: Plasmo (Chrome Extension framework), React 18, `@plasmohq/storage`, TailwindCSS
**Storage**: Chrome Extension Storage (`chrome.storage.local` via `@plasmohq/storage`)
**Testing**: Vitest + React Testing Library (unit), Playwright (E2E/browser)
**Target Platform**: Chromium-based browsers (Chrome, Edge, Brave) — Manifest V3
**Project Type**: Browser extension (Chrome Extension)
**Performance Goals**: Button injection < 2s after page load, notification delivery within 1 min of scheduled time
**Constraints**: Offline-capable (local storage only), no server-side component, Shadow DOM for style isolation
**Scale/Scope**: < 1,000 active reminders per user, single-user (local)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file contains only placeholders (no project-specific gates defined). No violations to evaluate.

**Status**: ✅ PASS (no gates defined)

## Project Structure

### Documentation (this feature)

```text
specs/001-chatops-reminder-ext/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── background/
│   ├── index.ts                 # Service worker: alarm scheduling, notification handling, snooze, recurring, auto-purge
│   └── messages.ts              # Message handlers for content↔background communication
├── contents/
│   ├── mattermost-injector.ts   # Content script: MutationObserver for DOM injection
│   └── reminder-modal.tsx       # CSUI: Shadow DOM modal form (React component)
├── popup/
│   ├── index.tsx                # Popup entry: reminder list with Pending/Completed tabs
│   ├── components/
│   │   ├── ReminderList.tsx      # Sortable list (by time/tag)
│   │   ├── ReminderCard.tsx      # Individual reminder display with edit/delete
│   │   ├── TagBadge.tsx          # Colored tag badge component
│   │   ├── TagManager.tsx        # Tag CRUD interface
│   │   └── SettingsPanel.tsx     # Language toggle, preferences
│   └── hooks/
│       ├── useReminders.ts       # Reminder CRUD hook with storage sync
│       └── useTags.ts            # Tag management hook
├── shared/
│   ├── types.ts                 # Reminder, Tag, NotificationEvent interfaces
│   ├── constants.ts             # Pre-reminder options, recurrence types, defaults
│   ├── storage.ts               # Storage adapter (@plasmohq/storage wrapper)
│   └── i18n/
│       ├── index.ts              # i18n setup with locale detection
│       ├── en.json               # English translations
│       └── vi.json               # Vietnamese translations
├── assets/
│   └── icon.png                 # Extension icon
└── styles/
    └── global.css               # TailwindCSS entry

tests/
├── unit/
│   ├── storage.test.ts          # Storage adapter tests
│   ├── reminder-crud.test.ts    # Reminder create/edit/delete logic
│   ├── tag-crud.test.ts         # Tag management logic
│   ├── alarm-scheduling.test.ts # Alarm scheduling + snooze + recurring
│   └── auto-purge.test.ts       # 30-day auto-purge logic
└── e2e/
    └── reminder-flow.test.ts    # Full flow: create → notify → snooze → complete
```

**Structure Decision**: Single-project Chrome Extension using Plasmo's conventions (`contents/`, `background/`, `popup/`). Shared modules in `src/shared/`. Tests separated into `unit/` and `e2e/`.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Mattermost Web Page             │
│  ┌───────────────────────────────────────────┐   │
│  │ Content Script (mattermost-injector.ts)   │   │
│  │  • MutationObserver → inject "Remind Me"  │   │
│  │  • Extract message permalink              │   │
│  └──────────┬────────────────────────────────┘   │
│             │ opens                               │
│  ┌──────────▼────────────────────────────────┐   │
│  │ CSUI Modal (reminder-modal.tsx)           │   │
│  │  • Shadow DOM (style isolation)           │   │
│  │  • Reminder form: title, time, tags, etc. │   │
│  └──────────┬────────────────────────────────┘   │
└─────────────┼───────────────────────────────────┘
              │ chrome.runtime.sendMessage
┌─────────────▼───────────────────────────────────┐
│ Background Service Worker (index.ts)             │
│  • chrome.alarms → schedule/reschedule           │
│  • chrome.notifications → display + snooze       │
│  • Recurring logic → auto-schedule next          │
│  • Auto-purge → clean completed > 30 days        │
│  • @plasmohq/storage → read/write reminders      │
└─────────────┬───────────────────────────────────┘
              │ storage sync
┌─────────────▼───────────────────────────────────┐
│ Extension Popup (popup/index.tsx)                 │
│  • Pending tab: list/sort/edit/delete reminders  │
│  • Completed tab: view/clear fired reminders     │
│  • Tag Manager: create/edit/delete tags          │
│  • Settings: language toggle (EN/VI)             │
└──────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Foundation (P1 — MVP)

1. **Project scaffold**: Initialize Plasmo project with React + TypeScript + TailwindCSS
2. **Shared types & storage**: Define `Reminder`, `Tag` interfaces and `@plasmohq/storage` adapter
3. **Background service worker**: `chrome.alarms` scheduling, `chrome.notifications` display, snooze handling
4. **Content script injection**: MutationObserver to detect Mattermost action menus, inject "Remind Me" button
5. **CSUI Modal form**: Shadow DOM React component for reminder creation with auto-filled message link
6. **Basic popup**: List pending reminders, sort by time

### Phase 2: Management & Organization (P2)

7. **Popup CRUD**: Edit/delete reminders from popup, alarm rescheduling
8. **Completed tab**: Show fired reminders in separate tab with manual clear
9. **Tag system**: Tag CRUD, multi-tag assignment, colored badges, sort by tag
10. **Tag management UI**: Dedicated tag management interface in popup

### Phase 3: Power Features & Polish (P3)

11. **Recurring reminders**: Daily/weekly/monthly recurrence with auto-scheduling
12. **i18n**: Bilingual support (EN/VI) with locale detection and settings toggle
13. **Auto-purge**: Background job to purge completed reminders older than 30 days
14. **Notification permissions**: Permission request flow on first reminder creation
15. **Auto-detection**: Mattermost page auto-detection by URL pattern/DOM markers

## Complexity Tracking

No constitution violations to justify.
