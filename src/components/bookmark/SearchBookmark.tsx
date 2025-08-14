"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkSearchParams } from "@/lib/firestore-advanced";
import { debounce } from "lodash";

interface SearchBookmarkProps {
  onSearch: (params: BookmarkSearchParams) => void;
  className?: string;
}

export default function SearchBookmark({
  onSearch,
  className,
}: SearchBookmarkProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [favoriteOnly, setFavoriteOnly] = useState(
    searchParams.get("favorites") === "true"
  );

  const updateUrlParams = useCallback(
    (newQuery: string, newFavoriteOnly: boolean) => {
      const params = new URLSearchParams(searchParams);

      if (newQuery.trim()) {
        params.set("q", newQuery.trim());
      } else {
        params.delete("q");
      }

      if (newFavoriteOnly) {
        params.set("favorites", "true");
      } else {
        params.delete("favorites");
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${window.location.pathname}${newUrl}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Stable debounced search function
  const debouncedSearch = useCallback(
    debounce((q: string, fav: boolean) => {
      const params: BookmarkSearchParams = {};
      if (q.trim()) params.query = q.trim();
      if (fav) params.favorite = true;

      onSearch(params);
      updateUrlParams(q, fav);
    }, 500),
    [onSearch, updateUrlParams]
  );

  // Trigger search on input changes (debounced)
  useEffect(() => {
    debouncedSearch(query, favoriteOnly);
    return debouncedSearch.cancel; // Cleanup
  }, [query, favoriteOnly, debouncedSearch]);

  // Load from URL once
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    const urlFavorites = searchParams.get("favorites") === "true";
    setQuery(urlQuery);
    setFavoriteOnly(urlFavorites);

    if (urlQuery || urlFavorites) {
      const initialParams: BookmarkSearchParams = {};
      if (urlQuery) initialParams.query = urlQuery;
      if (urlFavorites) initialParams.favorite = true;
      onSearch(initialParams);
    }
  }, []); // mount only

  const handleClear = () => {
    setQuery("");
    setFavoriteOnly(false);
    router.replace(window.location.pathname, { scroll: false });
  };

  const hasActiveFilters = query.length > 0 || favoriteOnly;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 space-y-4">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search across title, URL, notes, and tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="px-3 shrink-0"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="favorites"
              checked={favoriteOnly}
              onCheckedChange={setFavoriteOnly}
            />
            <Label
              htmlFor="favorites"
              className="text-sm flex items-center gap-1"
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5",
                  favoriteOnly
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                )}
              />
              Favorites only
            </Label>
          </div>

          {hasActiveFilters && (
            <div className="text-xs text-muted-foreground">
              {query && `"${query}"`}
              {query && favoriteOnly && " • "}
              {favoriteOnly && "Favorites"}
            </div>
          )}
        </div>

        {!hasActiveFilters && (
          <div className="text-xs text-muted-foreground">
            💡 Search works across all fields: titles, URLs, notes, and tags
          </div>
        )}
      </CardContent>
    </Card>
  );
}
