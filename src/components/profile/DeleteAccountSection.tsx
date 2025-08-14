// components/profile/DeleteAccountSection.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, AlertTriangle, Shield, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ReauthenticationModal } from "@/components/authentication/ReauthenticationModal";
import { toast } from "sonner";

interface DeleteAccountSectionProps {
  totalBookmarks: number;
  uniqueTagsCount: number;
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function DeleteAccountSection({
  totalBookmarks,
  uniqueTagsCount,
  variant = "destructive",
  size = "default",
  className,
  children,
}: DeleteAccountSectionProps) {
  const { deleteAccount, user } = useAuth();
  const router = useRouter();
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setIsDeleteDialogOpen(false);
    setIsDangerModalOpen(false);

    try {
      await deleteAccount();
      router.push("/");
    } catch (error: any) {
      console.error("Failed to delete account:", error);

      if (error.code === "auth/requires-recent-login") {
        // Show re-authentication modal
        setIsReauthModalOpen(true);
      } else {
        // Handle other errors with toast
        toast.error("Failed to delete account. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReauthSuccess = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      router.push("/");
    } catch (error: any) {
      console.error("Failed to delete account after reauth:", error);
      toast.error(
        "Failed to delete account after verification. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDangerModal = () => {
    setIsDangerModalOpen(true);
  };

  const handleCloseDangerModal = () => {
    setIsDangerModalOpen(false);
    setIsDeleting(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={handleOpenDangerModal}
        variant={variant}
        size={size}
        className={className}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 " />
        )}
        {children || "Delete Account"}
      </Button>

      {/* Danger Zone Modal */}
      <Dialog open={isDangerModalOpen} onOpenChange={setIsDangerModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone - Account Deletion
            </DialogTitle>
            <DialogDescription>
              Please review the information below before proceeding with account
              deletion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Warning Information */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-medium text-red-800 dark:text-red-200">
                    Account Deletion Warning
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Deleting your account is a permanent action that cannot be
                    undone. All your data will be permanently removed from our
                    servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Current Account Data Summary */}
            <div>
              <h4 className="font-medium text-foreground mb-3">
                Data that will be permanently deleted:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {totalBookmarks.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Bookmarks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {uniqueTagsCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">1</div>
                  <div className="text-xs text-muted-foreground">Account</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">All</div>
                  <div className="text-xs text-muted-foreground">Data</div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
              <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Security Notice:</strong> You may be asked to verify
                your identity before we can complete the account deletion for
                security purposes.
              </div>
            </div>

            {/* Final Warning */}
            <div className="p-4 border rounded-md bg-background">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Final Confirmation Required
                </h4>
                <p className="text-sm text-muted-foreground">
                  Once you proceed, there is no going back. Please be absolutely
                  certain that you want to delete your account and all
                  associated data.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDangerModal}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsDangerModalOpen(false);
                setIsDeleteDialogOpen(true);
              }}
              variant="destructive"
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              <AlertTriangle className=" h-4 w-4" />
              Proceed to Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-md sm:max-w-lg mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account - Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div className="text-sm sm:text-base font-medium">
                  This is your final confirmation. Are you absolutely sure?
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <div className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                    This will immediately and permanently delete:
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4">
                    <li>• Your account and profile information</li>
                    <li>
                      • All your bookmarks ({totalBookmarks.toLocaleString()}{" "}
                      bookmarks)
                    </li>
                    <li>
                      • All your tags and collections ({uniqueTagsCount} unique
                      tags)
                    </li>
                    <li>• Your account preferences and settings</li>
                    <li>• Any associated user data</li>
                  </ul>
                </div>

                <div className="text-xs sm:text-sm text-muted-foreground text-center">
                  <strong>This action cannot be undone.</strong>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Keep My Account
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className=" h-4 w-4 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className=" h-4 w-4" />
                  Yes, Delete My Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Re-authentication Modal */}
      <ReauthenticationModal
        isOpen={isReauthModalOpen}
        onClose={() => setIsReauthModalOpen(false)}
        onSuccess={handleReauthSuccess}
        title="Confirm Account Deletion"
        description="For security reasons, please verify your identity to proceed with deleting your account. This action cannot be undone."
      />
    </>
  );
}
