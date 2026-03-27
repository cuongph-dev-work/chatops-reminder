# ChatOps Reminder Constitution

## Core Principles

### I. UI & Aesthetics Standards
1. **Design Language & Theme**:
   - The primary brand color is **Blue** (specifically Tailwind's `blue-600` for primary actions, interactions, and key highlights).
   - Use the **Slate** palette (e.g., `slate-50`, `slate-200`, `slate-600`) for text, neutral backgrounds, borders, and empty states. This provides a softer, premium contrast than pure grays.
   - Employ generous whitespace (padding/margins) to maintain an airy and uncluttered interface.
2. **Shapes & Depth**:
   - Heavily favor highly rounded corners (`rounded-lg`, `rounded-xl`, `rounded-2xl`) for buttons, cards, input fields, and modals. Sharp corners are forbidden.
   - Use soft, layered drop shadows (`shadow-sm` on cards/inputs, `shadow-2xl` on modals/notifications) to create clear depth hierarchy.
3. **Controls & Inputs**:
   - All select/dropdown components in the UI MUST use `react-select`. Native HTML `<select>` elements are strictly prohibited to maintain consistency.
   - Checkboxes and toggles should be natively styled using Tailwind's `accent-blue-600` in combination with soft borders (`border-slate-300`).
4. **Typography & Iconography**:
   - Use legible, modern text sizes (e.g., `text-[13px]`, `text-sm`, `text-[14px]`) for body copy, labels, and microcopy.
   - Use SVG vectors from `react-icons` (e.g., `MdAlarm`, `MdOpenInNew`) exclusively. Native OS emojis are prohibited in UI controls due to cross-platform aesthetics.
5. **Animations & Interactions**:
   - All buttons, inputs, and links must have hover active states with `transition-colors` or `transition-all`.
   - Modals, Popups, and Notifications should use fade/slide animations (e.g. `animate-in fade-in`).
   - Action buttons on lists (e.g. ReminderCards) should remain hidden until hovered to keep default states visually minimal.
6. **CSS Paradigm**:
   - TailwindCSS is the single source of truth. The `tailwind.config.js` uses `important: true` to ensure utilities robustly pierce and apply within Plasmo Shadow DOMs.

### II. State Management & Architecture
1. The extension uses `@plasmohq/storage` as the primary cross-context store.
2. Background scripts (`src/background/messages.ts` and `src/background/index.ts`) operate as the source of truth for all complex logic, including alarm scheduling, recurring task logic, and firing custom notifications.
3. The popup and content scripts (CSUI) are strictly presentational. They read state via hooks (`useStorage`) and send `chrome.runtime.sendMessage` actions to mutate data.

**Version**: 1.0.0 | **Ratified**: 2026-03-27
