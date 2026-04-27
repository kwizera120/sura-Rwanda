import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('sura_rwanda_user');
    const token = localStorage.getItem('sura_rwanda_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Optionally verify with backend
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => setUser(data.user))
        .catch(() => {
          // Token invalid — keep local data as fallback
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Try backend first
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('sura_rwanda_user', JSON.stringify(data.user));
        localStorage.setItem('sura_rwanda_token', data.token);
        return true;
      }

      // Fallback: check localStorage users
      const users = JSON.parse(localStorage.getItem('sura_rwanda_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      if (foundUser) {
        const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
        setUser(userData);
        localStorage.setItem('sura_rwanda_user', JSON.stringify(userData));
        return true;
      }

      return false;
    } catch {
      // Backend unreachable — fallback to localStorage
      const users = JSON.parse(localStorage.getItem('sura_rwanda_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      if (foundUser) {
        const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
        setUser(userData);
        localStorage.setItem('sura_rwanda_user', JSON.stringify(userData));
        return true;
      }
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Try backend first
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('sura_rwanda_user', JSON.stringify(data.user));
        localStorage.setItem('sura_rwanda_token', data.token);
        // Also save locally as fallback
        const users = JSON.parse(localStorage.getItem('sura_rwanda_users') || '[]');
        users.push({ id: data.user.id, name, email, password });
        localStorage.setItem('sura_rwanda_users', JSON.stringify(users));
        return true;
      }

      if (res.status === 409) return false; // Already exists

      // Fallback to local
      return localSignup(name, email, password);
    } catch {
      return localSignup(name, email, password);
    }
  };

  const localSignup = (name: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('sura_rwanda_users') || '[]');
    if (users.find((u: any) => u.email === email)) return false;
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('sura_rwanda_users', JSON.stringify(users));
    const userData = { id: newUser.id, name, email };
    setUser(userData);
    localStorage.setItem('sura_rwanda_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sura_rwanda_user');
    localStorage.removeItem('sura_rwanda_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
