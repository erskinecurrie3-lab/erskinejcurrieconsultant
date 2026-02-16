import { useState, useEffect } from 'react';
import { client } from '@/lib/api';
import type { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await client.auth.me();
      if (response.data) {
        setUser({
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role || 'client' // Use actual role from backend, default to 'client' if not provided
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    await client.auth.toLogin();
  };

  const logout = async () => {
    await client.auth.logout();
    setUser(null);
  };

  return { user, loading, login, logout, checkAuth };
}