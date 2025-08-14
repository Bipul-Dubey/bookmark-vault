// lib/query-keys.ts
export const QUERY_KEYS = {
  bookmarks: {
    all: ["bookmarks"] as const,
    lists: () => [...QUERY_KEYS.bookmarks.all, "list"] as const,
    list: (filters?: Record<string, any>) =>
      [...QUERY_KEYS.bookmarks.lists(), { filters }] as const,
    infinite: (filters?: Record<string, any>) =>
      [...QUERY_KEYS.bookmarks.all, "infinite", { filters }] as const,
    details: () => [...QUERY_KEYS.bookmarks.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.bookmarks.details(), id] as const,
    count: (filters?: Record<string, any>) =>
      [...QUERY_KEYS.bookmarks.all, "count", { filters }] as const,
  },
  tags: {
    all: ["tags"] as const,
    user: (userId: string) => [...QUERY_KEYS.tags.all, "user", userId] as const,
    popular: (userId: string, limit?: number) =>
      [...QUERY_KEYS.tags.user(userId), "popular", { limit }] as const,
  },
  auth: {
    all: ["auth"] as const,
    user: () => [...QUERY_KEYS.auth.all, "user"] as const,
  },
} as const;

// Also export individual query key constants for backwards compatibility
export const BOOKMARKS_QUERY_KEY = "bookmarks";
