import { create } from "zustand";
import type { PlayerStatus } from "@/lib/status";

export type PresencePlayer = {
  userId: string;
  displayName: string;
  avatarSeed: string;
  status: PlayerStatus;
  rideDestination: string | null;
  position: { x: number; y: number; z: number } | null;
  rotationY: number;
};

type PresenceState = {
  counts: Record<string, number>;
  playersByIndustry: Record<string, PresencePlayer[]>;
  setCount: (industryId: string, count: number) => void;
  setAllCounts: (counts: Record<string, number>) => void;
  setIndustryData: (industryId: string, players: PresencePlayer[]) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  counts: {},
  playersByIndustry: {},
  setCount: (industryId, count) =>
    set((state) => ({
      counts: { ...state.counts, [industryId]: count },
    })),
  setAllCounts: (counts) => set({ counts }),
  setIndustryData: (industryId, players) =>
    set((state) => ({
      playersByIndustry: { ...state.playersByIndustry, [industryId]: players },
      counts: { ...state.counts, [industryId]: players.length },
    })),
}));
