"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import type { RideRequest } from "@/lib/ride";

function sortByCreatedAt(requests: RideRequest[]) {
  return requests.sort(
    (first, second) =>
      (second.createdAt?.toMillis() ?? 0) -
      (first.createdAt?.toMillis() ?? 0),
  );
}

export function useRideRequests() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;
  const [incoming, setIncoming] = useState<RideRequest[]>([]);
  const [outgoing, setOutgoing] = useState<RideRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIncoming([]);
      setOutgoing([]);
      setError(null);
      return;
    }

    setError(null);
    const requestsRef = collection(db, "rideRequests");
    const incomingQuery = query(
      requestsRef,
      where("toUserId", "==", userId),
      where("status", "==", "pending"),
    );
    const outgoingQuery = query(
      requestsRef,
      where("fromUserId", "==", userId),
      where("status", "==", "pending"),
    );

    const mapRequests = (snapshot: QuerySnapshot<DocumentData>) =>
      sortByCreatedAt(
        snapshot.docs.map((requestDoc) => {
          const data = requestDoc.data();
          return {
            id: requestDoc.id,
            fromUserId: data.fromUserId,
            fromName: data.fromName,
            toUserId: data.toUserId,
            toName: data.toName,
            destination: data.destination,
            status: data.status,
            createdAt: data.createdAt as Timestamp | null,
          } as RideRequest;
        }),
      );

    const unsubscribeIncoming = onSnapshot(
      incomingQuery,
      (snapshot) => setIncoming(mapRequests(snapshot)),
      (snapshotError) => setError(snapshotError.message),
    );
    const unsubscribeOutgoing = onSnapshot(
      outgoingQuery,
      (snapshot) => setOutgoing(mapRequests(snapshot)),
      (snapshotError) => setError(snapshotError.message),
    );

    return () => {
      unsubscribeIncoming();
      unsubscribeOutgoing();
    };
  }, [userId]);

  const offerRide = async (
    toUserId: string,
    toName: string,
    destination: string,
  ) => {
    if (!user || toUserId === user.uid) return;

    await addDoc(collection(db, "rideRequests"), {
      fromUserId: user.uid,
      fromName: user.displayName?.trim() || "Someone",
      toUserId,
      toName,
      destination,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  };

  const respondToRequest = async (
    requestId: string,
    status: "accepted" | "declined",
  ) => {
    if (!user) return;
    await updateDoc(doc(db, "rideRequests", requestId), { status });
  };

  return { incoming, outgoing, error, offerRide, respondToRequest };
}