import { create } from 'zustand';
import { clearAdminSession, isStoredSessionValid, storeAdminSession, verifyPassphrase } from '../lib/auth';

export const useAuthStore = create((set) => ({
  isAdmin: false,
  authReady: false,
  loginOpen: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  restoreSession: async () => {
    const isValid = await isStoredSessionValid();
    set({ isAdmin: isValid, authReady: true });
  },
  login: async (passphrase) => {
    const isValid = await verifyPassphrase(passphrase);
    if (!isValid) {
      throw new Error('Invalid passphrase');
    }
    await storeAdminSession(passphrase);
    set({ isAdmin: true, loginOpen: false });
    return true;
  },
  logout: () => {
    clearAdminSession();
    set({ isAdmin: false, loginOpen: false });
  }
}));
