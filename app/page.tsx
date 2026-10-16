"use client";

import Link from "next/link";
import { ArrowRight, Palmtree } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOnlineCount } from "@/hooks/useOnlineCount";
import { usePresence } from "@/hooks/usePresence";

export default function HomePage() {
  const { user } = useAuth();
  const onlineCount = useOnlineCount();

  usePresence(
    user?.uid ?? null,
    user?.displayName ?? null,
    null,
    "Working",
  );

  const lobbyStatus =
    onlineCount === null
      ? "Checking the lobby"
      : onlineCount === 0
        ? "Be the first on the island"
        : `${onlineCount} player${onlineCount === 1 ? "" : "s"} online`;

  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-[#173f34] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[url('/island-bg.svg')] bg-cover bg-position-[center_44%]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[#143d32]/55"
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
        <Link
          href="/"
          aria-label="Island Desk home"
          className="flex items-center gap-2.5"
        >
          <span className="grid size-10 place-items-center rounded-xl border-2 border-[#18372f] bg-[#f6d74a] text-[#18372f] shadow-[3px_3px_0_#18372f]">
            <Palmtree aria-hidden="true" size={22} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-black">Island Desk</span>
        </Link>

        <div
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/35 bg-[#18372f]/75 px-3 text-xs font-bold text-white"
          aria-live="polite"
        >
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${onlineCount === null ? "bg-[#f6d74a]" : "bg-[#75c98b]"}`}
          />
          {lobbyStatus}
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 py-12 text-center sm:px-8">
        <p className="mb-5 text-xs font-black uppercase tracking-[0.18em] text-[#f6d74a]">
          Lagos Island / Multiplayer life
        </p>
        <h1 className="text-5xl font-black leading-[1.05] sm:text-6xl md:text-7xl">
          Your 9-to-5
          <br />
          <span className="text-[#f6d74a]">on the Island</span>
        </h1>
        <p className="mt-5 text-base font-medium text-white/85 sm:text-lg">
          Move. Chat. Find rides. Live the Island life.
        </p>
        <Link
          href={user ? "/map" : "/signup"}
          className="mt-9 inline-flex min-h-14 items-center gap-3 rounded-2xl border-2 border-[#18372f] bg-[#f6d74a] px-8 text-lg font-black text-[#18372f] shadow-[5px_5px_0_#18372f] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#18372f] active:translate-y-0.5 active:shadow-[2px_2px_0_#18372f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          {user ? "Enter Island" : "Play Now"}
          <ArrowRight aria-hidden="true" size={20} />
        </Link>
      </section>

      <footer className="px-5 pb-6 text-center text-xs font-semibold text-white/75">
        Free to play <span aria-hidden="true">/</span> Lagos Island
      </footer>
    </main>
  );
}