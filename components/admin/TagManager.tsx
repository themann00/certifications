'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react'
import type { Tag } from '@/lib/types'

interface TagManagerProps {
  tags: Tag[]
  onRefresh: () => void
}

const COLOR_OPTIONS: { value: Tag['color']; label: string; classes: string }[] = [
  { value: 'red', label: 'Red', classes: 'bg-mondrian-red' },
  { value: 'blue', label: 'Blue', classes: 'bg-mondrian-blue' },
  { value: 'yellow', label: 'Yellow', classes: 'bg-mondrian-yellow border border-gray-200' },
  { value: 'black', label: 'Black', classes: 'bg-mondrian-black' },
]

export default function TagManager({ tags, onRefresh }: TagManagerProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState<Tag['color']>('black')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState<Tag['color']>('black')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), color: newColor }),
      })
      if (!res.ok) throw new Error('Failed')
      setNewName('')
      setNewColor('black')
      setAdding(false)
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  async function handleUpdate() {
    if (!editingId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/tags/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), color: editColor }),
      })
      if (!res.ok) throw new Error('Failed')
      setEditingId(null)
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setConfirmDeleteId(null)
      onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  const COLOR_BG: Record<string, string> = {
    red: 'bg-mondrian-red',
    blue: 'bg-mondrian-blue',
    yellow: 'bg-mondrian-yellow',
    black: 'bg-mondrian-black',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">
          Tags
          <span className="ml-2 font-body text-sm font-normal text-gray-400">
            ({tags.length})
          </span>
        </h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={14} /> Add Tag
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="border-4 border-mondrian-blue p-4 mb-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
                Tag Name
              </label>
              <input
                className="admin-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Cloud"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
                Color
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setNewColor(c.value)}
                    className={`w-7 h-7 ${c.classes} ${
                      newColor === c.value ? 'ring-2 ring-offset-1 ring-mondrian-black' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !newName.trim()}
                className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                Save
              </button>
              <button
                onClick={() => setAdding(false)}
                className="btn-secondary flex items-center gap-1.5"
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag list */}
      {tags.length === 0 ? (
        <div className="border-4 border-dashed border-gray-200 p-10 text-center">
          <p className="font-body text-sm text-gray-400 uppercase tracking-widest">
            No tags yet.
          </p>
        </div>
      ) : (
        <div className="border-4 border-mondrian-black divide-y-2 divide-mondrian-black">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              {editingId === tag.id ? (
                <>
                  <input
                    className="admin-input flex-1 !py-1.5"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => setEditColor(c.value)}
                        className={`w-6 h-6 ${c.classes} ${
                          editColor === c.value ? 'ring-2 ring-offset-1 ring-mondrian-black' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={saving}
                      className="btn-primary !py-1.5 !px-3 flex items-center gap-1 disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary !py-1.5 !px-3 flex items-center gap-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-4 h-4 flex-shrink-0 ${COLOR_BG[tag.color] ?? 'bg-black'}`} />
                  <span className="font-body text-sm font-semibold flex-1">{tag.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(tag)}
                      className="btn-secondary !py-1.5 !px-3 flex items-center gap-1"
                    >
                      <Pencil size={12} />
                    </button>
                    {confirmDeleteId === tag.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(tag.id)}
                          disabled={deletingId === tag.id}
                          className="btn-danger !py-1.5 !px-3 flex items-center gap-1 disabled:opacity-50"
                        >
                          {deletingId === tag.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <span className="text-[11px]">Confirm</span>
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="btn-secondary !py-1.5 !px-2"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(tag.id)}
                        className="btn-danger !py-1.5 !px-3"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
