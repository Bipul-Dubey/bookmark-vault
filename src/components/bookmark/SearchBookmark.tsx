// components/bookmarks/BookmarkSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export default function SearchBookmark({
  onSearch,
  placeholder = "Search bookmarks by title, URL, or tags...",
  className,
  debounceMs = 300,
}: BookmarkSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, debounceMs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>

      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleSearchChange}
        className="pl-10"
      />
    </div>
  );
}
