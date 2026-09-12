'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A quiet, product-like 3D scene: a stack of plates, a bowl, a mug and a jug,
 * turning slowly. Every shape is generated from a lathe profile — no external
 * models, textures or HDRIs, so the hero never waits on a network fetch.
 */

const CLAY = '#cf6127';
const PORCELAIN = '#f8f5f1';
const PORCELAIN_COOL = '#e8eff8';
const GLAZE = '#0c7fdc';

/** Revolve a 2D outline to make a solid of revolution. */
function profile(points: [number, number][]): THREE.Vector2[] {
  return points.map(([x, y]) => new THREE.Vector2(x, y));
}

const PLATE_PROFILE = profile([
  [0.0, 0.0],
  [0.62, 0.014],
  [0.82, 0.06],
  [0.94, 0.13],
  [0.96, 0.15],
  [0.87, 0.105],
  [0.6, 0.062],
  [0.0, 0.048],
]);

const BOWL_PROFILE = profile([
  [0.0, 0.0],
  [0.26, 0.01],
  [0.3, 0.04],
  [0.5, 0.28],
  [0.62, 0.52],
  [0.64, 0.56],
  [0.59, 0.53],
  [0.46, 0.29],
  [0.26, 0.06],
  [0.0, 0.05],
]);

const JUG_PROFILE = profile([
  [0.0, -0.62],
  [0.3, -0.6],
  [0.34, -0.55],
  [0.4, -0.28],
  [0.42, 0.02],
  [0.34, 0.32],
  [0.29, 0.5],
  [0.3, 0.56],
  [0.26, 0.53],
  [0.3, 0.3],
  [0.36, 0.0],
  [0.34, -0.3],
  [0.0, -0.56],
]);

const MUG_PROFILE = profile([
  [0.0, -0.4],
  [0.3, -0.39],
  [0.33, -0.34],
  [0.35, 0.0],
  [0.36, 0.36],
  [0.37, 0.4],
  [0.32, 0.38],
  [0.31, 0.0],
  [0.29, -0.32],
  [0.0, -0.33],
]);

function Lathe({
  points,
  color,
  roughness = 0.3,
  metalness = 0.06,
  segments = 96,
}: {
  points: THREE.Vector2[];
  color: string;
  roughness?: number;
  metalness?: number;
  segments?: number;
}) {
  return (
    <mesh castShadow receiveShadow>
      <latheGeometry args={[points, segments]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Four plates, turning together. */
function PlateStack() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.16;
  });

  const plates = useMemo(
    () => [
      { y: 0, scale: 1.0, color: PORCELAIN },
      { y: 0.145, scale: 0.94, color: PORCELAIN_COOL },
      { y: 0.29, scale: 0.88, color: PORCELAIN },
      { y: 0.435, scale: 0.8, color: PORCELAIN_COOL },
    ],
    [],
  );

  return (
    <group ref={group} position={[-1.4, -0.5, 0.1]}>
      {plates.map((p, i) => (
        <group key={i} position={[0, p.y, 0]} scale={[p.scale, 1, p.scale]}>
          <Lathe points={PLATE_PROFILE} color={p.color} roughness={0.26} metalness={0.08} />
        </group>
      ))}
    </group>
  );
}

function Bowl() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.22;
  });
  return (
    <Float speed={1.3} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={group} position={[0.3, 0.42, -0.25]} scale={1.25}>
        <Lathe points={BOWL_PROFILE} color={GLAZE} roughness={0.18} metalness={0.2} />
      </group>
    </Float>
  );
}

function Mug() {
  return (
    <Float speed={1.05} rotationIntensity={0.2} floatIntensity={0.35}>
      <group position={[1.55, -0.2, 0.4]} rotation={[0, -0.45, 0.05]} scale={1.05}>
        <Lathe points={MUG_PROFILE} color={CLAY} roughness={0.42} metalness={0.04} />
        {/* Handle, sitting flush against the mug wall. */}
        <mesh position={[0.4, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <torusGeometry args={[0.19, 0.045, 16, 40, Math.PI * 1.25]} />
          <meshStandardMaterial color={CLAY} roughness={0.42} metalness={0.04} />
        </mesh>
      </group>
    </Float>
  );
}

function Jug() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y -= delta * 0.1;
  });
  return (
    <Float speed={0.85} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={group} position={[1.0, 0.62, -1.15]} scale={1.15}>
        <Lathe points={JUG_PROFILE} color="#eef2f7" roughness={0.16} metalness={0.26} />
      </group>
    </Float>
  );
}

/** Gentle parallax so the scene follows the pointer without feeling twitchy. */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    const targetX = state.pointer.y * 0.08;
    const targetY = state.pointer.x * 0.22;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 3, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

export default function CrockeryScene({ className }: { className?: string }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={className} aria-hidden>
      <Canvas
        shadows
        dpr={[1, 1.8]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0.1, 1.0, 6.4]} fov={42} />
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[3.5, 6, 4]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
        />
        <directionalLight position={[-5, 2.5, -2]} intensity={0.85} color="#a8cdff" />
        <pointLight position={[0.5, -1.2, 3]} intensity={9} color="#ffd9b8" distance={8} />

        <Suspense fallback={null}>
          {/* Everything sits in one group so the whole arrangement can be
              nudged for framing without moving each piece by hand. */}
          <group position={[-0.15, 0.05, 0]}>
            <ParallaxRig>
              <PlateStack />
              <Bowl />
              <Mug />
              <Jug />
            </ParallaxRig>
            <ContactShadows
              position={[0, -1.02, 0]}
              opacity={0.26}
              scale={18}
              blur={3.4}
              far={3.2}
              resolution={512}
            />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
