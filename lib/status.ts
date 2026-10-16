export const PLAYER_STATUSES = [
  { id: "Working", label: "Working", color: "#326f9b" },
  { id: "On Break", label: "On Break", color: "#b87922" },
  { id: "Free to Chat", label: "Free to Chat", color: "#3c805d" },
  { id: "Looking for Ride", label: "Looking for Ride", color: "#765a83" },
] as const;

export type PlayerStatus = (typeof PLAYER_STATUSES)[number]["id"];

export const RIDE_DESTINATIONS = [
  "Lekki",
  "Ajah",
  "Yaba",
  "Ikeja",
  "Surulere",
  "Mainland (General)",
  "Ikorodu",
  "Festac",
  "Other",
] as const;

export function isPlayerStatus(value: unknown): value is PlayerStatus {
  return PLAYER_STATUSES.some((status) => status.id === value);
}