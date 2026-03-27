# Data Model: Popup UI Redesign

There are no structural changes to the core backend data model (`Reminder`, `Tag`, `RecurrenceRule`). This feature is exclusively a presentation-layer change affecting how the data is materialized in the DOM.

View-layer state definitions required in the Popup component (`src/popup/index.tsx`):
- `activeTab`: `"All" | "Today" | "Tags"`
- `reminders`: Array of `Reminder` objects fetched and synced reactively from `@plasmohq/storage`.
