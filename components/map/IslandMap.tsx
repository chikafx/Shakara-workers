"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Building2, Compass } from "lucide-react";
import { companies } from "@/lib/companies";
import { industries } from "@/lib/industries";
import { usePresenceStore } from "@/store/presence";

type Props = {
  onSelectCompany: (companyId: string) => void;
};

const MAP_BOUNDS = {
  minLatitude: 6.422,
  maxLatitude: 6.461,
  minLongitude: 3.38,
  maxLongitude: 3.462,
};

function projectPoint(latitude: number, longitude: number) {
  const x =
    ((longitude - MAP_BOUNDS.minLongitude) /
      (MAP_BOUNDS.maxLongitude - MAP_BOUNDS.minLongitude)) *
    100;
  const y =
    ((MAP_BOUNDS.maxLatitude - latitude) /
      (MAP_BOUNDS.maxLatitude - MAP_BOUNDS.minLatitude)) *
    100;

  return { x, y };
}

const industryById = new Map(industries.map((industry) => [industry.id, industry]));

function CompanyBuilding({
  position,
  color,
  index,
}: {
  position: [number, number, number];
  color: string;
  index: number;
}) {
  const floors = 3 + (index % 4);
  const width = 2.5 + (index % 3) * 0.25;
  const height = floors * 1.15;
  const depth = 1.35;
  const sideWidth = 0.8;
  const windows = Array.from({ length: floors * 2 }, (_, windowIndex) => {
    const floor = Math.floor(windowIndex / 2);
    const column = windowIndex % 2;

    return {
      key: windowIndex,
      x: column === 0 ? -width * 0.23 : width * 0.23,
      y: -height / 2 + ((floor + 0.58) * height) / floors,
    };
  });

  return (
    <group position={position} rotation={[0, -0.28, 0]}>
      <mesh position={[0, 0.12, -0.5]}>
        <circleGeometry args={[2.2, 12]} />
        <meshBasicMaterial color="#244d40" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh
        position={[width / 2 + sideWidth / 2 - 0.02, height / 2, -0.08]}
        castShadow
      >
        <boxGeometry args={[sideWidth, height - 0.08, depth - 0.12]} />
        <meshStandardMaterial color="#29483e" roughness={0.82} />
      </mesh>
      <mesh position={[sideWidth / 2, height + 0.12, 0]} castShadow>
        <boxGeometry args={[width + sideWidth + 0.16, 0.28, depth + 0.2]} />
        <meshStandardMaterial color="#f0d69a" roughness={0.62} />
      </mesh>
      {windows.map((window) => (
        <mesh
          key={window.key}
          position={[window.x, window.y, depth / 2 + 0.02]}
        >
          <boxGeometry args={[0.4, 0.38, 0.05]} />
          <meshStandardMaterial
            color="#f4e5b9"
            emissive="#c79351"
            emissiveIntensity={0.12}
            roughness={0.36}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function IslandMap({ onSelectCompany }: Props) {
  const counts = usePresenceStore((state) => state.counts);
  const totalPlayers = Object.values(counts).reduce(
    (total, count) => total + count,
    0,
  );

  return (
    <div
      role="region"
      aria-label="Interactive company map of Lagos Island"
      className="relative isolate h-[min(70vh,760px)] min-h-130 w-full overflow-hidden rounded-xl border border-[#acd2c7] bg-[#9acdc8] shadow-[0_18px_55px_-30px_rgba(20,73,63,0.55)]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/island-bg.svg')",
          backgroundPosition: "center",
          backgroundSize: "100% 100%",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#173f34]/8"
      />

      <Canvas
        orthographic
        camera={{
          left: -50,
          right: 50,
          top: 50,
          bottom: -50,
          near: 0.1,
          far: 150,
          position: [0, 0, 100],
        }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor("#000000", 0)}
        className="pointer-events-none absolute inset-0 z-20"
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[-28, 36, 55]} intensity={2.1} />
        {companies.map((company, index) => {
          const point = projectPoint(company.lat, company.lng);
          const industry = industryById.get(company.industryId);

          return (
            <CompanyBuilding
              key={company.id}
              position={[point.x - 50, 50 - point.y, 0]}
              color={industry?.color ?? "#6b7280"}
              index={index}
            />
          );
        })}
      </Canvas>

      <div className="absolute left-3 top-3 z-40 flex items-center gap-2 border border-white/70 bg-[#fffdf2]/90 px-3 py-2 text-[#23483d] shadow-md backdrop-blur-sm sm:left-5 sm:top-5">
        <Compass aria-hidden="true" size={17} className="text-[#b56d3d]" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#668077]">
            Lagos, Nigeria
          </p>
          <p className="text-xs font-bold">Company landmarks</p>
        </div>
      </div>

      <div className="absolute right-3 top-3 z-40 flex items-center gap-2 border border-white/70 bg-[#fffdf2]/90 px-3 py-2 text-[#23483d] shadow-md backdrop-blur-sm sm:right-5 sm:top-5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#48a875]" />
        <span className="text-xs font-bold tabular-nums">
          {totalPlayers} online
        </span>
      </div>

      <div
        aria-hidden="true"
        className="absolute right-4 top-16 z-10 flex size-9 items-center justify-center border border-white/60 bg-white/55 text-xs font-black text-[#34574b] sm:right-5 sm:top-20"
      >
        N
      </div>

      {companies.map((company) => {
        const point = projectPoint(company.lat, company.lng);
        const industry = industryById.get(company.industryId);

        return (
          <button
            key={company.id}
            type="button"
            aria-label={`Enter ${industry?.shortName ?? "industry"} office from ${company.name}`}
            title={`${company.name} - ${company.shortLocation}`}
            onClick={() => onSelectCompany(company.id)}
            className="group absolute z-30 h-16 w-12 -translate-x-1/2 -translate-y-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap border border-white/70 bg-[#18372f] px-2 py-1 text-[10px] font-semibold text-white shadow-md group-hover:block group-focus-visible:block">
              {company.name}
              <span className="block font-normal text-white/70">
                {company.shortLocation}
              </span>
            </span>
          </button>
        );
      })}

      <div className="absolute bottom-3 left-3 z-40 flex items-center gap-2 border border-white/70 bg-[#fffdf2]/90 px-3 py-2 text-[10px] font-semibold text-[#34574b] shadow-md backdrop-blur-sm sm:bottom-5 sm:left-5 sm:text-xs">
        <Building2 aria-hidden="true" size={16} className="text-[#b56d3d]" />
        Company buildings
      </div>

      <p className="absolute bottom-3 right-3 z-10 text-[9px] font-bold uppercase tracking-[0.12em] text-[#315d53]/75 sm:bottom-5 sm:right-5">
        Click a company to enter its office
      </p>
    </div>
  );
}
