// lib/firestore.ts
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { IBookmark } from "@/types";

const BOOKMARKS_COLLECTION = "bookmarks";

export class FirestoreService {
  // Add a new bookmark
  static async addBookmark(
    bookmark: Omit<IBookmark, "id" | "createdAt" | "updatedAt">,
    userId: string
  ): Promise<IBookmark> {
    try {
      const bookmarkData = {
        ...bookmark,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, BOOKMARKS_COLLECTION),
        bookmarkData
      );

      return {
        id: docRef.id,
        ...bookmark,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IBookmark;
    } catch (error) {
      console.error("Error adding bookmark:", error);
      throw new Error("Failed to save bookmark");
    }
  }

  // Update an existing bookmark
  static async updateBookmark(
    bookmarkId: string,
    updates: Partial<IBookmark>,
    userId: string
  ): Promise<void> {
    try {
      const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, bookmarkId);

      // Verify ownership
      const bookmarkDoc = await getDoc(bookmarkRef);
      if (!bookmarkDoc.exists() || bookmarkDoc.data().userId !== userId) {
        throw new Error("Bookmark not found or access denied");
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(bookmarkRef, updateData);
    } catch (error) {
      console.error("Error updating bookmark:", error);
      throw new Error("Failed to update bookmark");
    }
  }

  // Delete a bookmark
  static async deleteBookmark(
    bookmarkId: string,
    userId: string
  ): Promise<void> {
    try {
      const bookmarkRef = doc(db, BOOKMARKS_COLLECTION, bookmarkId);

      // Verify ownership
      const bookmarkDoc = await getDoc(bookmarkRef);
      if (!bookmarkDoc.exists() || bookmarkDoc.data().userId !== userId) {
        throw new Error("Bookmark not found or access denied");
      }

      await deleteDoc(bookmarkRef);
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      throw new Error("Failed to delete bookmark");
    }
  }

  // Get all bookmarks for a user
  static async getBookmarks(userId: string): Promise<IBookmark[]> {
    try {
      const bookmarksRef = collection(db, BOOKMARKS_COLLECTION);
      const q = query(
        bookmarksRef,
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as IBookmark;
      });
    } catch (error) {
      console.error("Error getting bookmarks:", error);
      throw new Error("Failed to load bookmarks");
    }
  }

  // Subscribe to real-time updates
  static subscribeToBookmarks(
    userId: string,
    callback: (bookmarks: IBookmark[]) => void
  ) {
    const bookmarksRef = collection(db, BOOKMARKS_COLLECTION);
    const q = query(
      bookmarksRef,
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(
      q,
      (querySnapshot) => {
        const bookmarks = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as IBookmark;
        });

        callback(bookmarks);
      },
      (error) => {
        console.error("Error listening to bookmarks:", error);
      }
    );
  }

  // Search bookmarks (client-side filtering)
  static async searchBookmarks(
    userId: string,
    searchQuery: string
  ): Promise<IBookmark[]> {
    try {
      const bookmarks = await this.getBookmarks(userId);

      const searchLower = searchQuery.toLowerCase();

      return bookmarks.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(searchLower) ||
          bookmark.url.toLowerCase().includes(searchLower) ||
          bookmark.notes?.toLowerCase().includes(searchLower) ||
          bookmark.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error("Error searching bookmarks:", error);
      throw new Error("Failed to search bookmarks");
    }
  }

  // Get bookmarks by tag
  static async getBookmarksByTag(
    userId: string,
    tag: string
  ): Promise<IBookmark[]> {
    try {
      const bookmarksRef = collection(db, BOOKMARKS_COLLECTION);
      const q = query(
        bookmarksRef,
        where("userId", "==", userId),
        where("tags", "array-contains", tag),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as IBookmark;
      });
    } catch (error) {
      console.error("Error getting bookmarks by tag:", error);
      throw new Error("Failed to load bookmarks by tag");
    }
  }

  // Get all unique tags for a user
  static async getUserTags(userId: string): Promise<string[]> {
    try {
      const bookmarks = await this.getBookmarks(userId);
      const allTags = bookmarks.flatMap((bookmark) => bookmark.tags);
      return [...new Set(allTags)].sort();
    } catch (error) {
      console.error("Error getting user tags:", error);
      throw new Error("Failed to load tags");
    }
  }

  // Get popular tags with counts
  static async getPopularTags(
    userId: string,
    limitCount: number = 10
  ): Promise<Array<{ tag: string; count: number }>> {
    try {
      const bookmarks = await this.getBookmarks(userId);
      const tagCounts: Record<string, number> = {};

      bookmarks.forEach((bookmark) => {
        bookmark.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting popular tags:", error);
      throw new Error("Failed to load popular tags");
    }
  }
}
