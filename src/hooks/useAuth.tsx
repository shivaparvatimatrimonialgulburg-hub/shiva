import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isPremium: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isManager: false,
  isPremium: false,
  login: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/profiles/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    // Check local storage for session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      fetchProfile(parsed.id);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      await fetchProfile(data.user.id);
    } else {
      throw new Error(data.error || "Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('user');
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isPremium = profile?.package && profile.package !== 'free';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isManager, isPremium, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
