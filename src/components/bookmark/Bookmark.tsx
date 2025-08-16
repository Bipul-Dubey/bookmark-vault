// components/bookmarks/BookmarkCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ExternalLink,
  Heart,
  MoreHorizontal,
  Trash2,
  Copy,
  Calendar,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { IBookmark } from "@/types";
import { BookmarkFormButton } from "./BookmarkFormButton";
import Image from "next/image";

interface BookmarkCardProps {
  bookmark: IBookmark;
  onDelete?: (bookmarkId: string) => void;
  onToggleFavorite?: (bookmarkId: string) => void;
  onCopyUrl?: (url: string) => void;
}

export function BookmarkCard({
  bookmark,
  onDelete,
  onToggleFavorite,
  onCopyUrl,
}: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false);

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url);
    onCopyUrl?.(bookmark.url);
  };

  const handleOpenUrl = () => {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="group py-0 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left side - Favicon and content */}
          <div className="flex gap-3 flex-1 min-w-0">
            {/* Favicon */}
            <div className="flex-shrink-0 mt-1">
              {!imageError && getFaviconUrl(bookmark.url) ? (
                <Image
                  src={getFaviconUrl(bookmark.url)!}
                  loader={() => getFaviconUrl(bookmark.url)!}
                  alt=""
                  className="w-6 h-6 rounded-sm"
                  onError={() => setImageError(true)}
                  width={30}
                  height={30}
                />
              ) : (
                <div className="w-4 h-4 rounded-sm bg-muted flex items-center justify-center">
                  <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and URL */}
              <div className="space-y-1">
                <h3
                  className="font-medium text-sm line-clamp-2 group-hover:text-primary cursor-pointer hover:underline"
                  onClick={handleOpenUrl}
                >
                  {bookmark.title}
                </h3>
                <p
                  className="text-xs text-muted-foreground truncate cursor-pointer"
                  onClick={handleOpenUrl}
                >
                  {getDomainFromUrl(bookmark.url)}
                </p>
              </div>

              {/* Notes */}
              {bookmark.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {bookmark.notes}
                </p>
              )}

              {/* Tags */}
              {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {bookmark.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 h-5"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {bookmark.tags.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 h-5"
                    >
                      +{bookmark.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  {bookmark.createdAt.getTime() !== bookmark.updatedAt.getTime()
                    ? `Updated ${formatDate(bookmark.updatedAt)}`
                    : `Added ${formatDate(bookmark.createdAt)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Favorite button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onToggleFavorite?.(bookmark.id)}
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5",
                  bookmark.favorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-500"
                )}
              />
            </Button>

            <Button
              variant={"ghost"}
              size={"icon"}
              onClick={handleOpenUrl}
              className="h-7 w-7 p-0"
            >
              <ExternalLink />
            </Button>

            <BookmarkFormButton
              featureType="edit"
              variant="ghost"
              bookmark={bookmark}
              size="icon"
              className="h-7 w-7 p-0"
            />

            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(bookmark.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
