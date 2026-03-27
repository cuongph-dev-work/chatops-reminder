# Research: Auto-Detect Source Site

## Decision 1: How to detect current tab URL

- **Decision**: Use `chrome.tabs.query({ active: true, currentWindow: true })` from the popup context
- **Rationale**: The popup already has `tabs` permission. This API returns both `url` and `title` for the active tab without needing content script injection.
- **Alternatives**: Content script `window.location` — rejected because it requires message passing back to popup and only works on pages where content scripts can inject.

## Decision 2: Site Mapping storage key

- **Decision**: Separate storage key `SITE_MAPPINGS` as a `SiteMapping[]` array
- **Rationale**: Decouples site metadata from reminders. Easy to query, edit, and manage independently.
- **Alternatives**: Embed in Settings object — rejected because site mappings are a growing list, not a fixed config.

## Decision 3: When to resolve site name

- **Decision**: Resolve at reminder creation time in `handleCreate` (background)
- **Rationale**: Background is the source of truth (per Constitution). Resolving at creation time means the name is frozen/snapshot — even if the user later changes the mapping, old reminders keep their original label.
- **Alternatives**: Resolve at notification time — rejected because it adds latency and complexity to the notification path.
