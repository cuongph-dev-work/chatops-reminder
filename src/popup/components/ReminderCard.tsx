// src/popup/components/ReminderCard.tsx
// Individual reminder display with inline edit mode, tags, recurrence indicator

import React, { useState } from "react"
import { MdEdit, MdDelete, MdAccessTime, MdRepeat, MdSnooze } from "react-icons/md"
import type { Reminder, Tag } from "~shared/types"
import { TagBadge } from "./TagBadge"
import { useI18n } from "~shared/i18n/index"
import { PRE_REMINDER_OPTIONS, DAYS_OF_WEEK } from "~shared/constants"

interface ReminderCardProps {
  reminder: Reminder
  tags: Tag[]
  onUpdate: (id: string, updates: Partial<Reminder>) => Promise<unknown>
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

  // const statusColor = {
  //   pending: "border-l-blue-500",
  //   snoozed: "border-l-amber-500",
  //   completed: "border-l-green-500"
  // }[reminder.status]

  return (
    <div className="bg-white rounded-[14px] shadow-sm p-4 pt-3.5 space-y-2 relative group flex flex-col hover:shadow-md transition-shadow border border-gray-100">
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
              className="text-[12px] bg-blue-600 font-semibold text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-[12px] font-medium text-slate-500 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Hover Action Row (Absolute positioned) */}
          <div className="absolute inset-x-0 inset-y-0 bg-white/90 backdrop-blur-[1px] rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10 pointer-events-none group-hover:pointer-events-auto">
            {reminder.status !== "completed" && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="w-9 h-9 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors shadow-sm"
                  title="Edit"
                ><MdEdit size={18} /></button>
                <button
                  onClick={async () => await onUpdate(reminder.id, { status: "snoozed", snoozedUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString() })}
                  className="w-9 h-9 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200 transition-colors shadow-sm"
                  title="Snooze 5m"
                ><MdSnooze size={18} /></button>
                <button
                  onClick={async () => await onUpdate(reminder.id, { status: "completed", completedAt: new Date().toISOString() })}
                  className="w-9 h-9 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors shadow-sm"
                  title="Complete"
                ><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg></button>
              </>
            )}
            <button
              onClick={() => onDelete(reminder.id)}
              className="w-9 h-9 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
              title="Delete"
            ><MdDelete size={18} /></button>
          </div>

          {/* Top Row: Tags & Time Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 flex-wrap">
              {reminderTags.length > 0 ? (
                reminderTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-[3px] rounded-full text-[10px] font-bold tracking-wide uppercase"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="px-2 py-[3px] rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-500">
                  UNTAGGED
                </span>
              )}
            </div>
            
            {/* Fake dynamic time indicator for visual parity */}
            <span className="px-2.5 py-[3px] rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 whitespace-nowrap">
              {reminder.status === "snoozed" ? "Snoozed" : "Active"}
            </span>
          </div>

          {/* Title */}
          <p className="text-[15px] font-semibold text-slate-800 leading-snug py-1">
            {reminder.title}
          </p>

          {/* Bottom Row: Time and Extra Indicators */}
          <div className="flex items-center gap-3 text-slate-500">
            <p className="text-[12px] font-medium flex items-center gap-1.5">
              <MdAccessTime size={15} /> 
              {formatDateTime(reminder.scheduledAt)}
            </p>
            {recLabel && (
              <p className="text-[12px] font-medium flex items-center gap-1 text-slate-400">
                <MdRepeat size={14} /> {recLabel}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
