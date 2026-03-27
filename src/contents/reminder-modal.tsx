// src/contents/reminder-modal.tsx
// CSUI: Shadow DOM modal form React component for reminder creation

import styleText from "data-text:../styles/global.css"
import type { PlasmoCSConfig, PlasmoCSUIJSXContainer, PlasmoRender, PlasmoGetShadowHostId } from "plasmo"
import React, { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"
import { MdClose } from "react-icons/md"

import { I18nProvider, useI18n } from "~shared/i18n/index"

import type { BackgroundResponse, CreateReminderPayload, RecurrenceRule } from "~shared/types"
import {
  DAYS_OF_WEEK,
  PRE_REMINDER_OPTIONS,
  RECURRENCE_TYPES
} from "~shared/constants"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/*"],
  run_at: "document_idle"
}

export const getShadowHostId: PlasmoGetShadowHostId = () => "chatops-reminder-modal-host"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

// ─── Modal Form Component ─────────────────────────────────────────────────────

interface ModalFormProps {
  messageLink: string
  onClose: () => void
}

function ModalForm({ messageLink, onClose }: ModalFormProps) {
  const { t } = useI18n()
  const [title, setTitle] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [preReminderMinutes, setPreReminderMinutes] = useState<0 | 5 | 10 | 15 | 30>(0)
  const [recurrenceType, setRecurrenceType] = useState<"none" | "daily" | "weekly" | "monthly">("none")
  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function buildRecurrence(): RecurrenceRule | null {
    if (recurrenceType === "none") return null
    return {
      type: recurrenceType,
      dayOfWeek: recurrenceType === "weekly" ? dayOfWeek : null,
      dayOfMonth: recurrenceType === "monthly" ? dayOfMonth : null
    }
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
      messageLink,
      scheduledAt: new Date(scheduledAt).toISOString(),
      preReminderMinutes,
      tagIds: [],
      recurrence: buildRecurrence(),
      description: (document.getElementById("cr-description") as HTMLTextAreaElement)?.value.trim() || undefined
    }

    try {
      const response = await chrome.runtime.sendMessage({
        type: "CREATE_REMINDER",
        payload
      }) as BackgroundResponse

      if (response.success) {
        onClose()
      } else {
        setError("error" in response ? response.error : "Failed to save reminder")
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose()
    if (e.key === "Enter" && e.ctrlKey) handleSave()
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">{t("modal_title")}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Title */}
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="cr-description"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Add some details..."
          />
        </div>

        {/* Date/Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("label_datetime")} <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Pre-reminder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("label_pre_reminder")}
          </label>
          <select
            value={preReminderMinutes}
            onChange={(e) => setPreReminderMinutes(Number(e.target.value) as 0 | 5 | 10 | 15 | 30)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRE_REMINDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Recurrence */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("label_recurrence")}
          </label>
          <select
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value as typeof recurrenceType)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">{t("recurrence_off")}</option>
            {RECURRENCE_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          {recurrenceType === "weekly" && (
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          )}

          {recurrenceType === "monthly" && (
            <input
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Number(e.target.value))}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("label_recurrence_day_of_month")}
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("btn_cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : t("btn_save")}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Host ───────────────────────────────────────────────────────────────

function ModalHost() {
  const [open, setOpen] = useState(false)
  const [messageLink, setMessageLink] = useState("")

  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<{ messageLink: string }>
      setMessageLink(detail.messageLink ?? window.location.href)
      setOpen(true)
    }
    document.addEventListener("chatops:open-reminder-modal", handler)
    return () => document.removeEventListener("chatops:open-reminder-modal", handler)
  }, [])

  if (!open) return null

  return (
    <I18nProvider>
      <ModalForm messageLink={messageLink} onClose={() => setOpen(false)} />
    </I18nProvider>
  )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  anchor,
  createRootContainer
}) => {
  const rootContainer = await createRootContainer!(anchor)
  const root = createRoot(rootContainer)
  root.render(<ModalHost />)
}
