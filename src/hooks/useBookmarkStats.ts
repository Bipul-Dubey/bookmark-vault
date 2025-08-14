// hooks/useBookmarkStats.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { IBookmark, IBookmarkStats } from "@/types";

interface TagInfo {
  tag: string;
  count: number;
}

export function useBookmarkStats() {
  const { user } = useAuth();

  const queryResult = useQuery({
    queryKey: ["bookmark-stats", user?.uid],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Fetch all user's bookmarks
      const bookmarksQuery = query(
        collection(db, "bookmarks"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(bookmarksQuery);

      const bookmarks: IBookmark[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as IBookmark;
      });

      // Calculate statistics
      const stats = calculateBookmarkStats(bookmarks);
      const topTags = calculateTopTags(bookmarks);

      return {
        bookmarks,
        stats,
        topTags,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    ...queryResult,
    bookmarks: queryResult.data?.bookmarks || [],
    stats: queryResult.data?.stats || {
      totalBookmarks: 0,
      favoriteBookmarksCount: 0,
      uniqueTagsCount: 0,
      recentBookmarksCount: 0,
      averageTagsPerBookmark: 0,
      maxTagsOnSingleBookmark: 0,
    },
    topTags: queryResult.data?.topTags || [],
  };
}

function calculateBookmarkStats(bookmarks: IBookmark[]): IBookmarkStats {
  const totalBookmarks = bookmarks.length;

  if (totalBookmarks === 0) {
    return {
      totalBookmarks: 0,
      favoriteBookmarksCount: 0,
      uniqueTagsCount: 0,
      recentBookmarksCount: 0,
      averageTagsPerBookmark: 0,
      maxTagsOnSingleBookmark: 0,
    };
  }

  // Calculate favorites
  const favoriteBookmarksCount = bookmarks.filter((b) => b.favorite).length;

  // Calculate unique tags
  const allTags = bookmarks.flatMap((bookmark) => bookmark.tags);
  const uniqueTags = new Set(allTags);
  const uniqueTagsCount = uniqueTags.size;

  // Calculate recent bookmarks (added this week)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentBookmarksCount = bookmarks.filter(
    (bookmark) => bookmark.createdAt >= oneWeekAgo
  ).length;

  // Calculate average tags per bookmark
  const totalTags = allTags.length;
  const averageTagsPerBookmark = Number(
    (totalTags / totalBookmarks).toFixed(1)
  );

  // Find max tags on a single bookmark
  const maxTagsOnSingleBookmark = Math.max(
    ...bookmarks.map((bookmark) => bookmark.tags.length),
    0
  );

  // Get most recent bookmark
  const mostRecentBookmark = bookmarks.length > 0 ? bookmarks[0] : null;

  return {
    totalBookmarks,
    favoriteBookmarksCount,
    uniqueTagsCount,
    recentBookmarksCount,
    averageTagsPerBookmark,
    maxTagsOnSingleBookmark,
    mostRecentBookmark,
  };
}

function calculateTopTags(bookmarks: IBookmark[]): TagInfo[] {
  const tagCounts = new Map<string, number>();

  bookmarks.forEach((bookmark) => {
    bookmark.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
