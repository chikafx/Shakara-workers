"use client";

import Image from "next/image";
import { useState } from "react";
import { generateAvatar } from "@/lib/avatar";
import type { RideRequest } from "@/lib/ride";

type Props = {
  incoming: RideRequest[];
  error: string | null;
  respondToRequest: (
    requestId: string,
    status: "accepted" | "declined",
  ) => Promise<void>;
};

export default function IncomingRequests({ incoming, error, respondToRequest }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (incoming.length === 0 && !error) return null;

  const handleResponse = async (
    requestId: string,
    status: "accepted" | "declined",
  ) => {
    setLoadingId(requestId);
    setActionError(null);

    try {
      await respondToRequest(requestId, status);
    } catch {
      setActionError("Could not update this ride offer. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="min-w-0 pt-4" aria-labelledby="incoming-rides-title">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="incoming-rides-title" className="text-sm font-bold text-[#765a3b]">
          Ride offers
        </h2>
        <span className="text-xs tabular-nums text-[#8a765d]">{incoming.length}</span>
      </div>

      {error && <p role="alert" className="mb-3 text-xs text-red-700">{error}</p>}
      {actionError && <p role="alert" className="mb-3 text-xs text-red-700">{actionError}</p>}

      {incoming.length > 0 && (
        <ul className="max-h-[min(36vh,300px)] divide-y divide-[#e8dfcf] overflow-y-auto border-y border-[#e8dfcf]">
          {incoming.map((request) => (
            <li key={request.id} className="flex min-w-0 items-center gap-3 py-3">
              <Image
                src={generateAvatar(request.fromUserId, 64)}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="size-10 shrink-0 rounded-full border border-[#e2d6c4] bg-white"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#4c4032]">
                  {request.fromName}
                </p>
                <p className="truncate text-xs text-[#81715f]">
                  Offering a ride to <span className="font-semibold">{request.destination}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  disabled={loadingId === request.id}
                  onClick={() => void handleResponse(request.id, "accepted")}
                  className="min-h-9 rounded-md bg-[#3c805d] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#326d4f] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d594b]"
                >
                  Accept
                </button>
                <button
                  type="button"
                  disabled={loadingId === request.id}
                  onClick={() => void handleResponse(request.id, "declined")}
                  className="min-h-9 rounded-md border border-[#d8d8ce] px-2.5 text-xs font-semibold text-[#655d52] transition-colors hover:bg-[#f3f1eb] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d594b]"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}