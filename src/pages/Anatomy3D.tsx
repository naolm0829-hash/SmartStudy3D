// @ts-nocheck
import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, ContactShadows } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Layers, Info, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

type BodyLayer = "skin" | "muscles" | "skeleton" | "organs" | "cells";

const layerConfig: { id: BodyLayer; label: string; color: string; emoji: string }[] = [
  { id: "skin", label: "Skin", color: "#FFDAB9", emoji: "🧑" },
  { id: "muscles", label: "Muscles", color: "#C0392B", emoji: "💪" },
  { id: "skeleton", label: "Skeleton", color: "#F5F5DC", emoji: "🦴" },
  { id: "organs", label: "Organs", color: "#E74C3C", emoji: "🫀" },
  { id: "cells", label: "Cells", color: "#🔬", emoji: "🔬" },
];

const organData = [
  { name: "Brain", position: [0, 3.8, 0.05] as [number, number, number], size: [0.5, 0.4, 0.45], color: "#F5A3B5", info: "The brain has ~86 billion neurons controlling cognition, memory, emotions, and motor functions." },
  { name: "Heart", position: [-0.15, 2.0, 0.35] as [number, number, number], size: [0.2, 0.25, 0.2], color: "#B71C1C", info: "The heart beats ~100,000 times/day pumping ~7,500 liters of blood." },
  { name: "Left Lung", position: [-0.55, 2.35, 0.05] as [number, number, number], size: [0.3, 0.5, 0.25], color: "#F48FB1", info: "The left lung has 2 lobes. Lungs have ~480 million alveoli." },
  { name: "Right Lung", position: [0.55, 2.35, 0.05] as [number, number, number], size: [0.35, 0.55, 0.28], color: "#F48FB1", info: "The right lung has 3 lobes and is slightly larger." },
  { name: "Liver", position: [0.45, 1.35, 0.2] as [number, number, number], size: [0.45, 0.25, 0.3], color: "#6D2B15", info: "The liver performs 500+ functions including detoxification and bile production." },
  { name: "Stomach", position: [-0.25, 1.15, 0.3] as [number, number, number], size: [0.25, 0.2, 0.2], color: "#E8967A", info: "The stomach uses HCl acid (pH 1.5-3.5) to digest food." },
  { name: "Kidneys", position: [0, 0.6, -0.15] as [number, number, number], size: [0.15, 0.2, 0.1], color: "#8B1A1A", info: "Kidneys filter ~180 liters of blood daily." },
  { name: "Intestines", position: [0, 0.0, 0.15] as [number, number, number], size: [0.5, 0.35, 0.3], color: "#EFADC0", info: "Small intestine ~6m, large intestine ~1.5m long." },
];

/* ── Helper: Lathe profile for smooth organic shapes ── */
function createBodyProfile(points: [number, number][], segments = 64) {
  const pts = points.map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, segments);
}

