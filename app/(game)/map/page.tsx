"use client";

import { useState } from "react";
import BuildingInterior from "@/components/building/BuildingInterior";
import IncomingRequests from "@/components/ride/IncomingRequests";
import RideBoard from "@/components/ride/RideBoard";
import StatusSelector from "@/components/status/StatusSelector";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { companies } from "@/lib/companies";
import { industries } from "@/lib/industries";
import type { PlayerStatus } from "@/lib/status";
import { usePresence } from "@/hooks/usePresence";
import { useRideRequests } from "@/hooks/useRideRequests";
import { usePresenceStore } from "@/store/presence";
import { LogOut } from "lucide-react";
import dynamic from "next/dynamic";

const IslandMap = dynamic(() => import("@/components/map/IslandMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[min(70vh,760px)] min-h-[520px] w-full items-center justify-center rounded-xl border border-[#acd2c7] bg-[#dcebe2] text-sm font-medium text-[#567168]"
      role="status"
    >
      Loading map...
    </div>
  ),
});

function MapContent() {
  const { user, logout } = useAuth();
  const [currentIndustryId, setCurrentIndustryId] = useState<string | null>("coworking");
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [view, setView] = useState<"map" | "building">("map");
  const [status, setStatus] = useState<PlayerStatus>("Working");
  const [rideDestination, setRideDestination] = useState<string | null>(null);
  const rideRequests = useRideRequests();
  const counts = usePresenceStore((state) => state.counts);
  const currentIndustry = industries.find(
    (industry) => industry.id === currentIndustryId,
  );
  const totalWorkers = Object.values(counts).reduce(
    (total, count) => total + count,
    0,
  );

  usePresence(
    user?.uid ?? null,
    user?.displayName ?? null,
    currentIndustryId,
    status,
    rideDestination,
  );

  const handleStatusChange = (
    nextStatus: PlayerStatus,
    destination?: string | null,
  ) => {
    setStatus(nextStatus);
    setRideDestination(destination ?? null);
  };

  const handleSelectCompany = (companyId: string) => {
    const company = companies.find((item) => item.id === companyId);
    if (!company) return;

    setCurrentCompanyId(company.id);
    setCurrentIndustryId(company.industryId);
    setView("building");
  };

  if (view === "building" && currentIndustryId) {
    return (
      <BuildingInterior
        industryId={currentIndustryId}
        companyId={currentCompanyId}
        onBack={() => {
          setCurrentCompanyId(null);
          setView("map");
        }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7ef] px-4 py-7 text-[#18372f] sm:px-7 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#66877b]">
              Shakara Workers / World map
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight text-[#18372f] sm:text-4xl">
              Lagos Island
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#567168]">
              Welcome, {user?.displayName || user?.email}. Find your place among the island&apos;s industries.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 border-l-2 border-[#b7d4c2] pl-4">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-[#48a875]" />
              <div>
                <p className="text-xl font-semibold leading-none tabular-nums">
                  {totalWorkers}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#66877b]">
                  workers on island
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbdccf] px-3 text-sm font-semibold text-[#345d4e] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d594b]"
            >
              <LogOut aria-hidden="true" size={16} />
              Sign out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <IslandMap
            onSelectCompany={handleSelectCompany}
          />

          <aside className="min-w-0 border-t border-[#d6e2d7] lg:border-t-0 lg:border-l lg:pl-5">
            <StatusSelector
              currentStatus={status}
              rideDestination={rideDestination}
              onStatusChange={handleStatusChange}
            />
            <IncomingRequests
              incoming={rideRequests.incoming}
              error={rideRequests.error}
              respondToRequest={rideRequests.respondToRequest}
            />
            <div className="pt-4">
              <RideBoard
                outgoing={rideRequests.outgoing}
                error={rideRequests.error}
                offerRide={rideRequests.offerRide}
              />
            </div>
          </aside>
        </div>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[#d6e2d7] pt-4 text-sm">
          <div className="flex items-center gap-2 text-[#668077]">
            <span className="font-medium">Your location</span>
            <span aria-hidden="true" className="text-[#a2b6ab]">/</span>
            <span className="font-semibold text-[#23483d]">
              {currentIndustry?.name ?? "Choose a district"}
            </span>
          </div>
          {currentIndustry && (
            <span className="text-xs font-medium text-[#668077]">
              {counts[currentIndustry.id] ?? 0} here now
            </span>
          )}
        </footer>
      </div>
    </main>
  );
}

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MapContent />
    </ProtectedRoute>
  );
}
