"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { BookmarkCard } from "./Bookmark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { IBookmark } from "@/types";
import { BookmarkSearchParams } from "@/lib/firestore-advanced";
import {
  useBookmarksCount,
  useBookmarkMutations,
  useInfiniteBookmarks,
} from "@/hooks/useBookmarks";
import { toast } from "sonner";
import SearchBookmark from "./SearchBookmark";
import { BookmarkListSkeleton } from "./BookmarkSkeleton";
import { ErrorUI } from "./BookmarkComponent";
import { BookmarkFormButton } from "./BookmarkFormButton";

export default function BookmarkList() {
  const urlSearchParams = useSearchParams();

  // Initialize search params from URL
  const [searchParams, setSearchParams] = useState<BookmarkSearchParams>(() => {
    const params: BookmarkSearchParams = {};
    const query = urlSearchParams.get("q");
    const favorites = urlSearchParams.get("favorites");

    if (query) params.query = query;
    if (favorites === "true") params.favorite = true;

    return params;
  });

  // React Query hooks for data fetching
  const {
    data: totalCount,
    isLoading: isCountLoading,
    error: countError,
  } = useBookmarksCount(searchParams);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteBookmarks(searchParams);

  const { updateBookmark, deleteBookmark } = useBookmarkMutations();

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Auto fetch next page when load more button comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleSearchChange = useCallback((params: BookmarkSearchParams) => {
    setSearchParams(params);
  }, []);

  const handleDelete = async (bookmarkId: string) => {
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      try {
        await deleteBookmark(bookmarkId);
      } catch (error) {
        console.error("Error deleting bookmark:", error);
      }
    }
  };

  const handleToggleFavorite = async (bookmark: IBookmark) => {
    try {
      await updateBookmark({
        id: bookmark.id,
        updates: { favorite: !bookmark.favorite },
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  // Get all bookmarks from all pages
  const allBookmarks: IBookmark[] =
    data?.pages?.flatMap((page) => page.bookmarks) ?? [];
  const loadedCount = allBookmarks.length;

  // Check if we have active search/filters
  const hasActiveSearch = searchParams.query || searchParams.favorite;

  // Loading state
  if (status === "pending") {
    return <BookmarkListSkeleton />;
  }

  // Error state
  if (status === "error") {
    return <ErrorUI message={error?.message ?? ""} refetch={refetch} />;
  }

  return (
    <div className="w-full mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Bookmarks</h1>
          <div className="flex items-center gap-2 mt-1">
            {isCountLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : countError ? (
              <span className="text-sm text-red-500">Error loading count</span>
            ) : (
              <Badge variant="outline" className="text-sm">
                {totalCount} total
              </Badge>
            )}
            {loadedCount !== totalCount && (
              <Badge variant="secondary" className="text-sm">
                {loadedCount} loaded
              </Badge>
            )}
            {hasActiveSearch && (
              <Badge variant="default" className="text-sm">
                Filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Add Bookmark Button */}
        <BookmarkFormButton featureType="create" />
      </div>

      {/* Search Component */}
      <SearchBookmark onSearch={handleSearchChange} />

      {/* Bookmarks List */}
      {allBookmarks.length === 0 ? (
        <Card className="p-4 text-center">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium">
              {hasActiveSearch ? "No bookmarks found" : "No bookmarks yet"}
            </p>
            <p className="text-sm mt-2 mb-4">
              {hasActiveSearch
                ? "Try adjusting your search or filters"
                : "Start by adding your first bookmark!"}
            </p>
            {!hasActiveSearch && (
              <BookmarkFormButton featureType="create" variant="outline" />
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {allBookmarks.map((bookmark: IBookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={handleDelete}
              onToggleFavorite={() => handleToggleFavorite(bookmark)}
              onCopyUrl={handleCopyUrl}
            />
          ))}

          {/* Load More Trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more bookmarks...
                  </div>
                </Card>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  className="w-full max-w-sm"
                >
                  Load More Bookmarks
                </Button>
              )}
            </div>
          )}

          {/* End of List Indicator */}
          {!hasNextPage && allBookmarks.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                You've reached the end! 🎉
              </p>
            </div>
          )}
        </div>
      )}

      {/* Global Loading Indicator */}
      {isFetching && !isFetchingNextPage && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="p-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
