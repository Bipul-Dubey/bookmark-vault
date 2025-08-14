// components/profile/TagAnalytics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

interface TagInfo {
  tag: string;
  count: number;
}

interface TagAnalyticsProps {
  topTags: TagInfo[];
  isLoading: boolean;
  error: Error | null;
}

export function TagAnalytics({ topTags, isLoading, error }: TagAnalyticsProps) {
  if (isLoading || error || topTags.length === 0) {
    return null;
  }

  // Group tags by usage frequency for better visualization
  const getTagSizeClass = (count: number, maxCount: number) => {
    const percentage = (count / maxCount) * 100;
    if (percentage >= 80) return "text-base font-semibold";
    if (percentage >= 60) return "text-sm font-medium";
    if (percentage >= 40) return "text-sm";
    return "text-xs";
  };

  const maxCount = Math.max(...topTags.map((t) => t.count));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Your Most Used Tags
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top Tags Cloud */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Most Popular Tags
            </h3>

            {/* Top 5 Tags - Larger Display */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {topTags.slice(0, 4).map((tagInfo, index) => (
                  <div
                    key={tagInfo.tag}
                    className={`p-3 rounded-lg border ${
                      index === 0
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium truncate ${
                          index === 0 ? "text-primary" : ""
                        }`}
                      >
                        #{tagInfo.tag}
                      </span>
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {tagInfo.count}
                      </Badge>
                    </div>
                    {index === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Most used tag
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Remaining Tags - Compact Display */}
            {topTags.length > 4 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Other tags:</p>
                <div className="flex flex-wrap gap-2">
                  {topTags.slice(4, 15).map((tagInfo) => (
                    <Badge
                      key={tagInfo.tag}
                      variant="secondary"
                      className={`${getTagSizeClass(
                        tagInfo.count,
                        maxCount
                      )} flex items-center gap-1`}
                    >
                      {tagInfo.tag}
                      <span className="text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded-full">
                        {tagInfo.count}
                      </span>
                    </Badge>
                  ))}

                  {topTags.length > 15 && (
                    <Badge variant="outline" className="text-xs">
                      +{topTags.length - 15} more tags
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tag Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Tag Distribution
            </h3>

            <div className="space-y-4">
              {/* Tag Usage Chart (Visual representation) */}
              <div className="space-y-3">
                {topTags.slice(0, 8).map((tagInfo, index) => {
                  const percentage = (tagInfo.count / maxCount) * 100;
                  return (
                    <div key={tagInfo.tag} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate font-medium">
                          {tagInfo.tag}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {tagInfo.count}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === 0
                              ? "bg-primary"
                              : index === 1
                              ? "bg-blue-500"
                              : index === 2
                              ? "bg-green-500"
                              : "bg-muted-foreground/60"
                          }`}
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Stats */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total unique tags:</span>
                  <span className="font-medium">{topTags.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Most used tag:</span>
                  <span className="font-medium">
                    {topTags[0]?.tag} ({topTags[0]?.count}×)
                  </span>
                </div>
                {topTags.length > 1 && (
                  <div className="flex justify-between text-sm">
                    <span>Usage range:</span>
                    <span className="font-medium">
                      {topTags[topTags.length - 1]?.count} - {topTags[0]?.count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
