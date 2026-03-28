// src/popup/index.tsx
// Main popup entry point: Pending/Completed tabs + Tag Manager + Settings

import "../styles/global.css"

import React, { useEffect, useState } from "react"
import { MdAlarm, MdHistory, MdDeleteSweep } from "react-icons/md"
import { I18nProvider, useI18n } from "~shared/i18n/index"
import { getSettings, storage } from "~shared/storage"
import { STORAGE_KEYS } from "~shared/constants"
import type { Settings, Reminder } from "~shared/types"
import { ReminderList } from "./components/ReminderList"
import { TagManager } from "./components/TagManager"
import { SettingsPanel } from "./components/SettingsPanel"
import { ReminderForm } from "./components/ReminderForm"
import { useReminders } from "./hooks/useReminders"
import { useTags } from "./hooks/useTags"

type Tab = "All" | "Today" | "Tags" | "History"

function Popup() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>("All")
  const [showSettings, setShowSettings] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null)
  const [activeTabUrl, setActiveTabUrl] = useState("")
  const [activeTabTitle, setActiveTabTitle] = useState("")
  const { pending, completed, loading: remLoading, updateReminder, deleteReminder, clearCompleted } = useReminders()
  const { tags, loading: tagsLoading, createTag, editTag, removeTag } = useTags()

  const loading = remLoading || tagsLoading
  const tabs: Tab[] = ["All", "Today", "History", "Tags"]

  const todayReminders = pending.filter(r => {
    const today = new Date()
    const scheduled = new Date(r.scheduledAt)
    return today.toDateString() === scheduled.toDateString()
  })

  const sortedCompleted = [...completed].sort((a, b) => {
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0
    return bTime - aTime
  })

  // Derive the editing logic
  const editingReminder = React.useMemo(() => {
    if (!editingReminderId) return null
    return pending.find(r => r.id === editingReminderId) || completed.find(r => r.id === editingReminderId) || null
  }, [editingReminderId, pending, completed])

  // Check for pending mattermost reminder and auto-drafts
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEYS.PENDING_REMINDER, STORAGE_KEYS.DRAFT_STATE], (result) => {
      const pending = result[STORAGE_KEYS.PENDING_REMINDER]
      if (pending?.link) {
        setActiveTabUrl(pending.link)
        setActiveTabTitle(pending.pageTitle || "")
        setIsCreating(true)
        setEditingReminderId(null)
        // Clear the pending data and badge
        chrome.storage.local.remove(STORAGE_KEYS.PENDING_REMINDER)
        chrome.action.setBadgeText({ text: "" })
      } else {
        // Handle restoring form visibility from draft
        const draft = result[STORAGE_KEYS.DRAFT_STATE]
        if (draft) {
          const now = Date.now()
          if (now - draft.lastUpdatedAt <= 15 * 60 * 1000) {
            if (draft.editingId) {
              setEditingReminderId(draft.editingId)
            } else {
              setIsCreating(true)
            }
          }
        }
      }
    })
  }, [])

  return (
    <div className={`w-[400px] h-[600px] flex flex-col bg-slate-50 relative ${(isCreating || (editingReminderId && editingReminder)) ? '' : 'pb-[68px]'}`}>
      <div className="bg-white px-5 pt-4 pb-0 flex flex-col gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdAlarm className="text-[26px] text-blue-600" />
            <h1 className="font-bold text-slate-900 text-[17px] tracking-tight">ChatOps Reminders</h1>
          </div>
          <button className="text-slate-400 hover:text-slate-800 transition-colors">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path></svg>
          </button>
        </div>
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowSettings(false); setIsCreating(false); setEditingReminderId(null); }}
              className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${
                activeTab === tab && !showSettings
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${(isCreating || (editingReminderId && editingReminder)) ? '' : 'p-4'}`}>
        {loading ? (
          <p className="text-sm text-slate-400 text-center py-8">Loading...</p>
        ) : (isCreating || (editingReminderId && editingReminder)) ? (
          <ReminderForm 
            tags={tags} 
            initialReminder={editingReminder || undefined}
            defaultLink={activeTabUrl}
            defaultSiteTitle={activeTabTitle}
            onCancel={() => { setIsCreating(false); setEditingReminderId(null); }} 
          />
        ) : showSettings ? (
          <SettingsPanel />
        ) : (
          <>
            {activeTab === "All" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">ACTIVE STREAM</h2>
                  <button onClick={() => setActiveTab("Tags")} className="text-[13px] font-semibold text-blue-600 flex items-center gap-1.5 hover:underline">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="15" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.41l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.58l7-7c.36-.36.86-.58 1.41-.58s1.05-.22 1.41-.58zM13 20.01L4 11V4h7v-.01l9 9-7 7.02z"></path><circle cx="6.5" cy="6.5" r="1.5"></circle></svg>
                    Manage Tags
                  </button>
                </div>
                <ReminderList
                  reminders={pending}
                  tags={tags}
                  onUpdate={updateReminder}
                  onDelete={deleteReminder}
                  onEdit={(r) => setEditingReminderId(r.id)}
                  emptyMessage={t("no_reminders")}
                />
              </div>
            )}

            {activeTab === "Today" && (
              <div className="space-y-4">
                <h2 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-1">TODAY'S REMINDERS</h2>
                <ReminderList
                  reminders={todayReminders}
                  tags={tags}
                  onUpdate={updateReminder}
                  onDelete={deleteReminder}
                  onEdit={(r) => setEditingReminderId(r.id)}
                  emptyMessage={"No reminders scheduled for today."}
                />
              </div>
            )}

            {activeTab === "Tags" && (
              <TagManager tags={tags} onCreateTag={createTag} onEditTag={editTag} onDeleteTag={removeTag} />
            )}

            {activeTab === "History" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MdHistory className="text-slate-400" />
                    <h2 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">COMPLETED</h2>
                  </div>
                  {sortedCompleted.length > 0 && (
                    <button
                      onClick={() => clearCompleted()}
                      className="text-[13px] font-semibold text-red-500 flex items-center gap-1.5 hover:underline transition-colors"
                    >
                      <MdDeleteSweep size={16} />
                      Clear All
                    </button>
                  )}
                </div>
                {sortedCompleted.length === 0 ? (
                  <div className="text-center py-12">
                    <MdHistory className="text-slate-200 text-5xl mx-auto mb-3" />
                    <p className="text-[14px] text-slate-400">No completed reminders yet.</p>
                    <p className="text-[12px] text-slate-300 mt-1">Accept a reminder to see it here.</p>
                  </div>
                ) : (
                  <ReminderList
                    reminders={sortedCompleted}
                    tags={tags}
                    onUpdate={updateReminder}
                    onDelete={deleteReminder}
                    onEdit={(r) => setEditingReminderId(r.id)}
                    emptyMessage="No completed reminders."
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
      {/* Sticky Footer */}
      {!isCreating && !(editingReminderId && editingReminder) && (
        <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-slate-50/90 backdrop-blur-sm border-t border-slate-200 flex items-center justify-between px-5">
          <div className="flex items-center gap-4 text-slate-600">
            <button className="hover:text-slate-900 transition-colors p-1" title="Help"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"></path></svg></button>
            <button onClick={() => { setShowSettings(!showSettings); setIsCreating(false); setEditingReminderId(null); }} className={`transition-colors p-1 ${showSettings ? "text-blue-600" : "hover:text-slate-900"}`} title="Settings"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path></svg></button>
          </div>
          <button onClick={() => {
            setIsCreating(true); setEditingReminderId(null);
            // Query active tab for auto-fill
            chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
              const tab = tabs[0]
              if (tab?.url && /^https?:\/\//.test(tab.url)) {
                setActiveTabUrl(tab.url)
                setActiveTabTitle(tab.title || "")
              } else {
                setActiveTabUrl("")
                setActiveTabTitle("")
              }
            }).catch(() => { setActiveTabUrl(""); setActiveTabTitle("") })
          }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 text-[14px] flex items-center justify-center gap-2 transition-colors shadow-md">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
            New Reminder
          </button>
        </div>
      )}
    </div>
  )
}

function PopupWithI18n() {
  const [initialLocale, setInitialLocale] = useState<"en" | "vi" | undefined>()

  useEffect(() => {
    getSettings().then((s) => setInitialLocale(s.language))
  }, [])

  return (
    <I18nProvider initialLocale={initialLocale}>
      <Popup />
    </I18nProvider>
  )
}

export default PopupWithI18n
