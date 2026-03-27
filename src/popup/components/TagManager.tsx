// src/popup/components/TagManager.tsx
// Tag CRUD interface with color picker

import React, { useState } from "react"
import type { Tag } from "~shared/types"
import { TagBadge } from "./TagBadge"
import { useI18n } from "~shared/i18n/index"
import { TAG_COLORS } from "~shared/constants"

interface TagManagerProps {
  tags: Tag[]
  onCreateTag: (name: string, color: string) => Promise<Tag>
  onEditTag: (id: string, name: string, color: string) => Promise<void>
  onDeleteTag: (id: string) => Promise<void>
}

export function TagManager({ tags, onCreateTag, onEditTag, onDeleteTag }: TagManagerProps) {
  const { t } = useI18n()
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(TAG_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")

  async function handleCreate() {
    if (!newName.trim()) return
    try {
      await onCreateTag(newName.trim(), newColor)
      setNewName("")
      setNewColor(TAG_COLORS[0])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  async function handleEdit() {
    if (!editingId) return
    await onEditTag(editingId, editName, editColor)
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      {/* Create new tag */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">{t("tag_name")}</label>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tag name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t("tag_color")}</label>
          <div className="flex gap-1">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  newColor === c ? "border-gray-800 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 whitespace-nowrap"
        >
          {t("create_tag")}
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Tag list */}
      {tags.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">{t("no_tags")}</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center gap-2">
              {editingId === tag.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex gap-1">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditColor(c)}
                        className={`w-4 h-4 rounded-full border-2 ${
                          editColor === c ? "border-gray-800" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <button onClick={handleEdit} className="text-xs text-blue-600 hover:underline">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:underline">Cancel</button>
                </>
              ) : (
                <>
                  <TagBadge tag={tag} />
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="text-xs text-gray-400 hover:text-blue-600"
                    >✏️</button>
                    <button
                      onClick={() => onDeleteTag(tag.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >🗑️</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
