"use client";

import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import type { BuildingPlayer } from "@/hooks/useBuildingPlayers";

const skinTones = ["#5b3426", "#7a4934", "#9b6046", "#bb805c", "#d6a37f"];
const hairColors = ["#171615", "#30231d", "#493124", "#201a18"];
const clothingColors = ["#34785b", "#bf654b", "#3c6d9c", "#bd913d", "#704a76"];

function seededIndex(seed: string, salt: number, length: number) {
  let hash = salt;
  for (const character of seed) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) | 0;
  }
  return ((hash % length) + length) % length;
}

function AvatarFigure({ seed }: { seed: string }) {
  const skin = skinTones[seededIndex(seed, 17, skinTones.length)];
  const hair = hairColors[seededIndex(seed, 29, hairColors.length)];
  const clothing = clothingColors[seededIndex(seed, 43, clothingColors.length)];
  const hairstyle = seededIndex(seed, 61, 3);

  return (
    <group position={[0, -0.04, 0]} rotation={[0, -0.12, 0]}>
      <mesh position={[0, -0.72, 0]} scale={[0.72, 0.58, 0.42]}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial color={clothing} roughness={0.76} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.2, 0.23, 0.36, 16]} />
        <meshStandardMaterial color={skin} roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.28, 0]} scale={[0.58, 0.68, 0.52]}>
        <sphereGeometry args={[1, 28, 24]} />
        <meshStandardMaterial color={skin} roughness={0.82} />
      </mesh>

      <mesh position={[-0.55, 0.25, 0]} scale={[0.13, 0.19, 0.12]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.82} />
      </mesh>
      <mesh position={[0.55, 0.25, 0]} scale={[0.13, 0.19, 0.12]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skin} roughness={0.82} />
      </mesh>

      <mesh position={[0, 0.79, -0.02]} scale={hairstyle === 1 ? [0.68, 0.48, 0.58] : [0.6, 0.34, 0.54]}>
        <sphereGeometry args={[1, 20, 18]} />
        <meshStandardMaterial color={hair} roughness={0.95} />
      </mesh>
      {hairstyle === 2 && (
        <>
          <mesh position={[-0.48, 0.67, -0.02]} scale={[0.2, 0.23, 0.2]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={hair} roughness={0.95} />
          </mesh>
          <mesh position={[0.48, 0.67, -0.02]} scale={[0.2, 0.23, 0.2]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={hair} roughness={0.95} />
          </mesh>
        </>
      )}

      {[[-0.2, 0.34], [0.2, 0.34]].map(([x, y]) => (
        <group key={x} position={[x, y, 0.48]}>
          <mesh>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color="#fffaf2" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.05]}>
            <sphereGeometry args={[0.031, 12, 12]} />
            <meshStandardMaterial color="#292523" roughness={0.55} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.2, 0.52]} scale={[0.07, 0.1, 0.07]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={skin} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.08, 0.51]} scale={[0.09, 0.025, 0.018]}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#643b36" roughness={0.7} />
      </mesh>
    </group>
  );
}

export default function AvatarRoster3D({
  players,
  currentUserId,
}: {
  players: BuildingPlayer[];
  currentUserId: string | null;
}) {
  return (
    <div className="relative">
      <Canvas
        className="pointer-events-none !absolute !inset-0 !z-0 !h-full !w-full"
        dpr={1}
        frameloop="demand"
        camera={{ position: [0, 0, 4.1], fov: 34 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} />
        <directionalLight position={[3, 1, 2]} intensity={0.55} color="#d8e8ff" />
        <View.Port />
      </Canvas>
      <ul className="relative z-10 space-y-1">
        {players.map((player) => {
          const isCurrentUser = player.userId === currentUserId;

          return (
            <li
              key={player.userId}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/70"
            >
              <View
                frames={1}
                className="size-12 shrink-0 overflow-hidden rounded-full border border-[#c9ddc9] bg-[radial-gradient(circle_at_50%_35%,#fffdf5,#dcebd7)] shadow-[inset_0_2px_5px_rgba(255,255,255,0.9),0_3px_8px_rgba(35,72,56,0.18)] transition-transform duration-200 hover:scale-110"
              >
                <AvatarFigure seed={player.avatarSeed} />
              </View>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-[#28483b]">
                  {player.displayName}
                  {isCurrentUser && (
                    <span className="shrink-0 text-[10px] font-medium text-[#778c7e]">
                      You
                    </span>
                  )}
                </span>
                <span className="block truncate text-xs text-[#788c80]">
                  {player.status}
                </span>
              </span>
              <span
                aria-label="Online"
                className="size-2 shrink-0 rounded-full bg-[#58a477]"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}