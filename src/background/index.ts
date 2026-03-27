// src/background/index.ts
// Background service worker: alarm scheduling, notification handling, snooze, recurring, auto-purge

import {
  getReminderById,
  getReminders,
  updateReminder,
  addReminder
} from "~shared/storage"
import { cancelAlarm, scheduleAlarm, setupMessageHandler } from "./messages"
import { AUTO_PURGE_DAYS, NOTIFICATION_BUTTONS } from "~shared/constants"
import type { Reminder, RecurrenceRule } from "~shared/types"

// ─── Message Handlers ────────────────────────────────────────────────────────

setupMessageHandler()

// ─── Alarm Handler ───────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith("reminder:")) return

  const reminderId = alarm.name.replace("reminder:", "")
  const reminder = await getReminderById(reminderId)
  if (!reminder || reminder.status === "completed") return

  // Display notification
  chrome.notifications.create(`notif:${reminder.id}`, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("assets/icon.png"),
    title: reminder.title,
    message: `Reminder from: ${reminder.sourceInstanceUrl}`,
    buttons: [
      { title: NOTIFICATION_BUTTONS.SNOOZE_5.title },
      { title: NOTIFICATION_BUTTONS.SNOOZE_10.title }
    ],
    requireInteraction: true
  })

  // Mark as pending (re-confirm in case snoozed)
  if (reminder.status !== "pending") {
    await updateReminder({ ...reminder, status: "pending", snoozedUntil: null })
  }
})

// ─── Notification Interactions ───────────────────────────────────────────────

chrome.notifications.onClicked.addListener(async (notifId) => {
  if (!notifId.startsWith("notif:")) return
  const reminderId = notifId.replace("notif:", "")
  const reminder = await getReminderById(reminderId)
  if (!reminder) return

  // Open message link in new tab
  chrome.tabs.create({ url: reminder.messageLink })

  // Mark completed (only mark if it was pending, not if it's recurring)
  if (!reminder.recurrence) {
    await markCompleted(reminder)
  } else {
    await scheduleNextRecurrence(reminder)
  }
  chrome.notifications.clear(notifId)
})

chrome.notifications.onButtonClicked.addListener(
  async (notifId, buttonIndex) => {
    if (!notifId.startsWith("notif:")) return
    const reminderId = notifId.replace("notif:", "")
    const reminder = await getReminderById(reminderId)
    if (!reminder) return

    const snoozeMinutes = buttonIndex === 0 ? 5 : 10
    const snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString()

    const snoozed: Reminder = {
      ...reminder,
      status: "snoozed",
      snoozedUntil
    }
    await updateReminder(snoozed)

    // Schedule snooze alarm
    chrome.alarms.create(`reminder:${reminder.id}`, {
      when: Date.now() + snoozeMinutes * 60 * 1000
    })

    chrome.notifications.clear(notifId)
  }
)

chrome.notifications.onClosed.addListener(async (notifId, byUser) => {
  if (!notifId.startsWith("notif:") || !byUser) return
  const reminderId = notifId.replace("notif:", "")
  const reminder = await getReminderById(reminderId)
  if (!reminder) return

  if (reminder.recurrence) {
    await scheduleNextRecurrence(reminder)
  } else {
    await markCompleted(reminder)
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function markCompleted(reminder: Reminder): Promise<void> {
  await updateReminder({
    ...reminder,
    status: "completed",
    completedAt: new Date().toISOString()
  })
  await cancelAlarm(reminder.id)
}

async function scheduleNextRecurrence(reminder: Reminder): Promise<void> {
  if (!reminder.recurrence) return

  const nextDate = calcNextOccurrence(
    new Date(reminder.scheduledAt),
    reminder.recurrence
  )
  if (!nextDate) return

  // Create a new reminder for next occurrence
  const next: Reminder = {
    ...reminder,
    id: crypto.randomUUID(),
    scheduledAt: nextDate.toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
    completedAt: null,
    snoozedUntil: null
  }
  await addReminder(next)
  await scheduleAlarm(next)

  // Mark current as completed
  await markCompleted(reminder)
}

function calcNextOccurrence(from: Date, rule: RecurrenceRule): Date | null {
  const next = new Date(from)

  switch (rule.type) {
    case "daily":
      next.setDate(next.getDate() + 1)
      break
    case "weekly": {
      const targetDay = rule.dayOfWeek ?? from.getDay()
      next.setDate(next.getDate() + 7)
      // Adjust to the correct day of week
      while (next.getDay() !== targetDay) {
        next.setDate(next.getDate() + 1)
      }
      break
    }
    case "monthly": {
      const targetDay = rule.dayOfMonth ?? from.getDate()
      next.setMonth(next.getMonth() + 1)
      next.setDate(targetDay)
      break
    }
    default:
      return null
  }

  return next
}

// ─── Auto-Purge ──────────────────────────────────────────────────────────────

async function autoPurgeOldCompleted(): Promise<void> {
  const reminders = await getReminders()
  const cutoff = Date.now() - AUTO_PURGE_DAYS * 24 * 60 * 60 * 1000
  const filtered = reminders.filter((r) => {
    if (r.status !== "completed") return true
    if (!r.completedAt) return true
    return new Date(r.completedAt).getTime() > cutoff
  })
  if (filtered.length < reminders.length) {
    const { saveReminders } = await import("~shared/storage")
    await saveReminders(filtered)
  }
}

// Run on startup and then periodically via alarm
chrome.runtime.onStartup.addListener(async () => {
  await autoPurgeOldCompleted()
  // Re-check pending reminders missed while browser was closed
  await recheckPendingReminders()
})

chrome.runtime.onInstalled.addListener(async () => {
  // Create periodic alarm for auto-purge every 24h
  chrome.alarms.create("auto:purge", { periodInMinutes: 24 * 60 })
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "auto:purge") {
    await autoPurgeOldCompleted()
  }
})

// ─── Missed Reminders (browser was closed) ───────────────────────────────────

async function recheckPendingReminders(): Promise<void> {
  const reminders = await getReminders()
  const now = Date.now()

  for (const reminder of reminders) {
    if (reminder.status !== "pending") continue
    const fireAt =
      new Date(reminder.scheduledAt).getTime() -
      reminder.preReminderMinutes * 60 * 1000

    if (fireAt <= now) {
      // Reminder was missed while browser was closed — fire now
      chrome.notifications.create(`notif:${reminder.id}`, {
        type: "basic",
        iconUrl: chrome.runtime.getURL("assets/icon.png"),
        title: reminder.title,
        message: `Missed reminder from: ${reminder.sourceInstanceUrl}`,
        buttons: [
          { title: NOTIFICATION_BUTTONS.SNOOZE_5.title },
          { title: NOTIFICATION_BUTTONS.SNOOZE_10.title }
        ],
        requireInteraction: true
      })
    } else {
      // Still in the future — reschedule
      await scheduleAlarm(reminder)
    }
  }
}
