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

  return (
    <div className="w-[420px] max-w-[calc(100vw-48px)] animate-in fade-in slide-in-from-top-6 duration-300 drop-shadow-2xl pointer-events-auto shrink-0">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/60 ring-1 ring-black/5">
        <div className="flex p-5 gap-4 items-start relative">
          <button
            onClick={handleIgnore}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <MdClose size={18} />
          </button>

          {/* Icon Block */}
          <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner mt-0.5 shadow-blue-600/20">
            <MdAlarm className="text-white text-3xl" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-5">
            <h3 className="text-[17px] font-bold text-slate-800 leading-tight mb-2 tracking-tight line-clamp-2">
              {reminder.title}
            </h3>

            {reminder.description && (
              <p className="text-[14px] text-slate-500 leading-snug line-clamp-3 mb-2">
                {reminder.description}
              </p>
            )}

            {reminder.tagIds && reminder.tagIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
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

            {reminder.sourceSiteName && (
              <p className="text-[12px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span className="font-medium text-slate-500">From:</span> {reminder.sourceSiteName}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex border-t border-slate-100 bg-slate-50">
          {reminder.messageLink && (
            <button
              onClick={handleView}
              className="flex-1 py-3.5 px-4 flex items-center justify-center gap-2.5 text-[14px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-r border-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <MdOpenInNew size={18} />
              View in Chat
            </button>
          )}
          <button
            onClick={handleSnooze}
            className="flex-1 py-3.5 px-4 flex items-center justify-center gap-2.5 text-[14px] font-semibold text-slate-600 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400"
          >
            <MdSnooze size={18} />
            Snooze 5m
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-3.5 px-4 flex items-center justify-center gap-2.5 text-[14px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors border-l border-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
          >
            <MdCheck size={18} />
            OK
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
