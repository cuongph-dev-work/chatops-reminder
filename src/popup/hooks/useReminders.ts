// src/popup/hooks/useReminders.ts
// Reminder CRUD hook with storage sync

import { useCallback, useEffect, useState } from "react"
import { storage } from "~shared/storage"
import { STORAGE_KEYS } from "~shared/constants"
import type { Reminder } from "~shared/types"
import { getReminders } from "~shared/storage"

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReminders().then((r) => {
      setReminders(r)
      setLoading(false)
    })

    // Reactively watch storage changes
    const unwatch = storage.watch<Reminder[]>(STORAGE_KEYS.REMINDERS, (change) => {
      if (change.newValue !== undefined) {
        setReminders(change.newValue)
      }
    })

    return () => {
      unwatch()
    }
  }, [])

  const updateReminder = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Reminder, "title" | "scheduledAt" | "preReminderMinutes" | "tagIds" | "recurrence">>
    ) => {
      const response = await chrome.runtime.sendMessage({
        type: "UPDATE_REMINDER",
        payload: { id, ...updates }
      })
      return response
    },
    []
  )

  const deleteReminder = useCallback(async (id: string) => {
    const response = await chrome.runtime.sendMessage({
      type: "DELETE_REMINDER",
      payload: { id }
    })
    return response
  }, [])

  const clearCompleted = useCallback(async (id?: string) => {
    const response = await chrome.runtime.sendMessage({
      type: "CLEAR_COMPLETED",
      payload: { id }
    })
    return response
  }, [])

  const pending = reminders.filter((r) => r.status === "pending" || r.status === "snoozed")
  const completed = reminders.filter((r) => r.status === "completed")

  return {
    reminders,
    pending,
    completed,
    loading,
    updateReminder,
    deleteReminder,
    clearCompleted
  }
}
