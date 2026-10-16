"use client";

import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent,
} from "react";
import * as THREE from "three";
import { Move } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import type { ChatMessage } from "@/hooks/useBuildingChat";
import type { BuildingPlayer } from "@/hooks/useBuildingPlayers";
import { companies } from "@/lib/companies";
import { industries } from "@/lib/industries";
import Character from "./Character";
import PlayerController from "./PlayerController";

type Props = {
  industryId: string;
  companyId?: string | null;
  players: BuildingPlayer[];
  messages: ChatMessage[];
};

type OfficePalette = {
  wall: string;
  floor: string;
  trim: string;
  accent: string;
  glass: string;
  desk: string;
  wood: string;
  plant: string;
  sign: string;
};

type OfficeLayout = {
  name: string;
  desks: [number, number][];
  lounge: string;
};

const officePalettes: OfficePalette[] = [
  { wall: "#f2eddf", floor: "#d9c7a7", trim: "#245e49", accent: "#c7974f", glass: "#a9d6d5", desk: "#a77d56", wood: "#76583f", plant: "#4f8762", sign: "#245e49" },
  { wall: "#e7eef0", floor: "#c6d5d6", trim: "#345d76", accent: "#d1934e", glass: "#b5e2e2", desk: "#8b765e", wood: "#594c42", plant: "#5c896f", sign: "#345d76" },
  { wall: "#eee8f0", floor: "#d7cbdc", trim: "#684c70", accent: "#d7a455", glass: "#c3dede", desk: "#927b69", wood: "#5e4b43", plant: "#62866a", sign: "#684c70" },
  { wall: "#f4e8df", floor: "#ddc3ad", trim: "#a34e45", accent: "#dcaa50", glass: "#a8d6d5", desk: "#a66c4c", wood: "#704a3c", plant: "#63845d", sign: "#a34e45" },
  { wall: "#e9eddf", floor: "#cbd0ad", trim: "#596b43", accent: "#d2a04c", glass: "#b1d7d2", desk: "#8d805d", wood: "#5e5541", plant: "#597d53", sign: "#596b43" },
  { wall: "#f0e4e4", floor: "#d7bfc0", trim: "#874d5b", accent: "#d9a54d", glass: "#acd5d4", desk: "#956b66", wood: "#68494a", plant: "#5c8062", sign: "#874d5b" },
  { wall: "#e2efea", floor: "#c1d8cc", trim: "#28726e", accent: "#d9954f", glass: "#b7dfdd", desk: "#7b8b6c", wood: "#4e6556", plant: "#4b805f", sign: "#28726e" },
];

const officeLayouts: OfficeLayout[] = [
  {
    name: "Open plan",
    desks: [[-5.5, -4], [-2, -4], [2, -4], [5.5, -4], [-5.5, 1.5], [5.5, 1.5], [-2.5, 5], [2.5, 5]],
    lounge: "#75846f",
  },
  {
    name: "Executive suite",
    desks: [[-5, -4], [0, -4], [5, -4], [-5, 4], [0, 4], [5, 4]],
    lounge: "#576c72",
  },
  {
    name: "Studio floor",
    desks: [[-6, -5], [-2, -5], [2, -5], [6, -5], [-5, 4], [5, 4]],
    lounge: "#8b6d56",
  },
  {
    name: "Collaboration hub",
    desks: [[-6, -4], [-2, -4], [2, -4], [6, -4], [-6, 4], [6, 4]],
    lounge: "#6d7180",
  },
];

const outfitColors = ["#327c69", "#c97549", "#496b9b", "#ba9a45", "#955c78"];
const skinColors = ["#75442f", "#9b6044", "#b97c58", "#d39a72"];
const hairColors = ["#211a18", "#493027", "#30231e", "#76503a"];

function MovementJoystick({ input }: { input: MutableRefObject<THREE.Vector2> }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const updateInput = (event: PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const maxOffset = bounds.width * 0.3;
    const deltaX = event.clientX - (bounds.left + bounds.width / 2);
    const deltaY = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(deltaX, deltaY);
    const scale = distance > maxOffset ? maxOffset / distance : 1;
    const x = deltaX * scale;
    const y = deltaY * scale;

    input.current.set(x / maxOffset, y / maxOffset);
    setOffset({ x, y });
  };

  const releaseInput = (event: PointerEvent<HTMLButtonElement>) => {
    input.current.set(0, 0);
    setOffset({ x: 0, y: 0 });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <button
      type="button"
      aria-label="Movement joystick"
      title="Drag to move"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        updateInput(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          updateInput(event);
        }
      }}
      onPointerUp={releaseInput}
      onPointerCancel={releaseInput}
      className="absolute bottom-4 left-4 z-30 grid size-28 touch-none select-none appearance-none place-items-center rounded-full border border-white/55 bg-[#173f34]/50 p-0 shadow-lg backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <span aria-hidden="true" className="absolute size-20 rounded-full border border-white/25 bg-white/10" />
      <span
        aria-hidden="true"
        className="relative grid size-14 place-items-center rounded-full border-2 border-white/75 bg-[#e5ce8d] text-[#263f32] shadow-md"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <Move size={21} strokeWidth={2.5} />
      </span>
    </button>
  );
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
}

