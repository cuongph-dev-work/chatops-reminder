// src/contents/custom-notification.tsx
// CSUI for displaying rich custom notifications directly in the active tab

import styleText from "data-text:../styles/global.css"
import type { PlasmoCSConfig, PlasmoCSUIJSXContainer, PlasmoRender, PlasmoGetShadowHostId } from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { MdAlarm, MdClose, MdOpenInNew, MdSnooze, MdCheck } from "react-icons/md"
import type { Reminder, Tag } from "~shared/types"
import { getTags } from "~shared/storage"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_idle"
}

export const getShadowHostId: PlasmoGetShadowHostId = () => "chatops-reminder-notification-host"

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = styleText
  return style
}

function CustomNotification({
  reminder,
  tags,
  onClose
}: {
  reminder: Reminder
  tags: Tag[]
  onClose: () => void
}) {
  const [progress, setProgress] = useState(100)

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    const duration = 15000
    const interval = 50
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(timer)
          handleIgnore()
          return 0
        }
        return p - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [reminder.id])

  async function handleSnooze() {
    await chrome.runtime.sendMessage({
      type: "SNOOZE_NOTIFICATION",
      payload: { reminderId: reminder.id, minutes: 5 }
    })
    onClose()
  }

  async function handleDismiss() {
    await chrome.runtime.sendMessage({
      type: "DISMISS_NOTIFICATION",
      payload: { reminderId: reminder.id }
    })
    onClose()
  }

  async function handleIgnore() {
    await chrome.runtime.sendMessage({
      type: "IGNORE_NOTIFICATION",
      payload: { reminderId: reminder.id }
    })
    onClose()
  }

  function handleView() {
    if (reminder.messageLink) {
      window.open(reminder.messageLink, "_blank")
    }
    handleDismiss()
  }

  // Format relative time for "Just now", "Xm ago", etc.
  function formatRelativeTime(): string {
    const now = Date.now()
    const created = new Date(reminder.createdAt).getTime()
    const diffMs = now - created
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "Just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return `${Math.floor(diffHr / 24)}d ago`
  }

  return (
    <div className="w-[460px] max-w-[calc(100vw-48px)] drop-shadow-2xl pointer-events-auto shrink-0">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/60 ring-1 ring-black/5 border-l-[5px] border-l-blue-500">
        {/* Header: Label + Timestamp + Close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <span className="text-[11px] font-bold tracking-widest uppercase text-blue-600">
            Active Reminder
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-400 font-medium">
              {formatRelativeTime()}
            </span>
            <button
              onClick={handleIgnore}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>

        {/* Body: Icon + Content */}
        <div className="flex px-5 pb-4 gap-4 items-start">
          {/* Icon Block */}
          <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mt-0.5">
            <MdAlarm className="text-blue-600 text-2xl" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-slate-800 leading-snug mb-1 tracking-tight line-clamp-2">
              {reminder.title}
            </h3>

            {/* Source site subtitle */}
            {reminder.sourceSiteName && (
              <p className="text-[13px] leading-snug mb-2">
                <span className="font-semibold text-emerald-600">{reminder.sourceSiteName}</span>
                {reminder.description && (
                  <span className="text-slate-500">: {reminder.description}</span>
                )}
              </p>
            )}

            {/* Description when no source site */}
            {!reminder.sourceSiteName && reminder.description && (
              <p className="text-[13px] text-slate-500 leading-snug line-clamp-3 mb-2">
                {reminder.description}
              </p>
            )}

            {/* Tags */}
            {reminder.tagIds && reminder.tagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {reminder.tagIds.map(tagId => {
                  const tag = tags.find(x => x.id === tagId)
                  if (!tag) return null
                  return (
                    <span
                      key={tag.id}
                      className="px-2 py-[3px] rounded-full text-[10px] font-bold tracking-wide uppercase"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 px-5 pb-4">
          {reminder.messageLink && (
            <button
              onClick={handleView}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <MdOpenInNew size={16} />
              View in Chat
            </button>
          )}
          <button
            onClick={handleSnooze}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
          >
            <MdSnooze size={16} />
            Snooze 5m
          </button>
          <button
            onClick={handleDismiss}
            className="ml-auto text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors px-3 py-2.5 focus:outline-none"
          >
            Dismiss
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-100">
          <div
            className="h-full bg-blue-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function NotificationContainer() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  useEffect(() => {
    getTags().then(setTags)

    const handler = (msg: any) => {
      if (msg.type === "SHOW_CUSTOM_NOTIFICATION") {
        setReminders((prev) => [...prev, msg.payload])
      }
      return false
    }

    chrome.runtime.onMessage.addListener(handler)
    return () => chrome.runtime.onMessage.removeListener(handler)
  }, [])

  if (reminders.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-[2147483647] flex flex-col gap-4 pointer-events-none items-end max-h-[100vh] overflow-y-visible">
      {reminders.map((reminder) => (
        <CustomNotification
          key={reminder.id}
          reminder={reminder}
          tags={tags}
          onClose={() =>
            setReminders((prev) => prev.filter((r) => r.id !== reminder.id))
          }
        />
      ))}
    </div>
  )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  anchor,
  createRootContainer
}) => {
  const rootContainer = await createRootContainer!(anchor)
  const root = createRoot(rootContainer)
  root.render(<NotificationContainer />)
}
