// src/popup/components/ReminderList.tsx
// Sortable list of reminders with sort controls

import React, { useState } from "react"
import type { Reminder, Tag } from "~shared/types"
import { ReminderCard } from "./ReminderCard"
import { useI18n } from "~shared/i18n/index"

type SortMode = "time" | "tag"

interface ReminderListProps {
  reminders: Reminder[]
  tags: Tag[]
  onUpdate: (id: string, updates: Partial<Reminder>) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  onEdit?: (reminder: Reminder) => void
  emptyMessage?: string
}

function sortReminders(reminders: Reminder[], mode: SortMode, tags: Tag[]): Reminder[] {
  const sorted = [...reminders]
  if (mode === "time") {
    sorted.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
  } else if (mode === "tag") {
    sorted.sort((a, b) => {
      const tagA = tags.find((t) => a.tagIds.includes(t.id))?.name ?? ""
      const tagB = tags.find((t) => b.tagIds.includes(t.id))?.name ?? ""
      return tagA.localeCompare(tagB)
    })
  }
  return sorted
}

export function ReminderList({ reminders, tags, onUpdate, onDelete, onEdit, emptyMessage }: ReminderListProps) {
  const { t } = useI18n()
  const [sortMode, setSortMode] = useState<SortMode>("time")

  const sorted = sortReminders(reminders, sortMode, tags)

  return (
    <div className="space-y-3">
      {reminders.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() => setSortMode("time")}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              sortMode === "time"
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-500 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("sort_by_time")}
          </button>
          <button
            onClick={() => setSortMode("tag")}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              sortMode === "tag"
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-500 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("sort_by_tag")}
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          {emptyMessage ?? t("no_reminders")}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              tags={tags}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