/* ── Realistic Skin Body using Lathe geometry for smooth contours ── */
function SkinLayer({ opacity }: { opacity: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0005; });

  const skinMat = useMemo(() => ({
    color: "#D4A07A",
    roughness: 0.45,
    clearcoat: 0.4,
    clearcoatRoughness: 0.35,
    sheen: 1.2,
    sheenRoughness: 0.35,
    sheenColor: "#E8C4A0",
    transparent: true,
    opacity,
    envMapIntensity: 0.6,
  }), [opacity]);

  // Torso profile (lathe around Y axis) — creates smooth human silhouette
  const torsoGeo = useMemo(() => {
    const pts: [number, number][] = [
      [0, -0.8],    // bottom pelvis
      [0.48, -0.6], // hip width
      [0.42, -0.2], // waist narrowing
      [0.38, 0.0],  // natural waist
      [0.42, 0.3],  // lower ribcage
      [0.50, 0.6],  // chest
      [0.52, 0.8],  // upper chest
      [0.42, 1.0],  // shoulder base
      [0.18, 1.15], // neck base
      [0, 1.2],     // top center
    ];
    return createBodyProfile(pts, 48);
  }, []);

  // Head profile
  const headGeo = useMemo(() => {
    const pts: [number, number][] = [
      [0, -0.4],    // chin point
      [0.18, -0.35],// chin width
      [0.26, -0.2], // jaw
      [0.32, -0.05],// lower cheek
      [0.36, 0.1],  // cheekbone
      [0.38, 0.25], // temple
      [0.37, 0.4],  // forehead side
      [0.34, 0.55], // upper forehead
      [0.28, 0.65], // crown side
      [0.18, 0.72], // top side
      [0, 0.75],    // top center
    ];
    return createBodyProfile(pts, 48);
  }, []);

  return (
    <group ref={ref}>
      {/* Head — lathe-based smooth skull shape */}
      <mesh position={[0, 3.65, 0.02]} geometry={headGeo}>
        <meshPhysicalMaterial {...skinMat} />
      </mesh>

      {/* Facial features */}
      {/* Nose bridge + tip */}
      <mesh position={[0, 3.55, 0.38]}>
        <boxGeometry args={[0.06, 0.22, 0.1]} />
        <meshPhysicalMaterial {...skinMat} />
      </mesh>
      <mesh position={[0, 3.45, 0.42]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshPhysicalMaterial {...skinMat} />
      </mesh>
      {/* Nostrils */}
      {[-0.025, 0.025].map(x => (
        <mesh key={`nostril${x}`} position={[x, 3.42, 0.41]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshPhysicalMaterial color="#B8896A" roughness={0.6} transparent opacity={opacity} />
        </mesh>
      ))}

      {/* Eye sockets — slight indentation */}
      {[-0.12, 0.12].map(x => (
        <group key={`eye${x}`}>
          <mesh position={[x, 3.6, 0.33]}>
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshPhysicalMaterial color="#F5F5F0" roughness={0.1} clearcoat={1} transparent opacity={opacity * 0.9} />
          </mesh>
          {/* Iris */}
          <mesh position={[x, 3.6, 0.38]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshPhysicalMaterial color="#5D4E37" roughness={0.3} transparent opacity={opacity} />
          </mesh>
          {/* Pupil */}
          <mesh position={[x, 3.6, 0.395]}>
            <sphereGeometry args={[0.015, 12, 12]} />
            <meshPhysicalMaterial color="#111111" roughness={0.1} transparent opacity={opacity} />
          </mesh>
          {/* Eyelid */}
          <mesh position={[x, 3.63, 0.34]} scale={[1.4, 0.5, 0.8]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Eyebrow */}
          <mesh position={[x, 3.7, 0.33]} scale={[2.2, 0.35, 0.6]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshPhysicalMaterial color="#6B4F3A" roughness={0.8} transparent opacity={opacity * 0.7} />
          </mesh>
        </group>
      ))}

      {/* Lips */}
      <mesh position={[0, 3.35, 0.35]} scale={[1, 0.45, 0.6]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial color="#C4766E" roughness={0.35} sheen={1.5} sheenColor="#E8A0A0" clearcoat={0.6} transparent opacity={opacity} />
      </mesh>
      {/* Lower lip */}
      <mesh position={[0, 3.32, 0.34]} scale={[0.9, 0.35, 0.5]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshPhysicalMaterial color="#C9807A" roughness={0.4} sheen={1.2} sheenColor="#E8A0A0" clearcoat={0.5} transparent opacity={opacity} />
      </mesh>

      {/* Ears */}
      {[-0.37, 0.37].map(x => (
        <group key={`ear${x}`}>
          <mesh position={[x, 3.58, -0.02]} scale={[0.08, 0.14, 0.06]} rotation={[0, x > 0 ? -0.2 : 0.2, 0]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Ear lobe */}
          <mesh position={[x * 1.02, 3.47, -0.01]} scale={[0.04, 0.05, 0.03]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
        </group>
      ))}

      {/* Neck — tapered cylinder */}
      <mesh position={[0, 3.1, 0.02]}>
        <cylinderGeometry args={[0.13, 0.17, 0.35, 32]} />
        <meshPhysicalMaterial {...skinMat} />
      </mesh>
      {/* Adam's apple hint */}
      <mesh position={[0, 3.12, 0.16]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshPhysicalMaterial {...skinMat} />
      </mesh>

      {/* Torso — lathe-based smooth body */}
      <mesh position={[0, 1.1, 0]} geometry={torsoGeo} scale={[1, 1, 0.55]}>
        <meshPhysicalMaterial {...skinMat} />
      </mesh>

      {/* Chest definition — subtle pectoral shape */}
      {[-0.18, 0.18].map(x => (
        <mesh key={`chest${x}`} position={[x, 2.35, 0.32]} scale={[1, 0.7, 0.35]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshPhysicalMaterial {...skinMat} />
        </mesh>
      ))}

      {/* Shoulders — smooth rounded */}
      {[-0.58, 0.58].map(x => (
        <mesh key={`sh${x}`} position={[x, 2.75, 0]} scale={[1, 0.8, 0.85]}>
          <sphereGeometry args={[0.18, 32, 32]} />
          <meshPhysicalMaterial {...skinMat} />
        </mesh>
      ))}

      {/* Arms */}
      {[-1, 1].map(side => (
        <group key={`arm${side}`}>
          {/* Upper arm — tapered */}
          <mesh position={[side * 0.78, 2.25, 0]} rotation={[0, 0, side * -0.06]}>
            <cylinderGeometry args={[0.1, 0.12, 0.95, 24]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Elbow — smooth joint */}
          <mesh position={[side * 0.8, 1.7, 0]}>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Forearm — tapered */}
          <mesh position={[side * 0.82, 1.2, 0.02]} rotation={[0.03, 0, side * -0.03]}>
            <cylinderGeometry args={[0.07, 0.1, 0.85, 24]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Wrist */}
          <mesh position={[side * 0.83, 0.72, 0.03]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Hand — flattened ovoid */}
          <mesh position={[side * 0.84, 0.52, 0.04]} scale={[0.55, 0.85, 0.3]}>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Fingers — 4 grouped */}
          {[0, 1, 2, 3].map(f => (
            <mesh key={`finger${f}`} position={[side * (0.8 + (f - 1.5) * 0.018), 0.38, 0.04 + (f - 1.5) * 0.01]}>
              <capsuleGeometry args={[0.012, 0.1, 6, 8]} />
              <meshPhysicalMaterial {...skinMat} />
            </mesh>
          ))}
          {/* Thumb */}
          <mesh position={[side * 0.76, 0.48, 0.08]} rotation={[0.3, side * 0.4, side * 0.3]}>
            <capsuleGeometry args={[0.015, 0.07, 6, 8]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
        </group>
      ))}

      {/* Legs */}
      {[-0.22, 0.22].map(x => (
        <group key={`leg${x}`}>
          {/* Thigh — tapered, wider at top */}
          <mesh position={[x, -0.15, 0]}>
            <cylinderGeometry args={[0.13, 0.19, 1.1, 28]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Knee — subtle bump */}
          <mesh position={[x, -0.82, 0.06]}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Shin/Calf — tapered */}
          <mesh position={[x, -1.5, 0.01]}>
            <cylinderGeometry args={[0.08, 0.12, 1.1, 24]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Calf muscle bulge */}
          <mesh position={[x, -1.3, -0.06]} scale={[0.9, 1, 0.7]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Ankle */}
          <mesh position={[x, -2.1, 0.02]}>
            <sphereGeometry args={[0.07, 14, 14]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Foot — elongated, flat bottom */}
          <mesh position={[x, -2.25, 0.1]} scale={[0.4, 0.18, 0.75]}>
            <sphereGeometry args={[0.22, 20, 20]} />
            <meshPhysicalMaterial {...skinMat} />
          </mesh>
          {/* Toes */}
          {[0, 1, 2, 3, 4].map(t => (
            <mesh key={`toe${t}`} position={[x + (t - 2) * 0.018, -2.3, 0.26 - Math.abs(t - 2) * 0.01]}>
              <sphereGeometry args={[0.015 - Math.abs(t - 1) * 0.001, 8, 8]} />
              <meshPhysicalMaterial {...skinMat} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Navel */}
      <mesh position={[0, 1.25, 0.42]}>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshPhysicalMaterial color="#B8896A" roughness={0.7} transparent opacity={opacity * 0.6} />
      </mesh>

      {/* Collarbone hints */}
      {[-1, 1].map(side => (
        <mesh key={`collarbone${side}`} position={[side * 0.25, 2.82, 0.2]} rotation={[0.1, 0, side * 0.25]} scale={[1, 0.3, 0.3]}>
          <capsuleGeometry args={[0.02, 0.3, 6, 12]} />
          <meshPhysicalMaterial {...skinMat} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Realistic Muscle Layer ── */
function MuscleLayer({ opacity }: { opacity: number }) {
  const muscleMat = (color: string, op = opacity) => ({
    color,
    roughness: 0.55,
    clearcoat: 0.2,
    sheen: 1.4,
    sheenRoughness: 0.25,
    sheenColor: "#E57373",
    transparent: true,
    opacity: op,
    envMapIntensity: 0.4,
  });

  return (
    <group>
      {/* Trapezius */}
      <mesh position={[0, 2.9, -0.12]} scale={[1.3, 0.55, 0.4]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial {...muscleMat("#A63030")} />
      </mesh>

      {/* Pectorals — more defined */}
      {[-0.2, 0.2].map(x => (
        <mesh key={`pec${x}`} position={[x, 2.4, 0.32]} scale={[1, 0.6, 0.35]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshPhysicalMaterial {...muscleMat("#C62828")} />
        </mesh>
      ))}

      {/* Deltoids — capping shoulders */}
      {[-0.65, 0.65].map(x => (
        <mesh key={`delt${x}`} position={[x, 2.7, 0]} scale={[0.7, 0.65, 0.6]}>
          <sphereGeometry args={[0.2, 28, 28]} />
          <meshPhysicalMaterial {...muscleMat("#D32F2F")} />
        </mesh>
      ))}

      {/* Rectus abdominis — 6-pack */}
      {[2.05, 1.85, 1.65, 1.45].map((y, i) => (
        <group key={`abs${i}`}>
          {[-0.1, 0.1].map(x => (
            <mesh key={`ab${x}${y}`} position={[x, y, 0.42]} scale={[1, 1, 0.25]}>
              <boxGeometry args={[0.16, 0.15, 0.12]} />
              <meshPhysicalMaterial {...muscleMat("#B71C1C", opacity * 0.85)} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Linea alba */}
      <mesh position={[0, 1.72, 0.44]}>
        <boxGeometry args={[0.015, 1.0, 0.04]} />
        <meshPhysicalMaterial color="#8B0000" transparent opacity={opacity * 0.5} roughness={0.5} />
      </mesh>

      {/* External obliques */}
      {[-0.35, 0.35].map(x => (
        <mesh key={`obl${x}`} position={[x, 1.65, 0.22]} scale={[0.45, 1.1, 0.28]}>
          <capsuleGeometry args={[0.14, 0.55, 8, 24]} />
          <meshPhysicalMaterial {...muscleMat("#A63030", opacity * 0.6)} />
        </mesh>
      ))}

      {/* Serratus anterior */}
      {[-0.42, 0.42].map(x => (
        <group key={`serratus${x}`}>
          {[2.2, 2.05, 1.9].map((y, i) => (
            <mesh key={i} position={[x, y, 0.18]} scale={[0.4, 0.4, 0.2]}>
              <boxGeometry args={[0.12, 0.08, 0.08]} />
              <meshPhysicalMaterial {...muscleMat("#B71C1C", opacity * 0.45)} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Biceps & Triceps */}
      {[-0.78, 0.78].map(x => (
        <group key={`armm${x}`}>
          {/* Bicep — fusiform shape */}
          <mesh position={[x, 2.2, 0.08]} rotation={[0, 0, x > 0 ? -0.06 : 0.06]}>
            <capsuleGeometry args={[0.09, 0.5, 12, 24]} />
            <meshPhysicalMaterial {...muscleMat("#E53935")} />
          </mesh>
          {/* Tricep */}
          <mesh position={[x, 2.2, -0.08]} rotation={[0, 0, x > 0 ? -0.06 : 0.06]}>
            <capsuleGeometry args={[0.08, 0.48, 10, 24]} />
            <meshPhysicalMaterial {...muscleMat("#C62828")} />
          </mesh>
          {/* Brachioradialis (forearm) */}
          <mesh position={[x * 1.02, 1.3, 0.04]} rotation={[0, 0, x > 0 ? -0.03 : 0.03]}>
            <capsuleGeometry args={[0.06, 0.5, 8, 20]} />
            <meshPhysicalMaterial {...muscleMat("#D32F2F", opacity * 0.7)} />
          </mesh>
        </group>
      ))}

      {/* Quadriceps — 4-headed */}
      {[-0.22, 0.22].map(x => (
        <group key={`quad${x}`}>
          {/* Rectus femoris */}
          <mesh position={[x, -0.2, 0.1]}>
            <capsuleGeometry args={[0.12, 0.8, 10, 24]} />
            <meshPhysicalMaterial {...muscleMat("#C62828")} />
          </mesh>
          {/* Vastus lateralis */}
          <mesh position={[x + (x > 0 ? 0.06 : -0.06), -0.2, 0.04]}>
            <capsuleGeometry args={[0.09, 0.7, 8, 20]} />
            <meshPhysicalMaterial {...muscleMat("#B71C1C", opacity * 0.7)} />
          </mesh>
          {/* Hamstrings */}
          <mesh position={[x, -0.2, -0.1]}>
            <capsuleGeometry args={[0.11, 0.7, 8, 24]} />
            <meshPhysicalMaterial {...muscleMat("#A63030", opacity * 0.75)} />
          </mesh>
          {/* Gastrocnemius (calf) */}
          <mesh position={[x, -1.4, -0.05]} scale={[1, 1, 0.8]}>
            <capsuleGeometry args={[0.08, 0.45, 8, 20]} />
            <meshPhysicalMaterial {...muscleMat("#D32F2F", opacity * 0.7)} />
          </mesh>
          {/* Soleus (deep calf) */}
          <mesh position={[x, -1.55, -0.02]}>
            <capsuleGeometry args={[0.06, 0.35, 6, 16]} />
            <meshPhysicalMaterial {...muscleMat("#C62828", opacity * 0.5)} />
          </mesh>
        </group>
      ))}

      {/* Gluteus maximus */}
      {[-0.18, 0.18].map(x => (
        <mesh key={`glute${x}`} position={[x, 0.25, -0.2]} scale={[1.1, 0.75, 0.7]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshPhysicalMaterial {...muscleMat("#B71C1C", opacity * 0.7)} />
        </mesh>
      ))}

      {/* Latissimus dorsi */}
      {[-0.38, 0.38].map(x => (
        <mesh key={`lat${x}`} position={[x, 2.0, -0.22]} scale={[0.9, 1.3, 0.22]}>
          <capsuleGeometry args={[0.18, 0.5, 8, 24]} />
          <meshPhysicalMaterial {...muscleMat("#A63030", opacity * 0.5)} />
        </mesh>
      ))}

      {/* Erector spinae */}
      {[-0.08, 0.08].map(x => (
        <mesh key={`erector${x}`} position={[x, 1.5, -0.2]}>
          <capsuleGeometry args={[0.05, 1.8, 6, 16]} />
          <meshPhysicalMaterial {...muscleMat("#8B2020", opacity * 0.4)} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Realistic Skeleton ── */
function SkeletonLayer({ opacity }: { opacity: number }) {
  const boneMat = useMemo(() => ({
    color: "#F0EBD8",
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity,
  }), [opacity]);

  return (
    <group>
      {/* Skull */}
      <mesh position={[0, 3.9, 0]} scale={[0.9, 1, 0.85]}>
        <sphereGeometry args={[0.48, 48, 48]} />
        <meshPhysicalMaterial {...boneMat} />
      </mesh>
      {/* Mandible */}
      <mesh position={[0, 3.4, 0.15]} scale={[0.65, 0.3, 0.45]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshPhysicalMaterial {...boneMat} />
      </mesh>
      {/* Eye sockets */}
      {[-0.15, 0.15].map(x => (
        <mesh key={`eye${x}`} position={[x, 3.9, 0.38]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={opacity * 0.9} />
        </mesh>
      ))}
      {/* Nasal cavity */}
      <mesh position={[0, 3.72, 0.42]} scale={[0.5, 0.8, 0.4]}>
        <coneGeometry args={[0.06, 0.12, 8]} />
        <meshPhysicalMaterial {...boneMat} />
      </mesh>
      {/* Teeth row hint */}
      <mesh position={[0, 3.38, 0.28]} scale={[0.7, 0.2, 0.3]}>
        <boxGeometry args={[0.3, 0.04, 0.08]} />
        <meshPhysicalMaterial color="#F5F0E0" roughness={0.1} clearcoat={1} transparent opacity={opacity * 0.7} />
      </mesh>

      {/* Cervical spine (7 vertebrae) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`cerv${i}`} position={[0, 3.2 - i * 0.1, -0.1]}>
          <cylinderGeometry args={[0.06, 0.07, 0.08, 12]} />
          <meshPhysicalMaterial {...boneMat} />
        </mesh>
      ))}

      {/* Thoracic + Lumbar spine (17 vertebrae) */}
      {Array.from({ length: 17 }).map((_, i) => (
        <mesh key={`vert${i}`} position={[0, 2.5 - i * 0.17, -0.15]} scale={[1, 1, 0.8]}>
          <cylinderGeometry args={[0.06 + i * 0.002, 0.07 + i * 0.002, 0.12, 12]} />
          <meshPhysicalMaterial {...boneMat} />
        </mesh>
      ))}

      {/* Sacrum */}
      <mesh position={[0, 0.15, -0.18]} scale={[1.2, 1, 0.6]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshPhysicalMaterial {...boneMat} />
      </mesh>

      {/* Rib cage (12 pairs) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={`rib${i}`}>
          {[-1, 1].map(side => {
            const ribLen = i < 7 ? 0.35 - i * 0.01 : 0.28 - (i - 7) * 0.03;
            return (
              <mesh key={`r${side}${i}`} position={[side * 0.2, 2.5 - i * 0.14, 0.1]} rotation={[0.2, 0, side * (0.5 + i * 0.02)]}>
                <torusGeometry args={[ribLen, 0.015, 8, 24, Math.PI * 0.8]} />
                <meshPhysicalMaterial {...boneMat} opacity={opacity * 0.75} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Sternum */}
      <mesh position={[0, 2.2, 0.35]}>
        <boxGeometry args={[0.08, 0.9, 0.03]} />
        <meshPhysicalMaterial {...boneMat} />
      </mesh>

      {/* Clavicles */}
      {[-1, 1].map(side => (
        <mesh key={`clav${side}`} position={[side * 0.35, 2.8, 0.15]} rotation={[0, 0, side * 0.2]}>
          <capsuleGeometry args={[0.02, 0.4, 6, 12]} />
          <meshPhysicalMaterial {...boneMat} />
        </mesh>
      ))}

      {/* Scapulae */}
      {[-0.5, 0.5].map(x => (
        <mesh key={`scap${x}`} position={[x, 2.5, -0.25]} scale={[0.6, 1, 0.15]}>
          <coneGeometry args={[0.2, 0.5, 3]} />
          <meshPhysicalMaterial {...boneMat} opacity={opacity * 0.6} />
        </mesh>
      ))}

      {/* Pelvis */}
      <mesh position={[0, 0.35, 0]} scale={[1.3, 0.5, 0.6]}>
        <torusGeometry args={[0.3, 0.08, 12, 24, Math.PI]} />
        <meshPhysicalMaterial {...boneMat} />
      </mesh>

      {/* Arms */}
      {[-1, 1].map(side => (
        <group key={`armb${side}`}>
          <mesh position={[side * 0.75, 2.25, 0]} rotation={[0, 0, side * -0.06]}>
            <capsuleGeometry args={[0.035, 0.9, 6, 16]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.78, 1.7, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.8, 1.2, 0.03]}>
            <capsuleGeometry args={[0.025, 0.75, 6, 12]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.82, 1.2, -0.03]}>
            <capsuleGeometry args={[0.02, 0.7, 6, 12]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.81, 0.72, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          {/* Hand bones (metacarpals) */}
          {[0, 1, 2, 3, 4].map(f => (
            <mesh key={`mc${f}`} position={[side * (0.78 + (f - 2) * 0.015), 0.55, 0.04 + (f - 2) * 0.008]}>
              <capsuleGeometry args={[0.008, 0.12, 4, 6]} />
              <meshPhysicalMaterial {...boneMat} opacity={opacity * 0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Legs */}
      {[-0.22, 0.22].map(x => (
        <group key={`legb${x}`}>
          <mesh position={[x, -0.2, 0]}>
            <capsuleGeometry args={[0.045, 0.9, 6, 16]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[x, -0.8, 0.1]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[x, -1.5, 0.02]}>
            <capsuleGeometry args={[0.035, 0.9, 6, 16]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[x * 1.15, -1.5, -0.02]}>
            <capsuleGeometry args={[0.02, 0.8, 6, 12]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          <mesh position={[x, -2.05, 0.05]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshPhysicalMaterial {...boneMat} />
          </mesh>
          {/* Metatarsals */}
          {[0, 1, 2, 3, 4].map(t => (
            <mesh key={`mt${t}`} position={[x + (t - 2) * 0.015, -2.2, 0.12 + t * 0.02]}>
              <capsuleGeometry args={[0.008, 0.08, 4, 6]} />
              <meshPhysicalMaterial {...boneMat} opacity={opacity * 0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── Organs ── */
function OrgansLayer({ opacity, selected, onSelect }: { opacity: number; selected: string | null; onSelect: (n: string | null) => void }) {
  return (
    <group>
      {organData.map(organ => (
        <OrganMesh key={organ.name} data={organ} opacity={opacity} isSelected={selected === organ.name} onSelect={onSelect} />
      ))}
      <BloodVessels opacity={opacity} />
      <Trachea opacity={opacity} />
    </group>
  );
}

function OrganMesh({ data, opacity, isSelected, onSelect }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    const t = isSelected ? 1 + Math.sin(Date.now() * 0.004) * 0.04 : hovered ? 1.06 : 1;
    ref.current.scale.lerp(new THREE.Vector3(t, t, t), 0.08);
  });

  return (
    <group position={data.position}>
      <mesh
        ref={ref}
        onClick={e => { e.stopPropagation(); onSelect(isSelected ? null : data.name); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[Math.max(...data.size), 32, 32]} />
        <meshPhysicalMaterial
          color={data.color}
          transparent
          opacity={isSelected ? opacity : hovered ? opacity * 0.85 : opacity * 0.7}
          roughness={0.35}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
          sheen={0.8}
          sheenColor={data.color}
          emissive={isSelected ? data.color : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      <Html distanceFactor={10} position={[0, Math.max(...data.size) + 0.12, 0]} center style={{ pointerEvents: "none" }}>
        <span className={`text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full backdrop-blur-md ${isSelected ? "bg-primary text-primary-foreground shadow-lg" : "bg-background/60 text-foreground/80"}`}>
          {data.name}
        </span>
      </Html>
      {isSelected && (
        <Html distanceFactor={10} position={[Math.max(...data.size) + 0.5, 0, 0]} style={{ pointerEvents: "none" }}>
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 w-52 shadow-2xl">
            <h4 className="text-xs font-bold" style={{ color: data.color }}>{data.name}</h4>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{data.info}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function BloodVessels({ opacity }: { opacity: number }) {
  const curves = useMemo(() => {
    const aorta = Array.from({ length: 12 }, (_, i) => new THREE.Vector3(
      Math.sin(i * 0.3) * 0.12 + 0.05, 3.6 - i * 0.35, Math.cos(i * 0.4) * 0.08 + 0.15
    ));
    const carotidL = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(-0.12, 3.1 + i * 0.15, 0.08));
    const carotidR = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(0.12, 3.1 + i * 0.15, 0.08));
    const venaC = Array.from({ length: 10 }, (_, i) => new THREE.Vector3(
      -Math.sin(i * 0.25) * 0.1 + 0.15, 3.4 - i * 0.35, Math.cos(i * 0.3) * 0.06 + 0.1
    ));
    return [
      { curve: new THREE.CatmullRomCurve3(aorta), r: 0.022, color: "#D32F2F" },
      { curve: new THREE.CatmullRomCurve3(carotidL), r: 0.012, color: "#E53935" },
      { curve: new THREE.CatmullRomCurve3(carotidR), r: 0.012, color: "#E53935" },
      { curve: new THREE.CatmullRomCurve3(venaC), r: 0.02, color: "#1565C0" },
    ];
  }, []);

  return (
    <group>
      {curves.map((v, i) => (
        <mesh key={i}>
          <tubeGeometry args={[v.curve, 32, v.r, 12, false]} />
          <meshPhysicalMaterial color={v.color} transparent opacity={opacity * 0.55} roughness={0.4} clearcoat={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Trachea({ opacity }: { opacity: number }) {
  const curve = useMemo(() => {
    const pts = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(0, 3.2 - i * 0.15, 0.12));
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  return (
    <mesh>
      <tubeGeometry args={[curve, 16, 0.04, 12, false]} />
      <meshPhysicalMaterial color="#E0C8A8" transparent opacity={opacity * 0.4} roughness={0.5} clearcoat={0.3} />
    </mesh>
  );
}

/* ── Cells ── */
function CellsLayer({ opacity }: { opacity: number }) {
  const cells = useMemo(() => {
    const arr = [];
    const types = [
      { color: "#E53935", name: "Red Blood Cell" },
      { color: "#FFFFFF", name: "White Blood Cell" },
      { color: "#8E24AA", name: "Platelet" },
      { color: "#43A047", name: "Nerve Cell" },
      { color: "#FB8C00", name: "Epithelial" },
    ];
    for (let i = 0; i < 80; i++) {
      const t = types[Math.floor(Math.random() * types.length)];
      arr.push({
        pos: [(Math.random() - 0.5) * 1.4, Math.random() * 5 - 1, (Math.random() - 0.5) * 0.8] as [number, number, number],
        size: 0.02 + Math.random() * 0.04,
        ...t,
        speed: 0.001 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {cells.map((cell, i) => (
        <CellParticle key={i} cell={cell} opacity={opacity} />
      ))}
    </group>
  );
}

function CellParticle({ cell, opacity }: { cell: any; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = cell.pos[1] + Math.sin(t * cell.speed * 100 + cell.phase) * 0.12;
    ref.current.position.x = cell.pos[0] + Math.cos(t * cell.speed * 80 + cell.phase) * 0.04;
  });

  return (
    <mesh ref={ref} position={cell.pos}>
      <sphereGeometry args={[cell.size, 12, 12]} />
      <meshPhysicalMaterial color={cell.color} transparent opacity={opacity * 0.5} roughness={0.2} clearcoat={1} emissive={cell.color} emissiveIntensity={0.15} />
    </mesh>
  );
}

/* ── Main Component ── */
const Anatomy3D = () => {
  const [activeLayers, setActiveLayers] = useState<Set<BodyLayer>>(new Set(["skin"]));
  const [selected, setSelected] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(true);

  const toggleLayer = useCallback((layer: BodyLayer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  }, []);

  const presets = [
    { label: "Full Body", layers: ["skin"] as BodyLayer[] },
    { label: "X-Ray", layers: ["skeleton", "organs"] as BodyLayer[] },
    { label: "Deep View", layers: ["muscles", "skeleton", "organs", "cells"] as BodyLayer[] },
    { label: "All Layers", layers: ["skin", "muscles", "skeleton", "organs", "cells"] as BodyLayer[] },
  ];

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <Link to="/3d">
            <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-sm font-bold">Anatomy Lab</h1>
            <p className="text-[10px] text-muted-foreground">Interactive Human Body Explorer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" onClick={() => setShowPanel(!showPanel)} title={showPanel ? "Hide layers panel" : "Show layers panel"}>
            {showPanel ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span className="hidden sm:inline">{showPanel ? "Hide" : "Layers"}</span>
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" onClick={() => { setActiveLayers(new Set(["skin"])); setSelected(null); }}>
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 2, 6.5], fov: 42 }} shadows dpr={[1, 2]}>
          <color attach="background" args={["#0a0f1a"]} />
          <fog attach="fog" args={["#0a0f1a", 12, 25]} />

          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow shadow-mapSize={2048} color="#fff5ee" />
          <directionalLight position={[-3, 6, -4]} intensity={0.5} color="#a5b4fc" />
          <spotLight position={[0, 12, 3]} angle={0.25} penumbra={1} intensity={2.5} color="#f1f5f9" castShadow />
          <spotLight position={[-3, 4, 6]} angle={0.4} penumbra={0.8} intensity={0.8} color="#fecdd3" />
          <spotLight position={[3, 2, -4]} angle={0.3} penumbra={0.6} intensity={0.4} color="#c7d2fe" />
          <pointLight position={[0, 2, 3]} intensity={0.3} color="#FFE4E1" />
          <hemisphereLight args={["#c7d2fe", "#0f172a", 0.3]} />

          {activeLayers.has("skin") && <SkinLayer opacity={activeLayers.size === 1 ? 0.92 : 0.12} />}
          {activeLayers.has("muscles") && <MuscleLayer opacity={0.75} />}
          {activeLayers.has("skeleton") && <SkeletonLayer opacity={activeLayers.has("muscles") ? 0.55 : 0.9} />}
          {activeLayers.has("organs") && <OrgansLayer opacity={0.8} selected={selected} onSelect={setSelected} />}
          {activeLayers.has("cells") && <CellsLayer opacity={0.8} />}

          <ContactShadows position={[0, -2.4, 0]} opacity={0.5} scale={12} blur={2.5} far={5} />

          <mesh position={[0, -2.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[24, 24]} />
            <meshPhysicalMaterial color="#0a0f1a" roughness={0.03} metalness={0.95} />
          </mesh>

          <OrbitControls enablePan enableZoom enableRotate minDistance={2.5} maxDistance={14} target={[0, 1.5, 0]} />
          <Environment preset="studio" />
        </Canvas>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-4 left-4 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl z-10"
            >
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Body Layers</h3>
              </div>
              <div className="space-y-1.5">
                {layerConfig.map(layer => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeLayers.has(layer.id)
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <span>{layer.emoji}</span>
                    <span>{layer.label}</span>
                    <div className={`ml-auto w-2.5 h-2.5 rounded-full transition-colors ${activeLayers.has(layer.id) ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-2 font-medium">Quick Presets</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {presets.map(p => (
                    <button
                      key={p.label}
                      onClick={() => { setActiveLayers(new Set(p.layers)); setSelected(null); }}
                      className="px-2 py-1.5 rounded-lg bg-secondary/60 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 w-52 bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-4 hidden sm:block shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold">How to Use</h3>
          </div>
          <ul className="text-[10px] text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-1.5"><span>🖱️</span> Rotate to examine</li>
            <li className="flex items-center gap-1.5"><span>🔍</span> Scroll to zoom</li>
            <li className="flex items-center gap-1.5"><span>🫀</span> Click organs for info</li>
            <li className="flex items-center gap-1.5"><span>🧬</span> Toggle layers to explore</li>
          </ul>
        </motion.div>

        {activeLayers.has("organs") && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-xl">
            <p className="text-[10px] text-muted-foreground font-medium mb-2">Select Organ</p>
            <div className="flex gap-1.5 flex-wrap">
              {organData.map(o => (
                <button
                  key={o.name}
                  onClick={() => setSelected(selected === o.name ? null : o.name)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    selected === o.name
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ backgroundColor: o.color }} />
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <AIExplainPanel
        context={`Active layers: ${Array.from(activeLayers).join(", ")}. ${selected ? `Selected organ: ${selected}` : "No organ selected."}`}
        subject="Human Anatomy"
      />
    </div>
  );
};

export default Anatomy3D;
