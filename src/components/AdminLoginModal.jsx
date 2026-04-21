import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function AdminLoginModal() {
  const { loginOpen, closeLogin, login, isAdmin } = useAuthStore();
  const [passphrase, setPassphrase] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!loginOpen) {
      setPassphrase('');
      setUnlocked(false);
      setSubmitting(false);
    }
  }, [loginOpen]);

  useEffect(() => {
    if (isAdmin) {
      setUnlocked(true);
    }
  }, [isAdmin]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(passphrase);
      setUnlocked(true);
      toast.success('Admin unlocked');
      window.setTimeout(closeLogin, 700);
    } catch (error) {
      toast.error(error.message || 'Invalid passphrase');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {loginOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--overlay-strong)] px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="glass-card w-full max-w-md p-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="theme-accent-chip flex h-12 w-12 items-center justify-center rounded-2xl">
                {unlocked ? <Sparkles className="theme-accent h-5 w-5" /> : <LockKeyhole className="theme-accent h-5 w-5" />}
              </div>
              <div>
                <h3 className="theme-title font-display text-2xl">Admin unlock</h3>
                <p className="theme-muted text-sm">Client-side gate for article and category management.</p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                type="password"
                autoFocus
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
                placeholder="Enter passphrase"
                className="input-shell"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeLogin}
                  className="button-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-primary flex-1"
                  disabled={submitting || !passphrase}
                >
                  {submitting ? 'Unlocking...' : unlocked ? 'Unlocked' : 'Unlock'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
