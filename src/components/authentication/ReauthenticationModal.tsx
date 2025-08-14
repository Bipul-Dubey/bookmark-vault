// components/auth/ReauthenticationModal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield, Eye, EyeOff, Chrome } from "lucide-react";

interface ReauthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function ReauthenticationModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Verify Your Identity",
  description = "For security reasons, please verify your identity to continue with account deletion.",
}: ReauthenticationModalProps) {
  const { user, reauthenticateWithPassword, reauthenticateWithGoogle } =
    useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const providerId = user.providerData[0]?.providerId;
  const isEmailProvider = providerId === "password";
  const isGoogleProvider = providerId === "google.com";

  const handlePasswordReauth = async () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await reauthenticateWithPassword(password);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Password re-authentication failed:", error);
      setError(error.message || "Invalid password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleReauth = async () => {
    setIsLoading(true);
    setError("");

    try {
      await reauthenticateWithGoogle();
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Google re-authentication failed:", error);
      if (!error.message.includes("closed")) {
        setError(
          error.message ||
            "Failed to verify identity with Google. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    setError("");
    setIsLoading(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isEmailProvider && password.trim()) {
      handlePasswordReauth();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email/Password Re-authentication */}
          {isEmailProvider && (
            <>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your current password"
                    className="pr-10"
                    disabled={isLoading}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
            </>
          )}

          {/* Google Re-authentication */}
          {isGoogleProvider && (
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
              <Chrome className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Click below to verify your identity with Google
              </p>
            </div>
          )}

          {error && isGoogleProvider && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          {isEmailProvider && (
            <Button
              onClick={handlePasswordReauth}
              disabled={isLoading || !password.trim()}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Identity
                </>
              )}
            </Button>
          )}

          {isGoogleProvider && (
            <Button
              onClick={handleGoogleReauth}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-4 w-4" />
                  Sign in with Google
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
