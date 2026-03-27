// src/shared/i18n/index.tsx
// i18n context provider with locale detection and language switching

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { getSettings, saveSettings } from "../storage"
import enMessages from "./en.json"
import viMessages from "./vi.json"
import type { Settings } from "../types"

type Locale = Settings["language"]
type Messages = typeof enMessages

const messages: Record<Locale, Messages> = {
  en: enMessages,
  vi: viMessages as Messages
}

function detectLocale(): Locale {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith("vi")) return "vi"
  return "en"
}

interface I18nContextValue {
  locale: Locale
  t: (key: keyof Messages) => string
  setLocale: (locale: Locale) => Promise<void>
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: (key) => key as string,
  setLocale: async () => {}
})

interface I18nProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? detectLocale())

  const t = useCallback(
    (key: keyof Messages): string => {
      return (messages[locale] as Record<string, string>)[key as string] ?? (key as string)
    },
    [locale]
  )

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale)
    const settings = await getSettings()
    await saveSettings({ ...settings, language: newLocale })
  }, [])

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}

export type { Locale, Messages }
