"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { generateAvatar } from "@/lib/avatar";
import { industries } from "@/lib/industries";
import type { RideRequest } from "@/lib/ride";
import { usePresenceStore } from "@/store/presence";

type Props = {
  outgoing: RideRequest[];
  error: string | null;
  offerRide: (toUserId: string, toName: string, destination: string) => Promise<void>;
};

export default function RideBoard({ outgoing, error, offerRide }: Props) {
  const { user } = useAuth();
  const playersByIndustry = usePresenceStore((state) => state.playersByIndustry);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const ridePlayers = Object.entries(playersByIndustry).flatMap(
    ([industryId, players]) =>
      players
        .filter((player) => player.status === "Looking for Ride")
        .map((player) => ({
          ...player,
          industryId,
          industryName:
            industries.find((industry) => industry.id === industryId)?.shortName ??
            industryId,
        })),
  );
  const alreadyOffered = (userId: string) =>
    outgoing.some((request) => request.toUserId === userId);

  const handleOffer = async (player: (typeof ridePlayers)[number]) => {
    if (!user || player.userId === user.uid) return;
    setLoadingId(player.userId);
    setActionError(null);

    try {
      await offerRide(
        player.userId,
        player.displayName,
        player.rideDestination || "Mainland (General)",
      );
    } catch {
      setActionError("Could not send the ride offer. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="min-w-0" aria-labelledby="ride-board-title">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="ride-board-title" className="text-sm font-bold text-[#34574b]">
          Ride board
        </h2>
        <span className="text-xs tabular-nums text-[#668077]">
          {ridePlayers.length} {ridePlayers.length === 1 ? "request" : "requests"}
        </span>
      </div>

      {error && <p role="alert" className="mb-3 text-xs text-red-700">{error}</p>}
      {actionError && <p role="alert" className="mb-3 text-xs text-red-700">{actionError}</p>}

      {ridePlayers.length === 0 ? (
        <p className="border-l-2 border-[#d6e2d7] py-3 pl-3 text-sm text-[#788c80]">
          No one is looking for a ride right now.
        </p>
      ) : (
        <ul className="max-h-[min(42vh,360px)] divide-y divide-[#dce5d8] overflow-y-auto border-y border-[#dce5d8]">
          {ridePlayers.map((player) => {
            const isMe = player.userId === user?.uid;
            const destination = player.rideDestination || "Mainland (General)";

            return (
              <li
                key={`${player.industryId}-${player.userId}`}
                className={`flex min-w-0 items-center gap-3 py-3 ${isMe ? "bg-[#edf3e9] px-2" : ""}`}
              >
                <Image
                  src={generateAvatar(player.avatarSeed, 64)}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10 shrink-0 rounded-full border border-[#cbdccf] bg-white"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#28483b]">
                    {player.displayName}
                    {isMe && <span className="ml-1 text-xs font-medium text-[#668077]">You</span>}
                  </p>
                  <p className="truncate text-xs text-[#788c80]">
                    {player.industryName} <span aria-hidden="true">to</span>{" "}
                    <span className="font-semibold text-[#624a6e]">{destination}</span>
                  </p>
                </div>
                {!isMe && (
                  <button
                    type="button"
                    disabled={alreadyOffered(player.userId) || loadingId === player.userId}
                    onClick={() => void handleOffer(player)}
                    className="min-h-9 shrink-0 rounded-md border border-[#cbdccf] px-3 text-xs font-semibold text-[#34574b] transition-colors hover:bg-[#edf3e9] disabled:cursor-not-allowed disabled:border-[#dce5d8] disabled:bg-[#f2f4ef] disabled:text-[#788c80] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d594b]"
                  >
                    {loadingId === player.userId
                      ? "Sending..."
                      : alreadyOffered(player.userId)
                        ? "Offered"
                        : "Offer ride"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}