function spawnPosition(userId: string): [number, number, number] {
  const hash = stableHash(userId);
  const angle = ((hash % 360) * Math.PI) / 180;
  const radius = 2 + ((hash >>> 8) % 450) / 100;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

function getAppearance(userId: string) {
  const hash = stableHash(userId);
  return {
    color: outfitColors[hash % outfitColors.length],
    skinColor: skinColors[(hash >>> 8) % skinColors.length],
    hairColor: hairColors[(hash >>> 16) % hairColors.length],
  };
}

function Desk({
  position,
  palette,
}: {
  position: [number, number, number];
  palette: OfficePalette;
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[1.9, 0.08, 0.95]}
        radius={0.04}
        position={[0, 0.72, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={palette.desk} roughness={0.78} />
      </RoundedBox>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh
            key={`leg-${x}-${z}`}
            castShadow
            position={[x * 0.8, 0.35, z * 0.35]}
          >
            <boxGeometry args={[0.07, 0.68, 0.07]} />
            <meshStandardMaterial color={palette.wood} roughness={0.82} />
          </mesh>
        )),
      )}
      <mesh castShadow position={[0, 0.27, 0.76]}>
        <boxGeometry args={[0.48, 0.08, 0.48]} />
        <meshStandardMaterial color={palette.trim} roughness={0.85} />
      </mesh>
      <mesh castShadow position={[0, 0.52, 0.94]}>
        <boxGeometry args={[0.48, 0.48, 0.07]} />
        <meshStandardMaterial color={palette.trim} roughness={0.85} />
      </mesh>
    </group>
  );
}

