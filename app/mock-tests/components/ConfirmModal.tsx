'use client'

import { AnimatePresence, motion } from 'framer-motion'

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-[min(520px,92vw)] rounded-3xl bg-background border border-white/10 shadow-2xl p-6"
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="text-text font-semibold text-lg">{title}</div>
            {description && <div className="mt-2 text-sm text-text/70">{description}</div>}

            <div className="mt-6 flex gap-3 justify-end">
              <button
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold border border-white/20 bg-white/60 hover:bg-white/80 transition-colors"
                onClick={onClose}
              >
                {cancelText}
              </button>
              <button
                className="rounded-2xl px-4 py-2.5 text-sm font-semibold bg-button text-white hover:bg-button/90 transition-colors shadow-sm"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

