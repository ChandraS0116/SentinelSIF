"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sliders,
  Flame,
  Zap,
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Volume2,
  Lock,
  ChevronRight,
  TrendingUp,
  Radio,
  ArrowUpRight,
  Sparkles,
  FileCheck,
  User,
  Crosshair,
} from "lucide-react";
import { ThemeMode } from "../AuthGateway";
import { PhysicsSimulationState } from "../PhysicsStressSimulator";
import { sound } from "../../utils/audioHaptics";

interface PhysicsSandboxViewProps {
  theme: ThemeMode;
  physicsState: PhysicsSimulationState | null;
  onUpdatePhysics: (state: PhysicsSimulationState) => void;
  onNavigateView: (view: "digital_twin" | "incident_lab" | "physics_sandbox" | "acoustic_array" | "compliance_audit") => void;
}

export default function PhysicsSandboxView({
  theme,
  physicsState,
  onUpdatePhysics,
  onNavigateView,
}: PhysicsSandboxViewProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDraggingWorker, setIsDraggingWorker] = useState<boolean>(false);

  // Local state with safe fallback
  const current: PhysicsSimulationState = physicsState || {
    pressurePsi: 3150,
    gasLelPercent: 78,
    workerProximityMeters: 1.8,
    flowRateM3H: 750,
    psvStatus: "THROTTLED",
    delugeStatus: "OFFLINE",
    lotoStatus: "BYPASSED",
    acousticSensorActive: true,
    discordanceScore: 94,
    sifClassification: "CRITICAL BLOWOUT",
    tntEquivalentKg: 184,
    lethalBlastRadiusMeters: 28.5,
    heatFlux12kwRadiusMeters: 42.0,
    safePerimeterMeters: 75.0,
    isRuptureImminent: true,
  };

  const updateParam = (key: string, value: any) => {
    const updated = { ...current, [key]: value };
    const pressure = key === "pressurePsi" ? Number(value) : updated.pressurePsi;
    const lel = key === "gasLelPercent" ? Number(value) : updated.gasLelPercent;
    const dist = key === "workerProximityMeters" ? Number(value) : updated.workerProximityMeters;
    const flow = key === "flowRateM3H" ? Number(value) : updated.flowRateM3H;
    const psv = key === "psvStatus" ? value : updated.psvStatus;
    const deluge = key === "delugeStatus" ? value : updated.delugeStatus;
    const loto = key === "lotoStatus" ? value : updated.lotoStatus;

    let baseEnergy = (pressure / 5000) * 45 + (flow / 1200) * 25 + (lel / 100) * 30;
    if (psv === "THROTTLED") baseEnergy += 18;
    if (psv === "BYPASSED") baseEnergy += 25;
    if (deluge === "OFFLINE") baseEnergy += 15;
    if (loto === "BYPASSED") baseEnergy += 20;

    const proximityFactor = Math.max(0.2, (30 - dist) / 30);
    let calculatedGap = Math.min(99, Math.round(baseEnergy * (0.6 + proximityFactor * 0.5)));

    const tntKg = Math.round((pressure * flow * (lel / 100)) / 12500);
    const lethalM = Math.round(Math.pow(tntKg + 1, 0.33) * 4.8 * 10) / 10;
    const radiantM = Math.round(lethalM * 1.55 * 10) / 10;
    const safeM = Math.round(radiantM * 1.75);

    let classification: "ROUTINE" | "WATCH" | "SIF PRECURSOR" | "CRITICAL BLOWOUT" = "ROUTINE";
    if (calculatedGap > 80) classification = "CRITICAL BLOWOUT";
    else if (calculatedGap > 55) classification = "SIF PRECURSOR";
    else if (calculatedGap > 30) classification = "WATCH";

    const finalState: PhysicsSimulationState = {
      ...updated,
      discordanceScore: calculatedGap,
      sifClassification: classification,
      tntEquivalentKg: tntKg,
      lethalBlastRadiusMeters: lethalM,
      heatFlux12kwRadiusMeters: radiantM,
      safePerimeterMeters: safeM,
      isRuptureImminent: calculatedGap > 85,
    };
    onUpdatePhysics(finalState);
  };

  const applyPreset = (preset: {
    pressure: number;
    flow: number;
    lel: number;
    dist: number;
    psv: string;
    deluge: string;
    loto: string;
  }) => {
    sound.click();
    updateParam("pressurePsi", preset.pressure);
    updateParam("flowRateM3H", preset.flow);
    updateParam("gasLelPercent", preset.lel);
    updateParam("workerProximityMeters", preset.dist);
    updateParam("psvStatus", preset.psv);
    updateParam("delugeStatus", preset.deluge);
    updateParam("lotoStatus", preset.loto);
  };

  // 2D Interactive Blast Radar Canvas Renderer
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const maxRadiusMeters = 80;
    const scale = (Math.min(cx, cy) - 20) / maxRadiusMeters;

    ctx.clearRect(0, 0, w, h);

    // Radar grid rings
    ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    [20, 40, 60, 80].forEach((r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx, h - 10);
    ctx.moveTo(10, cy);
    ctx.lineTo(w - 10, cy);
    ctx.stroke();

    // 1. Safe Perimeter (Green)
    const safePx = current.safePerimeterMeters * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, safePx, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.06)";
    ctx.fill();
    ctx.strokeStyle = isLight ? "rgba(16, 185, 129, 0.8)" : "rgba(16, 185, 129, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Radiant Heat 12.5 kW/m² (Amber)
    const radiantPx = current.heatFlux12kwRadiusMeters * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, radiantPx, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.12)";
    ctx.fill();
    ctx.strokeStyle = isLight ? "rgba(217, 119, 6, 0.9)" : "rgba(245, 158, 11, 0.6)";
    ctx.stroke();

    // 3. Lethal Blast Overpressure >5 PSI (Red)
    const lethalPx = current.lethalBlastRadiusMeters * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, lethalPx, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.2)";
    ctx.fill();
    ctx.strokeStyle = isLight ? "rgba(220, 38, 38, 0.95)" : "rgba(239, 68, 68, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;

    // Center Epicenter: Flange Leak Point
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? "#ea580c" : "#f97316";
    ctx.fill();

    // Plotted Worker Position
    const workerDist = current.workerProximityMeters;
    const workerPx = workerDist * scale;
    const wx = cx + workerPx;
    const wy = cy;

    ctx.beginPath();
    ctx.arc(wx, wy, 8, 0, Math.PI * 2);
    ctx.fillStyle = workerDist <= current.lethalBlastRadiusMeters ? "#dc2626" : workerDist <= current.heatFlux12kwRadiusMeters ? "#d97706" : "#059669";
    ctx.fill();
    ctx.strokeStyle = isLight ? "#0f172a" : "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Worker label text
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = isLight ? "#0f172a" : "#ffffff";
    ctx.fillText(`Worker (${workerDist}m)`, wx + 12, wy + 4);
  }, [current, isLight]);

  // Handle Drag/Click on Blast Radar Canvas
  const handleRadarInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const distPx = Math.sqrt(dx * dx + dy * dy);

    const maxRadiusMeters = 80;
    const scale = (Math.min(cx, cy) - 20) / maxRadiusMeters;
    const calculatedDist = Math.max(0.5, Math.min(30, Math.round((distPx / scale) * 10) / 10));

    updateParam("workerProximityMeters", calculatedDist);
    sound.click();
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Title */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316] animate-pulse" />
              <h1 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : ""}`}>
                Thermodynamic Physics &amp; Blast Simulator
              </h1>
            </div>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
              Real-time pipeline thermodynamics, choked flow modeling, and Hopkinson-Cranz blast scaling
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                applyPreset({
                  pressure: 1200,
                  flow: 300,
                  lel: 15,
                  dist: 12,
                  psv: "FUNCTIONING",
                  deluge: "ARMED",
                  loto: "LOCKED",
                });
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isLight
                  ? "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-sm"
                  : "border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Nominal</span>
            </button>
            <button
              onClick={() => {
                sound.click();
                onNavigateView("digital_twin");
              }}
              className={`px-3.5 py-1.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 ${
                isLight
                  ? "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-sm"
                  : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200 hover:text-white"
              }`}
            >
              <span>View 3D Twin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                sound.success();
                onNavigateView("compliance_audit");
              }}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95 animate-pulse hover:animate-none"
              title="Synthesize and take official executive safety intelligence dossier"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Take Output Dossier</span>
            </button>
          </div>
        </div>

        {/* QUICK SCENARIO PRESETS BAR */}
        <div
          className={`p-3 rounded-2xl border backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 text-xs ${
            isLight
              ? "bg-slate-50 border-slate-200 shadow-sm"
              : isPetroleum
              ? "bg-[#071324] border-amber-900/40"
              : "bg-white/[0.03] border-white/[0.08]"
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider font-mono pl-1 ${
            isLight ? "text-slate-700" : "text-slate-400"
          }`}>
            Quick-Load Pressure Profiles:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                label: "Nominal Pipeline (1,200 PSI)",
                preset: { pressure: 1200, flow: 320, lel: 12, dist: 15, psv: "FUNCTIONING", deluge: "ARMED", loto: "LOCKED" },
              },
              {
                label: "High Transfer (2,800 PSI)",
                preset: { pressure: 2800, flow: 640, lel: 45, dist: 8, psv: "FUNCTIONING", deluge: "ARMED", loto: "BYPASSED" },
              },
              {
                label: "Relief Bypass Runaway (3,900 PSI)",
                preset: { pressure: 3900, flow: 920, lel: 85, dist: 3, psv: "BYPASSED", deluge: "OFFLINE", loto: "BYPASSED" },
              },
              {
                label: "Catastrophic BLEVE (5,000 PSI)",
                preset: { pressure: 5000, flow: 1200, lel: 100, dist: 1.2, psv: "BYPASSED", deluge: "OFFLINE", loto: "BYPASSED" },
              },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p.preset)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all active:scale-95 ${
                  isLight
                    ? "bg-white hover:bg-orange-50 border border-slate-300 text-slate-800 font-semibold shadow-sm hover:border-orange-400 hover:text-orange-950"
                    : "bg-white/[0.04] hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/40 text-slate-300 hover:text-orange-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN WORKBENCH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 Cols: Tactical Sliders & Barrier Fault Ingestion */}
          <div className="lg:col-span-7 space-y-5">
            {/* Thermodynamic Sliders Card */}
            <div
              className={`p-5 rounded-2xl border backdrop-blur-xl shadow-xl space-y-4 ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50"
                  : isPetroleum
                  ? "bg-[#071426]/90 border-amber-500/25 text-amber-100 shadow-black/80"
                  : "bg-[#090e18]/90 border-white/[0.08] text-slate-100 shadow-black/80"
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isLight ? "text-orange-800 font-extrabold" : "text-orange-400"
              }`}>
                Operating Parameters (Drag to Modulate Physical Hazard)
              </span>

              {/* Slider 1: Pressure */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold flex items-center gap-1.5 ${isLight ? "text-slate-900" : ""}`}>
                    <Flame className={`w-3.5 h-3.5 ${isLight ? "text-orange-600" : "text-orange-400"}`} />
                    Line Operating Pressure:
                  </span>
                  <span className={`font-mono font-extrabold text-sm ${isLight ? "text-orange-800" : "text-orange-400"}`}>
                    {current.pressurePsi.toLocaleString()} PSI
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={current.pressurePsi}
                  onChange={(e) => {
                    updateParam("pressurePsi", e.target.value);
                    if (Number(e.target.value) > 4000) sound.warning();
                  }}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-500 ${
                    isLight ? "bg-slate-200" : "bg-slate-800"
                  }`}
                />
                <div className={`flex justify-between text-[10px] font-mono ${
                  isLight ? "text-slate-600 font-semibold" : "text-slate-400"
                }`}>
                  <span>100 PSI (Atmospheric Low)</span>
                  <span>2,500 PSI (High Process)</span>
                  <span className={isLight ? "text-red-700 font-bold" : "text-red-400 font-bold"}>
                    5,000 PSI (Critical Blowout)
                  </span>
                </div>
              </div>

              {/* Slider 2: Gas LEL */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isLight ? "text-slate-900" : "text-slate-300"}`}>
                    Flammable Vapor Concentration:
                  </span>
                  <span className={`font-mono font-extrabold ${isLight ? "text-amber-800" : "text-amber-400"}`}>
                    {current.gasLelPercent}% LEL
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={current.gasLelPercent}
                  onChange={(e) => updateParam("gasLelPercent", e.target.value)}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-500 ${
                    isLight ? "bg-slate-200" : "bg-slate-800"
                  }`}
                />
              </div>

              {/* Slider 3: Worker Proximity */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isLight ? "text-slate-900" : "text-slate-300"}`}>
                    Worker Line-of-Fire Distance:
                  </span>
                  <span className={`font-mono font-extrabold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>
                    {current.workerProximityMeters} meters
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={current.workerProximityMeters}
                  onChange={(e) => updateParam("workerProximityMeters", e.target.value)}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${
                    isLight ? "bg-slate-200" : "bg-slate-800"
                  }`}
                />
              </div>

              {/* Slider 4: Flow Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${isLight ? "text-slate-900" : "text-slate-300"}`}>
                    Mass Line Flow Rate:
                  </span>
                  <span className={`font-mono font-extrabold ${isLight ? "text-blue-900" : "text-slate-200"}`}>
                    {current.flowRateM3H} m³/hr
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="25"
                  value={current.flowRateM3H}
                  onChange={(e) => updateParam("flowRateM3H", e.target.value)}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                    isLight ? "bg-slate-200" : "bg-slate-800"
                  }`}
                />
              </div>
            </div>

            {/* Barrier Disruption Fault Matrix */}
            <div
              className={`p-5 rounded-2xl border backdrop-blur-xl shadow-xl space-y-3 ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50"
                  : isPetroleum
                  ? "bg-[#071426]/90 border-amber-500/25 text-amber-100 shadow-black/80"
                  : "bg-[#090e18]/90 border-white/[0.08] text-slate-100 shadow-black/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? "text-slate-700" : "text-slate-400"
                }`}>
                  Protective Barrier Disruption Switches
                </span>
                <span className={`text-[10px] font-mono ${
                  isLight ? "text-slate-600 font-semibold" : "text-slate-400"
                }`}>Toggle Failures Live</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* PSV Toggle */}
                <button
                  onClick={() => {
                    sound.toggle();
                    updateParam(
                      "psvStatus",
                      current.psvStatus === "FUNCTIONING"
                        ? "THROTTLED"
                        : current.psvStatus === "THROTTLED"
                        ? "BYPASSED"
                        : "FUNCTIONING"
                    );
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    current.psvStatus === "FUNCTIONING"
                      ? isLight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm"
                        : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : current.psvStatus === "THROTTLED"
                      ? isLight
                        ? "bg-amber-50 border-amber-300 text-amber-950 shadow-sm"
                        : "bg-amber-950/40 border-amber-500/50 text-amber-300"
                      : isLight
                      ? "bg-red-50 border-red-300 text-red-950 shadow-sm"
                      : "bg-red-950/50 border-red-500/60 text-red-300"
                  }`}
                >
                  <div className={`text-[10px] font-mono ${isLight ? "text-slate-700 font-bold" : "opacity-75"}`}>
                    PSV-102 PRIMARY RELIEF
                  </div>
                  <div className="font-extrabold text-sm mt-0.5">{current.psvStatus}</div>
                  <div className={`text-[10px] mt-1 ${isLight ? "text-slate-600 font-medium" : "opacity-60"}`}>
                    Click to toggle fault mode
                  </div>
                </button>

                {/* Deluge Toggle */}
                <button
                  onClick={() => {
                    sound.toggle();
                    updateParam("delugeStatus", current.delugeStatus === "ARMED" ? "OFFLINE" : "ARMED");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    current.delugeStatus === "ARMED"
                      ? isLight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm"
                        : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : isLight
                      ? "bg-red-50 border-red-300 text-red-950 shadow-sm"
                      : "bg-red-950/50 border-red-500/60 text-red-300"
                  }`}
                >
                  <div className={`text-[10px] font-mono ${isLight ? "text-slate-700 font-bold" : "opacity-75"}`}>
                    WATER DELUGE CURTAIN
                  </div>
                  <div className="font-extrabold text-sm mt-0.5">{current.delugeStatus}</div>
                  <div className={`text-[10px] mt-1 ${isLight ? "text-slate-600 font-medium" : "opacity-60"}`}>
                    Click to arm / trip offline
                  </div>
                </button>

                {/* LOTO Toggle */}
                <button
                  onClick={() => {
                    sound.toggle();
                    updateParam(
                      "lotoStatus",
                      current.lotoStatus === "LOCKED"
                        ? "DEPRESSURIZED"
                        : current.lotoStatus === "DEPRESSURIZED"
                        ? "BYPASSED"
                        : "LOCKED"
                    );
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    current.lotoStatus === "LOCKED"
                      ? isLight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm"
                        : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : current.lotoStatus === "DEPRESSURIZED"
                      ? isLight
                        ? "bg-amber-50 border-amber-300 text-amber-950 shadow-sm"
                        : "bg-amber-950/40 border-amber-500/50 text-amber-300"
                      : isLight
                      ? "bg-red-50 border-red-300 text-red-950 shadow-sm"
                      : "bg-red-950/50 border-red-500/60 text-red-300"
                  }`}
                >
                  <div className={`text-[10px] font-mono ${isLight ? "text-slate-700 font-bold" : "opacity-75"}`}>
                    ZERO-ENERGY LOTO ISOLATION
                  </div>
                  <div className="font-extrabold text-sm mt-0.5">{current.lotoStatus}</div>
                  <div className={`text-[10px] mt-1 ${isLight ? "text-slate-600 font-medium" : "opacity-60"}`}>
                    Click to toggle bleed state
                  </div>
                </button>

                {/* Ultrasonic Sensor Toggle */}
                <button
                  onClick={() => {
                    sound.toggle();
                    updateParam("acousticSensorActive", !current.acousticSensorActive);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    current.acousticSensorActive
                      ? isLight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm"
                        : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : isLight
                      ? "bg-red-50 border-red-300 text-red-950 shadow-sm"
                      : "bg-red-950/50 border-red-500/60 text-red-300"
                  }`}
                >
                  <div className={`text-[10px] font-mono ${isLight ? "text-slate-700 font-bold" : "opacity-75"}`}>
                    38.4 kHz ACOUSTIC SENSOR
                  </div>
                  <div className="font-extrabold text-sm mt-0.5">
                    {current.acousticSensorActive ? "ACTIVE LISTENING" : "MUTED"}
                  </div>
                  <div className={`text-[10px] mt-1 ${isLight ? "text-slate-600 font-medium" : "opacity-60"}`}>
                    High-frequency leak detection
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Real-Time Blast Canvas & Calculated Physics */}
          <div className="lg:col-span-5 space-y-5">
            {/* INTERACTIVE 2D BLAST DISPERSION RADAR CANVAS */}
            <div
              className={`p-5 rounded-2xl border backdrop-blur-xl shadow-xl space-y-3 ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50"
                  : isPetroleum
                  ? "bg-[#071426]/90 border-amber-500/25 text-amber-100 shadow-black/80"
                  : "bg-[#090e18]/90 border-white/[0.08] text-slate-100 shadow-black/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? "text-cyan-800 font-extrabold" : "text-cyan-400"
                }`}>
                  <Crosshair className="w-3.5 h-3.5" />
                  Interactive 2D Blast Dispersion Radar
                </span>
                <span className={`text-[10px] font-mono ${
                  isLight ? "text-slate-600 font-semibold" : "text-slate-400"
                }`}>Click or drag worker</span>
              </div>

              {/* Canvas Radar Viewport */}
              <div className={`relative w-full h-44 rounded-xl border overflow-hidden flex items-center justify-center cursor-crosshair ${
                isLight ? "bg-slate-100 border-slate-300 shadow-inner" : "bg-black/80 border-white/10"
              }`}>
                <canvas
                  ref={radarCanvasRef}
                  width={340}
                  height={170}
                  onClick={handleRadarInteraction}
                  onMouseDown={() => setIsDraggingWorker(true)}
                  onMouseUp={() => setIsDraggingWorker(false)}
                  onMouseMove={(e) => {
                    if (isDraggingWorker) handleRadarInteraction(e);
                  }}
                  className="w-full h-full"
                />
                <div className={`absolute bottom-2 left-3 text-[9px] font-mono pointer-events-none ${
                  isLight ? "text-slate-700 font-bold" : "text-slate-400"
                }`}>
                  Red: Lethal ({current.lethalBlastRadiusMeters}m) &bull; Green: Safe ({current.safePerimeterMeters}m)
                </div>
              </div>
            </div>

            {/* Real-time SIF Discordance Card */}
            <div
              className={`p-5 rounded-2xl border backdrop-blur-xl shadow-xl space-y-3 ${
                isLight
                  ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50"
                  : isPetroleum
                  ? "bg-[#071426]/90 border-amber-500/25 text-amber-100 shadow-black/80"
                  : "bg-[#090e18]/90 border-white/[0.08] text-slate-100 shadow-black/80"
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isLight ? "text-slate-700 font-bold" : "text-slate-400"
              }`}>
                Calculated SIF Discordance Gap
              </span>

              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`text-4xl font-black ${
                      current.discordanceScore > 80
                        ? isLight ? "text-red-700 animate-pulse" : "text-red-500 animate-pulse"
                        : current.discordanceScore > 50
                        ? isLight ? "text-orange-700" : "text-orange-400"
                        : isLight ? "text-emerald-700" : "text-emerald-400"
                    }`}
                  >
                    {current.discordanceScore}%
                  </span>
                  <span className={`text-xs font-bold block mt-0.5 ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
                    SEVERITY DISCORDANCE GAP
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-xs border ${
                      current.sifClassification === "CRITICAL BLOWOUT"
                        ? isLight
                          ? "bg-red-100 border-red-300 text-red-800"
                          : "bg-red-950/60 border-red-500/60 text-red-300"
                        : current.sifClassification === "SIF PRECURSOR"
                        ? isLight
                          ? "bg-orange-100 border-orange-300 text-orange-800"
                          : "bg-orange-950/60 border-orange-500/60 text-orange-300"
                        : isLight
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                        : "bg-emerald-950/60 border-emerald-500/60 text-emerald-300"
                    }`}
                  >
                    {current.sifClassification}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-3 rounded-full overflow-hidden border ${
                isLight ? "bg-slate-200 border-slate-300" : "bg-black/50 border-white/10"
              }`}>
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 transition-all duration-300"
                  style={{ width: `${current.discordanceScore}%` }}
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    sound.click();
                    onNavigateView("digital_twin");
                  }}
                  className={`w-full py-2.5 rounded-xl border font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                      : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200 hover:text-white"
                  }`}
                >
                  <span>Project Shockwave onto 3D Digital Twin</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    sound.success();
                    onNavigateView("compliance_audit");
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 animate-pulse hover:animate-none"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>TAKE OFFICIAL SAFETY OUTPUT DOSSIER</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
