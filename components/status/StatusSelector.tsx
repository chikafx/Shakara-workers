"use client";

import { useState } from "react";
import {
  PLAYER_STATUSES,
  RIDE_DESTINATIONS,
  type PlayerStatus,
} from "@/lib/status";

type Props = {
  currentStatus: PlayerStatus;
  rideDestination: string | null;
  onStatusChange: (status: PlayerStatus, destination?: string | null) => void;
};

export default function StatusSelector({
  currentStatus,
  rideDestination,
  onStatusChange,
}: Props) {
  const [showDestinations, setShowDestinations] = useState(false);

  return (
    <section className="border-y border-[#d6e2d7] py-4" aria-label="Your status">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-[#34574b]">Your status</h2>
        <span className="text-xs font-medium text-[#668077]">Visible to everyone</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLAYER_STATUSES.map((status) => {
          const selected = currentStatus === status.id;
          return (
            <button
              key={status.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (status.id === "Looking for Ride") {
                  setShowDestinations(true);
                } else {
                  setShowDestinations(false);
                  onStatusChange(status.id, null);
                }
              }}
              className={`min-h-9 rounded-md border px-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d594b] ${
                selected
                  ? "border-[#34574b] bg-[#34574b] text-white"
                  : "border-[#d6e2d7] bg-[#fffdf7] text-[#476b5c] hover:bg-[#edf3e9]"
              }`}
            >
              <span
                aria-hidden="true"
                className="mr-1.5 inline-block size-2 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
            </button>
          );
        })}
      </div>

      {showDestinations && (
        <div className="mt-4 border-t border-[#dce5d8] pt-3">
          <p className="mb-2 text-xs font-semibold text-[#668077]">
            Choose your destination
          </p>
          <div className="flex flex-wrap gap-2">
            {RIDE_DESTINATIONS.map((destination) => (
              <button
                key={destination}
                type="button"
                onClick={() => {
                  onStatusChange("Looking for Ride", destination);
                  setShowDestinations(false);
                }}
                className={`min-h-8 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d594b] ${
                  rideDestination === destination
                    ? "border-[#765a83] bg-[#765a83] text-white"
                    : "border-[#e1d9e4] bg-[#faf7fb] text-[#624a6e] hover:bg-[#f1eaf3]"
                }`}
              >
                {destination}
              </button>
            ))}
          </div>
        </div>
      )}

      {currentStatus === "Looking for Ride" && rideDestination && (
        <p className="mt-3 text-xs text-[#624a6e]">
          Ride wanted to <strong>{rideDestination}</strong>
        </p>
      )}
    </section>
  );
}