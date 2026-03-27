# Quickstart: ChatOps Reminder Chrome Extension

**Branch**: `001-chatops-reminder-ext` | **Date**: 2026-03-27

## Prerequisites

- Node.js 18+ and npm/pnpm
- Google Chrome (or Chromium-based browser)
- A Mattermost instance accessible via web browser

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server (with hot reload)
pnpm dev

# 3. Load extension in Chrome
#    - Navigate to chrome://extensions
#    - Enable "Developer mode" (top right toggle)
#    - Click "Load unpacked"
#    - Select the `build/chrome-mv3-dev` directory
```

## Development Workflow

```bash
# Run unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run E2E tests (requires built extension)
pnpm test:e2e

# Build for production
pnpm build

# Package for Chrome Web Store
pnpm package
```

## Project Structure Quick Reference

| Path | Purpose |
|------|---------|
| `src/contents/` | Content scripts injected into Mattermost pages |
| `src/background/` | Service worker for alarms, notifications |
| `src/popup/` | Extension popup (reminder manager) |
| `src/shared/` | Shared types, storage, i18n, constants |
| `tests/unit/` | Unit tests (Vitest) |
| `tests/e2e/` | End-to-end tests (Playwright) |

## Testing Against Mattermost

1. Start/access a Mattermost instance (e.g., local Docker: `docker run --name mm -d -p 8065:8065 mattermost/mattermost-preview`)
2. Load the extension in Chrome (see Setup above)
3. Navigate to your Mattermost instance
4. Hover over any message → click three-dot menu → "Remind Me ⏰" should appear

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tailwind.config.js` | TailwindCSS configuration |
| `tsconfig.json` | TypeScript configuration |
| `.plasmo.json` | Plasmo extension configuration (if needed) |
