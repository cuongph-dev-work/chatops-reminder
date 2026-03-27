# Implementation Plan: Notification Layout Redesign

**Branch**: `011-notification-layout-redesign` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)

## Summary

Redesign the custom CSUI notification layout to match the user's mockup. Key changes: left blue border accent, "ACTIVE REMINDER" header with relative timestamp, circular alarm icon, source site subtitle in green, and updated button layout (filled/outlined/text).

## Technical Context

**Language/Version**: TypeScript 5+, React 18
**Primary Dependencies**: Plasmo CSUI, TailwindCSS, react-icons
**Target Platform**: Chrome Extension (MV3)
**Constraints**: Shadow DOM styling, Tailwind `important: true`

## Changes

### Single File Change

#### [MODIFY] [custom-notification.tsx](file:///Users/cuongph/Workspace/chatops-reminder/src/contents/custom-notification.tsx)

1. Add `formatRelativeTime()` helper for "Just now", "Xm ago" display
2. Restructure card layout:
   - Header row: "ACTIVE REMINDER" label + timestamp + close button
   - Body: circular icon + title + source site subtitle + tags
   - Action buttons: filled "View in Chat", outlined "Snooze 5m", text "Dismiss"
3. Retain progress bar and auto-dismiss logic
4. "Dismiss" button calls `handleDismiss()` (marks completed)
5. Close (X) and timeout call `handleIgnore()` (triggers auto-snooze)

## Verification

- `pnpm dev` builds without errors
- Notification renders matching mockup layout