function OfficeSignature({
  variant,
  accent,
}: {
  variant: number;
  accent: string;
}) {
  return (
    <group position={[0, 0, -7.2]}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[2.2, 0.36, 1.1]} />
        <meshStandardMaterial color="#76583f" roughness={0.78} />
      </mesh>
      {variant === 0 && (
        <>
          <mesh position={[0, 1.1, 0]} castShadow>
            <sphereGeometry args={[0.65, 24, 16]} />
            <meshStandardMaterial color={accent} roughness={0.38} metalness={0.25} />
          </mesh>
          <mesh position={[0, 1.1, 0]} rotation={[0.35, 0, 0.2]}>
            <torusGeometry args={[0.88, 0.045, 8, 32]} />
            <meshStandardMaterial color="#e5ce8d" metalness={0.55} roughness={0.35} />
          </mesh>
        </>
      )}
      {variant === 1 && (
        <>
          {[-0.58, 0, 0.58].map((x) => (
            <group key={x} position={[x, 0.92, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.46, 1.1, 0.56]} />
                <meshStandardMaterial color="#29483e" roughness={0.42} metalness={0.35} />
              </mesh>
              {[0.65, 0.9, 1.15].map((y) => (
                <mesh key={y} position={[0, y - 0.92, 0.29]}>
                  <boxGeometry args={[0.3, 0.08, 0.025]} />
                  <meshBasicMaterial color={accent} />
                </mesh>
              ))}
            </group>
          ))}
        </>
      )}
      {variant === 2 && (
        <>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.24, 1.3, 12]} />
            <meshStandardMaterial color={accent} roughness={0.35} metalness={0.45} />
          </mesh>
          <mesh position={[0, 1.65, 0]} castShadow>
            <sphereGeometry args={[0.52, 16, 12]} />
            <meshStandardMaterial color="#fff0bd" emissive={accent} emissiveIntensity={0.3} />
          </mesh>
        </>
      )}
      {variant === 3 && (
        <>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[1.45, 0.86, 0.18]} />
            <meshStandardMaterial color="#223b4a" roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.95, 0.105]}>
            <boxGeometry args={[1.2, 0.62, 0.025]} />
            <meshBasicMaterial color={accent} />
          </mesh>
          <mesh position={[0, 0.43, 0]}>
            <boxGeometry args={[0.12, 0.42, 0.12]} />
            <meshStandardMaterial color="#d8c8a5" />
          </mesh>
        </>
      )}
      {variant === 4 && (
        <>
          <mesh position={[0, 0.95, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.68, 1.3, 6]} />
            <meshStandardMaterial color={accent} roughness={0.4} metalness={0.28} />
          </mesh>
          <mesh position={[0, 1.65, 0]} castShadow>
            <coneGeometry args={[0.62, 0.42, 6]} />
            <meshStandardMaterial color="#e7d8b4" roughness={0.7} />
          </mesh>
        </>
      )}
      {variant === 5 && (
        <>
          {[-0.46, 0, 0.46].map((x, index) => (
            <mesh key={x} position={[x, 0.84 + (index % 2) * 0.2, 0]} castShadow>
              <boxGeometry args={[0.32, 1.15 + (index % 2) * 0.4, 0.5]} />
              <meshStandardMaterial
                color={index === 1 ? accent : "#d9c7a7"}
                roughness={0.62}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

export default function BuildingScene({ industryId, companyId, players, messages }: Props) {
  const { user } = useAuth();
  const target = useRef<THREE.Vector3 | null>(null);
  const joystickInput = useRef(new THREE.Vector2());
  const controlsActiveRef = useRef(false);
  const [chatBubbles, setChatBubbles] = useState<Record<string, string>>({});
  const industry = industries.find((item) => item.id === industryId);
  const company = companies.find((item) => item.id === companyId);
  const companyIndex = company ? companies.indexOf(company) : 0;
  const signatureVariant = stableHash(company?.id ?? industryId) % 6;
  const palette = officePalettes[companyIndex % officePalettes.length];
  const layout = officeLayouts[
    Math.floor(companyIndex / officePalettes.length) % officeLayouts.length
  ];
  const currentPlayer = players.find((player) => player.userId === user?.uid);
  const initialPosition: [number, number, number] = currentPlayer?.position
    ? [currentPlayer.position.x, currentPlayer.position.y, currentPlayer.position.z]
    : [0, 0, 7.5];

  useEffect(() => {
    const latestByUser = new Map<string, ChatMessage>();
    for (const message of messages) {
      if (message.createdAt) latestByUser.set(message.userId, message);
    }

    const activeBubbles: Record<string, string> = {};
    const timers: ReturnType<typeof setTimeout>[] = [];
    const now = Date.now();

    for (const [userId, message] of latestByUser) {
      const remaining = 5000 - (now - message.createdAt!.toMillis());
      if (remaining <= 0) continue;

      activeBubbles[userId] = message.text;
      timers.push(
        setTimeout(() => {
          setChatBubbles((current) => {
            if (current[userId] !== message.text) return current;
            const next = { ...current };
            delete next[userId];
            return next;
          });
        }, remaining),
      );
    }

    setChatBubbles(activeBubbles);
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [messages]);

  const syncPosition = useCallback(
    (position: [number, number, number], rotationY: number) => {
      if (!user) return;

      const positionRef = doc(db, "presence", industryId, "users", user.uid);
      void setDoc(
        positionRef,
        {
          position: { x: position[0], y: position[1], z: position[2] },
          rotationY,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      ).catch((error: unknown) => {
        console.error("Failed to sync player position", error);
      });
    },
    [industryId, user],
  );

  const handleFloorClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    target.current = new THREE.Vector3(
      THREE.MathUtils.clamp(event.point.x, -9, 9),
      0,
      THREE.MathUtils.clamp(event.point.z, -9, 9),
    );
  };

  return (
    <div
      className="relative h-[min(48vh,520px)] min-h-[340px] w-full overflow-hidden border-b border-[#d6e2d7] bg-[#dce9e5]"
      onPointerEnter={() => {
        controlsActiveRef.current = true;
      }}
      onPointerLeave={() => {
        controlsActiveRef.current = false;
      }}
    >
      <Canvas
        camera={{ position: [8, 8, 10], fov: 43 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "low-power" }}
      >
        <color attach="background" args={[palette.wall]} />
        <fog attach="fog" args={[palette.wall, 20, 36]} />
        <ambientLight intensity={0.8} />
        <pointLight position={[0, 3.7, 0]} color={palette.accent} intensity={0.35} distance={15} />
        <directionalLight
          position={[7, 12, 6]}
          intensity={2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          onClick={handleFloorClick}
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color={palette.floor} roughness={0.95} />
        </mesh>

        <mesh position={[0, 2, -10]} receiveShadow>
          <boxGeometry args={[20, 4, 0.3]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
        <mesh position={[-10, 2, 0]} receiveShadow>
          <boxGeometry args={[0.3, 4, 20]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
        <mesh position={[10, 2, 0]} receiveShadow>
          <boxGeometry args={[0.3, 4, 20]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
        <mesh position={[-3.1, 2, 10]} receiveShadow>
          <boxGeometry args={[13.8, 4, 0.3]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
        <mesh position={[3.1, 2, 10]} receiveShadow>
          <boxGeometry args={[13.8, 4, 0.3]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>
        <mesh position={[0, 3.7, 10]} receiveShadow>
          <boxGeometry args={[2.4, 0.6, 0.3]} />
          <meshStandardMaterial color={palette.wall} roughness={0.9} />
        </mesh>

        {[-6, 0, 6].map((x) => (
          <mesh key={`window-${x}`} position={[x, 2.4, -9.82]}>
            <boxGeometry args={[2.8, 1.7, 0.08]} />
            <meshStandardMaterial
              color={palette.glass}
              emissive={palette.glass}
              emissiveIntensity={0.18}
              roughness={0.35}
            />
          </mesh>
        ))}

        {layout.desks.map(([x, z]) => (
          <Desk key={`${x}-${z}`} position={[x, 0, z]} palette={palette} />
        ))}

        <RoundedBox args={[3.2, 0.1, 1.4]} radius={0.05} position={[0, 0.4, -1]} castShadow>
          <meshStandardMaterial color={layout.lounge} roughness={0.8} />
        </RoundedBox>

        {company && (
          <OfficeSignature variant={signatureVariant} accent={palette.accent} />
        )}

        <mesh position={[0, 3.35, -9.78]} castShadow>
          <boxGeometry args={[5.8, 0.82, 0.14]} />
          <meshStandardMaterial color={palette.sign} roughness={0.58} />
        </mesh>
        <mesh position={[-2.45, 3.35, -9.68]}>
          <boxGeometry args={[0.08, 0.58, 0.04]} />
          <meshStandardMaterial color={palette.accent} emissive={palette.accent} emissiveIntensity={0.16} />
        </mesh>
        <Html position={[0, 3.35, -9.67]} center distanceFactor={11}>
          <div className="pointer-events-none min-w-max border border-white/20 bg-[#18372f]/90 px-3 py-1.5 text-center text-white shadow-lg">
            <p className="text-xs font-black">{company?.name ?? industry?.shortName}</p>
            <p className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#e5ce8d]">
              {company?.officeFeature ?? layout.name} / Lagos
            </p>
          </div>
        </Html>

        {[[-9, -8], [9, -8], [-9, 8], [9, 8]].map(([x, z]) => (
          <group key={`plant-${x}-${z}`} position={[x, 0, z]}>
            <mesh castShadow position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.25, 0.3, 0.5, 12]} />
              <meshStandardMaterial color={palette.wood} />
            </mesh>
            <mesh castShadow position={[0, 0.82, 0]}>
              <sphereGeometry args={[0.42, 12, 10]} />
              <meshStandardMaterial color={palette.plant} roughness={0.9} />
            </mesh>
          </group>
        ))}

        {user && (
          <PlayerController
            color={industry?.color ?? "#327c69"}
            name={user.displayName || "You"}
            initialPosition={initialPosition}
            initialRotationY={currentPlayer?.rotationY ?? Math.PI}
            target={target}
            joystickInput={joystickInput}
            controlsActive={controlsActiveRef}
            chatMessage={chatBubbles[user.uid] ?? null}
            onPositionChange={syncPosition}
          />
        )}

        {players
          .filter((player) => player.userId !== user?.uid)
          .map((player) => (
            <Character
              key={player.userId}
              position={
                player.position
                  ? [player.position.x, player.position.y, player.position.z]
                  : spawnPosition(player.userId)
              }
              {...getAppearance(player.avatarSeed || player.userId)}
              name={player.displayName}
                rotationY={player.rotationY ?? 0}
                chatMessage={chatBubbles[player.userId] ?? null}
                smoothPosition
            />
          ))}

        <OrbitControls
          makeDefault
          target={[0, 0.7, 0]}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={7}
          maxDistance={19}
        />
      </Canvas>
      <MovementJoystick input={joystickInput} />
      <div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-white/70 bg-[#fffdf7]/90 px-3 py-2 text-[10px] font-medium text-[#34574b] shadow-sm sm:text-xs">
        Drag to move · WASD · Click floor · {players.length}{" "}
        {players.length === 1 ? "worker" : "workers"} here
      </div>
    </div>
  );
}