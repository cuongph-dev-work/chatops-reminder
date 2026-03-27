// src/popup/components/TagManager.tsx
// Tag CRUD interface with color picker

import React, { useState } from "react"
import { MdEdit, MdDelete } from "react-icons/md"
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
  const [newColor, setNewColor] = useState<string>(TAG_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState<string>("")

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
      <div className="bg-white rounded-[14px] shadow-sm p-4 border border-gray-100 flex flex-col gap-3 relative">
        <h2 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-1">Create New Tag</h2>
        
        <div className="flex flex-col gap-3">
          <div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[14px] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-colors"
              placeholder="E.g. Project Alpha"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 flex-wrap flex-1">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                    newColor === c 
                      ? "ring-2 ring-offset-1 ring-slate-400 scale-110 shadow-sm" 
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  title="Select Color"
                >
                  {newColor === c && <div className="w-2.5 h-2.5 bg-white/90 rounded-full" />}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={newName.trim() === ""}
              className="relative z-20 text-[13px] font-semibold bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ml-2"
            >
              Add Tag
            </button>
          </div>
        </div>

        {error && <p className="text-[12px] font-medium text-red-500 mt-2 bg-red-50 px-3 py-1.5 rounded-md">{error}</p>}
      </div>

      {/* Tag list */}
      <div className="bg-white rounded-[14px] shadow-sm border border-gray-100 overflow-hidden">
        {tags.length === 0 ? (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-slate-400 gap-2">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="32" width="32" xmlns="http://www.w3.org/2000/svg" className="opacity-50"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.41l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.58l7-7c.36-.36.86-.58 1.41-.58s1.05-.22 1.41-.58zM13 20.01L4 11V4h7v-.01l9 9-7 7.02z"></path><circle cx="6.5" cy="6.5" r="1.5"></circle></svg>
            <p className="text-[13px] font-medium">No tags created yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto">
            {tags.map((tag) => (
              <li key={tag.id} className="p-3 hover:bg-slate-50/50 transition-colors group flex items-center gap-3">
                {editingId === tag.id ? (
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {TAG_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setEditColor(c)}
                            className={`w-5 h-5 rounded-full transition-all flex items-center justify-center ${
                              editColor === c ? "ring-2 ring-offset-1 ring-slate-400 scale-110" : ""
                            }`}
                            style={{ backgroundColor: c }}
                            title="Select Color"
                          >
                             {editColor === c && <div className="w-1.5 h-1.5 bg-white/90 rounded-full" />}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleEdit} className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-md transition-colors">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-[12px] font-medium text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1 rounded-md transition-colors">Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <TagBadge tag={tag} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => startEdit(tag)}
                        className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors shadow-sm"
                        title="Edit Tag"
                      ><MdEdit size={16} /></button>
                      <button
                        onClick={() => onDeleteTag(tag.id)}
                        className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                        title="Delete Tag"
                      ><MdDelete size={16} /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
