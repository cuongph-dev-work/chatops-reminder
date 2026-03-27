# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Remove the Snooze action from the ReminderCard popup UI, while introducing an Auto-Snooze capability for ignored/missed OS or CSUI notifications. Auto-snooze preferences (toggle and duration) will be configurable globally in the application Settings.

## Technical Context

**Language/Version**: TypeScript / React 18
**Primary Dependencies**: Plasmo HQ, react-select, TailwindCSS, chrome.alarms, chrome.storage API
**Storage**: @plasmohq/storage
**Testing**: N/A
**Target Platform**: Chrome Extension V3
**Project Type**: Chrome Extension
**Performance Goals**: Instant UI updates (<100ms) for Settings interactions
**Constraints**: Alarms must be managed securely within MV3 service worker limitations
**Scale/Scope**: Feature addition integrated across UI and background worker

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Standard extension logic with UI & Background separation follows project baseline. (Pass)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
src/
├── background/
│   └── index.ts               # Implements auto-snooze logic on dismiss handlers
├── popup/
│   ├── components/
│   │   ├── ReminderCard.tsx   # Removes snooze button
│   │   └── SettingsPanel.tsx  # Adds setting toggles and selectors
├── shared/
│   └── types.ts               # Adds hasAutoSnoozed to Reminder, updates Settings
```

**Structure Decision**: Integrated directly into existing `src/popup`, `src/background`, and `src/shared` domains.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
