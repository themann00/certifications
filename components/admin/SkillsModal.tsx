'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Tag } from '@/lib/types'
import TagManager from './TagManager'

interface SkillsModalProps {
  tags: Tag[]
  onRefresh: () => void
  onClose: () => void
}

export default function SkillsModal({ tags, onRefresh, onClose }: SkillsModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white border-4 border-mondrian-black w-full max-w-xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-4 border-mondrian-black px-6 py-4 bg-mondrian-black sticky top-0">
          <span className="font-display text-white font-bold text-lg">Manage Skills</span>
          <button
            onClick={onClose}
            className="text-white hover:text-mondrian-yellow transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <TagManager tags={tags} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  )
}
