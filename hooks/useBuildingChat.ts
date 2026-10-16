"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ChatMessage = {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: Timestamp | null;
};

export function useBuildingChat(industryId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(industryId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!industryId) {
      setMessages([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(db, "chats", industryId, "messages");
    const recentMessagesQuery = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(100),
    );

    return onSnapshot(
      recentMessagesQuery,
      (snapshot) => {
        const nextMessages = snapshot.docs
          .map((messageDoc) => {
            const data = messageDoc.data();
            return {
              id: messageDoc.id,
              userId: data.userId,
              displayName: data.displayName || "Anonymous",
              text: data.text,
              createdAt: data.createdAt as Timestamp | null,
            };
          })
          .reverse();

        setMessages(nextMessages);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );
  }, [industryId]);

  const sendMessage = async (
    userId: string,
    displayName: string,
    text: string,
  ) => {
    const normalizedText = text.trim();
    if (!industryId || !normalizedText) return;

    const messagesRef = collection(db, "chats", industryId, "messages");
    await addDoc(messagesRef, {
      userId,
      displayName: displayName.trim() || "Anonymous",
      text: normalizedText,
      createdAt: serverTimestamp(),
    });
  };

  return { messages, loading, error, sendMessage };
}
