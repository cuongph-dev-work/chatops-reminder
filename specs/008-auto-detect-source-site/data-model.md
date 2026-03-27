# Data Model: Auto-Detect Source Site

## New Entity: SiteMapping

| Field        | Type    | Description                                  |
|--------------|---------|----------------------------------------------|
| domain       | string  | Hostname (e.g., `jira.company.com`)          |
| name         | string  | Friendly display name (e.g., "Jira")         |
| autoDetected | boolean | `true` if name was derived from page title   |

Storage key: `SITE_MAPPINGS`

## Extended Entity: Reminder

| Field          | Type            | Change   |
|----------------|-----------------|----------|
| sourceSiteName | string \| undefined | **NEW** — resolved from SiteMapping at creation |
| sourcePageTitle| string \| undefined | **NEW** — raw `document.title` captured at creation |
