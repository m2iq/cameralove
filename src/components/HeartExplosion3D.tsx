"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/lib/store";

const HEART_COUNT = 120;
const SPARKLE_COUNT = 80;

// Create a 3D heart shape
function createHeartShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const s = 0.05;
  shape.moveTo(0, s * -8);
  shape.bezierCurveTo(s * -15, s * -25, s * -30, s * -5, 0, s * 15);
  shape.moveTo(0, s * -8);
  shape.bezierCurveTo(s * 15, s * -25, s * 30, s * -5, 0, s * 15);
  return shape;
}

const HEART_COLORS = [
  new THREE.Color("#e11d48"),
  new THREE.Color("#f43f5e"),
  new THREE.Color("#fb7185"),
  new THREE.Color("#fda4af"),
  new THREE.Color("#f9a8d4"),
  new THREE.Color("#f472b6"),
  new THREE.Color("#ec4899"),
  new THREE.Color("#c084fc"),
  new THREE.Color("#a855f7"),
  new THREE.Color("#d946ef"),
];

interface HeartData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotationSpeed: THREE.Vector3;
  scale: number;
  color: THREE.Color;
  life: number;
  maxLife: number;
  active: boolean;
}

function HeartsParticleSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const heartsRef = useRef<HeartData[]>([]);
  const lastTrigger = useRef(0);
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const explosionTrigger = useAppStore((s) => s.explosionTrigger);
  const gestureDetected = useAppStore((s) => s.gestureDetected);

  const geometry = useMemo(() => {
    const shape = createHeartShape();
    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.05,
      bevelThickness: 0.03,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Initialize hearts pool
  useEffect(() => {
    heartsRef.current = Array.from({ length: HEART_COUNT }, () => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      rotationSpeed: new THREE.Vector3(),
      scale: 0,
      color: HEART_COLORS[0],
      life: 0,
      maxLife: 0,
      active: false,
    }));
  }, []);

  // Trigger explosion
  useEffect(() => {
    if (explosionTrigger <= lastTrigger.current) return;
    lastTrigger.current = explosionTrigger;

    const hearts = heartsRef.current;
    const burstCount = 60 + Math.floor(Math.random() * 30);

    for (let i = 0; i < burstCount && i < hearts.length; i++) {
      const h = hearts[i];
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI - Math.PI / 2;
      const speed = 2 + Math.random() * 4;

      h.position.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.3
      );
      h.velocity.set(
        Math.cos(theta) * Math.cos(phi) * speed,
        Math.sin(phi) * speed * 0.8 + 1.5,
        Math.sin(theta) * Math.cos(phi) * speed * 0.5
      );
      h.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      h.rotationSpeed.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1
      );
      h.scale = 0.3 + Math.random() * 1.2;
      h.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
      h.maxLife = 3 + Math.random() * 3;
      h.life = h.maxLife;
      h.active = true;
    }
  }, [explosionTrigger]);

  // Continuous gentle hearts while detected
  const continuousTimer = useRef(0);
  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Continuous spawning while gesture is held
    if (gestureDetected) {
      continuousTimer.current += delta;
      if (continuousTimer.current > 0.15) {
        continuousTimer.current = 0;
        const hearts = heartsRef.current;
        for (let i = 0; i < 3; i++) {
          const h = hearts.find((h) => !h.active);
          if (!h) break;
          h.position.set(
            (Math.random() - 0.5) * 6,
            -4 + Math.random() * 2,
            (Math.random() - 0.5) * 2
          );
          h.velocity.set(
            (Math.random() - 0.5) * 0.5,
            1.5 + Math.random() * 2,
            0
          );
          h.rotation.set(0, 0, (Math.random() - 0.5) * 0.5);
          h.rotationSpeed.set(0, 0, (Math.random() - 0.5) * 0.5);
          h.scale = 0.2 + Math.random() * 0.6;
          h.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
          h.maxLife = 4 + Math.random() * 3;
          h.life = h.maxLife;
          h.active = true;
        }
      }
    }

    const hearts = heartsRef.current;
    for (let i = 0; i < hearts.length; i++) {
      const h = hearts[i];
      if (!h.active) {
        tempObj.scale.setScalar(0);
        tempObj.updateMatrix();
        mesh.setMatrixAt(i, tempObj.matrix);
        continue;
      }

      h.life -= delta;
      if (h.life <= 0) {
        h.active = false;
        tempObj.scale.setScalar(0);
        tempObj.updateMatrix();
        mesh.setMatrixAt(i, tempObj.matrix);
        continue;
      }

      // Physics
      h.velocity.y -= delta * 0.3; // gravity
      h.velocity.multiplyScalar(0.995); // drag
      h.position.addScaledVector(h.velocity, delta);

      h.rotation.x += h.rotationSpeed.x * delta;
      h.rotation.y += h.rotationSpeed.y * delta;
      h.rotation.z += h.rotationSpeed.z * delta;

      // Fade
      const lifeRatio = h.life / h.maxLife;
      const fadeIn = Math.min(1, (h.maxLife - h.life) / 0.3);
      const fadeOut = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1;
      const opacity = fadeIn * fadeOut;

      const currentScale = h.scale * opacity;

      tempObj.position.copy(h.position);
      tempObj.rotation.copy(h.rotation);
      tempObj.scale.setScalar(currentScale);
      tempObj.updateMatrix();
      mesh.setMatrixAt(i, tempObj.matrix);

      tempColor.copy(h.color);
      mesh.setColorAt(i, tempColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, HEART_COUNT]}>
      <meshStandardMaterial
        vertexColors
        emissive="#e11d48"
        emissiveIntensity={0.4}
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

