import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        {/* Glow spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
        <p className="mt-4 text-muted font-heading font-medium tracking-wide">Syncing Mobo-Care Session...</p>
      </div>
    );
  }

  // Redirect to login if no token or user profile is loaded
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is allowed for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'superAdmin') {
      return <Navigate to="/super/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
