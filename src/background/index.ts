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
import type { Reminder, RecurrenceRule, SnoozeNotificationPayload, DismissNotificationPayload } from "~shared/types"

// ─── Message Handlers ────────────────────────────────────────────────────────

setupMessageHandler()

// ─── Alarm Handler ───────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith("reminder:")) return

  const reminderId = alarm.name.replace("reminder:", "")
  const reminder = await getReminderById(reminderId)
  if (!reminder || reminder.status === "completed") return

  // Try to send to active tab for custom CSUI notification
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  const activeTab = tabs[0]

  if (activeTab?.id) {
    try {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: "SHOW_CUSTOM_NOTIFICATION",
        payload: reminder
      })
    } catch (e) {
      // Content script not ready or cannot receive message (e.g. chrome:// URL)
      showNativeNotification(reminder)
    }
  } else {
    showNativeNotification(reminder)
  }

  // Mark as pending (re-confirm in case snoozed)
  if (reminder.status !== "pending") {
    await updateReminder({ ...reminder, status: "pending", snoozedUntil: null })
  }
})

function showNativeNotification(reminder: Reminder, missed: boolean = false) {
  chrome.notifications.create(`notif:${reminder.id}`, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("assets/icon.png"),
    title: reminder.title,
    message: `${missed ? "Missed reminder" : "Reminder"} from: ${reminder.sourceInstanceUrl}`,
    buttons: [
      { title: NOTIFICATION_BUTTONS.SNOOZE_5.title },
      { title: NOTIFICATION_BUTTONS.SNOOZE_10.title }
    ],
    requireInteraction: true
  })
}

// ─── Native Notification Interactions (Fallback) ──────────────────────────────

chrome.notifications.onClicked.addListener(async (notifId) => {
  if (!notifId.startsWith("notif:")) return
  const reminderId = notifId.replace("notif:", "")
  const reminder = await getReminderById(reminderId)
  if (!reminder) return

  chrome.tabs.create({ url: reminder.messageLink })

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
    await handleCSUISnooze({ reminderId, minutes: buttonIndex === 0 ? 5 : 10 })
    chrome.notifications.clear(notifId)
  }
)

chrome.notifications.onClosed.addListener(async (notifId, byUser) => {
  if (!notifId.startsWith("notif:") || !byUser) return
  const reminderId = notifId.replace("notif:", "")
  await handleCSUIDismiss({ reminderId })
})

// ─── Custom CSUI Notification Interactions ──────────────────────────────────

chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.type === "SNOOZE_NOTIFICATION") {
    handleCSUISnooze(message.payload).then(sendResponse)
    return true
  }
  if (message.type === "DISMISS_NOTIFICATION") {
    handleCSUIDismiss(message.payload).then(sendResponse)
    return true
  }
  return false
})

async function handleCSUISnooze(payload: SnoozeNotificationPayload) {
  const reminder = await getReminderById(payload.reminderId)
  if (!reminder) return { success: false }

  const snoozedUntil = new Date(Date.now() + payload.minutes * 60 * 1000).toISOString()
  await updateReminder({ ...reminder, status: "snoozed", snoozedUntil })

  chrome.alarms.create(`reminder:${reminder.id}`, {
    when: Date.now() + payload.minutes * 60 * 1000
  })
  return { success: true }
}

async function handleCSUIDismiss(payload: DismissNotificationPayload) {
  const reminder = await getReminderById(payload.reminderId)
  if (!reminder) return { success: false }

  if (reminder.recurrence) {
    await scheduleNextRecurrence(reminder)
  } else {
    await markCompleted(reminder)
  }
  return { success: true }
}

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
      // Try to send to active tab for custom CSUI notification
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
      const activeTab = tabs[0]
      if (activeTab?.id) {
        try {
          await chrome.tabs.sendMessage(activeTab.id, {
            type: "SHOW_CUSTOM_NOTIFICATION",
            payload: reminder
          })
        } catch (e) {
          showNativeNotification(reminder, true)
        }
      } else {
        showNativeNotification(reminder, true)
      }
    } else {
      // Still in the future — reschedule
      await scheduleAlarm(reminder)
    }
  }
}
