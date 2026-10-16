"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  getAuth,
  type User,
} from "firebase/auth";
import { app } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = onAuthStateChanged(getAuth(app), (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
    } catch (error) {
      console.error("Firebase Auth could not be initialized", error);
      setLoading(false);
    }

    return () => unsubscribe?.();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getAuth(app), email, password);
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const normalizedName = displayName.trim();
    if (!normalizedName) {
      throw new Error("Enter a display name.");
    }

    const result = await createUserWithEmailAndPassword(
      getAuth(app),
      email,
      password,
    );
    await updateProfile(result.user, { displayName: normalizedName });
  };

  const logout = async () => {
    await signOut(getAuth(app));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
