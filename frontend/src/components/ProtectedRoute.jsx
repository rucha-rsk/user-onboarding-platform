import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, token } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.validateToken();
        if (!response.data.valid) {
          useAuthStore.getState().logout();
        }
      } catch (err) {
        useAuthStore.getState().logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}
