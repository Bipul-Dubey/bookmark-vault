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
import { X, Plus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { IBookmark } from "@/types";

interface BookmarkEditProps {
  bookmark?: IBookmark | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Partial<IBookmark>) => Promise<void> | void;
  availableTags?: string[];
  loading?: boolean;
}

// Predefined tags that users can quickly select
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
];

export function BookmarkEdit({
  bookmark,
  isOpen,
  onClose,
  onSave,
  availableTags = [],
  loading = false,
}: BookmarkEditProps) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    notes: "",
    tags: [] as string[],
    favorite: false,
  });
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(bookmark);

  // Initialize form data when bookmark changes
  useEffect(() => {
    if (bookmark) {
      setFormData({
        title: bookmark.title,
        url: bookmark.url,
        notes: bookmark.notes || "",
        tags: [...bookmark.tags],
        favorite: bookmark.favorite,
      });
    } else {
      // Reset form for new bookmark
      setFormData({
        title: "",
        url: "",
        notes: "",
        tags: [],
        favorite: false,
      });
    }
    setErrors({});
  }, [bookmark, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const bookmarkData = {
      ...formData,
      title: formData.title.trim(),
      url: formData.url.trim(),
      notes: formData.notes.trim(),
      updatedAt: new Date(),
    };

    try {
      await onSave(bookmarkData);
      onClose();
    } catch (error) {
      console.error("Error saving bookmark:", error);
      // TODO: Show error toast
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
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

  const getAllTags = () => {
    const allTags = [...PREDEFINED_TAGS, ...availableTags];
    return [...new Set(allTags)].sort();
  };

  const getUnusedTags = () => {
    return getAllTags().filter((tag) => !formData.tags.includes(tag));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Bookmark" : "Add New Bookmark"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your bookmark below."
              : "Add a new bookmark to your collection."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleInputChange("title")}
              placeholder="Enter bookmark title"
              className={cn(errors.title && "border-red-500")}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={handleInputChange("url")}
              placeholder="https://example.com"
              className={cn(errors.url && "border-red-500")}
              disabled={loading}
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
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
              disabled={loading}
            />
          </div>

          {/* Tags */}
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
                      disabled={loading}
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
                disabled={loading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddTag(newTag)}
                disabled={loading || !newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Tag Selection */}
            {getUnusedTags().length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Quick add:
                </Label>
                <div className="flex flex-wrap gap-1">
                  {getUnusedTags()
                    .slice(0, 10)
                    .map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleAddTag(tag)}
                        disabled={loading}
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
              <Label className="text-base">Favorite</Label>
              <p className="text-sm text-muted-foreground">
                Mark this bookmark as a favorite
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.favorite}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, favorite: checked }))
                }
                disabled={loading}
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
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Add Bookmark"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
