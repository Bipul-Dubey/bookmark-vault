// components/profile/BookmarkStatistics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bookmark,
  Tag,
  Heart,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface BookmarkStats {
  totalBookmarks: number;
  favoriteBookmarksCount: number;
  uniqueTagsCount: number;
  recentBookmarksCount: number;
  averageTagsPerBookmark: number;
  maxTagsOnSingleBookmark: number;
  mostRecentBookmark?: {
    title: string;
    createdAt: Date;
  };
}

interface BookmarkStatisticsProps {
  stats: BookmarkStats;
  isLoading: boolean;
  error: Error | null;
}

export function BookmarkStatistics({
  stats,
  isLoading,
  error,
}: BookmarkStatisticsProps) {
  const router = useRouter();

  const StatCard = ({
    icon: Icon,
    value,
    label,
    gradient,
    iconColor,
    textColor,
  }: {
    icon: any;
    value: number;
    label: string;
    gradient: string;
    iconColor: string;
    textColor: string;
  }) => (
    <div className={`text-center p-4 sm:p-6 ${gradient} rounded-lg border`}>
      <div className="flex items-center justify-center mb-3">
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} />
      </div>
      <div className={`text-xl sm:text-2xl font-bold ${textColor} mb-1`}>
        {value.toLocaleString()}
      </div>
      <div className={`text-xs sm:text-sm ${iconColor}`}>{label}</div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Bookmark Statistics
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="text-center p-4 sm:p-6 bg-muted/50 rounded-lg"
              >
                <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3" />
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mx-auto mb-2" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mx-auto" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm sm:text-base">
              Unable to load bookmark statistics
            </p>
          </div>
        ) : stats.totalBookmarks === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">
              Start building your bookmark collection by adding your first
              bookmark.
            </p>
            <Button
              onClick={() => router.push("/bookmark")}
              className="w-full sm:w-auto"
            >
              Go to Bookmarks
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                icon={Bookmark}
                value={stats.totalBookmarks}
                label="Total Bookmarks"
                gradient="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
                iconColor="text-blue-600 dark:text-blue-400"
                textColor="text-blue-700 dark:text-blue-300"
              />

              <StatCard
                icon={Heart}
                value={stats.favoriteBookmarksCount}
                label="Favorites"
                gradient="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900"
                iconColor="text-red-600 dark:text-red-400"
                textColor="text-red-700 dark:text-red-300"
              />

              <StatCard
                icon={Tag}
                value={stats.uniqueTagsCount}
                label="Unique Tags"
                gradient="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                iconColor="text-green-600 dark:text-green-400"
                textColor="text-green-700 dark:text-green-300"
              />

              <StatCard
                icon={Clock}
                value={stats.recentBookmarksCount}
                label="Added This Week"
                gradient="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
                iconColor="text-purple-600 dark:text-purple-400"
                textColor="text-purple-700 dark:text-purple-300"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
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
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Latest Activity
                  </h3>
                  <div className="text-sm">
                    <p className="truncate">
                      <span className="font-medium">Latest bookmark:</span>{" "}
                      {stats.mostRecentBookmark.title}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Added {formatDate(stats.mostRecentBookmark.createdAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
