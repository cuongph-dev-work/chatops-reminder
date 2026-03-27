# Data Model Updates

## Reminder Entity

The core `Reminder` interface in `src/shared/types.ts` will be extended with:

```typescript
export interface Reminder {
  // ... existing fields
  description?: string;
}
```

## Background Message Payloads

The `CreateReminderPayload` will also need to carry this new optional field:

```typescript
export interface CreateReminderPayload {
  // ... existing fields
  description?: string;
}
```
