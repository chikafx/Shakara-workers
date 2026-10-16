"use client";

import { Billboard, RoundedBox, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { useRef } from "react";

type CharacterProps = {
  position: [number, number, number];
  rotationY?: number;
  color?: string;
  skinColor?: string;
  hairColor?: string;
  isMe?: boolean;
  name?: string;
  isMoving?: boolean;
  chatMessage?: string | null;
  smoothPosition?: boolean;
};

export default function Character({
  position,
  rotationY = 0,
  color = "#3b82f6",
  skinColor = "#9c6248",
  hairColor = "#30231e",
  isMe = false,
  name = "",
  isMoving = false,
  chatMessage = null,
  smoothPosition = false,
}: CharacterProps) {
  const group = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const time = clock.elapsedTime * (isMoving ? 10 : 2);
    if (group.current) {
      const rotationDifference = THREE.MathUtils.euclideanModulo(
        rotationY - group.current.rotation.y + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
      group.current.rotation.y += rotationDifference * (1 - Math.exp(-delta * 12));

      if (smoothPosition) {
        group.current.position.x = THREE.MathUtils.damp(
          group.current.position.x,
          position[0],
          10,
          delta,
        );
        group.current.position.z = THREE.MathUtils.damp(
          group.current.position.z,
          position[2],
          10,
          delta,
        );
      }
      group.current.position.y =
        position[1] + (isMoving ? Math.abs(Math.sin(time)) * 0.035 : Math.sin(time) * 0.018);
    }

    if (torso.current) {
      torso.current.rotation.x = THREE.MathUtils.damp(
        torso.current.rotation.x,
        isMoving ? -0.045 : 0,
        8,
        delta,
      );
      torso.current.position.y = THREE.MathUtils.damp(
        torso.current.position.y,
        0.84 + (isMoving ? Math.abs(Math.sin(time)) * 0.018 : 0),
        10,
        delta,
      );
    }
    if (head.current) {
      head.current.rotation.z = Math.sin(time * 0.32) * 0.018;
    }

    const armSwing = isMoving ? Math.sin(time) * 0.55 : 0;
    const legSwing = isMoving ? Math.sin(time) * 0.42 : 0;
    if (leftArm.current) leftArm.current.rotation.x = armSwing;
    if (rightArm.current) rightArm.current.rotation.x = -armSwing;
    if (leftLeg.current) leftLeg.current.rotation.x = -legSwing;
    if (rightLeg.current) rightLeg.current.rotation.x = legSwing;
  });

  return (
    <group ref={group} position={smoothPosition ? undefined : position}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#17382f" opacity={0.2} transparent />
      </mesh>

      {isMe && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
          <ringGeometry args={[0.46, 0.51, 32]} />
          <meshBasicMaterial color="#e3ae50" />
        </mesh>
      )}

      <group ref={leftLeg} position={[-0.13, 0.49, 0]}>
        <mesh castShadow position={[0, -0.19, 0]}>
          <capsuleGeometry args={[0.105, 0.36, 5, 10]} />
          <meshStandardMaterial color="#263849" roughness={0.82} />
        </mesh>
        <RoundedBox
          args={[0.22, 0.13, 0.36]}
          radius={0.055}
          smoothness={3}
          position={[0, -0.42, 0.065]}
          castShadow
        >
          <meshStandardMaterial color="#26332f" roughness={0.68} />
        </RoundedBox>
        <mesh position={[0, -0.395, 0.12]}>
          <boxGeometry args={[0.13, 0.012, 0.13]} />
          <meshStandardMaterial color="#d4b16c" metalness={0.35} roughness={0.45} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.13, 0.49, 0]}>
        <mesh castShadow position={[0, -0.19, 0]}>
          <capsuleGeometry args={[0.105, 0.36, 5, 10]} />
          <meshStandardMaterial color="#263849" roughness={0.82} />
        </mesh>
        <RoundedBox
          args={[0.22, 0.13, 0.36]}
          radius={0.055}
          smoothness={3}
          position={[0, -0.42, 0.065]}
          castShadow
        >
          <meshStandardMaterial color="#26332f" roughness={0.68} />
        </RoundedBox>
        <mesh position={[0, -0.395, 0.12]}>
          <boxGeometry args={[0.13, 0.012, 0.13]} />
          <meshStandardMaterial color="#d4b16c" metalness={0.35} roughness={0.45} />
        </mesh>
      </group>

      <group ref={torso} position={[0, 0.84, 0]}>
        <RoundedBox
          args={[0.62, 0.76, 0.36]}
          radius={0.13}
          smoothness={4}
          position={[0, 0.1, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.76} />
        </RoundedBox>
        <RoundedBox
          args={[0.23, 0.54, 0.035]}
          radius={0.025}
          smoothness={3}
          position={[0, 0.08, 0.187]}
        >
          <meshStandardMaterial color="#f5ead3" roughness={0.82} />
        </RoundedBox>
        <mesh position={[0, 0.1, 0.21]}>
          <boxGeometry args={[0.055, 0.3, 0.025]} />
          <meshStandardMaterial color="#b97848" roughness={0.72} />
        </mesh>
        {[-0.13, -0.02, 0.09].map((y) => (
          <mesh key={y} position={[0, y, 0.23]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshStandardMaterial color="#d8bd78" metalness={0.35} roughness={0.5} />
          </mesh>
        ))}
        <RoundedBox
          args={[0.14, 0.11, 0.035]}
          radius={0.018}
          smoothness={2}
          position={[-0.19, 0.22, 0.19]}
        >
          <meshStandardMaterial color="#e4c36f" metalness={0.2} roughness={0.55} />
        </RoundedBox>
        <mesh position={[-0.19, 0.22, 0.212]}>
          <boxGeometry args={[0.07, 0.012, 0.008]} />
          <meshBasicMaterial color="#fff7df" />
        </mesh>
        <RoundedBox
          args={[0.55, 0.075, 0.37]}
          radius={0.025}
          smoothness={2}
          position={[0, -0.31, 0]}
        >
          <meshStandardMaterial color="#253a38" roughness={0.7} />
        </RoundedBox>
      </group>

      <mesh position={[0, 1.32, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.19, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.84} />
      </mesh>

      <group ref={leftArm} position={[-0.34, 1.16, 0]}>
        <mesh castShadow position={[0, -0.17, 0]}>
          <capsuleGeometry args={[0.105, 0.3, 5, 10]} />
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, -0.39, 0.025]}>
          <sphereGeometry args={[0.105, 12, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.82} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.34, 1.16, 0]}>
        <mesh castShadow position={[0, -0.17, 0]}>
          <capsuleGeometry args={[0.105, 0.3, 5, 10]} />
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[0, -0.39, 0.025]}>
          <sphereGeometry args={[0.105, 12, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.82} />
        </mesh>
      </group>

      <group ref={head} position={[0, 1.58, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.285, 28, 22]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh position={[-0.276, -0.01, 0]} scale={[0.12, 0.17, 0.1]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.82} />
        </mesh>
        <mesh position={[0.276, -0.01, 0]} scale={[0.12, 0.17, 0.1]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.82} />
        </mesh>
        <mesh castShadow position={[0, 0.15, -0.018]}>
          <sphereGeometry args={[0.29, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.57]} />
          <meshStandardMaterial color={hairColor} roughness={0.92} />
        </mesh>
        <mesh castShadow position={[-0.12, 0.17, 0.205]} scale={[0.52, 0.36, 0.52]}>
          <sphereGeometry args={[0.15, 14, 12]} />
          <meshStandardMaterial color={hairColor} roughness={0.94} />
        </mesh>
        {[-0.09, 0.09].map((x) => (
          <group key={x} position={[x, -0.025, 0.242]}>
            <mesh>
              <sphereGeometry args={[0.047, 12, 10]} />
              <meshStandardMaterial color="#fff7eb" roughness={0.42} />
            </mesh>
            <mesh position={[0, -0.002, 0.035]}>
              <sphereGeometry args={[0.025, 10, 8]} />
              <meshStandardMaterial color="#28211e" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.068, -0.005]} rotation={[0, 0, x < 0 ? -0.12 : 0.12]}>
              <boxGeometry args={[0.09, 0.022, 0.025]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.09, 0.275]} scale={[0.075, 0.1, 0.07]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.78} />
        </mesh>
        <mesh position={[0, -0.17, 0.247]} scale={[0.075, 0.022, 0.018]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color="#75423c" roughness={0.7} />
        </mesh>
      </group>

      {name && (
        <Billboard position={[0, 2.05, 0]}>
          <Text
            anchorX="center"
            anchorY="middle"
            fontSize={0.2}
            color={isMe ? "#174d3a" : "#263d34"}
            outlineColor="#fffdf7"
            outlineWidth={0.012}
            maxWidth={2.4}
          >
            {name}
          </Text>
        </Billboard>
      )}

      {chatMessage && (
        <Billboard position={[0, 2.55, 0]}>
          <RoundedBox
            args={[Math.min(chatMessage.length * 0.1 + 0.55, 3.2), 0.48, 0.06]}
            radius={0.1}
            smoothness={2}
          >
            <meshBasicMaterial color="#fffdf7" />
          </RoundedBox>
          <Text
            position={[0, 0, 0.04]}
            fontSize={0.15}
            color="#263d34"
            anchorX="center"
            anchorY="middle"
            maxWidth={2.9}
          >
            {chatMessage.length > 40
              ? `${chatMessage.slice(0, 38)}...`
              : chatMessage}
          </Text>
        </Billboard>
      )}
    </group>
  );
}