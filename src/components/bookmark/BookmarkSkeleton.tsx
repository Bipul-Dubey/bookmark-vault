import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function BookmarkListSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`container mx-auto py-6 space-y-6 max-w-4xl ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
