"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import Character from "./Character";

type MoveKey = "w" | "a" | "s" | "d";
type Props = {
  color: string;
  name: string;
  initialPosition: [number, number, number];
  initialRotationY: number;
  target: MutableRefObject<THREE.Vector3 | null>;
  joystickInput: MutableRefObject<THREE.Vector2>;
  controlsActive: MutableRefObject<boolean>;
  chatMessage?: string | null;
  onPositionChange: (
    position: [number, number, number],
    rotationY: number,
  ) => void;
};

export default function PlayerController({
  color,
  name,
  initialPosition,
  initialRotationY,
  target,
  joystickInput,
  controlsActive,
  chatMessage = null,
  onPositionChange,
}: Props) {
  const group = useRef<THREE.Group | null>(null);
  const velocity = useRef(new THREE.Vector3());
  const desiredVelocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const cameraTarget = useRef(new THREE.Vector3());
  const keys = useRef<Record<MoveKey, boolean>>({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const hasMoved = useRef(false);
  const lastSync = useRef(0);
  const lastSyncedPosition = useRef(new THREE.Vector3(...initialPosition));
  const [isMoving, setIsMoving] = useState(false);
  const { camera } = useThree();
  const initialPositionRef = useRef(initialPosition);

  useEffect(() => {
    initialPositionRef.current = initialPosition;
    if (!hasMoved.current && group.current) {
      group.current.position.set(...initialPosition);
      group.current.rotation.y = initialRotationY;
      lastSyncedPosition.current.set(...initialPosition);
    }
  }, [initialPosition, initialRotationY]);

  useEffect(() => {
    if (!group.current) return;
    const current = group.current.position;
    onPositionChange([current.x, current.y, current.z], group.current.rotation.y);
  }, [onPositionChange]);

  useEffect(() => {
    const isTextEntry = (targetElement: EventTarget | null) =>
      targetElement instanceof HTMLElement &&
      Boolean(targetElement.closest("input, textarea, [contenteditable='true']"));

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase() as MoveKey;
      if (!(key in keys.current) || isTextEntry(event.target)) return;
      if (!controlsActive.current) return;

      event.preventDefault();
      keys.current[key] = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase() as MoveKey;
      if (key in keys.current) keys.current[key] = false;
    };
    const handleBlur = () => {
      keys.current = { w: false, a: false, s: false, d: false };
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    const frameDelta = Math.min(delta, 0.05);
    const position = group.current.position;
    const inputX = Number(keys.current.d) - Number(keys.current.a);
    const inputZ = Number(keys.current.s) - Number(keys.current.w);
    const hasKeyboardInput = inputX !== 0 || inputZ !== 0;
    const joystickX = joystickInput.current.x;
    const joystickY = joystickInput.current.y;
    const joystickMagnitude = Math.min(1, Math.hypot(joystickX, joystickY));
    const hasJoystickInput = joystickMagnitude > 0.08;
    if (hasKeyboardInput || hasJoystickInput) target.current = null;

    let targetDistance = 0;
    if (hasKeyboardInput) {
      direction.current.set(inputX, 0, inputZ);
    } else if (hasJoystickInput) {
      direction.current.set(joystickX, 0, -joystickY);
    } else if (target.current) {
      direction.current.set(
        target.current.x - position.x,
        0,
        target.current.z - position.z,
      );
      targetDistance = direction.current.length();
      if (targetDistance < 0.12) {
        target.current = null;
        direction.current.set(0, 0, 0);
      }
    } else {
      direction.current.set(0, 0, 0);
    }

    const hasDirection = direction.current.lengthSq() > 0;
    if (hasDirection) direction.current.normalize();

    const maxSpeed = 3.25;
    const targetSpeed = hasKeyboardInput
      ? maxSpeed
      : hasJoystickInput
        ? maxSpeed * joystickMagnitude
        : target.current
          ? Math.min(maxSpeed, targetDistance * 2.4)
          : 0;
    desiredVelocity.current
      .copy(direction.current)
      .multiplyScalar(targetSpeed);

    const currentSpeed = velocity.current.length();
    const response = targetSpeed > currentSpeed ? 9 : 14;
    velocity.current.lerp(
      desiredVelocity.current,
      1 - Math.exp(-response * frameDelta),
    );

    const facingDirection =
      hasDirection ? direction.current : velocity.current;
    if (facingDirection.lengthSq() > 0.0001) {
      const targetRotation = Math.atan2(facingDirection.x, facingDirection.z);
      const rotationDifference = THREE.MathUtils.euclideanModulo(
        targetRotation - group.current.rotation.y + Math.PI,
        Math.PI * 2,
      ) - Math.PI;
      group.current.rotation.y +=
        rotationDifference * (1 - Math.exp(-frameDelta * 12));
    }

    const moving = velocity.current.lengthSq() > 0.0025;
    if (moving) {
      position.addScaledVector(velocity.current, frameDelta);
      const clampedX = THREE.MathUtils.clamp(position.x, -9, 9);
      const clampedZ = THREE.MathUtils.clamp(position.z, -9, 9);
      if (clampedX !== position.x) velocity.current.x = 0;
      if (clampedZ !== position.z) velocity.current.z = 0;
      position.x = clampedX;
      position.z = clampedZ;
      hasMoved.current = true;
    }

    setIsMoving((previous) => (previous === moving ? previous : moving));

    if (moving) {
      cameraTarget.current.set(position.x + 6, 7, position.z + 7);
      camera.position.lerp(cameraTarget.current, 1 - Math.exp(-frameDelta * 3));
      camera.lookAt(position.x, 1, position.z);
    }

    if (
      hasMoved.current &&
      state.clock.elapsedTime - lastSync.current >= 0.25 &&
      position.distanceToSquared(lastSyncedPosition.current) > 0.0025
    ) {
      lastSync.current = state.clock.elapsedTime;
      lastSyncedPosition.current.copy(position);
      onPositionChange([position.x, 0, position.z], group.current.rotation.y);
    }
  });

  return (
    <group ref={group} position={initialPositionRef.current}>
      <Character
        position={[0, 0, 0]}
        color={color}
        isMe
        name={name}
        isMoving={isMoving}
        rotationY={0}
        chatMessage={chatMessage}
      />
    </group>
  );
}
