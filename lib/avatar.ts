import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

export function generateAvatar(seed: string, size = 128) {
  const avatar = createAvatar(avataaars, {
    seed,
    size,
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
  });

  return avatar.toDataUri();
}