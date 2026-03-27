// src/background/messages.ts
// Message handler router for content↔background communication


import {
  addReminder,
  clearCompletedReminders,
  deleteReminder,
  getReminderById,
  updateReminder
} from "~shared/storage"
import {
  PRE_REMINDER_VALUES,
  VALIDATION
} from "~shared/constants"
import type {
  BackgroundMessage,
  BackgroundResponse,
  Reminder,
  CreateReminderPayload,
  UpdateReminderPayload
} from "~shared/types"

// Validation helper
function validateCreatePayload(p: CreateReminderPayload): string | null {
  if (!p.title || p.title.trim().length === 0) return "Title is required"
  if (p.title.length > VALIDATION.MAX_TITLE_LENGTH)
    return `Title must be ${VALIDATION.MAX_TITLE_LENGTH} characters or less`
  if (!p.scheduledAt) return "scheduledAt is required"
  if (new Date(p.scheduledAt) <= new Date()) return "scheduledAt must be in the future"
  if (!PRE_REMINDER_VALUES.includes(p.preReminderMinutes as never))
    return "Invalid preReminderMinutes value"
  return null
}

// Schedule an alarm for the reminder (fires at scheduled time - preReminderMinutes)
async function scheduleAlarm(reminder: Reminder): Promise<void> {
  const fireAt =
    new Date(reminder.scheduledAt).getTime() -
    reminder.preReminderMinutes * 60 * 1000
  chrome.alarms.create(`reminder:${reminder.id}`, { when: fireAt })
}

async function cancelAlarm(reminderId: string): Promise<void> {
  await chrome.alarms.clear(`reminder:${reminderId}`)
}

// Handle CREATE_REMINDER
async function handleCreate(
  payload: CreateReminderPayload
): Promise<BackgroundResponse> {
  const err = validateCreatePayload(payload)
  if (err) return { success: false, error: err }

  const now = new Date().toISOString()
  const reminder: Reminder = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    messageLink: payload.messageLink,
    scheduledAt: payload.scheduledAt,
    preReminderMinutes: payload.preReminderMinutes,
    tagIds: payload.tagIds ?? [],
    recurrence: payload.recurrence ?? null,
    status: "pending",
    createdAt: now,
    completedAt: null,
    snoozedUntil: null,
    sourceInstanceUrl: payload.messageLink ? new URL(payload.messageLink).origin : undefined
  }

  try {
    await addReminder(reminder)
    await scheduleAlarm(reminder)
    return { success: true, reminder }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes("QUOTA")) {
      return { success: false, error: "Storage is full. Please delete some reminders." }
    }
    return { success: false, error: msg }
  }
}

// Handle UPDATE_REMINDER
async function handleUpdate(
  payload: UpdateReminderPayload
): Promise<BackgroundResponse> {
  const existing = await getReminderById(payload.id)
  if (!existing) return { success: false, error: `Reminder not found: ${payload.id}` }

  const updated: Reminder = {
    ...existing,
    ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
    ...(payload.scheduledAt !== undefined ? { scheduledAt: payload.scheduledAt } : {}),
    ...(payload.preReminderMinutes !== undefined
      ? { preReminderMinutes: payload.preReminderMinutes }
      : {}),
    ...(payload.tagIds !== undefined ? { tagIds: payload.tagIds } : {}),
    ...(payload.recurrence !== undefined ? { recurrence: payload.recurrence } : {})
  }

  try {
    await updateReminder(updated)
    // Reschedule alarm if time changed
    if (payload.scheduledAt !== undefined || payload.preReminderMinutes !== undefined) {
      await cancelAlarm(updated.id)
      if (updated.status === "pending") {
        await scheduleAlarm(updated)
      }
    }
    return { success: true, reminder: updated }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// Handle DELETE_REMINDER
async function handleDelete(id: string): Promise<BackgroundResponse> {
  try {
    await cancelAlarm(id)
    await deleteReminder(id)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// Handle CLEAR_COMPLETED
async function handleClearCompleted(id?: string): Promise<BackgroundResponse> {
  const count = await clearCompletedReminders(id)
  return { success: true, clearedCount: count }
}

// Main message router
export function setupMessageHandler(): void {
  chrome.runtime.onMessage.addListener(
    (
      message: BackgroundMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: BackgroundResponse) => void
    ) => {
      let handlerPromise: Promise<BackgroundResponse>

      switch (message.type) {
        case "CREATE_REMINDER":
          handlerPromise = handleCreate(message.payload)
          break
        case "UPDATE_REMINDER":
          handlerPromise = handleUpdate(message.payload)
          break
        case "DELETE_REMINDER":
          handlerPromise = handleDelete(message.payload.id)
          break
        case "CLEAR_COMPLETED":
          handlerPromise = handleClearCompleted(message.payload.id)
          break
        case "SNOOZE_NOTIFICATION":
        case "DISMISS_NOTIFICATION":
          // Handled in src/background/index.ts
          return false
        default: {
          const _exhaustive: never = message
          sendResponse({ success: false, error: "Unknown message type" })
          return false
        }
      }

      handlerPromise.then(sendResponse).catch((e) => {
        sendResponse({ success: false, error: String(e) })
      })

      return true // keep channel open for async response
    }
  )
}

export { scheduleAlarm, cancelAlarm }
