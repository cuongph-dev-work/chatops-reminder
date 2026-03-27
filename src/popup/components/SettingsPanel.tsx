// src/popup/components/SettingsPanel.tsx
// Language toggle and preferences

import React, { useEffect, useState } from "react"
import { useI18n } from "~shared/i18n/index"
import { getSettings, saveSettings, getSiteMappings, saveSiteMappings, deleteSiteMapping } from "~shared/storage"
import { DEFAULTS } from "~shared/constants"
import type { SiteMapping } from "~shared/types"
import Select from "react-select"
import { MdDelete, MdLanguage } from "react-icons/md"

const SNOOZE_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
]

export function SettingsPanel() {
  const { locale, setLocale, t } = useI18n()
  const [autoSnooze, setAutoSnooze] = useState(DEFAULTS.AUTO_SNOOZE)
  const [autoSnoozeMinutes, setAutoSnoozeMinutes] = useState(DEFAULTS.AUTO_SNOOZE_MINUTES)
  const [siteMappings, setSiteMappings] = useState<SiteMapping[]>([])

  useEffect(() => {
    getSettings().then(s => {
      setAutoSnooze(s.autoSnooze ?? DEFAULTS.AUTO_SNOOZE)
      setAutoSnoozeMinutes(s.autoSnoozeMinutes ?? DEFAULTS.AUTO_SNOOZE_MINUTES)
    })
    getSiteMappings().then(setSiteMappings)
  }, [])

  const handleToggleAutoSnooze = async (checked: boolean) => {
    setAutoSnooze(checked)
    const s = await getSettings()
    await saveSettings({ ...s, autoSnooze: checked })
  }

  const handleChangeMinutes = async (m: number) => {
    setAutoSnoozeMinutes(m)
    const s = await getSettings()
    await saveSettings({ ...s, autoSnoozeMinutes: m })
  }

  const handleUpdateSiteName = async (domain: string, newName: string) => {
    const updated = siteMappings.map(m =>
      m.domain === domain ? { ...m, name: newName, autoDetected: false } : m
    )
    setSiteMappings(updated)
    await saveSiteMappings(updated)
  }

  const handleDeleteSiteMapping = async (domain: string) => {
    setSiteMappings(prev => prev.filter(m => m.domain !== domain))
    await deleteSiteMapping(domain)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("language")}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setLocale("en")}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
              locale === "en"
                ? "bg-blue-600 text-white border-blue-600 z-10"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("lang_en")}
          </button>
          <button
            onClick={() => setLocale("vi")}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
              locale === "vi"
                ? "bg-blue-600 text-white border-blue-600 z-10"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("lang_vi")}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <label className="flex items-center justify-between cursor-pointer mb-2">
          <span className="text-[14px] font-semibold text-slate-700">Auto-Snooze (Missed Reminders)</span>
          <div className="relative inline-flex items-center">
            <input 
              type="checkbox" 
              className="w-[18px] h-[18px] accent-blue-600 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 cursor-pointer transition-colors"
              checked={autoSnooze} 
              onChange={(e) => handleToggleAutoSnooze(e.target.checked)} 
            />
          </div>
        </label>
        
        {autoSnooze && (
          <div className="flex items-center justify-between mt-3 p-3 bg-white rounded-xl border border-slate-100 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
            <span className="text-[14px] font-medium text-slate-600">Snooze Duration</span>
            <Select
              value={SNOOZE_OPTIONS.find(o => o.value === autoSnoozeMinutes)}
              onChange={(opt) => handleChangeMinutes((opt?.value as number) ?? 5)}
              options={SNOOZE_OPTIONS}
              className="text-[13px] font-medium min-w-[130px]"
              styles={{ control: (base) => ({ ...base, borderRadius: '0.5rem', borderColor: '#e2e8f0', minHeight: '36px' }) }}
              menuPlacement="auto"
              isSearchable={false}
            />
          </div>
        )}
      </div>

      {/* Site Mappings */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <MdLanguage className="text-blue-500 text-lg" />
          <span className="text-[14px] font-semibold text-slate-700">Site Mappings</span>
        </div>
        
        {siteMappings.length === 0 ? (
          <p className="text-[13px] text-slate-400 text-center py-4">
            No sites detected yet. Create a reminder from any website to auto-register.
          </p>
        ) : (
          <div className="space-y-2">
            {siteMappings.map(mapping => (
              <div key={mapping.domain} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-100 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 truncate">{mapping.domain}</p>
                  <input
                    type="text"
                    value={mapping.name}
                    onChange={(e) => {
                      setSiteMappings(prev => prev.map(m =>
                        m.domain === mapping.domain ? { ...m, name: e.target.value } : m
                      ))
                    }}
                    onBlur={(e) => handleUpdateSiteName(mapping.domain, e.target.value)}
                    className="w-full text-[13px] font-medium text-slate-700 bg-transparent border-none outline-none focus:text-blue-600 transition-colors p-0"
                  />
                </div>
                <button
                  onClick={() => handleDeleteSiteMapping(mapping.domain)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                  title="Remove mapping"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-center text-gray-400 space-y-1 pt-4 border-t border-gray-100">
        <p>ChatOps Reminder v0.1.0</p>
        <p>Reminder data stored locally in your browser.</p>
      </div>
    </div>
  )
}
