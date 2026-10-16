"use client";

import { usePresenceStore } from "@/store/presence";
import { industries } from "@/lib/industries";

export function useOnlineCount() {
  const counts = usePresenceStore((state) => state.counts);

  if (!industries.every((industry) => counts[industry.id] !== undefined)) {
    return null;
  }

  return Object.values(counts).reduce((total, count) => total + count, 0);
}