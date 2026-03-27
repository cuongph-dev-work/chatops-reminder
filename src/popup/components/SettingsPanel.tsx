// src/popup/components/SettingsPanel.tsx
// Language toggle and preferences

import React from "react"
import { useI18n } from "~shared/i18n/index"

export function SettingsPanel() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("language")}
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setLocale("en")}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
              locale === "en"
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("lang_en")}
          </button>
          <button
            onClick={() => setLocale("vi")}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
              locale === "vi"
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t("lang_vi")}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <p>ChatOps Reminder v0.1.0</p>
        <p>Reminder data stored locally in your browser.</p>
      </div>
    </div>
  )
}
