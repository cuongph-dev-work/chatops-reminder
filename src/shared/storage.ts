// src/shared/storage.ts
// Storage adapter wrapping @plasmohq/storage with typed get/set for reminders, tags, and settings

import { Storage } from "@plasmohq/storage"
import type { Reminder, Settings, SiteMapping, Tag } from "./types"
import { DEFAULTS, STORAGE_KEYS } from "./constants"

const storage = new Storage()

// --- Reminders ---

export async function getReminders(): Promise<Reminder[]> {
  const val = await storage.get<Reminder[]>(STORAGE_KEYS.REMINDERS)
  return val ?? []
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await storage.set(STORAGE_KEYS.REMINDERS, reminders)
}

export async function getReminderById(id: string): Promise<Reminder | undefined> {
  const reminders = await getReminders()
  return reminders.find((r) => r.id === id)
}

export async function addReminder(reminder: Reminder): Promise<void> {
  const reminders = await getReminders()
  reminders.push(reminder)
  await saveReminders(reminders)
}

export async function updateReminder(updated: Reminder): Promise<void> {
  const reminders = await getReminders()
  const idx = reminders.findIndex((r) => r.id === updated.id)
  if (idx === -1) throw new Error(`Reminder not found: ${updated.id}`)
  reminders[idx] = updated
  await saveReminders(reminders)
}

export async function deleteReminder(id: string): Promise<void> {
  const reminders = await getReminders()
  await saveReminders(reminders.filter((r) => r.id !== id))
}

export async function clearCompletedReminders(id?: string): Promise<number> {
  const reminders = await getReminders()
  let cleared: Reminder[]
  let remaining: Reminder[]
  if (id) {
    cleared = reminders.filter((r) => r.id === id && r.status === "completed")
    remaining = reminders.filter((r) => !(r.id === id && r.status === "completed"))
  } else {
    cleared = reminders.filter((r) => r.status === "completed")
    remaining = reminders.filter((r) => r.status !== "completed")
  }
  await saveReminders(remaining)
  return cleared.length
}

// --- Tags ---

export async function getTags(): Promise<Tag[]> {
  const val = await storage.get<Tag[]>(STORAGE_KEYS.TAGS)
  return val ?? []
}

export async function saveTags(tags: Tag[]): Promise<void> {
  await storage.set(STORAGE_KEYS.TAGS, tags)
}

export async function addTag(tag: Tag): Promise<void> {
  const tags = await getTags()
  tags.push(tag)
  await saveTags(tags)
}

export async function updateTag(updated: Tag): Promise<void> {
  const tags = await getTags()
  const idx = tags.findIndex((t) => t.id === updated.id)
  if (idx === -1) throw new Error(`Tag not found: ${updated.id}`)
  tags[idx] = updated
  await saveTags(tags)
}

export async function deleteTag(id: string): Promise<void> {
  // Remove tag and cascade-remove from all reminders
  const [tags, reminders] = await Promise.all([getTags(), getReminders()])
  await saveTags(tags.filter((t) => t.id !== id))
  const updated = reminders.map((r) => ({
    ...r,
    tagIds: r.tagIds.filter((tid) => tid !== id)
  }))
  await saveReminders(updated)
}

// --- Settings ---

export async function getSettings(): Promise<Settings> {
  const val = await storage.get<Settings>(STORAGE_KEYS.SETTINGS)
  return {
    language: val?.language ?? DEFAULTS.LANGUAGE,
    autoSnooze: val?.autoSnooze ?? DEFAULTS.AUTO_SNOOZE,
    autoSnoozeMinutes: val?.autoSnoozeMinutes ?? DEFAULTS.AUTO_SNOOZE_MINUTES
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await storage.set(STORAGE_KEYS.SETTINGS, settings)
}

export { storage }

// --- Site Mappings ---

export async function getSiteMappings(): Promise<SiteMapping[]> {
  const val = await storage.get<SiteMapping[]>(STORAGE_KEYS.SITE_MAPPINGS)
  return val ?? []
}

export async function saveSiteMappings(mappings: SiteMapping[]): Promise<void> {
  await storage.set(STORAGE_KEYS.SITE_MAPPINGS, mappings)
}

export async function upsertSiteMapping(domain: string, name: string, autoDetected: boolean): Promise<SiteMapping> {
  const mappings = await getSiteMappings()
  const idx = mappings.findIndex((m) => m.domain === domain)
  if (idx >= 0) {
    // Only update if still auto-detected (don't overwrite user customizations)
    if (mappings[idx].autoDetected && autoDetected) {
      mappings[idx].name = name
    }
    await saveSiteMappings(mappings)
    return mappings[idx]
  }
  const newMapping: SiteMapping = { domain, name, autoDetected }
  mappings.push(newMapping)
  await saveSiteMappings(mappings)
  return newMapping
}

export async function deleteSiteMapping(domain: string): Promise<void> {
  const mappings = await getSiteMappings()
  await saveSiteMappings(mappings.filter((m) => m.domain !== domain))
}
