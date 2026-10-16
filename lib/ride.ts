import type { Timestamp } from "firebase/firestore";

export type RideRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export type RideRequest = {
  id: string;
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  destination: string;
  status: RideRequestStatus;
  createdAt: Timestamp | null;
};