# Research & Outline: Auto-Draft Feature

**Feature**: Form Auto-Draft  
**Created**: 2026-03-28  
**Status**: Decided  
**Reference**: [spec.md](./spec.md)

## Decisions

### 1. Storage Mechanism for Form Draft
**Decision**: Use `window.localStorage` or `@plasmohq/storage`. To adhere to the project constitution, we will strictly use `@plasmohq/storage` with `chrome.storage.local`.
**Rationale**: In Chrome Extensions, popups are fully destroyed on close. They act like full page unloads. Standard React state is lost. `chrome.storage.local` is robust, fast enough for stringified JSON, and easily accessible across re-renders using Plasmo's `useStorage` hook or standard `Storage` class.
**Alternatives Considered**:
- `sessionStorage` (Wiped completely by Chrome when the extension popup unloads in MV3)
- Background service worker messaging (Too slow/chatty for every keystroke)

### 2. State Sync Frequency (Debouncing)
**Decision**: We will utilize React's `useEffect` to watch form field states and write to `chrome.storage.local` on every change. Given the small payload, synchronous-feeling writes are acceptable. If performance drops, a 300ms debounce will be introduced.
**Rationale**: The form has minimal inputs. Modern devices handle `chrome.storage.local.set` extremely quickly. The user's typed data is highly valuable, so immediate saving prevents data loss if they click away mid-typing.
**Alternatives Considered**: Debounce hook via `lodash` or custom timeout (rejected for initial implementation to ensure max reliability; click-aways happen instantly).

### 3. Expiration Logic
**Decision**: Calculate the difference between `Date.now()` and the draft's `lastUpdatedAt` timestamp when the popup is opened (`useEffect` initialization). If the `diff > 15 * 60 * 1000` (15 minutes), the draft is purged completely and not loaded into state.
**Rationale**: Straightforward, client-side, dependency-free time calculation.
