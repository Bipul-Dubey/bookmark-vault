// lib/firestore-advanced.ts
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getCountFromServer,
  DocumentSnapshot,
  QueryConstraint,
  or,
  and,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IBookmark } from "@/types";

// lib/firestore-advanced.ts
export interface BookmarkSearchParams {
  query?: string; // General search across title, url, notes, tags
  favorite?: boolean; // Boolean filter for favorites
}

// Separate interface for advanced/specific field searches (if needed later)
export interface AdvancedBookmarkSearchParams extends BookmarkSearchParams {
  title?: string; // Specific title search
  url?: string; // Specific URL search
  notes?: string; // Specific notes search
  tags?: string[]; // Specific tag filtering
}

export interface PaginationParams {
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
}

export interface BookmarkQueryResult {
  bookmarks: IBookmark[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  totalMatches: number;
}

export class AdvancedFirestoreService {
  // Simplified server-side search focused on the two main search types
  static async searchBookmarks(
    userId: string,
    searchParams: BookmarkSearchParams = {},
    paginationParams: PaginationParams = {}
  ): Promise<BookmarkQueryResult> {
    try {
      const { pageSize = 20, lastDoc } = paginationParams;

      // Build base query constraints
      const constraints: QueryConstraint[] = [where("userId", "==", userId)];

      // Apply favorite filter at database level (has index)
      if (searchParams.favorite !== undefined) {
        constraints.push(where("favorite", "==", searchParams.favorite));
      }

      // Always order by updatedAt for consistent pagination
      constraints.push(orderBy("updatedAt", "desc"));

      // For text search, fetch more documents to account for client-side filtering
      const fetchSize = searchParams.query ? pageSize * 2 : pageSize;
      constraints.push(limit(fetchSize));

      // Add pagination cursor
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const bookmarksQuery = query(collection(db, "bookmarks"), ...constraints);
      const querySnapshot = await getDocs(bookmarksQuery);

      let bookmarks = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as IBookmark;
      });

      // Apply client-side text search across all searchable fields
      if (searchParams.query && searchParams.query.trim()) {
        bookmarks = this.filterBookmarksByQuery(bookmarks, searchParams.query);
      }

      // Take only requested page size after filtering
      const paginatedBookmarks = bookmarks.slice(0, pageSize);

      const hasMore =
        bookmarks.length === pageSize ||
        (querySnapshot.docs.length === fetchSize &&
          bookmarks.length >= pageSize);

      const lastDocument =
        querySnapshot.docs.length > 0
          ? querySnapshot.docs[querySnapshot.docs.length - 1]
          : null;

      return {
        bookmarks: paginatedBookmarks,
        lastDoc: lastDocument,
        hasMore,
        totalMatches: bookmarks.length,
      };
    } catch (error) {
      console.error("Error searching bookmarks:", error);
      throw new Error("Failed to search bookmarks");
    }
  }

  // Client-side filtering for general query search
  private static filterBookmarksByQuery(
    bookmarks: IBookmark[],
    query: string
  ): IBookmark[] {
    const searchLower = query.toLowerCase().trim();

    return bookmarks.filter((bookmark) => {
      // Search across title, url, notes, and tags
      const titleMatch = bookmark.title.toLowerCase().includes(searchLower);
      const urlMatch = bookmark.url.toLowerCase().includes(searchLower);
      const notesMatch =
        bookmark.notes?.toLowerCase().includes(searchLower) || false;
      const tagsMatch = bookmark.tags.some((tag) =>
        tag.toLowerCase().includes(searchLower)
      );

      return titleMatch || urlMatch || notesMatch || tagsMatch;
    });
  }

  // Get count with simplified parameters
  static async getBookmarksCount(
    userId: string,
    searchParams: BookmarkSearchParams = {}
  ): Promise<number> {
    try {
      const constraints: QueryConstraint[] = [where("userId", "==", userId)];

      // Apply favorite filter for server-side counting
      if (searchParams.favorite !== undefined) {
        constraints.push(where("favorite", "==", searchParams.favorite));
      }

      const bookmarksQuery = query(collection(db, "bookmarks"), ...constraints);

      // If there's a text query, we need to fetch all docs and count matches
      if (searchParams.query && searchParams.query.trim()) {
        const querySnapshot = await getDocs(bookmarksQuery);
        const bookmarks = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as IBookmark)
        );

        const filteredBookmarks = this.filterBookmarksByQuery(
          bookmarks,
          searchParams.query
        );
        return filteredBookmarks.length;
      }

      // For non-text searches, use efficient server-side counting
      const countSnapshot = await getCountFromServer(bookmarksQuery);
      return countSnapshot.data().count;
    } catch (error) {
      console.error("Error getting bookmarks count:", error);
      throw new Error("Failed to get bookmarks count");
    }
  }
}
