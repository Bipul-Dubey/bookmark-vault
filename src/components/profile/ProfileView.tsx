// components/profile/ProfileView.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Mail,
  Calendar,
  Bookmark,
  Tag,
  Heart,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { IBookmark } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";

export function ProfileView() {
  const { deleteAccount, user } = useAuth();
  if (!user) return;
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const data: {
    bookmarks: IBookmark[];
    availableTags: IBookmark["tags"];
  } = { bookmarks: [], availableTags: [] };
  const { bookmarks, availableTags } = data;

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case "google.com":
        return "Google";
      case "password":
        return "Email/Password";
      default:
        return "Unknown";
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      await deleteAccount();
      // Redirect to home page after successful deletion
      router.push("/");
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      // Error is handled by AuthContext with toast notification
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const favoriteBookmarks = (bookmarks as IBookmark[]).filter(
    (b) => b.favorite
  );
  const totalBookmarks = bookmarks.length;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Profile Information</CardTitle>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              size="sm"
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user.photoURL || undefined}
                alt={user.displayName || "User"}
              />
              <AvatarFallback className="text-lg">
                {getInitials(user.displayName || user.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">
                {user.displayName || "User"}
              </h2>
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {formatDate(user.metadata.creationTime || null)}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Account Status
              </h3>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div> */}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Sign-in Method
              </h3>
              <div className="flex flex-wrap gap-1">
                {user.providerData.map((provider, index) => (
                  <Badge key={index} variant="outline">
                    {getProviderName(provider.providerId)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Last Sign In
              </h3>
              <p className="text-sm">
                {formatDate(user.metadata.lastSignInTime || null)}
              </p>
            </div>

            {/* <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                User ID
              </h3>
              <p className="font-mono bg-muted px-2 py-1 rounded text-xs break-all">
                {user.uid}
              </p>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Bookmarks Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Bookmark Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Bookmark className="h-8 w-8 text-primary" />
              </div>
              <div className="text-2xl font-bold">{totalBookmarks}</div>
              <div className="text-sm text-muted-foreground">
                Total Bookmarks
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-2xl font-bold">
                {favoriteBookmarks.length}
              </div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Tag className="h-8 w-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{availableTags.length}</div>
              <div className="text-sm text-muted-foreground">Unique Tags</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      {availableTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 20).map((tag) => {
                const tagCount = bookmarks.filter((b) =>
                  b.tags.includes(tag)
                ).length;
                return (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag} ({tagCount})
                  </Badge>
                );
              })}
              {availableTags.length > 20 && (
                <Badge variant="outline">
                  +{availableTags.length - 20} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Are you sure you want to permanently delete your account? This
                  action cannot be undone.
                </div>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="text-sm text-red-800 font-medium">
                    This will permanently delete:
                  </div>
                  <ul className="text-sm text-red-700 mt-2 space-y-1 ml-4">
                    <li>• Your account and profile information</li>
                    <li>• All your bookmarks ({totalBookmarks} bookmarks)</li>
                    <li>• All your tags and collections</li>
                    <li>• Your account preferences and settings</li>
                  </ul>
                </div>
                <div className="text-sm text-muted-foreground">
                  Please Confirm deletion.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
