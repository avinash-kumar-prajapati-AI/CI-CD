import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AdminLoginModal } from '../components/AdminLoginModal';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export function RootLayout() {
  const location = useLocation();
  const outlet = <Outlet />;
  const { restoreSession } = useAuthStore();
  const { hydrateTheme } = useThemeStore();

  useEffect(() => {
    restoreSession();
    hydrateTheme();
  }, [hydrateTheme, restoreSession]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminLoginModal />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="pt-6"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
