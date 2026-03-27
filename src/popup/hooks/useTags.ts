// src/popup/hooks/useTags.ts
// Tag management hook with storage-synced CRUD and cascade deletion

import { useCallback, useEffect, useState } from "react"
import { storage } from "~shared/storage"
import { STORAGE_KEYS } from "~shared/constants"
import type { Tag } from "~shared/types"
import {
  getTags,
  addTag,
  updateTag,
  deleteTag as deleteTagStorage
} from "~shared/storage"

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTags().then((t) => {
      setTags(t)
      setLoading(false)
    })

    // Subscribe to storage changes
    storage.watch({
      [STORAGE_KEYS.TAGS]: (change: { newValue?: Tag[] }) => {
        if (change.newValue !== undefined) {
          setTags(change.newValue)
        }
      }
    })
  }, [])

  const createTag = useCallback(async (name: string, color: string): Promise<Tag> => {
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
    if (existing) throw new Error(`Tag "${name}" already exists`)

    const tag: Tag = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: new Date().toISOString()
    }
    await addTag(tag)
    setTags(prev => [...prev, tag])
    return tag
  }, [tags])

  const editTag = useCallback(async (id: string, name: string, color: string) => {
    const tag = tags.find((t) => t.id === id)
    if (!tag) throw new Error(`Tag not found: ${id}`)
    const updated = { ...tag, name: name.trim(), color }
    await updateTag(updated)
    setTags(prev => prev.map(t => t.id === id ? updated : t))
  }, [tags])

  const removeTag = useCallback(async (id: string) => {
    await deleteTagStorage(id)
    setTags(prev => prev.filter(t => t.id !== id))
  }, [])

  return { tags, loading, createTag, editTag, removeTag }
}
