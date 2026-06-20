"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getProfile } from "./api";

interface UserProfile {
  user_id: string;
  name: string;
  age: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  goal: string;
  diet_preference?: string;
  fitness_level: string;
  injury_note?: string;
}

interface AuthContextType {
  userId: string | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (userId: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  hasProfile: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("trainexai_user_id");
    if (saved) {
      setUserId(saved);
    }
    setLoading(false);
  }, []);

  // Fetch profile whenever userId changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem("trainexai_user_id", userId);
      setProfile(null);
      getProfile(userId)
        .then((p) => {
          setProfile(p);
        })
        .catch(() => {
          setProfile(null);
        });
    } else {
      localStorage.removeItem("trainexai_user_id");
      setProfile(null);
    }
  }, [userId]);

  const login = useCallback((id: string) => {
    setUserId(id);
  }, []);

  const logout = useCallback(() => {
    setUserId(null);
    localStorage.removeItem("trainexai_user_id");
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const p = await getProfile(userId);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  }, [userId]);

  return (
    <AuthContext.Provider
      value={{
        userId,
        profile,
        loading,
        login,
        logout,
        refreshProfile,
        hasProfile: profile !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
