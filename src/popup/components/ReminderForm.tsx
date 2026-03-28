import React, { useState, useRef, useEffect } from "react"
import { useI18n } from "~shared/i18n/index"
import { MdClose, MdOutlineAccessTime, MdLabelOutline, MdOpenInNew } from "react-icons/md"
import type { CreateReminderPayload, RecurrenceRule, BackgroundResponse, Tag, Reminder, DraftState } from "~shared/types"
import { DAYS_OF_WEEK, PRE_REMINDER_OPTIONS, RECURRENCE_TYPES, STORAGE_KEYS } from "~shared/constants"
import Select from "react-select"
import { useStorage } from "@plasmohq/storage/hook"

interface ReminderFormProps {
  tags: Tag[]
  initialReminder?: Reminder
  defaultLink?: string
  defaultSiteTitle?: string
  onCancel: () => void
}

export function ReminderForm({ tags, initialReminder, defaultLink, defaultSiteTitle, onCancel }: ReminderFormProps) {
  const { t } = useI18n()
  
  const [title, setTitle] = useState(initialReminder?.title || "")
  const [description, setDescription] = useState(initialReminder?.description || "")
  const [scheduledAt, setScheduledAt] = useState(() => {
    if (!initialReminder?.scheduledAt) return ""
    const d = new Date(initialReminder.scheduledAt)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })
  const [messageLink, setMessageLink] = useState(initialReminder?.messageLink || defaultLink || "")
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialReminder?.tagIds || [])
  const [preReminderMinutes, setPreReminderMinutes] = useState<0 | 5 | 10 | 15 | 30>(initialReminder?.preReminderMinutes || 0)
  const [recurrenceType, setRecurrenceType] = useState<"none" | "daily" | "weekly" | "monthly">(initialReminder?.recurrence?.type || "none")
  const [dayOfWeek, setDayOfWeek] = useState(initialReminder?.recurrence?.dayOfWeek || 1)
  const [dayOfMonth, setDayOfMonth] = useState(initialReminder?.recurrence?.dayOfMonth || 1)
  
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-Draft Implementation
  const isEditing = !!initialReminder
  const [draft, setDraft, { isLoading }] = useStorage<DraftState | null>(STORAGE_KEYS.DRAFT_STATE, null)
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false)

  // Load existing draft data (US1) & Check Expiration (US2)
  useEffect(() => {
    if (hasLoadedDraft || isLoading) return

    if (draft) {
      const now = Date.now()
      // Expiration logic (>15m)
      if (now - draft.lastUpdatedAt > 15 * 60 * 1000) {
        setDraft(null)
      } else {
        // If editing, only hydrate if the draft belongs to THIS reminder
        if (isEditing && draft.editingId !== initialReminder.id) {
          setHasLoadedDraft(true)
          return
        }

        // Load existing draft data
        if (draft.title) setTitle(draft.title)
        if (draft.description !== undefined) setDescription(draft.description)
        if (draft.scheduledAt) setScheduledAt(draft.scheduledAt)
        if (draft.messageLink !== undefined) setMessageLink(draft.messageLink)
        if (draft.tagIds) setSelectedTagIds(draft.tagIds)
        if (draft.preReminderMinutes !== undefined) setPreReminderMinutes(draft.preReminderMinutes)
        if (draft.recurrence !== undefined) {
          if (draft.recurrence) {
            setRecurrenceType(draft.recurrence.type)
            if (draft.recurrence.dayOfWeek !== null && draft.recurrence.dayOfWeek !== undefined) setDayOfWeek(draft.recurrence.dayOfWeek)
            if (draft.recurrence.dayOfMonth !== null && draft.recurrence.dayOfMonth !== undefined) setDayOfMonth(draft.recurrence.dayOfMonth)
          } else {
            setRecurrenceType("none")
          }
        }
      }
    }
    setHasLoadedDraft(true)
  }, [draft, isLoading, isEditing, hasLoadedDraft, setDraft])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const buildRecurrence = React.useCallback((): RecurrenceRule | null => {
    if (recurrenceType === "none") return null
    return {
      type: recurrenceType,
      dayOfWeek: recurrenceType === "weekly" ? dayOfWeek : null,
      dayOfMonth: recurrenceType === "monthly" ? dayOfMonth : null
    }
  }, [recurrenceType, dayOfWeek, dayOfMonth])

  // Sync form fields to draft (US1) & now also for edits
  useEffect(() => {
    if (!hasLoadedDraft) return

    const newDraft: DraftState = {
      editingId: initialReminder?.id,
      title,
      description,
      scheduledAt,
      messageLink,
      tagIds: selectedTagIds,
      preReminderMinutes,
      recurrence: buildRecurrence(),
      lastUpdatedAt: Date.now()
    }
    setDraft(newDraft)
  }, [title, description, scheduledAt, messageLink, selectedTagIds, preReminderMinutes, buildRecurrence, initialReminder?.id, hasLoadedDraft, setDraft])

  function handleCancelClick() {
    setDraft(null)
    onCancel()
  }

  async function handleSave() {
    setError(null)
    if (!title.trim()) { setError(t("error_title_required")); return }
    if (title.length > 200) { setError(t("error_title_too_long")); return }
    if (!scheduledAt) { setError(t("error_datetime_required")); return }
    if (new Date(scheduledAt) <= new Date()) { setError(t("error_datetime_past")); return }

    setSaving(true)
    const payload: CreateReminderPayload = {
      title: title.trim(),
      messageLink: messageLink.trim() || undefined, // Optional link
      scheduledAt: new Date(scheduledAt).toISOString(),
      preReminderMinutes,
      tagIds: selectedTagIds,
      recurrence: buildRecurrence(),
      description: description.trim() || undefined,
      sourcePageTitle: defaultSiteTitle || undefined
    }

    try {
      if (initialReminder) {
        const response = await chrome.runtime.sendMessage({
          type: "UPDATE_REMINDER",
          payload: { id: initialReminder.id, ...payload }
        }) as BackgroundResponse
        if (response.success) {
          onCancel()
        } else {
          setError("error" in response ? response.error : "Failed to update reminder")
        }
      } else {
        const response = await chrome.runtime.sendMessage({
          type: "CREATE_REMINDER",
          payload
        }) as BackgroundResponse
        if (response.success) {
          setDraft(null) // T129: Clear draft on success (US3)
          onCancel()
        } else {
          setError("error" in response ? response.error : "Failed to save reminder")
        }
      }
    } catch (e) {
      if (String(e).includes("QUOTA")) {
        setError(t("error_storage_quota"))
      } else {
        setError(String(e))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{initialReminder ? "Edit Reminder" : "New Reminder"}</h2>
        <button
          onClick={handleCancelClick}
          className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors"
          title="Cancel"
        >
          <MdClose size={24} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("label_title")} <span className="text-red-500">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What do you need to do?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Add some details..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <MdOutlineAccessTime className="text-blue-500" />
            {t("label_datetime")} <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={messageLink}
              onChange={(e) => setMessageLink(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://chat.example.com/..."
            />
            {messageLink && (
              <button
                type="button"
                onClick={() => window.open(messageLink, "_blank")}
                className="flex items-center justify-center px-3 border border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                title="Open Link"
              >
                <MdOpenInNew size={18} />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
            <MdLabelOutline className="text-blue-500" />
            Tags
          </label>
          <Select
            isMulti
            value={tags.filter(t => selectedTagIds.includes(t.id)).map(t => ({ value: t.id, label: t.name, color: t.color }))}
            onChange={(options) => setSelectedTagIds(options.map(o => o.value))}
            options={tags.map(t => ({ value: t.id, label: t.name, color: t.color }))}
            placeholder="Select tags..."
            className="text-sm"
            styles={{
              control: (base) => ({ ...base, borderRadius: '0.5rem', borderColor: '#d1d5db', padding: '2px' }),
              multiValue: (base, state) => ({ ...base, backgroundColor: state.data.color + '20', borderRadius: '4px' }),
              multiValueLabel: (base, state) => ({ ...base, color: state.data.color, fontWeight: 600 }),
              multiValueRemove: (base, state) => ({ ...base, color: state.data.color, ':hover': { backgroundColor: state.data.color, color: 'white' } })
            }}
            menuPlacement="auto"
          />
        </div>

        <div className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("label_pre_reminder")}
            </label>
            <Select
              value={PRE_REMINDER_OPTIONS.find(o => o.value === preReminderMinutes)}
              onChange={(opt) => setPreReminderMinutes((opt?.value as any) ?? 0)}
              options={PRE_REMINDER_OPTIONS}
              className="text-sm"
              styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', borderColor: '#d1d5db', padding: '0 2px' }) }}
              menuPlacement="auto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("label_recurrence")}
            </label>
            <Select
              value={RECURRENCE_TYPES.find(o => o.value === recurrenceType) || { value: "none", label: t("recurrence_off") }}
              onChange={(opt) => setRecurrenceType((opt?.value as any) ?? "none")}
              options={[{ value: "none", label: t("recurrence_off") }, ...RECURRENCE_TYPES]}
              className="text-sm"
              styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', borderColor: '#d1d5db', padding: '0 2px' }) }}
              menuPlacement="auto"
            />
          </div>
        </div>

        {recurrenceType === "weekly" && (
          <div>
            <Select
              value={DAYS_OF_WEEK.find(d => d.value === dayOfWeek)}
              onChange={(opt) => setDayOfWeek((opt?.value as any) ?? 1)}
              options={DAYS_OF_WEEK}
              className="text-sm pb-2"
              styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', borderColor: '#d1d5db' }) }}
              menuPlacement="auto"
            />
          </div>
        )}

        {recurrenceType === "monthly" && (
          <div>
            <input
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("label_recurrence_day_of_month")}
            />
          </div>
        )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
        )}

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? "Saving..." : t("btn_save")}
          </button>
        </div>
      </div>
    </div>
  )
}
