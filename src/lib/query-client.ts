// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors except 408 (timeout)
          if (
            error?.status >= 400 &&
            error?.status < 500 &&
            error?.status !== 408
          ) {
            return false;
          }
          return failureCount < 3;
        },
        // Reduce background refetching for bookmark data
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: "always",
      },
      mutations: {
        retry: 1, // Retry mutations once on failure
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  // Server: always make a new query client
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
