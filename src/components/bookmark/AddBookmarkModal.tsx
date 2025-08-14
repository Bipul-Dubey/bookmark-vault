// components/bookmarks/AddBookmarkButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Plus, Heart, Loader2, Check, Tag, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { IBookmark } from "@/types";
import { useBookmarkMutations } from "@/hooks/useBookmarks";
import { useQueryClient } from "@tanstack/react-query";

interface BookmarkFormData {
  title: string;
  url: string;
  notes: string;
  tags: string[];
  favorite: boolean;
}

// Predefined tags for quick selection
const PREDEFINED_TAGS = [
  "documentation",
  "tutorial",
  "tools",
  "inspiration",
  "reference",
  "article",
  "video",
  "course",
  "framework",
  "library",
  "design",
  "development",
  "productivity",
  "news",
  "blog",
  "resource",
  "github",
  "api",
  "css",
  "javascript",
  "react",
  "nextjs",
  "typescript",
  "firebase",
];

interface AddBookmarkButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function AddBookmarkButton({
  className,
  variant = "default",
  size = "default",
}: AddBookmarkButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BookmarkFormData>({
    title: "",
    url: "",
    notes: "",
    tags: [],
    favorite: false,
  });
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Partial<BookmarkFormData>>({});
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [isExtractingTitle, setIsExtractingTitle] = useState(false);

  const { addBookmark, isAdding } = useBookmarkMutations();
  const queryClient = useQueryClient();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        title: "",
        url: "",
        notes: "",
        tags: [],
        favorite: false,
      });
      setErrors({});
      setNewTag("");
    }
  }, [isModalOpen]);

  // Get available tags from cache
  const getAvailableTags = () => {
    try {
      const queryData = queryClient.getQueriesData({ queryKey: ["bookmarks"] });
      const allBookmarks = queryData.flatMap(([, data]: [any, any]) => {
        if (data?.pages) {
          return data.pages.flatMap((page: any) => page.bookmarks || []);
        }
        return [];
      });

      const allTags = allBookmarks.flatMap(
        (bookmark: IBookmark) => bookmark.tags || []
      );
      return [...new Set(allTags)].sort();
    } catch {
      return [];
    }
  };

  // Auto-extract title from URL when URL is provided
  const extractTitleFromUrl = async (url: string) => {
    if (!url.trim() || formData.title.trim()) return;

    setIsExtractingTitle(true);
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace("www.", "");
      const path = urlObj.pathname;

      let extractedTitle = domain;
      if (path && path !== "/") {
        const pathParts = path.split("/").filter(Boolean);
        if (pathParts.length > 0) {
          extractedTitle +=
            " - " + pathParts[pathParts.length - 1].replace(/[-_]/g, " ");
        }
      }

      setFormData((prev) => ({
        ...prev,
        title: extractedTitle.charAt(0).toUpperCase() + extractedTitle.slice(1),
      }));
    } catch (error) {
      // Invalid URL, ignore
    } finally {
      setIsExtractingTitle(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BookmarkFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof BookmarkFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }

      // Auto-extract title when URL changes
      if (field === "url" && value) {
        setTimeout(() => {
          extractTitleFromUrl(value);
        }, 1000);
      }
    };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
    }
    setNewTag("");
    setIsTagPopoverOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      handleAddTag(newTag);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const bookmarkData: Omit<IBookmark, "id" | "createdAt" | "updatedAt"> = {
      title: formData.title.trim(),
      url: formData.url.trim(),
      notes: formData.notes.trim(),
      tags: formData.tags,
      favorite: formData.favorite,
      userId: "", // This will be set by the service
    };

    try {
      await addBookmark(bookmarkData);
      setIsModalOpen(false);

      // Force refresh of all bookmark queries to show new bookmark at top
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  const getAllTags = () => {
    const availableTags = getAvailableTags();
    const allTags = [...PREDEFINED_TAGS, ...availableTags];
    return [...new Set(allTags)].sort();
  };

  const getUnusedTags = () => {
    return getAllTags().filter((tag) => !formData.tags.includes(tag));
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={className}
        disabled={isAdding}
      >
        {isAdding ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Add Bookmark
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Bookmark
            </DialogTitle>
            <DialogDescription>
              Save a new bookmark to your collection with tags and notes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                URL *
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={handleInputChange("url")}
                  placeholder="https://example.com"
                  className={cn(errors.url && "border-red-500")}
                  disabled={isAdding}
                />
                {isExtractingTitle && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {errors.url && (
                <p className="text-sm text-red-500">{errors.url}</p>
              )}
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleInputChange("title")}
                placeholder="Enter bookmark title"
                className={cn(errors.title && "border-red-500")}
                disabled={isAdding || isExtractingTitle}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange("notes")}
                placeholder="Add any notes about this bookmark..."
                rows={3}
                disabled={isAdding}
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-3">
              <Label>Tags</Label>

              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-sm px-3 py-1 flex items-center gap-1"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isAdding}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                  disabled={isAdding}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddTag(newTag)}
                  disabled={isAdding || !newTag.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Tag Selection */}
              {getUnusedTags().length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Quick add:
                    </Label>
                    <Popover
                      open={isTagPopoverOpen}
                      onOpenChange={setIsTagPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7">
                          <Tag className="h-3 w-3 mr-1" />
                          Browse all
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" align="end">
                        <Command>
                          <CommandInput placeholder="Search tags..." />
                          <CommandList>
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup>
                              {getUnusedTags().map((tag) => (
                                <CommandItem
                                  key={tag}
                                  value={tag}
                                  onSelect={() => handleAddTag(tag)}
                                  className="cursor-pointer"
                                >
                                  <Check className="mr-2 h-4 w-4 opacity-0" />
                                  {tag}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getUnusedTags()
                      .slice(0, 12)
                      .map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleAddTag(tag)}
                          disabled={isAdding}
                        >
                          {tag}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Favorite Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Add to Favorites</Label>
                <p className="text-sm text-muted-foreground">
                  Mark this bookmark as a favorite for quick access
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.favorite}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, favorite: checked }))
                  }
                  disabled={isAdding}
                />
                <Heart
                  className={cn(
                    "h-4 w-4",
                    formData.favorite
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  )}
                />
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isAdding}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isAdding || isExtractingTitle}
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bookmark
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
