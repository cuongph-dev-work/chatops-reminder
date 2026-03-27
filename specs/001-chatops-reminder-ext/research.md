# Research: ChatOps Reminder Chrome Extension

**Branch**: `001-chatops-reminder-ext` | **Date**: 2026-03-27

## R1: Plasmo Framework for Chrome Extension

**Decision**: Use Plasmo as the Chrome Extension framework.

**Rationale**: Plasmo is purpose-built for Chrome Extensions with first-class support for React, TypeScript, Content Scripts UI (CSUI with Shadow DOM), and `@plasmohq/storage`. It handles Manifest V3 configuration, hot-reload, and build pipeline out of the box. Eliminates boilerplate for content script injection, popup, and background service worker setup.

**Alternatives considered**:
- **Vanilla Manifest V3**: Full control but requires manual webpack/vite config, manifest management, and content script lifecycle handling. High boilerplate.
- **WXT (Web Extension Tools)**: Good alternative but less mature ecosystem and fewer examples for CSUI with Shadow DOM.
- **CRXJS (Vite plugin)**: Good Vite integration but less opinionated about project structure; Plasmo's CSUI feature is a stronger fit for DOM injection.

## R2: Mattermost DOM Injection Strategy

**Decision**: Use MutationObserver to detect Mattermost's message action menu (three-dot dropdown) and inject the "Remind Me" button dynamically.

**Rationale**: Mattermost renders its action menu lazily (only when user clicks the three-dot icon). A MutationObserver watching for the menu container appearance is the most reliable approach. The menu uses a consistent CSS class across Mattermost versions (`dropdown-menu`/`Menu` component).

**Alternatives considered**:
- **Static injection on page load**: Mattermost uses virtualized lists for chat messages; buttons injected on initial load would be lost when messages scroll out of view.
- **Event delegation on body**: Less reliable for detecting the exact menu structure; would require fragile selectors.

**Auto-detection approach**: Match URL patterns (`*/channels/*`, `*/messages/*`) and verify DOM markers (e.g., `#root` with Mattermost-specific classes like `channel-view`) to activate only on Mattermost pages.

## R3: Storage Strategy

**Decision**: Use `@plasmohq/storage` wrapping `chrome.storage.local`.

**Rationale**: `@plasmohq/storage` provides reactive hooks for React components, automatic serialization/deserialization, and real-time sync between content scripts, background worker, and popup. `chrome.storage.local` offers ~10MB quota (ample for < 1,000 reminders at ~1KB each).

**Alternatives considered**:
- **IndexedDB**: More storage capacity but no built-in cross-context sync; requires manual message passing.
- **chrome.storage.sync**: Cross-device sync but limited to 100KB total and 8KB per item.

## R4: Alarm & Notification Strategy

**Decision**: Use `chrome.alarms` for scheduling and `chrome.notifications` for display.

**Rationale**: `chrome.alarms` is the only reliable timer mechanism in Manifest V3 service workers (setTimeout/setInterval are unreliable due to service worker lifecycle). Minimum granularity is 1 minute, which aligns with the spec's SC-002 (within 1 minute). `chrome.notifications` supports action buttons (for Snooze 5/10 min).

**Key implementation details**:
- Each reminder gets a unique alarm name (e.g., `reminder-{id}`)
- Pre-reminder creates a separate alarm offset by the chosen minutes
- Snooze creates a new one-time alarm
- Recurring reminders: after notification fires, calculate and schedule the next occurrence

**Alternatives considered**:
- **Push notifications via server**: Ruled out (no server-side component).
- **Web Notifications API**: Cannot use action buttons; `chrome.notifications` is required for button support.

## R5: Internationalization (i18n) Approach

**Decision**: Simple JSON-based i18n with locale detection.

**Rationale**: With only 2 languages (EN/VI), a lightweight approach using JSON translation files and a React context provider is sufficient. No need for heavy i18n libraries. Default language detected from `navigator.language`.

**Alternatives considered**:
- **react-i18next**: Full-featured but overkill for 2 languages. Adds ~40KB bundle size.
- **Chrome's built-in i18n (chrome.i18n)**: Limited to `_locales/` directory structure, doesn't support runtime switching without extension reload.

## R6: TailwindCSS in Shadow DOM

**Decision**: Configure TailwindCSS to work within Plasmo's Shadow DOM CSUI.

**Rationale**: Plasmo supports TailwindCSS in content scripts via `getStyle()` export that injects styles into the Shadow DOM. This ensures TailwindCSS utilities work inside the modal without leaking into or being affected by Mattermost's styles.

**Alternatives considered**:
- **CSS Modules**: Good isolation but less utility-first productivity compared to TailwindCSS.
- **Styled Components**: Runtime CSS-in-JS adds bundle size and complexity.

## R7: Testing Strategy

**Decision**: Vitest for unit tests, Playwright for E2E browser tests.

**Rationale**: Vitest is fast, TypeScript-native, and compatible with the Vite-based build that Plasmo uses. Playwright can test Chrome Extensions via `--load-extension` flag, enabling real browser testing against Mattermost.

**Alternatives considered**:
- **Jest**: Heavier config, slower. Vitest is a drop-in replacement with better DX.
- **Puppeteer**: Less ergonomic API than Playwright for extension testing.
- **Cypress**: Does not support Chrome Extension testing natively.
