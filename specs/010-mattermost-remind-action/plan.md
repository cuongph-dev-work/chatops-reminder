# Implementation Plan: Mattermost Remind Me Action

**Branch**: `010-mattermost-remind-action` | **Date**: 2026-03-27 | **Spec**: [spec.md](./spec.md)

## Summary

Wire the existing `mattermost-injector.ts` "Remind Me" button to actually open the extension popup with the chat permalink pre-filled. The content script already injects the button and extracts permalinks — what's missing is the bridge from the content script event to the popup form.

## Technical Context

**Language/Version**: TypeScript 5+  
**Primary Dependencies**: React (Plasmo), @plasmohq/storage  
**Constraints**: Chrome MV3 popups cannot be opened programmatically from content scripts.

## Key Technical Decision

**Problem**: Content scripts cannot open the extension popup (Chrome API limitation).

**Solution**: Use `@plasmohq/storage` as a message bus:
1. Content script writes `{ link, title }` to a `pendingReminder` storage key
2. Content script calls `chrome.runtime.sendMessage` to notify background
3. Background script receives message and calls `chrome.action.openPopup()` (Chrome 127+) to open the popup, or falls back to a badge indicator
4. Popup reads `pendingReminder` on mount — if set, auto-opens the ReminderForm with the link pre-filled, then clears the key

**Fallback**: If `chrome.action.openPopup()` is not available, show a badge "1" on the extension icon to signal the user to click it manually.

## Implementation Approach

### Phase 1: Storage Bridge
- Add `STORAGE_KEYS.PENDING_REMINDER` constant
- Content script: on "Remind Me" click → write `{ link, pageTitle }` to storage → send message to background
- Background: listen for `OPEN_POPUP_WITH_REMINDER` message → attempt `chrome.action.openPopup()`, set badge fallback

### Phase 2: Popup Auto-Open Form
- Popup `index.tsx`: on mount, check `pendingReminder` storage key
- If set → auto-open ReminderForm with link pre-filled, clear the key
- Existing `defaultLink`/`defaultSiteTitle` props handle the pre-fill

### Phase 3: Visual Polish
- Match "Remind Me" button styling to Mattermost's native menu items (already mostly done)
- Add hover state matching

### Phase 4: Build Verification
- `pnpm tsc --noEmit`

## Files to Modify

| File | Change |
|------|--------|
| `src/shared/constants.ts` | Add `PENDING_REMINDER` storage key |
| `src/contents/mattermost-injector.ts` | Replace custom event with storage write + `sendMessage` |
| `src/background/index.ts` | Add listener for `OPEN_POPUP_WITH_REMINDER` |
| `src/popup/index.tsx` | Read `pendingReminder` on mount, auto-open form |
