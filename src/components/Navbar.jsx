import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Lock, LogOut, Menu, MoonStar, Search, SunMedium, Unlock, X } from 'lucide-react';
import { SITE_PROFILE } from '../lib/constants';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/blog', label: 'Blog' },
  { to: '/search', label: 'Search' }
];

export function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin, openLogin, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div
          className={cn(
            'container-shell glass-panel flex items-center justify-between px-4 py-3 transition-all sm:px-6',
            isScrolled ? 'border-neon-cyan/20 bg-[var(--nav-scrolled-bg)] shadow-neon' : 'bg-[var(--nav-idle-bg)]'
          )}
        >
          <Link
            to="/"
            className="theme-title font-display text-lg font-bold tracking-wide"
          >
            <span className="heading-gradient">{SITE_PROFILE.name}</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium theme-muted transition hover:text-[var(--text-primary)]',
                    isActive && 'text-[var(--text-primary)]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="theme-accent-underline absolute inset-x-2 -bottom-1 h-0.5 rounded-full"
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="button-secondary w-11 rounded-full px-0"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>

            <Link
              to="/search"
              className="button-secondary w-11 rounded-full px-0"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={isAdmin ? logout : openLogin}
              className={cn(
                'button-secondary w-11 rounded-full px-0',
                isAdmin && 'text-[var(--accent-primary)]'
              )}
              aria-label={isAdmin ? 'Unlock admin' : 'Lock admin'}
            >
              {isAdmin ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </button>

            <button
              type="button"
              className="button-secondary w-11 rounded-full px-0 md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.28 }}
            className="fixed inset-y-0 right-0 z-40 w-[82vw] max-w-sm border-l border-[var(--glass-border)] bg-[var(--drawer-bg)] p-6 backdrop-blur-xl md:hidden"
          >
            <div className="mt-20 flex flex-col gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'glass-panel flex min-h-11 items-center justify-between px-4 py-3 text-base font-medium theme-muted',
                      isActive && 'border-neon-cyan/40 text-[var(--text-primary)]'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <button
                type="button"
                onClick={toggleTheme}
                className="button-secondary justify-between"
              >
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </button>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={logout}
                  className="button-secondary justify-between"
                >
                  <span>Log out</span>
                  <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="button-primary justify-between"
                >
                  <span>Admin unlock</span>
                  <Unlock className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
