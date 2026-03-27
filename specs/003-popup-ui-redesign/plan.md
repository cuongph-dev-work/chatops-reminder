# Implementation Plan: Popup UI Redesign

**Branch**: `003-popup-ui-redesign` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-popup-ui-redesign/spec.md`

## Summary

This feature replaces the default extension popup UI with a modernized, Tailwind-styled React application featuring tabbed navigation (All, Today, Tags), rich visual reminder cards with hover-action states, and a prominent sticky footer for creating new reminders and accessing settings.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18  
**Primary Dependencies**: Plasmo HQ, TailwindCSS, `react-icons`
**Storage**: `@plasmohq/storage` (Existing)
**Testing**: Dev manual testing in unpacked extension  
**Target Platform**: Chrome Extension (Manifest V3) Popup Action
**Project Type**: Browser Extension Frontend  
**Performance Goals**: Instant popup load, 60fps scrolling and hover animations  
**Constraints**: Must fit within standard Chrome popup dimensions
**Scale/Scope**: 1 UI screen replacement broken into several sub-components.

## Constitution Check

*N/A - Project constitution rules are default.*

## Project Structure

### Documentation (this feature)

```text
specs/003-popup-ui-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Empty (no external API changes)
```

### Source Code (repository root)

```text
src/
└── popup/
    ├── index.tsx                # Main Popup Entry (Header/Tabs/Footer)
    └── components/
        ├── ReminderCard.tsx     # The visual card rendering a single reminder with hover actions
        ├── ReminderList.tsx     # The scrollable list view handling empty states and grouping
        └── ...                  # Existing components (TagManager, etc.) reused inside tabs
```

**Structure Decision**: We will continue using the existing Plasmo `src/popup/` directory structure, refactoring the top-level index to support the new tab abstraction and updating `ReminderCard` concepts to match the visual design.

## Complexity Tracking

*None.*
