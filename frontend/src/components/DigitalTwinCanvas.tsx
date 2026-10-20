"use client";

import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Sky } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  RotateCcw,
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  Waves,
} from "lucide-react";
import { sound } from "../utils/audioHaptics";

interface DigitalTwinProps {
  mode: "normal" | "sif_precursor" | "critical" | "pattern";
  currentStep?: number;
  officerDecision?: string | null;
  hideOverlays?: boolean;
  theme?: string;
  zoneFocus?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelectZone: (zone: string) => void;
  onOpenProcedure?: () => void;
  hasRecalledHazard?: boolean;
  recalledFeatureName?: string;
  physicsState?: {
    pressurePsi: number;
    gasLelPercent: number;
    workerProximityMeters: number;
    lethalBlastRadiusMeters: number;
    heatFlux12kwRadiusMeters: number;
    isRuptureImminent: boolean;
  };
  showBlastFootprint?: boolean;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onStepChange?: (step: number) => void;
}

// =============================================================================
// GERSTNER WAVE PHYSICS CONSTANTS & MATHEMATICAL SPECTRUM (6 HARMONICS)
// =============================================================================
const GERSTNER_WAVES = [
  { dir: new THREE.Vector2(0.707, 0.707).normalize(), steepness: 0.22, wavelength: 52.0, speed: 2.1 },
  { dir: new THREE.Vector2(0.88, 0.47).normalize(), steepness: 0.18, wavelength: 32.0, speed: 2.8 },
  { dir: new THREE.Vector2(-0.45, 0.89).normalize(), steepness: 0.14, wavelength: 18.0, speed: 3.5 },
  { dir: new THREE.Vector2(0.22, -0.97).normalize(), steepness: 0.12, wavelength: 11.0, speed: 4.4 },
  { dir: new THREE.Vector2(-0.78, -0.62).normalize(), steepness: 0.09, wavelength: 6.2, speed: 5.4 },
  { dir: new THREE.Vector2(0.65, -0.76).normalize(), steepness: 0.06, wavelength: 3.4, speed: 6.6 },
];

/**
 * Analytical Gerstner Wave Elevation & Normal Sampler
 * Evaluates the 6 wave harmonics so floating vessels and spray ride with exact physical hydrodynamics.
 */
export function sampleGerstnerWave(x: number, z: number, time: number) {
  let posX = x;
  let posZ = z;
  let posY = 0.0;

  let tx = 1.0, ty = 0.0, tz = 0.0;
  let bx = 0.0, by = 0.0, bz = 1.0;

  for (let i = 0; i < GERSTNER_WAVES.length; i++) {
    const w = GERSTNER_WAVES[i];
    const k = (2.0 * Math.PI) / w.wavelength;
    const c = w.speed;
    const d = w.dir;
    const f = k * (d.x * x + d.y * z) - c * time * 0.9;
    const a = w.steepness / k;

    const cosF = Math.cos(f);
    const sinF = Math.sin(f);

    posX += d.x * (a * cosF);
    posZ += d.y * (a * cosF);
    posY += a * sinF;

    tx -= d.x * d.x * (w.steepness * sinF);
    ty += d.x * (w.steepness * cosF);
    tz -= d.x * d.y * (w.steepness * sinF);

    bx -= d.x * d.y * (w.steepness * sinF);
    by += d.y * (w.steepness * cosF);
    bz -= d.y * d.y * (w.steepness * sinF);
  }

  const nx = ty * bz - tz * by;
  const ny = tz * bx - tx * bz;
  const nz = tx * by - ty * bx;
  const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

  return {
    x: posX,
    y: posY,
    z: posZ,
    normal: new THREE.Vector3(nx / len, Math.abs(ny / len), nz / len),
  };
}

// =============================================================================
// 1. PHOTOREALISTIC OCEAN WATER SHADER (CAPILLARY RIPPLES, SSS & VORONOI FOAM)
// =============================================================================
const OceanVertexShader = `
  uniform float uTime;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vElevation;
  varying vec3 vViewPosition;

  vec3 gerstnerDisplace(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 bitangent) {
    float k = 2.0 * 3.14159265 / wave.w;
    float c = wave.z;
    vec2 d = normalize(wave.xy);
    float f = k * (dot(d, p.xz) - c * uTime * 0.9);
    float steepness = 0.20;
    float a = steepness / k;

    float sinF = sin(f);
    float cosF = cos(f);

    tangent += vec3(
      -d.x * d.x * (steepness * sinF),
      d.x * (steepness * cosF),
      -d.x * d.y * (steepness * sinF)
    );
    bitangent += vec3(
      -d.x * d.y * (steepness * sinF),
      d.y * (steepness * cosF),
      -d.y * d.y * (steepness * sinF)
    );

    return vec3(
      d.x * (a * cosF),
      a * sinF,
      d.y * (a * cosF)
    );
  }

  void main() {
    vec3 p = position;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 bitangent = vec3(0.0, 0.0, 1.0);

    // 6 Harmonic Gerstner Waves
    p += gerstnerDisplace(vec4(0.707, 0.707, 2.1, 52.0), position, tangent, bitangent);
    p += gerstnerDisplace(vec4(0.88, 0.47, 2.8, 32.0), position, tangent, bitangent);
    p += gerstnerDisplace(vec4(-0.45, 0.89, 3.5, 18.0), position, tangent, bitangent);
    p += gerstnerDisplace(vec4(0.22, -0.97, 4.4, 11.0), position, tangent, bitangent);
    p += gerstnerDisplace(vec4(-0.78, -0.62, 5.4, 6.2), position, tangent, bitangent);
    p += gerstnerDisplace(vec4(0.65, -0.76, 6.6, 3.4), position, tangent, bitangent);

    vec3 normal = normalize(cross(bitangent, tangent));
    vNormal = normal;
    vElevation = p.y;

    vec4 worldPos = modelMatrix * vec4(p, 1.0);
    vWorldPosition = worldPos.xyz;

    vec4 mvPosition = viewMatrix * worldPos;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const OceanFragmentShader = `
  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform vec3 uDeepColor;
  uniform vec3 uShallowColor;
  uniform vec3 uFoamColor;
  uniform vec3 uSunColor;
  uniform float uIsLight;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vElevation;
  varying vec3 vViewPosition;

  // 2D Hash for procedural cellular texture
  vec2 hash2(vec2 p) {
    return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
  }

  // Voronoi Cellular Noise for realistic ocean foam lace & bubbles
  float voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = hash2(n + g);
        vec2 r = g + o - f;
        float d = dot(r, r);
        if (d < md) md = d;
      }
    }
    return sqrt(md);
  }

  // Procedural Capillary Micro-Waves (Dual-Octave High-Frequency Water Texture)
  vec3 getWaterMicroNormal(vec2 p, float time) {
    float t = time * 0.95;
    vec2 p1 = p * 0.38 + vec2(t * 0.05, t * 0.03);
    vec2 p2 = p * 0.76 - vec2(t * 0.04, -t * 0.06);
    vec2 p3 = p * 1.52 + vec2(-t * 0.07, t * 0.08);

    float h1 = sin(p1.x * 4.0 + sin(p1.y * 3.0)) * 0.5;
    float h2 = sin(p2.x * 6.0 + cos(p2.y * 5.0)) * 0.3;
    float h3 = sin(p3.x * 10.0 + sin(p3.y * 9.0)) * 0.15;

    float eps = 0.12;
    float dhdx = (sin((p1.x + eps) * 4.0 + sin(p1.y * 3.0)) - h1) * 0.5 +
                 (sin((p2.x + eps) * 6.0 + cos(p2.y * 5.0)) - h2) * 0.3;
    float dhdz = (sin(p1.x * 4.0 + sin((p1.y + eps) * 3.0)) - h1) * 0.5 +
                 (sin(p2.x * 6.0 + cos((p2.y + eps) * 5.0)) - h2) * 0.3;

    return normalize(vec3(-dhdx * 0.75, 1.0, -dhdz * 0.75));
  }

  void main() {
    vec3 viewDir = normalize(vViewPosition);

    // Combine macro Gerstner wave normal with fine capillary ripples
    vec3 microN = getWaterMicroNormal(vWorldPosition.xz, uTime);
    vec3 normal = normalize(vNormal + vec3(microN.x, 0.0, microN.z) * 0.65);

    // Fresnel Reflection (Schlick's approximation for water: F0 ≈ 0.02)
    float fresnel = dot(viewDir, normal);
    fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
    fresnel = pow(fresnel, 3.8);

    // Beer-Lambert depth extinction gradient (deep navy sapphire to shallow cerulean)
    float depthFactor = smoothstep(-2.2, 1.8, vElevation);
    vec3 waterColor = mix(uDeepColor, uShallowColor, depthFactor);

    // Subsurface Scattering (vivid tropical emerald-cyan glow through wave crests)
    vec3 sunDir = normalize(uSunDirection);
    vec3 sssColor = uIsLight > 0.5 ? vec3(0.0, 0.82, 0.68) : vec3(0.01, 0.40, 0.50);
    float sssFactor = pow(clamp(dot(-sunDir, viewDir), 0.0, 1.0), 3.0) * smoothstep(0.2, 1.8, vElevation);
    waterColor += sssColor * sssFactor * 0.95;

    // Specular Sun Glade: Warm golden sheen + dancing liquid glints
    vec3 halfVector = normalize(sunDir + viewDir);
    float specAngle = max(dot(normal, halfVector), 0.0);
    float specBroad = pow(specAngle, 45.0) * (uIsLight > 0.5 ? 2.2 : 1.3);
    float specGlint = pow(specAngle, 380.0) * (uIsLight > 0.5 ? 4.5 : 2.5);
    float specular = specBroad + specGlint;

    // Voronoi Cellular Foam Lacing at Wave Peaks & Slopes
    float cellFoam = voronoi(vWorldPosition.xz * 1.5 + vec2(uTime * 0.18, uTime * 0.10));
    float foamCrest = smoothstep(0.75, 1.55, vElevation);
    float foam = smoothstep(0.38, 0.85, (1.0 - cellFoam) * foamCrest * 2.0);

    vec3 finalColor = mix(waterColor, uFoamColor, foam * 0.85);

    // Sky reflection on grazing water angles: Deep azure sky reflection
    vec3 skyReflection = uIsLight > 0.5 ? vec3(0.12, 0.48, 0.84) : vec3(0.08, 0.18, 0.32);
    finalColor = mix(finalColor, skyReflection, fresnel * 0.65);
    finalColor += uSunColor * specular;

    // Atmospheric Distance Fog: Deep ocean horizon haze
    float dist = length(vWorldPosition.xz);
    float fog = smoothstep(90.0, 260.0, dist);
    vec3 fogColor = uIsLight > 0.5 ? vec3(0.12, 0.38, 0.72) : vec3(0.03, 0.08, 0.16);
    finalColor = mix(finalColor, fogColor, fog * 0.82);

    gl_FragColor = vec4(finalColor, 0.98);
  }
