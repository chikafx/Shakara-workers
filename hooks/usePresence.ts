"use client";

import { useEffect } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { industries } from "@/lib/industries";
import { usePresenceStore } from "@/store/presence";
import { isPlayerStatus, type PlayerStatus } from "@/lib/status";

export function usePresence(
  userId: string | null,
  displayName: string | null,
  currentIndustryId: string | null,
  status: PlayerStatus = "Working",
  rideDestination?: string | null,
) {
  const setIndustryData = usePresenceStore((state) => state.setIndustryData);

  useEffect(() => {
    const unsubscribers = industries.map((industry) => {
      const usersRef = collection(db, "presence", industry.id, "users");

      return onSnapshot(usersRef, (snapshot) => {
        const players = snapshot.docs.map((playerDoc) => {
          const data = playerDoc.data();
          const position = data.position as
            | Partial<{ x: number; y: number; z: number }>
            | undefined;

          return {
            userId: playerDoc.id,
            displayName: data.displayName || "Anonymous",
            avatarSeed: data.avatarSeed || playerDoc.id,
            status: isPlayerStatus(data.status) ? data.status : "Working",
            rideDestination:
              typeof data.rideDestination === "string"
                ? data.rideDestination
                : null,
            position:
              typeof position?.x === "number" &&
              typeof position.y === "number" &&
              typeof position.z === "number"
                ? { x: position.x, y: position.y, z: position.z }
                : null,
            rotationY: typeof data.rotationY === "number" ? data.rotationY : 0,
          };
        });

        setIndustryData(industry.id, players);
      });
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [setIndustryData]);

  useEffect(() => {
    if (!userId || !currentIndustryId) return;

    const userRef = doc(db, "presence", currentIndustryId, "users", userId);

    void setDoc(userRef, {
      userId,
      displayName: displayName || "Anonymous",
      status,
      rideDestination:
        status === "Looking for Ride" ? rideDestination || null : null,
      avatarSeed: userId,
      lastSeen: serverTimestamp(),
    }, { merge: true }).catch((error: unknown) => {
      console.error("Failed to update presence", error);
    });

  }, [userId, displayName, currentIndustryId, status, rideDestination]);

  useEffect(() => {
    if (!userId || !currentIndustryId) return;

    const userRef = doc(db, "presence", currentIndustryId, "users", userId);
    return () => {
      void deleteDoc(userRef).catch((error: unknown) => {
        console.error("Failed to remove presence", error);
      });
    };
  }, [userId, currentIndustryId]);
}
