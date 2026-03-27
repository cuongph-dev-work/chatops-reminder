// src/contents/custom-notification.tsx
// CSUI for displaying rich custom notifications directly in the active tab

import styleText from "data-text:../styles/global.css"
import type { PlasmoCSConfig, PlasmoCSUIJSXContainer, PlasmoRender, PlasmoGetShadowHostId } from "plasmo"
import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { MdAlarm, MdClose, MdOpenInNew, MdSnooze } from "react-icons/md"
import type { Reminder } from "~shared/types"

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
  onClose
}: {
  reminder: Reminder
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
          handleDismiss()
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

  function handleView() {
    window.open(reminder.messageLink, "_blank")
    handleDismiss()
  }

  return (
    <div className="fixed top-4 right-4 z-[2147483647] w-[360px] max-w-[calc(100vw-32px)] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto border border-gray-100">
        <div className="flex p-4 gap-4 items-start relative">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <MdClose size={18} />
          </button>

          {/* Icon Block */}
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner mt-1">
            <MdAlarm className="text-white text-2xl" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-[15px] font-semibold text-slate-800 leading-snug mb-1 tracking-tight truncate">
              {reminder.title}
            </h3>
            <p className="text-[13px] text-slate-500 leading-tight">
              From Mattermost: <span className="font-medium text-blue-600 truncate inline-block max-w-[120px] align-bottom">{new URL(reminder.sourceInstanceUrl).hostname}</span> requested this fix.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex border-t border-gray-100 bg-slate-50/50">
          <button
            onClick={handleView}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-[13px] font-medium text-blue-600 hover:bg-slate-100 transition-colors border-r border-gray-100"
          >
            <MdOpenInNew size={16} />
            View in Chat
          </button>
          <button
            onClick={handleSnooze}
            className="flex-1 py-3 px-4 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MdSnooze size={16} />
            Snooze 5m
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

  useEffect(() => {
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
    <div className="fixed top-0 right-0 z-[2147483647] p-4 flex flex-col gap-4 pointer-events-none">
      {reminders.map((reminder) => (
        <CustomNotification
          key={reminder.id}
          reminder={reminder}
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