`;

function OceanWaterMesh({ isLight }: { isLight: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDirection: { value: new THREE.Vector3(0.55, 0.82, 0.35).normalize() },
      uDeepColor: { value: new THREE.Color(isLight ? "#021f3f" : "#011224") },
      uShallowColor: { value: new THREE.Color(isLight ? "#0284c7" : "#0369a1") },
      uFoamColor: { value: new THREE.Color("#f0fdfa") },
      uSunColor: { value: new THREE.Color(isLight ? "#f59e0b" : "#fbbf24") },
      uIsLight: { value: isLight ? 1.0 : 0.0 },
    }),
    [isLight]
  );

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[360, 360, 130, 130]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={OceanVertexShader}
        fragmentShader={OceanFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// =============================================================================
// 2. SUBSEA CONDUCTOR ARRAY (16 WELLHEAD CASINGS PLUNGING INTO SEABED)
// =============================================================================
function SubseaConductorArray({ isLight }: { isLight: boolean }) {
  // 4 x 4 Grid of Subsea Conductor Pipes directly beneath derrick
  const conductors = useMemo(() => {
    const pts: [number, number][] = [];
    for (let x = -3.0; x <= 3.0; x += 2.0) {
      for (let z = -3.0; z <= 3.0; z += 2.0) {
        pts.push([x, z]);
      }
    }
    return pts;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {conductors.map(([x, z], i) => (
        <group key={`conductor-${i}`} position={[x, 0, z]}>
          {/* Vertical Heavy Steel Conductor Pipe from Cellar Deck (y = 13.5) into Seabed (-10m) */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 24.0, 16]} />
            <meshStandardMaterial
              color={isLight ? "#1e293b" : "#0f172a"}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>

          {/* Guide Funnel Collar at Waterline */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.42, 0.30, 1.2, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.7} />
          </mesh>

          {/* Marine Growth Fouling Collar Underwater */}
          <mesh position={[0, -4.5, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 7.0, 16]} />
            <meshStandardMaterial color="#052e16" roughness={0.9} />
          </mesh>

          {/* Christmas Tree Wellhead Assembly on Cellar Deck (y = 13.5) */}
          <group position={[0, 13.6, 0]}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.8, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.85} />
            </mesh>
            {/* Master Valve Cross Handwheels */}
            <mesh position={[0.35, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.15, 0.03, 8, 16]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <mesh position={[-0.35, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.15, 0.03, 8, 16]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        </group>
      ))}

      {/* Conductor Guide Structural Grillage at y = 1.0 */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[8.8, 0.3, 8.8]} />
        <meshStandardMaterial color="#334155" wireframe />
      </mesh>
    </group>
  );
}

// =============================================================================
// 3. SUBSTRUCTURE: 4 COLOSSAL CAISSON COLUMNS & BOAT LANDING STAGE
// =============================================================================
function OffshoreRigSubstructure({ isLight }: { isLight: boolean }) {
  const legPositions = useMemo<[number, number][]>(
    () => [
      [-10, -10],
      [10, -10],
      [-10, 10],
      [10, 10],
    ],
    []
  );

  const foamRingsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (foamRingsRef.current) {
      legPositions.forEach((pos, idx) => {
        const ring = foamRingsRef.current!.children[idx] as THREE.Mesh;
        if (ring) {
          const sample = sampleGerstnerWave(pos[0], pos[1], t);
          ring.position.y = sample.y + 0.12;
          const s = 1.0 + Math.sin(t * 3.2 + idx * 1.5) * 0.14;
          ring.scale.set(s, s, 1);
        }
      });
    }
  });

  return (
    <group>
      {/* 4 Colossal Corner Columns */}
      {legPositions.map(([x, z], i) => (
        <group key={`col-${i}`} position={[x, 0, z]}>
          {/* Main Column Body: High-density dark marine structural steel */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[2.2, 2.3, 25.0, 32]} />
            <meshStandardMaterial
              color={isLight ? "#1e293b" : "#0f172a"}
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>

          {/* Welded Plate Stiffener Rings along Column */}
          {[-6.0, -1.0, 4.0, 9.0, 13.5].map((ry, ki) => (
            <mesh key={`ring-${ki}`} position={[0, ry, 0]}>
              <torusGeometry args={[2.22, 0.08, 8, 32]} />
              <meshStandardMaterial color="#0f172a" metalness={0.85} />
            </mesh>
          ))}

          {/* Splash Zone Hazard Band (Vibrant Safety Yellow at waterline) */}
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[2.24, 2.24, 2.8, 32]} />
            <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.35} />
          </mesh>

          {/* Marine Growth & Bio-Fouling Underwater Collar */}
          <mesh position={[0, -4.5, 0]}>
            <cylinderGeometry args={[2.28, 2.28, 7.0, 32]} />
            <meshStandardMaterial color="#052e16" roughness={0.9} />
          </mesh>

          {/* Column Top Heavy Flange Transition Box */}
          <mesh position={[0, 15.0, 0]}>
            <boxGeometry args={[4.8, 1.2, 4.8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Boat Landing Stage & Fenders on South-East Column (10, 10) */}
      <group position={[10, 0, 10]}>
        {/* Landing Platform Grate at y = 2.4m */}
        <mesh position={[2.8, 2.4, 0]}>
          <boxGeometry args={[2.0, 0.2, 5.2]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} />
        </mesh>
        {/* Vertical Rubber Dock Fenders */}
        {[-1.8, 1.8].map((fz, fi) => (
          <mesh key={`fender-${fi}`} position={[3.8, 1.5, fz]}>
            <cylinderGeometry args={[0.32, 0.32, 3.4, 16]} />
            <meshStandardMaterial color="#090d16" roughness={0.8} />
          </mesh>
        ))}
        {/* Boarding Access Caged Ladder leading to Deck */}
        <mesh position={[2.6, 8.5, 0]}>
          <boxGeometry args={[0.5, 12.0, 0.6]} />
          <meshStandardMaterial color="#facc15" wireframe />
        </mesh>
      </group>

      {/* Submerged Horizontal Tubular Pontoons at y = -6.0 */}
      <mesh position={[0, -6.0, -10]}>
        <boxGeometry args={[20.0, 1.8, 1.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} />
      </mesh>
      <mesh position={[0, -6.0, 10]}>
        <boxGeometry args={[20.0, 1.8, 1.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} />
      </mesh>
      <mesh position={[-10, -6.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20.0, 1.8, 1.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} />
      </mesh>
      <mesh position={[10, -6.0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20.0, 1.8, 1.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} />
      </mesh>

      {/* Above-Water Heavy Tubular K-Bracing Trusses */}
      {[
        { p: [0, 8.5, -10], rot: [0, 0, Math.PI / 4] },
        { p: [0, 8.5, -10], rot: [0, 0, -Math.PI / 4] },
        { p: [0, 8.5, 10], rot: [0, 0, Math.PI / 4] },
        { p: [0, 8.5, 10], rot: [0, 0, -Math.PI / 4] },
        { p: [-10, 8.5, 0], rot: [Math.PI / 4, 0, 0] },
        { p: [-10, 8.5, 0], rot: [-Math.PI / 4, 0, 0] },
        { p: [10, 8.5, 0], rot: [Math.PI / 4, 0, 0] },
        { p: [10, 8.5, 0], rot: [-Math.PI / 4, 0, 0] },
      ].map((truss, i) => (
        <mesh key={`kbrace-${i}`} position={truss.p as any} rotation={truss.rot as any}>
          <cylinderGeometry args={[0.38, 0.38, 16.0, 16]} />
          <meshStandardMaterial
            color={isLight ? "#334155" : "#1e293b"}
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Dynamic Wave Foam Rings on Column Collars */}
      <group ref={foamRingsRef}>
        {legPositions.map(([x, z], i) => (
          <mesh key={`foam-${i}`} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.3, 4.0, 36]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.75} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// =============================================================================
// 4. MAIN DECKS: CELLAR DECK & UPPER PRODUCTION DECK WITH PIPE RACKS
// =============================================================================
function OffshoreDecks({ isLight }: { isLight: boolean }) {
  return (
    <group>
      {/* Lower Cellar Deck (y = 13.2) */}
      <mesh position={[0, 13.2, 0]}>
        <boxGeometry args={[26.4, 0.4, 26.4]} />
        <meshStandardMaterial color={isLight ? "#1e293b" : "#0f172a"} metalness={0.85} />
      </mesh>

      {/* Main Production Deck (y = 15.0) - High-traction Non-skid Offshore Deck Green */}
      <mesh position={[0, 15.0, 0]} receiveShadow>
        <boxGeometry args={[27.4, 0.6, 27.4]} />
        <meshStandardMaterial
          color={isLight ? "#1e3a2b" : "#11261a"}
          roughness={0.65}
          metalness={0.25}
        />
      </mesh>

      {/* Bold Canary-Yellow Safety Walkway Paths on Deck Surface */}
      <mesh position={[0, 15.31, 0]}>
        <boxGeometry args={[2.6, 0.02, 26.8]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>
      <mesh position={[0, 15.31, 0]}>
        <boxGeometry args={[26.8, 0.02, 2.6]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>

      {/* Perimeter Safety Kickplate & Handrails (Vivid Industrial Safety Yellow) */}
      <mesh position={[0, 15.6, -13.6]}>
        <boxGeometry args={[27.4, 0.6, 0.15]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>
      <mesh position={[0, 15.6, 13.6]}>
        <boxGeometry args={[27.4, 0.6, 0.15]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>
      <mesh position={[-13.6, 15.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[27.4, 0.6, 0.15]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>
      <mesh position={[13.6, 15.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[27.4, 0.6, 0.15]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>

      {/* Overhead Process Pipe Racks (API Color Standard: Yellow Gas, Brown Crude, Red Firewater, Cyan Seawater) */}
      {[-8, -4, 4, 8].map((z, idx) => (
        <group key={`piperack-${idx}`} position={[0, 17.5, z]}>
          {/* Yellow Fuel Gas Line */}
          <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 24.0, 16]} />
            <meshStandardMaterial color="#facc15" metalness={0.8} />
          </mesh>
          {/* Rich Bronze Crude Oil Line */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 24.0, 16]} />
            <meshStandardMaterial color="#92400e" metalness={0.8} />
          </mesh>
          {/* Signal Red Firewater Deluge Ring */}
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 24.0, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.8} />
          </mesh>
          {/* Vivid Azure Cooling Seawater Line */}
          <mesh position={[0, -0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 24.0, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 5. ICONIC TOWERING DRILLING DERRICK (CENTRAL HEART OF THE REAL OIL RIG)
// =============================================================================
function DrillingDerrick({ isLight }: { isLight: boolean }) {
  const crownBeaconRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (crownBeaconRef.current) {
      // FAA Red Obstruction Beacon Flashing at crown of derrick
      crownBeaconRef.current.intensity = Math.sin(t * 5.0) > 0.3 ? 3.8 : 0.2;
    }
  });

  return (
    <group position={[0, 15.3, 0]}>
      {/* Elevated Drill Floor Box Substructure (Drawworks Enclosure) */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[9.2, 2.6, 9.2]} />
        <meshStandardMaterial color={isLight ? "#1e293b" : "#0f172a"} metalness={0.8} />
      </mesh>

      {/* Drill Floor Windbreak Cladding Panels (Vibrant Safety Yellow) */}
      <mesh position={[0, 3.8, -4.5]}>
        <boxGeometry args={[9.0, 2.2, 0.15]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>
      <mesh position={[0, 3.8, 4.5]}>
        <boxGeometry args={[9.0, 2.2, 0.15]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>

      {/* Doghouse Roughneck Control Cabin (Offshore White & Cobalt Blue) */}
      <mesh position={[-3.6, 3.6, 0]}>
        <boxGeometry args={[1.8, 2.0, 3.8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.4} />
      </mesh>
      <mesh position={[-3.6, 4.6, 0]}>
        <boxGeometry args={[1.84, 0.1, 3.84]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[-2.65, 3.8, 0]}>
        <boxGeometry args={[0.1, 1.0, 2.6]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} />
      </mesh>

      {/* Rotary Table Center Floor */}
      <mesh position={[0, 2.92, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 0.08, 32]} />
        <meshStandardMaterial color="#facc15" metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.96, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.04, 32]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* V-Door Catwalk Ramp for Feeding Drill Pipe */}
      <mesh position={[0, 1.8, 6.2]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[2.4, 0.2, 4.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} />
      </mesh>

      {/* 4 Corner Structural Derrick Legs Tapering to Crown Block (23m Heavy Gunmetal Carbon Steel) */}
      {[
        { start: [-4.0, 2.9, -4.0], end: [-1.2, 24.5, -1.2] },
        { start: [4.0, 2.9, -4.0], end: [1.2, 24.5, -1.2] },
        { start: [-4.0, 2.9, 4.0], end: [-1.2, 24.5, 1.2] },
        { start: [4.0, 2.9, 4.0], end: [1.2, 24.5, 1.2] },
      ].map((leg, li) => {
        const v1 = new THREE.Vector3(...leg.start);
        const v2 = new THREE.Vector3(...leg.end);
        const mid = v1.clone().add(v2).multiplyScalar(0.5);
        const dir = v2.clone().sub(v1);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );

        return (
          <group key={`derrick-leg-${li}`}>
            <mesh position={mid} quaternion={quat}>
              <cylinderGeometry args={[0.26, 0.34, len, 12]} />
              <meshStandardMaterial
                color={isLight ? "#1e293b" : "#0f172a"}
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
          </group>
        );
      })}

      {/* Horizontal Derrick Girts & Diagonal X-Braces */}
      {[6.0, 11.0, 16.0, 20.5].map((y, ti) => {
        const span = 8.0 - ti * 1.5;
        return (
          <group key={`girt-${ti}`} position={[0, y, 0]}>
            <mesh position={[0, 0, -span / 2]}>
              <boxGeometry args={[span, 0.22, 0.22]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, span / 2]}>
              <boxGeometry args={[span, 0.22, 0.22]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[-span / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[span, 0.22, 0.22]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[span / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[span, 0.22, 0.22]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>

            {/* Diagonal X-Lattice simulation */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[span * 1.2, 0.1, 0.1]} />
              <meshStandardMaterial color="#475569" metalness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* Monkey Board / Pipe Racking Platform at y = 16.0m */}
      <mesh position={[0, 16.0, -2.4]}>
        <boxGeometry args={[4.2, 0.2, 1.8]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} />
      </mesh>

      {/* Red/White Aviation Warning Crown Mast at Top (y = 24.5 to 27.0) */}
      <mesh position={[0, 24.8, 0]}>
        <boxGeometry args={[2.6, 1.2, 2.6]} />
        <meshStandardMaterial color="#dc2626" metalness={0.7} />
      </mesh>
      <mesh position={[0, 25.8, 0]}>
        <boxGeometry args={[2.5, 0.8, 2.5]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} />
      </mesh>
      <mesh position={[0, 26.8, 0]}>
        <cylinderGeometry args={[0.9, 1.3, 0.8, 16]} />
        <meshStandardMaterial color="#dc2626" metalness={0.7} />
      </mesh>

      {/* Flashing Red FAA Aviation Obstruction Beacon */}
      <pointLight ref={crownBeaconRef} position={[0, 28.0, 0]} color="#ef4444" distance={50} />
      <mesh position={[0, 27.6, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Top Drive Unit & Suspended Drill String with Gooseneck Mud Hose */}
      <group position={[0, 14.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 2.2, 16]} />
          <meshStandardMaterial color="#facc15" metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshStandardMaterial color="#1d4ed8" metalness={0.7} />
        </mesh>
      </group>
      <mesh position={[0, 8.0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 12.0, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>

      {/* Setback Pipe Fingerboard (Racks of Vertical Drill Pipe Stands) */}
      {[-1.4, -0.7, 0, 0.7, 1.4].map((px, idx) => (
        <group key={`pipe-${idx}`} position={[px, 9.5, 2.4]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 13.0, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.85} />
          </mesh>
          <mesh position={[0, 4.0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.4, 8]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 6. CANTILEVERED FLARE BOOM & TURBULENT GAS FLAME OVER OPEN SEA
// =============================================================================
function CantileverFlareBoom({ isDepressurizing = false }: { isDepressurizing?: boolean }) {
  const flameCoreRef = useRef<THREE.Mesh>(null);
  const flameOuterRef = useRef<THREE.Mesh>(null);
  const flareLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const mult = isDepressurizing ? 2.2 : 1.0;
    const flicker = 1.0 + Math.sin(t * 22.0) * 0.18 + Math.cos(t * 14.0) * 0.12;

    if (flameCoreRef.current) {
      flameCoreRef.current.scale.set(flicker * 1.1 * mult, flicker * 1.6 * mult, flicker * 1.1 * mult);
      flameCoreRef.current.rotation.z = Math.sin(t * 8.0) * 0.15;
    }
    if (flameOuterRef.current) {
      flameOuterRef.current.scale.set(flicker * 1.4 * mult, flicker * 1.9 * mult, flicker * 1.4 * mult);
    }
    if (flareLightRef.current) {
      flareLightRef.current.intensity = (3.5 + flicker * 2.2) * (isDepressurizing ? 2.5 : 1.0);
    }
  });

  return (
    <group position={[-13.0, 15.0, 13.0]}>
      {/* Angled 45° Triangular Steel Space Truss extending 28m out over ocean */}
      <group rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        {/* Main Tubular Chords */}
        {[-0.9, 0.9].map((ox, i) =>
          [-0.9, 0.9].map((oz, j) => (
            <mesh key={`flarechord-${i}-${j}`} position={[ox, 14.0, oz]}>
              <cylinderGeometry args={[0.16, 0.16, 28.0, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          ))
        )}

        {/* Diagonal Lacing Trusses */}
        {Array.from({ length: 9 }).map((_, li) => (
          <mesh key={`flarelace-${li}`} position={[0, li * 3.2 + 2.0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[2.0, 0.09, 0.09]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.7} />
          </mesh>
        ))}

        {/* Flare Tip Burner Assembly at Apex */}
        <mesh position={[0, 28.0, 0]}>
          <cylinderGeometry args={[0.75, 0.45, 2.2, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>

        {/* Dynamic Animated Burning Gas Flare */}
        <group position={[0, 30.2, 0]}>
          {/* Inner Incandescent White Flame Core */}
          <mesh ref={flameCoreRef}>
            <coneGeometry args={[0.85, 4.6, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Outer Luminous Orange Flame Cone */}
          <mesh ref={flameOuterRef} position={[0, 0.9, 0]}>
            <coneGeometry args={[1.7, 6.5, 16]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.75} />
          </mesh>

          {/* Golden Flame Glow Casting Waves Reflections */}
          <pointLight ref={flareLightRef} position={[0, 1.5, 0]} color="#f59e0b" distance={70} />
        </group>
      </group>
    </group>
  );
}

// =============================================================================
// 7. CANTILEVERED HELIDECK & S-92 CREW TRANSPORT HELICOPTER
// =============================================================================
function HelideckComplex() {
  const mainRotorRef = useRef<THREE.Group>(null);
  const tailRotorRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mainRotorRef.current) {
      mainRotorRef.current.rotation.y = t * 14.0;
    }
    if (tailRotorRef.current) {
      tailRotorRef.current.rotation.x = t * 28.0;
    }
  });

  return (
    <group position={[-13.0, 17.5, -13.0]}>
      {/* Heavy Cantilever Diagonal Support Struts */}
      {[
        { rot: [Math.PI / 5, -Math.PI / 4, 0] },
        { rot: [Math.PI / 4, -Math.PI / 6, 0] },
      ].map((strut, i) => (
        <mesh key={`helistrut-${i}`} position={[-2.5, -3.0, -2.5]} rotation={strut.rot as any}>
          <cylinderGeometry args={[0.42, 0.42, 9.5, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      ))}

      {/* Octagonal Landing Deck Surface (15m Diameter) */}
      <mesh position={[-5.0, 0, -5.0]} rotation={[-Math.PI / 2, 0, Math.PI / 8]}>
        <cylinderGeometry args={[7.6, 7.6, 0.4, 8]} />
        <meshStandardMaterial color="#14532d" roughness={0.7} />
      </mesh>

      {/* Yellow Safety Boundary Circle */}
      <mesh position={[-5.0, 0.22, -5.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.7, 40]} />
        <meshBasicMaterial color="#facc15" side={THREE.DoubleSide} />
      </mesh>

      {/* Bold White "H" Touchdown Marking */}
      <group position={[-5.0, 0.23, -5.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[-1.2, 0, 0]}>
          <planeGeometry args={[0.5, 3.2]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <planeGeometry args={[0.5, 3.2]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[2.0, 0.5]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Offshore Transport Helicopter (Sikorsky S-92 Style: Navy Blue & Safety Red) */}
      <group position={[-5.0, 0.4, -5.0]}>
        {/* Fuselage (Cobalt Navy Blue) */}
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[1.8, 1.4, 5.4]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* White Cabin Top */}
        <mesh position={[0, 1.95, 0]}>
          <boxGeometry args={[1.76, 0.15, 4.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {/* Cockpit Canopy Glass */}
        <mesh position={[0, 1.35, 2.5]} rotation={[Math.PI / 5, 0, 0]}>
          <boxGeometry args={[1.6, 0.8, 1.2]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Tail Boom & Stabilizer */}
        <mesh position={[0, 1.4, -3.8]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.5, 3.6, 12]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.4, -5.4]}>
          <boxGeometry args={[0.15, 1.8, 0.8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>

        {/* Spinning Main Rotor */}
        <group ref={mainRotorRef} position={[0, 2.2, 0.2]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
            <mesh key={`blade-${i}`} position={[Math.cos(ang) * 2.8, 0.05, Math.sin(ang) * 2.8]} rotation={[0, -ang, 0]}>
              <boxGeometry args={[5.2, 0.03, 0.25]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Spinning Tail Rotor */}
        <group ref={tailRotorRef} position={[0.25, 2.4, -5.4]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.12, 1.6, 0.1]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =============================================================================
// 8. OFFSHORE PEDESTAL LATTICE CRANES & PROCESS SEPARATION TRAIN
// =============================================================================
function OffshoreEquipmentAndCranes({ isLight }: { isLight: boolean }) {
  return (
    <group position={[0, 15.3, 0]}>
      {/* East Pedestal Lattice Crane (Vibrant Safety Yellow) */}
      <group position={[11.5, 0, -5.0]}>
        <mesh position={[0, 2.0, 0]}>
          <cylinderGeometry args={[0.9, 1.0, 4.0, 20]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} />
        </mesh>
        {/* Slewing Machine House & Cab */}
        <mesh position={[0, 4.4, 0]}>
          <boxGeometry args={[2.2, 1.6, 2.8]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.6} />
        </mesh>
        {/* Long 16m Lattice Boom Angled Over Ocean */}
        <group position={[0, 4.8, 1.2]} rotation={[-Math.PI / 3, 0, 0]}>
          <mesh position={[0, 8.0, 0]}>
            <boxGeometry args={[0.8, 16.0, 0.8]} />
            <meshStandardMaterial color="#facc15" wireframe />
          </mesh>
          {/* Hoist Cable */}
          <mesh position={[0, 12.0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 8.0, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* West Pedestal Lattice Crane (Vibrant Safety Yellow) */}
      <group position={[-11.5, 0, 5.0]}>
        <mesh position={[0, 2.0, 0]}>
          <cylinderGeometry args={[0.9, 1.0, 4.0, 20]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} />
        </mesh>
        <mesh position={[0, 4.4, 0]}>
          <boxGeometry args={[2.2, 1.6, 2.8]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.6} />
        </mesh>
        <group position={[0, 4.8, -1.2]} rotation={[Math.PI / 3, 0, 0]}>
          <mesh position={[0, 8.0, 0]}>
            <boxGeometry args={[0.8, 16.0, 0.8]} />
            <meshStandardMaterial color="#facc15" wireframe />
          </mesh>
          <mesh position={[0, 12.0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 8.0, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* High-Pressure 3-Phase Production Separator (V-101 in Industrial Process Blue) */}
      <group position={[-6.0, 1.2, 6.0]}>
        {/* Horizontal Bullet Tank */}
        <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.2, 1.2, 6.5, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[-3.25, 0.8, 0]}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[3.25, 0.8, 0]}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Safety Relief Valves & Nozzles */}
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        <mesh position={[0, 2.65, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* Saddle Mount Legs */}
        {[-2.0, 2.0].map((sx, i) => (
          <mesh key={`saddle-${i}`} position={[sx, 0, 0]}>
            <boxGeometry args={[0.6, 0.8, 2.6]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        ))}
      </group>

      {/* Glycol Dehydration Contactor Column (T-201 in Vivid Deep Cyan) */}
      <group position={[-7.5, 0, -4.5]}>
        <mesh position={[0, 4.5, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 9.0, 24]} />
          <meshStandardMaterial color="#0891b2" metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Caged External Maintenance Platform */}
        <mesh position={[0, 6.0, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.1, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} />
        </mesh>
      </group>

      {/* Living Quarters Module (POB 120 Accommodation & OIM Glass Bridge) */}
      <group position={[2.0, 0, -10.0]}>
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[11.0, 7.0, 4.6]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
        </mesh>
        {/* Deep Marine Blue Accent Stripe */}
        <mesh position={[0, 5.0, 2.33]}>
          <boxGeometry args={[11.05, 0.6, 0.05]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        {/* Panoramic Navigation Bridge Windows */}
        <mesh position={[0, 5.8, 2.35]}>
          <boxGeometry args={[9.5, 1.2, 0.1]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Satellite Comms Radome Spheres */}
        {[-3.0, 3.0].map((rx, i) => (
          <mesh key={`radome-${i}`} position={[rx, 8.0, 0]}>
            <sphereGeometry args={[1.1, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 2 Totally Enclosed Motor-Propelled Survival Crafts (TEMPSC in Vivid IMO Safety Orange) */}
      {[-4.0, 4.0].map((lz, i) => (
        <group key={`lifeboat-${i}`} position={[13.8, 1.5, lz]}>
          {/* Cantilever Launch Davit */}
          <mesh position={[-0.4, 1.5, 0]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.3, 3.2, 0.3]} />
            <meshStandardMaterial color="#eab308" metalness={0.7} />
          </mesh>
          {/* Orange Enclosed Lifeboat Capsule */}
          <mesh position={[0.6, 0.8, 0]}>
            <boxGeometry args={[1.4, 1.3, 3.6]} />
            <meshStandardMaterial color="#ea580c" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* White Reflective Band */}
          <mesh position={[0.6, 0.9, 0]}>
            <boxGeometry args={[1.42, 0.15, 3.62]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 9. OFFSHORE SUPPORT VESSEL (OSV 'SENTINEL-1' HEAVING & PITCHING WITH BUOYANCY)
// =============================================================================
function OffshoreSupplyVessel() {
  const boatRef = useRef<THREE.Group>(null);
  const posX = 32.0;
  const posZ = 22.0;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (boatRef.current) {
      // Sample physical wave elevation at 4 hull points
      const bow = sampleGerstnerWave(posX, posZ + 7.0, t);
      const stern = sampleGerstnerWave(posX, posZ - 7.0, t);
      const port = sampleGerstnerWave(posX - 2.5, posZ, t);
      const stbd = sampleGerstnerWave(posX + 2.5, posZ, t);

      // Hydrodynamic Buoyancy: Heave (y), Pitch (rotX), Roll (rotZ)
      const heave = (bow.y + stern.y + port.y + stbd.y) * 0.25;
      const pitch = Math.atan2(bow.y - stern.y, 14.0);
      const roll = Math.atan2(stbd.y - port.y, 5.0);

      boatRef.current.position.y = heave + 0.3;
      boatRef.current.rotation.x = -pitch;
      boatRef.current.rotation.z = roll;
    }
  });

  return (
    <group ref={boatRef} position={[posX, 0, posZ]} rotation={[0, -Math.PI / 6, 0]}>
      {/* Ship Hull: Red Anti-fouling Keel + Dark Cobalt Blue Freeboard */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[5.2, 0.8, 16.0]} />
        <meshStandardMaterial color="#991b1b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[5.2, 1.0, 16.0]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Raked Bow Wedge */}
      <mesh position={[0, 0.8, 8.8]} rotation={[0, Math.PI, 0]}>
        <coneGeometry args={[2.6, 2.4, 4]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.7} />
      </mesh>

      {/* Forecastle Superstructure / Bridge */}
      <mesh position={[0, 2.6, 4.0]}>
        <boxGeometry args={[4.4, 2.2, 4.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
      {/* Royal Blue Cabin Stripe */}
      <mesh position={[0, 2.2, 6.12]}>
        <boxGeometry args={[4.42, 0.3, 0.05]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      {/* Bridge Windows */}
      <mesh position={[0, 3.2, 6.15]}>
        <boxGeometry args={[3.8, 0.7, 0.1]} />
        <meshStandardMaterial color="#0284c7" metalness={0.9} />
      </mesh>
      {/* Radar Mast */}
      <mesh position={[0, 4.4, 4.0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Open Aft Cargo Deck with Multi-Colored ISO Shipping Containers */}
      {[
        { x: -1.2, z: -4.0, col: "#ea580c" }, // Safety Orange
        { x: 1.2, z: -4.0, col: "#0284c7" },  // Maersk Blue
        { x: -1.2, z: -1.0, col: "#16a34a" }, // Emerald Green
        { x: 1.2, z: -1.0, col: "#facc15" },  // Canary Yellow
      ].map((box, i) => (
        <mesh key={`cargo-${i}`} position={[box.x, 1.9, box.z]}>
          <boxGeometry args={[1.8, 1.4, 2.6]} />
          <meshStandardMaterial color={box.col} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// =============================================================================
// 10. HERO WELLHEAD SKID P-102 & FLANGE F-402 (ZONE D INCIDENT FOCUS)
// =============================================================================
function HeroSkidAssembly({
  position,
  currentStep,
  pressurePsi,
  onClick,
}: {
  position: [number, number, number];
  currentStep: number;
  pressurePsi: number;
  onClick: () => void;
}) {
  const needleRef = useRef<THREE.Mesh>(null);
  const supersonicPlumeRef = useRef<THREE.Group>(null);
  const acousticPulseRef = useRef<THREE.Group>(null);
  const delugeMistRef = useRef<THREE.Group>(null);
  const weepDripRef = useRef<THREE.Group>(null);
  const workerProximityRef = useRef<THREE.Group>(null);
  const blastRingsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Rotating Bourdon Tube Pressure Gauge Needle
    if (needleRef.current) {
      const targetAngle = 2.2 - (pressurePsi / 5000) * 4.4;
      needleRef.current.rotation.z = THREE.MathUtils.lerp(
        needleRef.current.rotation.z,
        targetAngle,
        0.1
      );
    }

    // Step 1: Acoustic Sensor Ripple (Concentric expanding waves)
    if (acousticPulseRef.current && currentStep === 1) {
      const s = 1.0 + ((t * 2.2) % 1.6) * 2.2;
      acousticPulseRef.current.scale.set(s, s, s);
    }

    // Step 2 & 3: Flange Packing Weeping Condensate Drops
    if (weepDripRef.current && (currentStep === 2 || currentStep === 3)) {
      weepDripRef.current.position.y = 1.35 - ((t * 2.8) % 0.9);
    }

    // Step 2 & 3: Worker line-of-fire proximity pulse
    if (workerProximityRef.current && (currentStep === 2 || currentStep === 3)) {
      const p = 1.0 + 0.12 * Math.sin(t * 5.0);
      workerProximityRef.current.scale.set(p, 1, p);
    }

    // Step 4: Supersonic Hydrocarbon Jet Plume & Shock Diamonds
    if (supersonicPlumeRef.current && currentStep === 4) {
      const s = 1 + 0.25 * Math.sin(t * 32);
      supersonicPlumeRef.current.scale.set(s * 1.8, s * 1.3, s * 1.8);
    }

    // Step 4: Expanding Blast Shockwaves on Deck
    if (blastRingsRef.current && currentStep === 4) {
      const br = 1.0 + 0.08 * Math.sin(t * 10);
      blastRingsRef.current.scale.set(br, 1, br);
    }

    // Step 5: Deluge Water Spray Rotation & Mist Flutter
    if (delugeMistRef.current && currentStep === 5) {
      delugeMistRef.current.rotation.y = t * 0.8;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Skid Base with Yellow Safety Perimeter Curb */}
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[4.2, 0.32, 2.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.33, 0]}>
        <boxGeometry args={[4.24, 0.04, 2.64]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>

      {/* Electric Drive Motor with Cooling Fins */}
      <mesh position={[-1.0, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 24]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Centrifugal Pump Casing */}
      <mesh position={[0.85, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.68, 0.6, 0.8, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Flange F-402 & Discharge Spool */}
      <group position={[0.85, 1.65, 0]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.7, 24]} />
          <meshStandardMaterial
            color={currentStep === 3 || currentStep === 4 ? "#ef4444" : "#64748b"}
            metalness={0.8}
          />
        </mesh>

        {/* Flange Rings & 12 Hex Bolts */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.14, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        {Array.from({ length: 12 }).map((_, bi) => {
          const a = (bi * Math.PI * 2) / 12;
          return (
            <mesh key={`hex-b-${bi}`} position={[Math.cos(a) * 0.35, 0.05, Math.sin(a) * 0.35]}>
              <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
            </mesh>
          );
        })}

        {/* Bourdon Dial Pressure Gauge */}
        <group position={[0.38, 0.32, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          <mesh position={[0.035, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[0.2, 24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh ref={needleRef} position={[0.04, 0, 0]}>
            <boxGeometry args={[0.015, 0.16, 0.005]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
        </group>

        {/* Piezoelectric Sensor AC-104 (Cyan Beacon) */}
        <group position={[-0.28, 0.05, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.14, 16]} />
            <meshStandardMaterial color="#06b6d4" metalness={0.8} />
          </mesh>
          {currentStep === 1 && (
            <group ref={acousticPulseRef}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <ringGeometry args={[0.16, 0.28, 32]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} side={THREE.DoubleSide} />
              </mesh>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <ringGeometry args={[0.34, 0.44, 32]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
              <pointLight color="#22d3ee" intensity={3} distance={5} />
            </group>
          )}
        </group>

        {/* Weeping Packing Gland Droplets (Step 2 & 3) */}
        {(currentStep === 2 || currentStep === 3) && (
          <group ref={weepDripRef} position={[0, -0.15, 0.18]}>
            {[0, 0.08, -0.06].map((dx, di) => (
              <mesh key={`drip-${di}`} position={[dx, 0, 0]}>
                <sphereGeometry args={[0.04, 8, 8]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} />
              </mesh>
            ))}
          </group>
        )}

        {/* Step 3: Orange Volumetric Vapor Jet Haze */}
        {currentStep === 3 && (
          <group position={[0, 0.1, 0.35]} rotation={[Math.PI / 2.5, 0, 0]}>
            <mesh>
              <coneGeometry args={[0.7, 2.6, 16]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.65} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <sphereGeometry args={[0.65, 16, 16]} />
              <meshBasicMaterial color="#ea580c" transparent opacity={0.4} />
            </mesh>
          </group>
        )}

        {/* Step 4: Supersonic Hydrocarbon Jet Plume & Mach Diamonds */}
        {currentStep === 4 && (
          <group ref={supersonicPlumeRef} position={[0, 0.1, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh position={[0, 1.7, 0]}>
              <coneGeometry args={[1.0, 4.4, 24]} />
              <meshBasicMaterial color="#ef4444" transparent opacity={0.88} />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <coneGeometry args={[0.45, 1.8, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
            </mesh>
            {/* Mach Shock Diamonds */}
            <mesh position={[0, 1.1, 0]}>
              <octahedronGeometry args={[0.22, 0]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <mesh position={[0, 2.0, 0]}>
              <octahedronGeometry args={[0.3, 0]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
            <pointLight color="#ef4444" intensity={7} distance={20} />
          </group>
        )}

        {/* Step 5: High-Pressure Deluge Water Spray Shower */}
        {currentStep === 5 && (
          <group ref={delugeMistRef} position={[0, 2.2, 0]}>
            {[-0.9, -0.3, 0.3, 0.9].map((dx, di) => (
              <group key={`deluge-${di}`} position={[dx, -0.6, 0]}>
                <mesh rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.8, 2.4, 16]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
                </mesh>
                <mesh position={[0, -0.4, 0]} rotation={[Math.PI, 0, 0]}>
                  <coneGeometry args={[0.5, 1.8, 16]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
                </mesh>
              </group>
            ))}
            <pointLight color="#38bdf8" intensity={4} distance={12} />
          </group>
        )}
      </group>

      {/* Step 2 & 3: Worker 3D Avatar in Line-of-Fire (1.8m Proximity) */}
      {(currentStep === 2 || currentStep === 3) && (
        <group position={[1.6, 0.33, 1.1]}>
          {/* Work Boots */}
          <mesh position={[-0.09, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.18]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.09, 0.1, 0]}>
            <boxGeometry args={[0.1, 0.2, 0.18]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Work Pants (Navy Blue) */}
          <mesh position={[0, 0.42, 0]}>
            <boxGeometry args={[0.3, 0.46, 0.2]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          {/* High-Vis Orange Safety Vest */}
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[0.36, 0.46, 0.24]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} />
          </mesh>
          {/* Reflective Band */}
          <mesh position={[0, 0.85, 0.125]}>
            <planeGeometry args={[0.34, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Hard Hat Helmet */}
          <mesh position={[0, 1.22, 0]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
          <mesh position={[0, 1.28, 0]}>
            <sphereGeometry args={[0.16, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          {/* Line-of-Fire Deck Danger Ring */}
          <group ref={workerProximityRef} position={[0, 0.02, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.7, 0.88, 32]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.75} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      )}

      {/* Step 3: Holographic LOTO Bypass Indicator Ring */}
      {currentStep === 3 && (
        <group position={[0.85, 2.4, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.25, 0.04, 16, 24]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* Step 4: Hopkinson-Cranz Blast Rings on Deck */}
      {currentStep === 4 && (
        <group ref={blastRingsRef} position={[0.85, 0.35, 0]}>
          {/* Inner Lethal Radius (R = 28.5m scaled) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.8, 3.05, 48]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
          {/* Outer Safe Exclusion Radius (R = 75m scaled) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[5.8, 6.05, 48]} />
            <meshBasicMaterial color="#eab308" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Step 5: Emerald DGMS Positive Isolation Shield Mesh */}
      {currentStep === 5 && (
        <group position={[0.85, 2.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 6]} />
            <meshStandardMaterial color="#10b981" metalness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 11. 3D FLOATING PINNED OFFSHORE CALLOUT LABELS (SLEEK & MINIMAL)
// =============================================================================
function PinnedEquipmentCallout({
  position,
  tag,
  status,
  color = "#eab308",
  isLight = false,
}: {
  position: [number, number, number];
  tag: string;
  status: string;
  color?: string;
  isLight?: boolean;
}) {
  return (
    <Html position={position} center distanceFactor={26} zIndexRange={[10, 0]}>
      <div className="pointer-events-none select-none flex flex-col items-center">
        <div
          className="px-2 py-0.5 rounded-full border shadow-md flex items-center gap-1.5 text-[9px] font-mono font-bold whitespace-nowrap"
          style={{
            backgroundColor: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(10, 15, 26, 0.9)",
            borderColor: color,
            color: isLight ? "#0f172a" : "#ffffff",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{tag}</span>
        </div>
      </div>
    </Html>
  );
}

// =============================================================================
// CAMERA CONTROLLER: Dynamic Isometric & Zone D Auto-Framing Manager
// =============================================================================
function IsometricCameraManager({
  orbitRef,
  resetTrigger,
  currentStep = 1,
  autoCameraTracking = true,
}: {
  orbitRef: React.RefObject<OrbitControlsImpl | null>;
  resetTrigger: number;
  currentStep?: number;
  autoCameraTracking?: boolean;
}) {
  const { camera } = useThree();
  const isTransitioningRef = useRef<boolean>(true);
  const prevResetRef = useRef<number>(resetTrigger);
  const prevStepRef = useRef<number>(currentStep);

  const defaultWidePos = useMemo(() => new THREE.Vector3(48.0, 36.0, 48.0), []);
  const defaultWideLook = useMemo(() => new THREE.Vector3(0.0, 14.0, 0.0), []);

  const zoneDPos = useMemo(() => new THREE.Vector3(26.0, 24.0, 26.0), []);
  const zoneDLook = useMemo(() => new THREE.Vector3(4.0, 15.0, 4.0), []);

  const [activeTargetPos, setActiveTargetPos] = useState<THREE.Vector3>(defaultWidePos);
  const [activeTargetLook, setActiveTargetLook] = useState<THREE.Vector3>(defaultWideLook);

  useEffect(() => {
    const controls = orbitRef.current;
    if (!controls) return;
    const handleStart = () => {
      // User manual mouse orbit takes immediate priority
      isTransitioningRef.current = false;
    };
    controls.addEventListener("start", handleStart);
    return () => controls.removeEventListener("start", handleStart);
  }, [orbitRef]);

  // Handle manual reset button
  useEffect(() => {
    if (resetTrigger !== prevResetRef.current) {
      isTransitioningRef.current = true;
      prevResetRef.current = resetTrigger;
      setActiveTargetPos(defaultWidePos);
      setActiveTargetLook(defaultWideLook);
    }
  }, [resetTrigger, defaultWidePos, defaultWideLook]);

  // Handle automatic step camera framing
  useEffect(() => {
    if (autoCameraTracking && currentStep !== prevStepRef.current) {
      isTransitioningRef.current = true;
      prevStepRef.current = currentStep;
      if (currentStep === 5 || currentStep === 1) {
        // Wide rig overview
        setActiveTargetPos(defaultWidePos);
        setActiveTargetLook(defaultWideLook);
      } else {
        // Steps 2 to 4: Process deck focus with balanced distance
        setActiveTargetPos(zoneDPos);
        setActiveTargetLook(zoneDLook);
      }
    }
  }, [currentStep, autoCameraTracking, defaultWidePos, defaultWideLook, zoneDPos, zoneDLook]);

  useFrame(() => {
    if (!isTransitioningRef.current) return;
    camera.position.lerp(activeTargetPos, 0.04);
    if (orbitRef.current) {
      orbitRef.current.target.lerp(activeTargetLook, 0.04);
      orbitRef.current.update();
    }
    if (camera.position.distanceTo(activeTargetPos) < 0.15) {
      camera.position.copy(activeTargetPos);
      if (orbitRef.current) {
        orbitRef.current.target.copy(activeTargetLook);
        orbitRef.current.update();
      }
      isTransitioningRef.current = false;
    }
  });

  return null;
}

// =============================================================================
// MAIN DIGITAL TWIN CANVAS COMPONENT EXPORT
// =============================================================================
export default function DigitalTwinCanvas({
  mode,
  currentStep = 1,
  officerDecision,
  hideOverlays = false,
  theme = "light",
  zoneFocus = "Zone D",
  isExpanded = false,
  onToggleExpand,
  onSelectZone,
  onOpenProcedure,
  hasRecalledHazard = false,
  recalledFeatureName = "",
  physicsState,
  showBlastFootprint = false,
  isPlaying = true,
  onTogglePlay,
  onStepChange,
}: DigitalTwinProps) {
  const isLight = theme === "light";
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [autoCameraTracking, setAutoCameraTracking] = useState<boolean>(true);

  const handleResetCamera = () => {
    sound.click();
    setResetTrigger((prev) => prev + 1);
  };

  const handleZoomIn = () => {
    sound.click();
    if (orbitRef.current) {
      orbitRef.current.object.position.multiplyScalar(0.85);
      orbitRef.current.update();
    }
  };

  const handleZoomOut = () => {
    sound.click();
    if (orbitRef.current) {
      orbitRef.current.object.position.multiplyScalar(1.15);
      orbitRef.current.update();
    }
  };

  return (
    <div
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none transition-colors duration-300 ${
        isLight ? "bg-[#38bdf8]" : "bg-[#040e1b]"
      }`}
    >
      {/* 360° Free Camera Controls Floating Toolbar */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 font-sans text-xs">
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-md active:scale-95 ${
              isLight
                ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-800 font-medium"
                : "bg-[#0b1322]/90 hover:bg-[#111e36] border-amber-500/30 text-amber-200 font-medium"
            }`}
            title={isExpanded ? "Restore Normal View" : "Expand 3D Model Fullscreen"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isExpanded ? "Exit Fullscreen" : "Expand 3D"}</span>
          </button>
        )}

        <div
          className={`flex items-center rounded-lg border shadow-md overflow-hidden ${
            isLight ? "bg-white/95 border-slate-300" : "bg-[#0b1322]/90 border-amber-500/30"
          }`}
        >
          <button
            onClick={handleZoomIn}
            className={`p-2 transition-colors border-r ${
              isLight
                ? "border-slate-200 hover:bg-slate-100 text-slate-700"
                : "border-amber-500/20 hover:bg-[#111e36] text-amber-300"
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className={`p-2 transition-colors ${
              isLight ? "hover:bg-slate-100 text-slate-700" : "hover:bg-[#111e36] text-amber-300"
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            sound.toggle();
            setAutoCameraTracking((prev) => !prev);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-md active:scale-95 ${
            autoCameraTracking
              ? "bg-cyan-600 border-cyan-400 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              : isLight
              ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-800 font-medium"
              : "bg-[#0b1322]/90 hover:bg-[#111e36] border-amber-500/30 text-amber-200 font-medium"
          }`}
          title="Toggle Smart Camera Tracking of Active Event Stages"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{autoCameraTracking ? "Auto Track ON" : "Auto Track"}</span>
        </button>

        <button
          onClick={() => {
            sound.toggle();
            setAutoRotate((prev) => !prev);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-md active:scale-95 ${
            autoRotate
              ? "bg-amber-600 border-amber-400 text-white font-semibold shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              : isLight
              ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-800 font-medium"
              : "bg-[#0b1322]/90 hover:bg-[#111e36] border-amber-500/30 text-amber-200 font-medium"
          }`}
          title="Toggle 360° Continuous Turntable Rotation"
        >
          <Compass className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
          <span>{autoRotate ? "Turntable ON" : "360° Turntable"}</span>
        </button>

        <button
          onClick={handleResetCamera}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shadow-md active:scale-95 ${
            isLight
              ? "bg-white/95 hover:bg-slate-100 border-slate-300 text-slate-800 font-medium"
              : "bg-[#0b1322]/90 hover:bg-[#111e36] border-amber-500/30 text-amber-200 font-medium"
          }`}
          title="Reset Camera to Optimal Viewing Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Camera</span>
        </button>
      </div>

      <Canvas
        camera={{ position: [42, 34, 42], fov: 38 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={[isLight ? "#38bdf8" : "#040e1b"]} />

        {/* Physical Atmospheric Sky with Rayleigh & Mie Scattering */}
        <Sky
          distance={450000}
          sunPosition={[35, 45, 25]}
          inclination={0.52}
          azimuth={0.25}
          turbidity={2.2}
          rayleigh={0.65}
        />

        {/* Atmospheric Distance Ocean Sea Fog */}
        <fog attach="fog" args={[isLight ? "#1e40af" : "#031427", 100, 320]} />

        <IsometricCameraManager
          orbitRef={orbitRef}
          resetTrigger={resetTrigger}
          currentStep={currentStep}
          autoCameraTracking={autoCameraTracking}
        />

        {/* Radiant Oceanic Sun & Atmospheric Sky Lighting */}
        <ambientLight intensity={isLight ? 0.85 : 0.6} color={isLight ? "#0284c7" : "#0f2b48"} />
        <directionalLight
          position={[35, 45, 25]}
          intensity={isLight ? 2.4 : 1.8}
          color="#fef08a"
          castShadow
        />
        <directionalLight position={[-25, 30, -20]} intensity={isLight ? 0.9 : 0.6} color="#06b6d4" />

        <Suspense fallback={null}>
          {/* 1. Dynamic Gerstner Wave Ocean Surface with Capillary Texture & SSS */}
          <OceanWaterMesh isLight={isLight} />

          {/* 2. Subsea Conductor Array (16 Wellhead Casings with Christmas Trees Plunging into Seabed) */}
          <SubseaConductorArray isLight={isLight} />

          {/* 3. Substructure (Caissons with Weld Rings, Splash Zones, Pontoons & Boat Landing) */}
          <OffshoreRigSubstructure isLight={isLight} />

          {/* 4. Cellar & Upper Production Decks */}
          <OffshoreDecks isLight={isLight} />

          {/* 5. Towering Drilling Derrick with Crown Sheaves, Doghouse & Catwalk */}
          <DrillingDerrick isLight={isLight} />

          {/* 6. Cantilevered Flare Boom & Burning Flame (Flares up during Emergency Depressurization in Step 5) */}
          <CantileverFlareBoom isDepressurizing={currentStep === 5} />

          {/* 7. Cantilevered Helideck & S-92 Crew Helicopter */}
          <HelideckComplex />

          {/* 8. Offshore Pedestal Cranes & Process Separator Modules */}
          <OffshoreEquipmentAndCranes isLight={isLight} />

          {/* 9. Offshore Support Vessel (OSV 'Sentinel-1') Floating with Physical Buoyancy */}
          <OffshoreSupplyVessel />

          {/* 10. Hero Wellhead Skid P-102 & Flange F-402 Assembly (Zone D) */}
          <HeroSkidAssembly
            position={[5.0, 15.3, 5.0]}
            currentStep={currentStep}
            pressurePsi={
              physicsState?.pressurePsi ||
              (currentStep === 1
                ? 1250
                : currentStep === 2
                ? 2400
                : currentStep === 3
                ? 3150
                : currentStep === 4
                ? 4200
                : 650)
            }
            onClick={() => {
              sound.click();
              onSelectZone("Zone D");
              if (onOpenProcedure) onOpenProcedure();
            }}
          />

          {/* 11. 3D Pinned Floating Hexagonal Callout Labels (100% English) */}
          {!hideOverlays && (
            <>
              <PinnedEquipmentCallout
                position={[5.0, 18.2, 5.0]}
                tag="Zone D // Wellhead Skid"
                status={currentStep === 4 ? "4,200 PSI JET" : currentStep === 3 ? "LEL 78% VAPOR" : "ACTIVE"}
                color={currentStep === 4 ? "#ef4444" : currentStep === 3 ? "#f97316" : "#eab308"}
                isLight={isLight}
              />
              <PinnedEquipmentCallout
                position={[0, 40.0, 0]}
                tag="Zone A // Derrick"
                status="Drilling Active"
                color="#06b6d4"
                isLight={isLight}
              />
              <PinnedEquipmentCallout
                position={[-6.0, 18.0, 6.0]}
                tag="Zone B // Separator"
                status="Nominal"
                color="#f59e0b"
                isLight={isLight}
              />
              <PinnedEquipmentCallout
                position={[-26.0, 29.5, 26.0]}
                tag="Zone C // Flare Boom"
                status={currentStep === 5 ? "Relief Active" : "Nominal"}
                color={currentStep === 5 ? "#eab308" : "#ef4444"}
                isLight={isLight}
              />
              <PinnedEquipmentCallout
                position={[-18.0, 19.5, -18.0]}
                tag="Zone E // Helideck"
                status="Landed"
                color="#10b981"
                isLight={isLight}
              />
              <PinnedEquipmentCallout
                position={[32.0, 5.5, 22.0]}
                tag="Zone F // Vessel"
                status="Station Keeping"
                color="#38bdf8"
                isLight={isLight}
              />
            </>
          )}

          <OrbitControls
            ref={orbitRef}
            enableDamping
            dampingFactor={0.08}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={0.05}
            minDistance={8}
            maxDistance={90}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
