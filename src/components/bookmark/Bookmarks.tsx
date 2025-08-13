// components/bookmarks/BookmarkList.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BookmarkCard } from "./Bookmark";
import { IBookmark } from "@/types";

interface BookmarkListProps {
  onAddBookmark?: () => void;
  onEditBookmark?: (bookmark: IBookmark) => void;
  className?: string;
}

// Dummy data moved inside the component
const DUMMY_BOOKMARKS: IBookmark[] = [
  {
    id: "1",
    title: "React Documentation - Getting Started",
    url: "https://react.dev/learn",
    notes: "Great resource for learning React fundamentals and hooks",
    tags: ["react", "documentation", "javascript", "frontend"],
    favorite: true,
    createdAt: new Date(2024, 0, 15, 10, 30),
    updatedAt: new Date(2024, 0, 20, 14, 15),
  },
  {
    id: "2",
    title: "Next.js 14 App Router Guide",
    url: "https://nextjs.org/docs/app",
    notes: "Complete guide for the new app router in Next.js 14",
    tags: ["nextjs", "documentation", "react", "fullstack"],
    favorite: false,
    createdAt: new Date(2024, 0, 10, 9, 0),
    updatedAt: new Date(2024, 0, 10, 9, 0),
  },
  {
    id: "3",
    title: "TypeScript Handbook",
    url: "https://www.typescriptlang.org/docs/",
    notes: "",
    tags: ["typescript", "documentation", "javascript"],
    favorite: true,
    createdAt: new Date(2024, 0, 5, 16, 45),
    updatedAt: new Date(2024, 0, 12, 11, 30),
  },
  {
    id: "4",
    title: "Tailwind CSS Components - Heroicons",
    url: "https://heroicons.com/",
    notes: "Beautiful SVG icons for Tailwind CSS projects",
    tags: ["tailwind", "icons", "design", "ui"],
    favorite: false,
    createdAt: new Date(2024, 0, 18, 14, 20),
    updatedAt: new Date(2024, 0, 18, 14, 20),
  },
  {
    id: "5",
    title: "Firebase Firestore Documentation",
    url: "https://firebase.google.com/docs/firestore",
    notes: "NoSQL database documentation with real-time updates",
    tags: ["firebase", "database", "backend", "google"],
    favorite: false,
    createdAt: new Date(2024, 0, 8, 13, 10),
    updatedAt: new Date(2024, 0, 16, 9, 45),
  },
  {
    id: "6",
    title: "CSS Grid Complete Guide",
    url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
    notes: "Comprehensive guide to CSS Grid layout with examples",
    tags: ["css", "grid", "layout", "frontend"],
    favorite: true,
    createdAt: new Date(2024, 0, 3, 11, 0),
    updatedAt: new Date(2024, 0, 3, 11, 0),
  },
];

export default function Bookmark({
  onAddBookmark,
  onEditBookmark,
  className = "",
}: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<IBookmark[]>(DUMMY_BOOKMARKS);
  const [filteredBookmarks, setFilteredBookmarks] =
    useState<IBookmark[]>(DUMMY_BOOKMARKS);
  const [loading, setLoading] = useState(false);

  // Future: Replace with actual API call
  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Firebase call
      // const bookmarksData = await getBookmarks()
      // setBookmarks(bookmarksData)
      // setFilteredBookmarks(bookmarksData)

      // Simulate API call
      setTimeout(() => {
        setBookmarks(DUMMY_BOOKMARKS);
        setFilteredBookmarks(DUMMY_BOOKMARKS);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredBookmarks(bookmarks);
      return;
    }

    // Client-side filtering (later can be replaced with API search)
    const filtered = bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(query.toLowerCase()) ||
        bookmark.notes?.toLowerCase().includes(query.toLowerCase()) ||
        bookmark.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );

    setFilteredBookmarks(filtered);
  };

  const handleEdit = (bookmark: IBookmark) => {
    onEditBookmark?.(bookmark);
  };

  const handleDelete = async (bookmarkId: string) => {
    try {
      // TODO: Replace with actual Firebase delete
      // await deleteBookmark(bookmarkId)

      const updated = bookmarks.filter((b) => b.id !== bookmarkId);
      setBookmarks(updated);
      setFilteredBookmarks(updated);

      // TODO: Show success toast
      console.log("Bookmark deleted:", bookmarkId);
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      // TODO: Show error toast
    }
  };

  const handleToggleFavorite = async (bookmarkId: string) => {
    try {
      const updated = bookmarks.map((bookmark) =>
        bookmark.id === bookmarkId
          ? { ...bookmark, favorite: !bookmark.favorite, updatedAt: new Date() }
          : bookmark
      );

      // TODO: Replace with actual Firebase update
      // await updateBookmark(bookmarkId, { favorite: !bookmark.favorite })

      setBookmarks(updated);
      setFilteredBookmarks(updated);

      // TODO: Show success toast
      console.log("Favorite toggled for:", bookmarkId);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // TODO: Show error toast
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // TODO: Show success toast
    console.log("URL copied:", url);
  };

  const handleAddBookmark = () => {
    onAddBookmark?.();
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-80 bg-muted animate-pulse rounded" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={`container mx-auto py-6 space-y-6 max-w-4xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookmarks</h1>
          <p className="text-muted-foreground">
            {filteredBookmarks.length} bookmark
            {filteredBookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleAddBookmark}>
          <Plus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium">No bookmarks found</p>
            <p className="text-sm mt-1">Start by adding your first bookmark!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onCopyUrl={handleCopyUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
