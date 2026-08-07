import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, authReady } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-2xl border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-sm text-white/70">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
