import { useQuery } from "@tanstack/react-query";
import { createInitialState, type LearnerState } from "../../features/gamification/engine";
import { fetchProgress } from "./progress";
import { queryClient } from "./modules";

export function useProgress(enabled: boolean) {
  return useQuery<LearnerState>(
    {
      queryKey: ["progress"],
      queryFn: async () => (await fetchProgress()) ?? createInitialState(),
      enabled,
      staleTime: 10_000,
    },
    queryClient
  );
}
