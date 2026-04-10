"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

import { firebaseAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  authReady: boolean;
  firebaseConfigured: boolean;
  refreshAdminStatus: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchAdminStatus(user: User | null) {
  if (!user) return false;
  const token = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { isAdmin?: boolean };
  return Boolean(data.isAdmin);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseConfigured = isFirebaseClientConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = firebaseConfigured ? firebaseAuth() : null;

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true);
      setUser(nextUser);
      setIsAdmin(await fetchAdminStatus(nextUser));
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      authReady: true,
      firebaseConfigured,
      refreshAdminStatus: async () => {
        setIsAdmin(await fetchAdminStatus(auth?.currentUser ?? null));
      },
      getIdToken: async () => {
        if (!auth?.currentUser) return null;
        return auth.currentUser.getIdToken();
      },
      logout: async () => {
        if (!auth) return;
        await signOut(auth);
      },
    }),
    [auth, firebaseConfigured, isAdmin, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}

export const firebaseGoogleProvider = new GoogleAuthProvider();
