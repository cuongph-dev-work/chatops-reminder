// src/popup/components/ReminderCard.tsx
// Individual reminder display with inline edit mode, tags, recurrence indicator

import React, { useState } from "react"
import type { Reminder, Tag } from "~shared/types"
import { TagBadge } from "./TagBadge"
import { useI18n } from "~shared/i18n/index"
import { PRE_REMINDER_OPTIONS, DAYS_OF_WEEK } from "~shared/constants"

interface ReminderCardProps {
  reminder: Reminder
  tags: Tag[]
  onUpdate: (id: string, updates: Partial<Pick<Reminder, "title" | "scheduledAt" | "preReminderMinutes" | "tagIds" | "recurrence">>) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function recurrenceLabel(reminder: Reminder): string | null {
  if (!reminder.recurrence) return null
  switch (reminder.recurrence.type) {
    case "daily": return "Daily"
    case "weekly": {
      const day = DAYS_OF_WEEK.find(d => d.value === reminder.recurrence?.dayOfWeek)
      return `Weekly ${day?.label ?? ""}`
    }
    case "monthly": return `Monthly (day ${reminder.recurrence.dayOfMonth})`
  }
}

export function ReminderCard({ reminder, tags, onUpdate, onDelete }: ReminderCardProps) {
  const { t } = useI18n()
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(reminder.title)
  const [editAt, setEditAt] = useState(
    reminder.scheduledAt ? reminder.scheduledAt.slice(0, 16) : ""
  )
  const [saving, setSaving] = useState(false)

  const reminderTags = tags.filter((tag) => reminder.tagIds.includes(tag.id))
  const recLabel = recurrenceLabel(reminder)

  async function handleSave() {
    setSaving(true)
    await onUpdate(reminder.id, {
      title: editTitle,
      scheduledAt: new Date(editAt).toISOString()
    })
    setSaving(false)
    setEditing(false)
  }

  const statusColor = {
    pending: "border-l-blue-500",
    snoozed: "border-l-amber-500",
    completed: "border-l-green-500"
  }[reminder.status]

  return (
    <div className={`bg-white rounded-lg border-l-4 ${statusColor} shadow-sm p-3 space-y-1`}>
      {editing ? (
        <div className="space-y-2">
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="datetime-local"
            value={editAt}
            onChange={(e) => setEditAt(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : t("btn_save")}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-gray-500 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
            >
              {t("btn_cancel")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-800 leading-tight">{reminder.title}</p>
            {reminder.status !== "completed" && (
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                  title={t("btn_edit")}
                >✏️</button>
                <button
                  onClick={() => onDelete(reminder.id)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  title={t("btn_delete")}
                >🗑️</button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500">
            🕐 {formatDateTime(reminder.scheduledAt)}
            {reminder.preReminderMinutes > 0 &&
              ` (${PRE_REMINDER_OPTIONS.find(o => o.value === reminder.preReminderMinutes)?.label})`}
          </p>

          {recLabel && (
            <p className="text-xs text-purple-600">🔁 {recLabel}</p>
          )}

          {reminder.status === "snoozed" && reminder.snoozedUntil && (
            <p className="text-xs text-amber-600">💤 {t("snoozing_until")} {formatDateTime(reminder.snoozedUntil)}</p>
          )}

          {reminderTags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {reminderTags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          {reminder.messageLink && (
            <a
              href={reminder.messageLink}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {t("open_message")} →
            </a>
          )}
        </>
      )}
    </div>
  )
}
