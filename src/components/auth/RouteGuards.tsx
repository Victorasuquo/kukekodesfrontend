import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function SessionLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export function RequireSession() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SessionLoading />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
  return <Outlet />;
}

export function RequirePlatformAdmin() {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) return <SessionLoading />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function RequireOrganizationRole() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <SessionLoading />;
  if (!user) return <Navigate to="/auth" replace />;
  const canManage = user.role === 'admin' || user.memberships.some((membership) => ['owner', 'admin'].includes(membership.role));
  if (!canManage) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
