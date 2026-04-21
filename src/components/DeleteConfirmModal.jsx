import { AnimatePresence, motion } from 'framer-motion';

export function DeleteConfirmModal({ open, title, onCancel, onConfirm, loading }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--overlay-strong)] px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-card w-full max-w-md p-6"
          >
            <h3 className="theme-title font-display text-2xl">Delete article?</h3>
            <p className="theme-muted mt-3 text-sm leading-7">
              This will permanently remove <span className="theme-title">{title}</span> from the GitHub repo.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                className="button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="button-danger flex-1"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
