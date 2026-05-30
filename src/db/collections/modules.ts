import { QueryClient } from "@tanstack/react-query";
import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { Module } from "../../features/curriculum/types";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

async function fetchModules(): Promise<Module[]> {
  const response = await fetch("/api/modules");
  if (!response.ok) throw new Error("Failed to load modules");
  const data = (await response.json()) as { modules: Module[] };
  return data.modules;
}

/** TanStack DB collection with TanStack Query persistence sync to `/api/modules`. */
export const moduleCollection = createCollection(
  queryCollectionOptions({
    queryClient,
    queryKey: ["modules"],
    queryFn: fetchModules,
    getKey: (item) => item.id,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any
);
