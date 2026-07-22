import { OctagonAlert, RotateCw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/axios";

export function ApiErrorAlert({
  error,
  onRetry,
  title = "Couldn't load this",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "An unexpected error occurred. Please try again.";

  return (
    <Alert variant="destructive">
      <OctagonAlert className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="shrink-0">
            <RotateCw className="size-3.5" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
