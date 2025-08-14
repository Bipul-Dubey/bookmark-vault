// components/profile/ProfileView.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  TrendingUp,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";
import { useBookmarkStats } from "@/hooks/useBookmarkStats";

export function ProfileView() {
  const { deleteAccount, user } = useAuth();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch bookmark statistics
  const { bookmarks, stats, topTags, isLoading, error } = useBookmarkStats();

  if (!user) return null;

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
          </div>
        </CardContent>
      </Card>

      {/* Bookmark Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Bookmark Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                  <Skeleton className="h-8 w-8 mx-auto mb-2" />
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load bookmark statistics</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Bookmarks */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border">
                <div className="flex items-center justify-center mb-2">
                  <Bookmark className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.totalBookmarks}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Total Bookmarks
                </div>
              </div>

              {/* Favorites */}
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg border">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {stats.favoriteBookmarksCount}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">
                  Favorites
                </div>
              </div>

              {/* Unique Tags */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border">
                <div className="flex items-center justify-center mb-2">
                  <Tag className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats.uniqueTagsCount}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Unique Tags
                </div>
              </div>

              {/* Recent Activity */}
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.recentBookmarksCount}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Added This Week
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Tags */}
      {!isLoading && !error && topTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Your Most Used Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Tags */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Most Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {topTags.slice(0, 15).map((tagInfo) => (
                    <Badge
                      key={tagInfo.tag}
                      variant="secondary"
                      className="text-sm flex items-center gap-1"
                    >
                      {tagInfo.tag}
                      <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                        {tagInfo.count}
                      </span>
                    </Badge>
                  ))}
                  {topTags.length > 15 && (
                    <Badge variant="outline" className="text-xs">
                      +{topTags.length - 15} more tags
                    </Badge>
                  )}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Tag Usage
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Average tags per bookmark:</span>
                      <span className="font-medium">
                        {stats.averageTagsPerBookmark}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most tagged bookmark:</span>
                      <span className="font-medium">
                        {stats.maxTagsOnSingleBookmark} tags
                      </span>
                    </div>
                  </div>
                </div>

                {stats.mostRecentBookmark && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Latest Activity
                    </h3>
                    <div className="text-sm">
                      <p className="truncate">
                        <span className="font-medium">Latest bookmark:</span>{" "}
                        {stats.mostRecentBookmark.title}
                      </p>
                      <p className="text-muted-foreground mt-1">
                        Added{" "}
                        {formatDate(
                          stats.mostRecentBookmark.createdAt.toISOString()
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && stats.totalBookmarks === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your bookmark collection by adding your first
              bookmark.
            </p>
            <Button onClick={() => router.push("/bookmarks")}>
              Go to Bookmarks
            </Button>
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
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  <div className="text-sm text-red-800 dark:text-red-200 font-medium">
                    This will permanently delete:
                  </div>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1 ml-4">
                    <li>• Your account and profile information</li>
                    <li>
                      • All your bookmarks ({stats.totalBookmarks} bookmarks)
                    </li>
                    <li>
                      • All your tags and collections ({stats.uniqueTagsCount}{" "}
                      unique tags)
                    </li>
                    <li>• Your account preferences and settings</li>
                  </ul>
                </div>
                <div className="text-sm text-muted-foreground">
                  Please confirm deletion.
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
