// components/profile/ProfileView.tsx
"use client";

import { useBookmarkStats } from "@/hooks/useBookmarkStats";
import { ProfileHeader } from "./ProfileHeader";
import { BookmarkStatistics } from "./BookmarkStatistics";
import { TagAnalytics } from "./TagAnalytics";

export function ProfileView() {
  // Fetch bookmark statistics
  const { stats, topTags, isLoading, error } = useBookmarkStats();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          totalBookmarks={stats.totalBookmarks}
          uniqueTagsCount={stats.uniqueTagsCount}
        />

        {/* Bookmark Statistics */}
        <BookmarkStatistics stats={stats} isLoading={isLoading} error={error} />

        {/* Tag Analytics */}
        <TagAnalytics topTags={topTags} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
