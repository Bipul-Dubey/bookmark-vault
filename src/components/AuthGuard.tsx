// components/auth/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    if (user) {
      // User is logged in
      if (pathname === "/" || pathname === "/register") {
        // If user is on home or register page, redirect to /bookmark
        router.push("/bookmark");
      }
      // If user is on any other page, keep them there
    } else {
      // User is not logged in
      if (pathname !== "/" && pathname !== "/register") {
        // If user is on a protected page, redirect to home
        router.push("/");
      }
      // If user is already on / or /register, keep them there
    }
  }, [user, loading, pathname, router]);

  // Show loading while checking auth or redirecting
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {fallback || (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Show children
  return <>{children}</>;
}
