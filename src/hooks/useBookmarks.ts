// hooks/useBookmarks.ts
"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import {
  AdvancedFirestoreService,
  BookmarkQueryResult,
  BookmarkSearchParams,
} from "@/lib/firestore-advanced";
import { IBookmark } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { FirestoreService } from "@/lib/firestore";
import { DocumentSnapshot } from "firebase/firestore";
import { BOOKMARKS_QUERY_KEY, QUERY_KEYS } from "@/lib/query-keys";

// hooks/useBookmarks.ts
export function useBookmarksCount(searchParams: BookmarkSearchParams = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.bookmarks.count({
      userId: user?.uid,
      ...searchParams,
    }),
    queryFn: () =>
      user
        ? AdvancedFirestoreService.getBookmarksCount(user.uid, searchParams)
        : 0,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInfiniteBookmarks(searchParams: BookmarkSearchParams = {}) {
  const { user } = useAuth();
  const pageSize = 20;

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.bookmarks.infinite({
      userId: user?.uid,
      ...searchParams,
    }),
    queryFn: async ({
      pageParam,
    }: {
      pageParam: DocumentSnapshot | undefined;
    }) => {
      if (!user) throw new Error("User not authenticated");

      return AdvancedFirestoreService.searchBookmarks(user.uid, searchParams, {
        pageSize,
        lastDoc: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },
    initialPageParam: undefined as DocumentSnapshot | undefined,
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBookmarkMutations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addBookmarkMutation = useMutation({
    mutationFn: (
      bookmarkData: Omit<IBookmark, "id" | "createdAt" | "updatedAt">
    ) => {
      if (!user) throw new Error("User not authenticated");
      return FirestoreService.addBookmark(bookmarkData, user.uid);
    },
    onMutate: async (newBookmark) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });

      // Snapshot the previous value
      const previousBookmarksData = queryClient.getQueriesData({
        queryKey: [BOOKMARKS_QUERY_KEY],
      });

      // Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: [BOOKMARKS_QUERY_KEY, "infinite"] },
        (old: any) => {
          if (!old?.pages) return old;

          const optimisticBookmark: IBookmark = {
            ...newBookmark,
            id: `temp-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: user?.uid || "",
          };

          // Add to the first page at the top (since sorted by updatedAt desc)
          const newPages = [...old.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              bookmarks: [optimisticBookmark, ...newPages[0].bookmarks],
            };
          }

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      // Update count queries
      queryClient.setQueriesData(
        { queryKey: [BOOKMARKS_QUERY_KEY, "count"] },
        (old: number = 0) => old + 1
      );

      return { previousBookmarksData };
    },
    onError: (err, newBookmark, context) => {
      // Revert optimistic updates on error
      if (context?.previousBookmarksData) {
        context.previousBookmarksData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to add bookmark");
    },
    onSuccess: (savedBookmark) => {
      // Replace optimistic update with real data
      queryClient.setQueriesData(
        { queryKey: [BOOKMARKS_QUERY_KEY, "infinite"] },
        (old: any) => {
          if (!old?.pages) return old;

          const newPages = old.pages.map((page: any) => ({
            ...page,
            bookmarks: page.bookmarks.map((bookmark: IBookmark) =>
              bookmark.id.startsWith("temp-") ? savedBookmark : bookmark
            ),
          }));

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      toast.success("Bookmark added successfully!");
    },
    onSettled: () => {
      // Always refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });
    },
  });

  const updateBookmarkMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<IBookmark>;
    }) => {
      if (!user) throw new Error("User not authenticated");
      return FirestoreService.updateBookmark(id, updates, user.uid);
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });

      const previousData = queryClient.getQueriesData({
        queryKey: [BOOKMARKS_QUERY_KEY],
      });

      // Optimistically update the bookmark
      queryClient.setQueriesData(
        { queryKey: [BOOKMARKS_QUERY_KEY, "infinite"] },
        (old: any) => {
          if (!old?.pages) return old;

          const updatedBookmark = {
            ...updates,
            updatedAt: new Date(),
          };

          const newPages = old.pages.map((page: any) => ({
            ...page,
            bookmarks: page.bookmarks.map((bookmark: IBookmark) =>
              bookmark.id === id
                ? { ...bookmark, ...updatedBookmark }
                : bookmark
            ),
          }));

          // Re-sort the first page to put updated bookmark at top
          if (newPages[0]) {
            newPages[0].bookmarks.sort(
              (a: IBookmark, b: IBookmark) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
          }

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update bookmark");
    },
    onSuccess: () => {
      toast.success("Bookmark updated successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error("User not authenticated");
      return FirestoreService.deleteBookmark(id, user.uid);
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });

      const previousData = queryClient.getQueriesData({
        queryKey: [BOOKMARKS_QUERY_KEY],
      });

      // Optimistically remove the bookmark
      queryClient.setQueriesData(
        { queryKey: [BOOKMARKS_QUERY_KEY, "infinite"] },
        (old: any) => {
          if (!old?.pages) return old;

          const newPages = old.pages.map((page: any) => ({
            ...page,
            bookmarks: page.bookmarks.filter(
              (bookmark: IBookmark) => bookmark.id !== deletedId
            ),
          }));

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      // Update count
      queryClient.setQueriesData(
        { queryKey: [BOOKMARKS_QUERY_KEY, "count"] },
        (old: number = 0) => Math.max(0, old - 1)
      );

      return { previousData };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to delete bookmark");
    },
    onSuccess: () => {
      toast.success("Bookmark deleted successfully!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] });
    },
  });

  return {
    addBookmark: addBookmarkMutation.mutateAsync,
    updateBookmark: updateBookmarkMutation.mutateAsync,
    deleteBookmark: deleteBookmarkMutation.mutateAsync,
    isAdding: addBookmarkMutation.isPending,
    isUpdating: updateBookmarkMutation.isPending,
    isDeleting: deleteBookmarkMutation.isPending,
  };
}
