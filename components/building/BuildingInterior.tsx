"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useBuildingChat } from "@/hooks/useBuildingChat";
import { useBuildingPlayers } from "@/hooks/useBuildingPlayers";
import { companies } from "@/lib/companies";
import { industries } from "@/lib/industries";

const AvatarRoster3D = dynamic(() => import("@/components/building/Avatar3D"), {
  ssr: false,
  loading: () => (
    <span
      aria-hidden="true"
      className="size-12 shrink-0 rounded-full border border-[#c9ddc9] bg-[#dcebd7]"
    />
  ),
});

const BuildingScene = dynamic(
  () => import("@/components/building/BuildingScene"),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(48vh,520px)] min-h-[340px] items-center justify-center bg-[#dce9e5] text-sm font-medium text-[#567168]"
        role="status"
      >
        Loading 3D room...
      </div>
    ),
  },
);
import Image from "next/image";

type Props = {
  industryId: string;
  companyId?: string | null;
  onBack: () => void;
};

export default function BuildingInterior({ industryId, companyId, onBack }: Props) {
  const { user } = useAuth();
  const {
    players,
    loading: playersLoading,
    error: playersError,
  } = useBuildingPlayers(industryId);
  const {
    messages,
    loading: chatLoading,
    error: chatError,
    sendMessage,
  } = useBuildingChat(industryId);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const industry = industries.find((item) => item.id === industryId);
  const company = companies.find((item) => item.id === companyId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !message.trim() || sending) return;

    setSending(true);
    setSendError(null);
    try {
      await sendMessage(
        user.uid,
        user.displayName || user.email || "Anonymous",
        message,
      );
      setMessage("");
    } catch (error) {
      setSendError(
        error instanceof Error ? error.message : "Message could not be sent.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#f5f7ef] text-[#18372f]">
      <header className="sticky top-0 z-10 flex min-h-[76px] items-center justify-between gap-4 border-b border-[#d6e2d7] bg-[#fffdf7] px-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#476b5c] transition-colors hover:bg-[#edf3e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d594b]"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            <span className="hidden sm:inline">Map</span>
          </button>
          <div className="min-w-0 border-l border-[#d6e2d7] pl-4">
            <p className="truncate text-lg font-semibold text-[#18372f]">
              {company?.name ?? industry?.name ?? "Industry"}
            </p>
            <p className="mt-0.5 text-xs text-[#668077]">
              {players.length} {players.length === 1 ? "worker" : "workers"} here
            </p>
          </div>
        </div>
        <p className="hidden text-xs font-medium text-[#668077] sm:block">
          Shakara Workers / Island map
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <aside className="max-h-[45vh] w-full shrink-0 overflow-y-auto border-b border-[#d6e2d7] bg-[#edf3e9] p-4 md:max-h-none md:w-72 md:border-b-0 md:border-r md:p-5">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-bold text-[#34574b]">People here</h2>
            <span className="text-xs tabular-nums text-[#668077]">
              {players.length} online
            </span>
          </div>

          {playersLoading ? (
            <p className="py-3 text-sm text-[#788c80]" role="status">
              Loading workers...
            </p>
          ) : playersError ? (
            <p className="py-3 text-sm text-[#9b493b]" role="alert">
              Could not load workers: {playersError}
            </p>
          ) : players.length === 0 ? (
            <p className="py-3 text-sm text-[#788c80]">
              It&apos;s quiet here. You can be the first to say hello.
            </p>
          ) : (
            <AvatarRoster3D players={players} currentUserId={user?.uid ?? null} />
          )}

        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <BuildingScene
            industryId={industryId}
            companyId={companyId}
            players={players}
            messages={messages}
          />
          <section
            aria-label="Building chat"
            className="flex min-h-[42vh] flex-1 flex-col bg-[#f8f9f3] md:min-h-[320px]"
          >
          <div
            className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-7"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {chatLoading ? (
              <p className="py-8 text-center text-sm text-[#788c80]" role="status">
                Loading conversation...
              </p>
            ) : chatError ? (
              <p className="mx-auto mt-8 max-w-md border-l-2 border-[#b74d3b] bg-[#fff0eb] px-3 py-2.5 text-sm text-[#913c31]" role="alert">
                Could not load chat: {chatError}
              </p>
            ) : messages.length === 0 ? (
              <div className="mx-auto mt-12 max-w-sm text-center">
                <p className="font-serif text-2xl text-[#34574b]">A quiet room.</p>
                <p className="mt-2 text-sm text-[#788c80]">
                  Start the conversation with your coworkers.
                </p>
              </div>
            ) : (
              messages.map((chatMessage) => {
                const isCurrentUser = chatMessage.userId === user?.uid;
                const time = chatMessage.createdAt?.toDate().toLocaleTimeString(
                  [],
                  { hour: "numeric", minute: "2-digit" },
                );

                return (
                  <div
                    key={chatMessage.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <article
                      className={`max-w-[min(82%,36rem)] border px-3.5 py-2.5 sm:px-4 ${
                        isCurrentUser
                          ? "border-[#245e49] bg-[#245e49] text-white"
                          : "border-[#dce5d8] bg-white text-[#28483b]"
                      }`}
                    >
                      <header className="mb-1 flex items-baseline justify-between gap-4">
                        <p
                          className={`truncate text-xs font-bold ${
                            isCurrentUser ? "text-white/80" : "text-[#668077]"
                          }`}
                        >
                          {isCurrentUser ? "You" : chatMessage.displayName}
                        </p>
                        {time && (
                          <time
                            className={`shrink-0 text-[10px] ${
                              isCurrentUser ? "text-white/65" : "text-[#8a9b8e]"
                            }`}
                          >
                            {time}
                          </time>
                        )}
                      </header>
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {chatMessage.text}
                      </p>
                    </article>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-[#dce5d8] bg-[#fffdf7] p-3 sm:p-4"
          >
            {sendError && (
              <p className="mb-2 text-sm text-[#913c31]" role="alert">
                {sendError}
              </p>
            )}
            <div className="mx-auto flex max-w-4xl items-end gap-2">
              <label className="sr-only" htmlFor="building-message">
                Message your coworkers
              </label>
              <textarea
                id="building-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Message your coworkers..."
                rows={1}
                maxLength={500}
                className="max-h-32 min-h-11 flex-1 resize-y border border-[#cbd9ca] bg-white px-3 py-2.5 text-sm text-[#28483b] outline-none placeholder:text-[#8a9b8e] focus:border-[#34785b] focus:ring-2 focus:ring-[#34785b]/20"
              />
              <button
                type="submit"
                disabled={!message.trim() || sending || !user}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-[#245e49] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#184a38] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Send message"
              >
                <Send aria-hidden="true" size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="mx-auto mt-1.5 max-w-4xl text-right text-[10px] tabular-nums text-[#8a9b8e]">
              {message.length}/500
            </p>
          </form>
          </section>
        </div>
      </div>
    </main>
  );
}
