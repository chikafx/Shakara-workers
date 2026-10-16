"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#f5f7ef]"
        role="status"
        aria-label="Checking your session"
      >
        <span className="size-8 animate-spin rounded-full border-4 border-[#c8d9ca] border-t-[#34785b]" />
      </div>
    );
  }

  return children;
}
