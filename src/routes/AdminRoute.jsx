import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export function AdminRoute({ children }) {
  const location = useLocation();
  const { authReady, isAdmin, openLogin } = useAuthStore();

  useEffect(() => {
    if (authReady && !isAdmin) {
      openLogin();
    }
  }, [authReady, isAdmin, openLogin]);

  if (!authReady) {
    return (
      <div className="container-shell flex min-h-[50vh] items-center justify-center">
        <div className="glass-panel flex max-w-md items-center gap-3 px-6 py-5 text-slate-200">
          <ShieldAlert className="h-5 w-5 text-neon-cyan" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
