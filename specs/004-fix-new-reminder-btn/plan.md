# Implementation Plan: Fix New Reminder Button

**Branch**: `004-fix-new-reminder-btn` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-fix-new-reminder-btn/spec.md`

## Summary

Make the "New Reminder" button in the popup footer functional by triggering an inline reminder creation form within the popup. The form will allow users to create manual reminders that are saved directly to local storage, optionally accepting a Mattermost permalink.

## Technical Context

**Language/Version**: TypeScript, React 18
**Primary Dependencies**: Plasmo, TailwindCSS
**Storage**: `@plasmohq/storage`
**Testing**: Vitest
**Target Platform**: Chrome Extension (Manifest V3)
**Project Type**: Browser Extension
**Performance Goals**: Instant UI updates (<50ms)
**Constraints**: Must fit within the Chrome Extension popup constraints (400x600px).
**Scale/Scope**: Local user data only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*
Passes all core principles. Modifies existing extension UI without breaking CSUI architectures.

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-new-reminder-btn/
├── plan.md              
├── research.md          
├── data-model.md        
└── quickstart.md        
```

### Source Code (repository root)

```text
src/
├── popup/
│   ├── index.tsx
│   └── components/
│       ├── ReminderForm.tsx  # [NEW] Manual creation form
│       └── ...
└── shared/
    ├── types.ts          # [MODIFY] Make Mattermost-specific fields optional
    └── ...
```

**Structure Decision**: Add a new `ReminderForm` component in the popup directory to handle manual creation so we don't entangle the existing CSUI modal logic with the popup UI constraints.
