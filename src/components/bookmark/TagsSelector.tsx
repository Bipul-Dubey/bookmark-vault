"use client";

import { useState, useRef } from "react";
import { X, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Input } from "../ui/input";

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

export default function TagSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !value.includes(t)) {
      onChange([...value, t]);
    }
    setInputValue("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredTags = PREDEFINED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag)
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag}
            <X
              size={14}
              className="cursor-pointer hover:text-destructive"
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            onClick={() => {
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            <Input
              ref={inputRef}
              className="w-full outline-none bg-transparent text-sm"
              placeholder="Type to search or add..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setOpen(true);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
          sideOffset={4}
        >
          <Command>
            <CommandInput
              placeholder="Search tags..."
              value={inputValue}
              onValueChange={setInputValue}
            />
            {/* Scrollable suggestion list */}
            <CommandList
              className="max-h-60 overflow-y-auto"
              onWheel={(e) => e.stopPropagation()} // allow wheel scrolling
            >
              <CommandEmpty>
                {inputValue ? (
                  <div
                    className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-muted"
                    onClick={() => addTag(inputValue)}
                  >
                    <Plus size={14} /> Add “{inputValue}”
                  </div>
                ) : (
                  "No tags found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag}
                    value={tag}
                    onSelect={() => addTag(tag)}
                  >
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
