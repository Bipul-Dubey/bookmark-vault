// components/bookmarks/BookmarkFormButton.tsx
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
import {
  X,
  Plus,
  Heart,
  Loader2,
  Check,
  Tag,
  Globe,
  Edit,
  Save,
} from "lucide-react";
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

interface BookmarkFormButtonProps {
  featureType: "create" | "edit";
  bookmark?: IBookmark; // For edit mode
  className?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  availableTags?: string[];
  // Optional custom trigger content
  children?: React.ReactNode;
}

export function BookmarkFormButton({
  featureType,
  bookmark,
  className,
  variant = "default",
  size = "default",
  availableTags = [],
  children,
}: BookmarkFormButtonProps) {
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

  const { addBookmark, updateBookmark, isAdding, isUpdating } =
    useBookmarkMutations();
  const queryClient = useQueryClient();

  // Determine operation states
  const isCreateMode = featureType === "create";
  const isEditMode = featureType === "edit";
  const isLoading = isAdding || isUpdating;

  // Reset/populate form when modal opens/closes or bookmark changes
  useEffect(() => {
    if (isModalOpen) {
      if (isEditMode && bookmark) {
        // Pre-populate form with bookmark data for editing
        setFormData({
          title: bookmark.title,
          url: bookmark.url,
          notes: bookmark.notes || "",
          tags: [...bookmark.tags],
          favorite: bookmark.favorite,
        });
      } else {
        // Reset form for creating new bookmark
        setFormData({
          title: "",
          url: "",
          notes: "",
          tags: [],
          favorite: false,
        });
      }
      setErrors({});
      setNewTag("");
    }
  }, [isModalOpen, bookmark, isEditMode]);

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
      return [...new Set([...allTags, ...availableTags])].sort();
    } catch {
      return availableTags;
    }
  };

  // Auto-extract title from URL when URL is provided (only for create mode)
  const extractTitleFromUrl = async (url: string) => {
    if (!url.trim() || formData.title.trim() || isEditMode) return;

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

      // Auto-extract title when URL changes (only for create mode)
      if (field === "url" && value && isCreateMode) {
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

    try {
      if (isEditMode && bookmark) {
        // Update existing bookmark
        const updates: Partial<IBookmark> = {
          title: formData.title.trim(),
          url: formData.url.trim(),
          notes: formData.notes.trim(),
          tags: formData.tags,
          favorite: formData.favorite,
        };

        await updateBookmark({ id: bookmark.id, updates });
      } else {
        // Create new bookmark
        const bookmarkData: Omit<IBookmark, "id" | "createdAt" | "updatedAt"> =
          {
            title: formData.title.trim(),
            url: formData.url.trim(),
            notes: formData.notes.trim(),
            tags: formData.tags,
            favorite: formData.favorite,
            userId: "", // This will be set by the service
          };

        await addBookmark(bookmarkData);
      }

      setIsModalOpen(false);

      // Force refresh of all bookmark queries
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "saving"} bookmark:`,
        error
      );
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

  // Check if form has changes (for edit mode)
  const hasChanges =
    isEditMode && bookmark
      ? formData.title !== bookmark.title ||
        formData.url !== bookmark.url ||
        formData.notes !== (bookmark.notes || "") ||
        JSON.stringify(formData.tags.sort()) !==
          JSON.stringify([...bookmark.tags].sort()) ||
        formData.favorite !== bookmark.favorite
      : true;

  // Render trigger button
  const renderTriggerButton = () => {
    if (children) {
      return (
        <div onClick={() => setIsModalOpen(true)} className={className}>
          {children}
        </div>
      );
    }

    return (
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={className}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isEditMode ? (
          <Edit className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isEditMode ? null : isLoading ? "Saving..." : "Add Bookmark"}
      </Button>
    );
  };

  return (
    <>
      {renderTriggerButton()}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit className="h-5 w-5" />
                  Edit Bookmark
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add New Bookmark
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update your bookmark details below."
                : "Save a new bookmark to your collection with tags and notes."}
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
                  disabled={isLoading}
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
                disabled={isLoading || isExtractingTitle}
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
                disabled={isLoading}
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
                        disabled={isLoading}
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
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddTag(newTag)}
                  disabled={isLoading || !newTag.trim()}
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
                          disabled={isLoading}
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
                <Label className="text-base">
                  {isEditMode ? "Favorite" : "Add to Favorites"}
                </Label>
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
                  disabled={isLoading}
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

            {/* Edit Mode: Show changes indicator */}
            {isEditMode && (
              <div className="text-xs text-muted-foreground">
                {hasChanges
                  ? "• You have unsaved changes"
                  : "• No changes made"}
              </div>
            )}
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading || isExtractingTitle || (isEditMode && !hasChanges)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Bookmark
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bookmark
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
