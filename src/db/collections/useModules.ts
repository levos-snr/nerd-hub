import { useQuery } from "@tanstack/react-query";
import { normalizeModule } from "../../features/curriculum/normalizeModule";
import type { Module } from "../../features/curriculum/types";
import { queryClient } from "./modules";

async function fetchModules(): Promise<Module[]> {
  const response = await fetch("/api/modules");
  if (!response.ok) throw new Error("Failed to load modules");
  const data = (await response.json()) as { modules: Module[] };
  return data.modules.map((m) => normalizeModule(m));
}

/** TanStack Query-backed module loader (synced with TanStack DB collection query key). */
export function useModules() {
  return useQuery(
    {
      queryKey: ["modules"],
      queryFn: fetchModules,
      staleTime: 30_000,
    },
    queryClient
  );
}

export { fetchModules };