function SparkleSystem() {
  const pointsRef = useRef<THREE.Points>(null);
  const sparklesRef = useRef<{
    positions: Float32Array;
    velocities: Float32Array;
    lives: Float32Array;
    maxLives: Float32Array;
    sizes: Float32Array;
    active: Uint8Array;
  } | null>(null);

  const explosionTrigger = useAppStore((s) => s.explosionTrigger);
  const lastTrigger = useRef(0);

  useEffect(() => {
    sparklesRef.current = {
      positions: new Float32Array(SPARKLE_COUNT * 3),
      velocities: new Float32Array(SPARKLE_COUNT * 3),
      lives: new Float32Array(SPARKLE_COUNT),
      maxLives: new Float32Array(SPARKLE_COUNT),
      sizes: new Float32Array(SPARKLE_COUNT),
      active: new Uint8Array(SPARKLE_COUNT),
    };
  }, []);

  useEffect(() => {
    if (explosionTrigger <= lastTrigger.current) return;
    lastTrigger.current = explosionTrigger;

    const s = sparklesRef.current;
    if (!s) return;

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const i3 = i * 3;
      s.positions[i3] = (Math.random() - 0.5) * 0.5;
      s.positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      s.positions[i3 + 2] = (Math.random() - 0.5) * 0.3;

      const speed = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI - Math.PI / 2;
      s.velocities[i3] = Math.cos(theta) * speed;
      s.velocities[i3 + 1] = Math.sin(phi) * speed + 2;
      s.velocities[i3 + 2] = Math.sin(theta) * speed * 0.3;

      s.maxLives[i] = 1.5 + Math.random() * 2.5;
      s.lives[i] = s.maxLives[i];
      s.sizes[i] = 0.03 + Math.random() * 0.08;
      s.active[i] = 1;
    }
  }, [explosionTrigger]);

  useFrame((_, delta) => {
    const pts = pointsRef.current;
    const s = sparklesRef.current;
    if (!pts || !s) return;

    const geo = pts.geometry;
    const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
    const sizeAttr = geo.getAttribute("size") as THREE.BufferAttribute;

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      if (!s.active[i]) {
        sizeAttr.setX(i, 0);
        continue;
      }
      const i3 = i * 3;

      s.lives[i] -= delta;
      if (s.lives[i] <= 0) {
        s.active[i] = 0;
        sizeAttr.setX(i, 0);
        continue;
      }

      s.velocities[i3 + 1] -= delta * 1.5;
      s.positions[i3] += s.velocities[i3] * delta;
      s.positions[i3 + 1] += s.velocities[i3 + 1] * delta;
      s.positions[i3 + 2] += s.velocities[i3 + 2] * delta;

      const lifeRatio = s.lives[i] / s.maxLives[i];
      const fade = lifeRatio < 0.3 ? lifeRatio / 0.3 : 1;

      posAttr.setXYZ(i, s.positions[i3], s.positions[i3 + 1], s.positions[i3 + 2]);
      sizeAttr.setX(i, s.sizes[i] * fade);
    }

    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(SPARKLE_COUNT * 3);
    const sizes = new Float32Array(SPARKLE_COUNT);
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#fda4af"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 5]} intensity={1.5} color="#fda4af" />
      <pointLight position={[-3, -2, 3]} intensity={0.8} color="#c084fc" />
      <HeartsParticleSystem />
      <SparkleSystem />
    </>
  );
}

export default function HeartExplosion3D() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 35 }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}
