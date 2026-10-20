import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main>
        <p>Verifying authentication credentials...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <main>
        <section>
          <h2>Access Denied</h2>
          <p>
            Your current assigned role (<strong>{user?.role}</strong>) is not authorized to access this section.
          </p>
          <p>
            Required roles: <em>{allowedRoles.join(', ')}</em>
          </p>
          <p>Please contact the system administrator or switch to an authorized role.</p>
        </section>
      </main>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
