'use client'

import { X } from 'lucide-react'

interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-start gap-3 bg-mondrian-black text-white border-[6px] border-mondrian-yellow px-4 py-3 shadow-lg max-w-lg w-[calc(100vw-2rem)]">
      <p className="font-body text-sm flex-1 break-all">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="flex-shrink-0 mt-0.5 text-white hover:text-mondrian-yellow transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}
