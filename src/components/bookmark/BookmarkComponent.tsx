import React from "react";
import { Card } from "../ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

export const ErrorUI = ({
  message,
  refetch,
}: {
  message: string;
  refetch: () => void;
}) => {
  return (
    <div className={`w-full mx-auto py-6`}>
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading bookmarks</h3>
        <p className="text-muted-foreground mb-4">
          {message || "Something went wrong"}
        </p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </Card>
    </div>
  );
};
