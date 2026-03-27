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
    const unwatch = storage.watch<Tag[]>(STORAGE_KEYS.TAGS, (change) => {
      if (change.newValue !== undefined) {
        setTags(change.newValue)
      }
    })

    return () => {
      unwatch()
    }
  }, [])

  const createTag = useCallback(async (name: string, color: string): Promise<Tag> => {
    // Check for duplicate name (case-insensitive)
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
    if (existing) throw new Error(`Tag "${name}" already exists`)

    const tag: Tag = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: new Date().toISOString()
    }
    await addTag(tag)
    return tag
  }, [tags])

  const editTag = useCallback(async (id: string, name: string, color: string) => {
    const tag = tags.find((t) => t.id === id)
    if (!tag) throw new Error(`Tag not found: ${id}`)
    await updateTag({ ...tag, name: name.trim(), color })
  }, [tags])

  const removeTag = useCallback(async (id: string) => {
    await deleteTagStorage(id)
  }, [])

  return { tags, loading, createTag, editTag, removeTag }
}
