// src/popup/index.tsx
// Main popup entry point: Pending/Completed tabs + Tag Manager + Settings

import "../styles/global.css"

import React, { useEffect, useState } from "react"
import { I18nProvider, useI18n } from "~shared/i18n/index"
import { getSettings } from "~shared/storage"
import type { Settings } from "~shared/types"
import { ReminderList } from "./components/ReminderList"
import { TagManager } from "./components/TagManager"
import { SettingsPanel } from "./components/SettingsPanel"
import { useReminders } from "./hooks/useReminders"
import { useTags } from "./hooks/useTags"

type Tab = "pending" | "completed" | "tags" | "settings"

function Popup() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<Tab>("pending")
  const { pending, completed, loading: remLoading, updateReminder, deleteReminder, clearCompleted } = useReminders()
  const { tags, loading: tagsLoading, createTag, editTag, removeTag } = useTags()

  const loading = remLoading || tagsLoading

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: t("tab_pending") },
    { key: "completed", label: t("tab_completed") },
    { key: "tags", label: t("tab_tags") },
    { key: "settings", label: t("tab_settings") }
  ]

  return (
    <div className="w-96 min-h-[400px] max-h-[600px] flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
        <span className="text-xl">⏰</span>
        <h1 className="font-semibold text-gray-800 text-base">ChatOps Reminder</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-2 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            {tab.key === "pending" && pending.length > 0 && (
              <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading...</p>
        ) : (
          <>
            {activeTab === "pending" && (
              <ReminderList
                reminders={pending}
                tags={tags}
                onUpdate={updateReminder}
                onDelete={deleteReminder}
                emptyMessage={t("no_reminders")}
              />
            )}

            {activeTab === "completed" && (
              <div className="space-y-3">
                {completed.length > 0 && (
                  <button
                    onClick={() => clearCompleted()}
                    className="w-full text-xs text-red-600 border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                  >
                    {t("btn_clear_completed")}
                  </button>
                )}
                <ReminderList
                  reminders={completed}
                  tags={tags}
                  onUpdate={updateReminder}
                  onDelete={(id) => clearCompleted(id)}
                  emptyMessage={t("no_completed")}
                />
              </div>
            )}

            {activeTab === "tags" && (
              <TagManager
                tags={tags}
                onCreateTag={createTag}
                onEditTag={editTag}
                onDeleteTag={removeTag}
              />
            )}

            {activeTab === "settings" && <SettingsPanel />}
          </>
        )}
      </div>
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
