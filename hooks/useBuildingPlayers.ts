"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type BuildingPlayerPosition = {
  x: number;
  y: number;
  z: number;
};

export type BuildingPlayer = {
  userId: string;
  displayName: string;
  status: string;
  avatarSeed: string;
  position?: BuildingPlayerPosition;
  rotationY?: number;
};

export function useBuildingPlayers(industryId: string | null) {
  const [players, setPlayers] = useState<BuildingPlayer[]>([]);
  const [loading, setLoading] = useState(Boolean(industryId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!industryId) {
      setPlayers([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const usersRef = collection(db, "presence", industryId, "users");
    return onSnapshot(
      usersRef,
      (snapshot) => {
        const nextPlayers = snapshot.docs
          .map((playerDoc) => {
            const data = playerDoc.data();
            const position = data.position as
              | Partial<BuildingPlayerPosition>
              | undefined;

            return {
              userId: playerDoc.id,
              displayName: data.displayName || "Anonymous",
              status: data.status || "Working",
              avatarSeed: data.avatarSeed || playerDoc.id,
              position:
                typeof position?.x === "number" &&
                typeof position.y === "number" &&
                typeof position.z === "number"
                  ? { x: position.x, y: position.y, z: position.z }
                  : undefined,
              rotationY:
                typeof data.rotationY === "number" ? data.rotationY : 0,
            };
          })
          .sort((first, second) =>
            first.displayName.localeCompare(second.displayName),
          );

        setPlayers(nextPlayers);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setLoading(false);
      },
    );
  }, [industryId]);

  return { players, loading, error };
}
