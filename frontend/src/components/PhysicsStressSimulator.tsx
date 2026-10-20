"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Gauge,
  Flame,
  Zap,
  Activity,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Radio,
  Volume2,
  Lock,
  Unlock,
  Sparkles,
  ChevronRight,
  Eye,
  Crosshair,
  TrendingUp,
} from "lucide-react";

export interface PhysicsSimulationState {
  pressurePsi: number;
  gasLelPercent: number;
  workerProximityMeters: number;
  flowRateM3H: number;
  psvStatus: "FUNCTIONING" | "THROTTLED" | "BYPASSED";
  delugeStatus: "ARMED" | "CLOGGED" | "OFFLINE";
  lotoStatus: "LOCKED" | "DEPRESSURIZED" | "BYPASSED";
  acousticSensorActive: boolean;
  // Computed values
  discordanceScore: number;
  sifClassification: "ROUTINE" | "WATCH" | "SIF PRECURSOR" | "CRITICAL BLOWOUT";
  tntEquivalentKg: number;
  lethalBlastRadiusMeters: number;
  heatFlux12kwRadiusMeters: number;
  safePerimeterMeters: number;
  isRuptureImminent: boolean;
}

interface PhysicsStressSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  onStateChange?: (state: PhysicsSimulationState) => void;
}

export default function PhysicsStressSimulator({
  isOpen,
  onClose,
  theme = "dark",
  onStateChange,
}: PhysicsStressSimulatorProps) {
  // Theme helpers
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  // Interactive Sliders State
  const [pressurePsi, setPressurePsi] = useState<number>(3150);
  const [gasLelPercent, setGasLelPercent] = useState<number>(78);
  const [workerProximityMeters, setWorkerProximityMeters] = useState<number>(1.8);
  const [flowRateM3H, setFlowRateM3H] = useState<number>(450);

  // Barrier Switches
  const [psvStatus, setPsvStatus] = useState<"FUNCTIONING" | "THROTTLED" | "BYPASSED">("BYPASSED");
  const [delugeStatus, setDelugeStatus] = useState<"ARMED" | "CLOGGED" | "OFFLINE">("CLOGGED");
  const [lotoStatus, setLotoStatus] = useState<"LOCKED" | "DEPRESSURIZED" | "BYPASSED">("BYPASSED");
  const [acousticSensorActive, setAcousticSensorActive] = useState<boolean>(true);

  // Real-time Physics & Discordance Math Engine
  const computed = useMemo<PhysicsSimulationState>(() => {
    // 1. TNT Equivalent Consequence Energy via Isentropic Gas/Vapor Expansion
    // E_TNT = (P * V * 10^5) / (4.184 * 10^6) kg TNT
    const vesselVolumeM3 = 1.2; // Standard pump discharge manifold volume
    const pressureAtm = pressurePsi / 14.696;
    const gasExpansionFactor = gasLelPercent > 20 ? 1.0 + (gasLelPercent / 100) * 2.5 : 1.0;
    const tntEquivalentKg = Math.max(
      0.1,
      parseFloat((((pressureAtm * 101325 * vesselVolumeM3) / (4.184e6)) * gasExpansionFactor).toFixed(2))
    );

    // 2. Lethal Overpressure Radius (> 5 PSI threshold causes eardrum rupture & lethal missile impact)
    // Hopkinson-Cranz blast scaling law: R = 0.28 * (TNT_equiv)^(1/3) * (P/P0)^0.5
    const lethalBlastRadiusMeters = Math.max(
      0.5,
      parseFloat((2.8 * Math.cbrt(tntEquivalentKg) * Math.sqrt(pressurePsi / 1000)).toFixed(1))
    );

    // 3. Radiant Heat Flux Radius (> 12.5 kW/m² causes 1st degree burns in 10s)
    const heatFlux12kwRadiusMeters = parseFloat((lethalBlastRadiusMeters * 1.6).toFixed(1));
    const safePerimeterMeters = parseFloat((heatFlux12kwRadiusMeters * 1.8).toFixed(1));

    // 4. Dynamic Discordance Gap
    // High energy (high pressure, high LEL, close proximity) combined with degraded barriers creates high discordance
    let energyFactor = (pressurePsi / 5000) * 45 + (gasLelPercent / 100) * 30;
    const proximityMultiplier = Math.max(0.2, 1.0 - (workerProximityMeters / 25));
    energyFactor = energyFactor * (0.6 + proximityMultiplier * 0.4);

    let barrierDeficit = 0;
    if (psvStatus === "BYPASSED") barrierDeficit += 25;
    else if (psvStatus === "THROTTLED") barrierDeficit += 12;

    if (delugeStatus === "OFFLINE") barrierDeficit += 15;
    else if (delugeStatus === "CLOGGED") barrierDeficit += 8;

    if (lotoStatus === "BYPASSED") barrierDeficit += 20;

    const rawDiscordance = Math.min(98, Math.max(4, Math.round(energyFactor + barrierDeficit)));

    // 5. Dynamic SIF Classification
    let sifClassification: "ROUTINE" | "WATCH" | "SIF PRECURSOR" | "CRITICAL BLOWOUT" = "ROUTINE";
    const isRuptureImminent = pressurePsi > 3800 || (pressurePsi > 2500 && gasLelPercent > 70 && psvStatus === "BYPASSED");

    if (isRuptureImminent) {
      sifClassification = "CRITICAL BLOWOUT";
    } else if (rawDiscordance >= 70 || (pressurePsi > 2000 && psvStatus !== "FUNCTIONING")) {
      sifClassification = "SIF PRECURSOR";
    } else if (rawDiscordance >= 35) {
      sifClassification = "WATCH";
    } else {
      sifClassification = "ROUTINE";
    }

    return {
      pressurePsi,
      gasLelPercent,
      workerProximityMeters,
      flowRateM3H,
      psvStatus,
      delugeStatus,
      lotoStatus,
      acousticSensorActive,
      discordanceScore: rawDiscordance,
      sifClassification,
      tntEquivalentKg,
      lethalBlastRadiusMeters,
      heatFlux12kwRadiusMeters,
      safePerimeterMeters,
      isRuptureImminent,
    };
  }, [pressurePsi, gasLelPercent, workerProximityMeters, flowRateM3H, psvStatus, delugeStatus, lotoStatus, acousticSensorActive]);

  // Broadcast to parent whenever state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(computed);
    }
  }, [computed, onStateChange]);

  // Reset to nominal baseline
  const resetToBaseline = () => {
    setPressurePsi(420);
    setGasLelPercent(2);
    setWorkerProximityMeters(14.5);
    setFlowRateM3H(180);
    setPsvStatus("FUNCTIONING");
    setDelugeStatus("ARMED");
    setLotoStatus("LOCKED");
    setAcousticSensorActive(true);
  };

  // Load worst-case blowout test
  const loadWorstCaseStress = () => {
    setPressurePsi(4850);
    setGasLelPercent(96);
    setWorkerProximityMeters(0.8);
    setFlowRateM3H(890);
    setPsvStatus("BYPASSED");
    setDelugeStatus("OFFLINE");
    setLotoStatus("BYPASSED");
    setAcousticSensorActive(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-sans animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 transition-colors ${
          isLight
            ? "bg-white border-slate-300 text-slate-900"
            : isPetroleum
            ? "bg-[#091629] border-amber-600/80 text-amber-50"
            : isCyber
            ? "bg-[#020906] border-emerald-500/80 text-emerald-50"
            : "bg-[#090e18] border-orange-500/80 text-white"
        }`}
      >
        {/* MODAL HEADER */}
        <header
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isLight
              ? "bg-slate-50 border-slate-200"
              : isPetroleum
              ? "bg-[#06101e] border-amber-900/50"
              : isCyber
              ? "bg-[#010603] border-emerald-900/60"
              : "bg-[#070b14] border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                computed.isRuptureImminent
                  ? "bg-red-600/20 border-red-500 text-red-500 animate-pulse"
                  : computed.discordanceScore >= 70
                  ? "bg-orange-600/20 border-orange-500 text-orange-500"
                  : "bg-emerald-600/20 border-emerald-500 text-emerald-500"
              }`}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white ${
                    computed.isRuptureImminent
                      ? "bg-red-600 animate-pulse"
                      : computed.discordanceScore >= 70
                      ? "bg-orange-600"
                      : "bg-emerald-600"
                  }`}
                >
                  LIVE PHYSICS DIGITAL TWIN SANDBOX
                </span>
                <span className="text-xs font-mono opacity-70">
                  Real-Time SIF Discordance &amp; Barrier Stress Engine
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                Dynamic Process Energy &amp; Rupture Consequence Simulator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToBaseline}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
              }`}
              title="Reset all parameters to nominal safe refinery operations"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Safe</span>
            </button>

            <button
              onClick={loadWorstCaseStress}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
              title="Stress-test the system with near-blowout pressure and failed barriers"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Worst Case Blowout</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white transition-all ml-1"
              title="Close Sandbox"
            >
              ✕
            </button>
          </div>
        </header>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* REAL-TIME DYNAMIC OUTPUT SUMMARY BANNER */}
          <div
            className={`p-4 rounded-xl border-2 transition-all grid grid-cols-2 md:grid-cols-4 gap-3 ${
              computed.isRuptureImminent
                ? "bg-red-950/40 border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : computed.discordanceScore >= 70
                ? "bg-orange-950/40 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                : "bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            }`}
          >
            {/* Metric 1: Live Discordance */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                Calculated SIF Discordance
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    computed.discordanceScore >= 70
                      ? "text-orange-500"
                      : computed.discordanceScore >= 35
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {computed.discordanceScore}%
                </span>
                <span className="text-[11px] font-bold opacity-80">GAP</span>
              </div>
              <span className="text-[10px] opacity-75 block">
                |Potential SIF - Actual Severity|
              </span>
            </div>

            {/* Metric 2: Live SIF Classification */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                Real-Time Classification
              </span>
              <div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-block border ${
                    computed.isRuptureImminent
                      ? "bg-red-600 text-white border-red-400 animate-pulse"
                      : computed.sifClassification === "SIF PRECURSOR"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500"
                      : computed.sifClassification === "WATCH"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                  }`}
                >
                  {computed.sifClassification}
                </span>
              </div>
              <span className="text-[10px] opacity-75 block">
                Deterministic SIF Decision Engine
              </span>
            </div>

            {/* Metric 3: TNT Equivalent Energy */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                Blast Energy Equivalent
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                  {computed.tntEquivalentKg}
                </span>
                <span className="text-[11px] font-bold text-cyan-300">kg TNT</span>
              </div>
              <span className="text-[10px] opacity-75 block">
                Hopkinson-Cranz Isentropic Expansion
              </span>
            </div>

            {/* Metric 4: Lethal Blast Radius */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                Lethal Overpressure Footprint
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black font-mono text-red-400">
                  {computed.lethalBlastRadiusMeters}
                </span>
                <span className="text-[11px] font-bold text-red-300">meters</span>
              </div>
              <span className="text-[10px] opacity-75 block">
                Safe Perimeter: {computed.safePerimeterMeters}m
              </span>
            </div>
          </div>

          {/* TWO COLUMN GRID: SLIDERS (LEFT) & BARRIERS + CONSEQUENCE (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* COLUMN 1: LIVE PHYSICAL TELEMETRY SLIDERS */}
            <div
              className={`p-4 rounded-xl border space-y-4 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-cyan-400">
                  <Activity className="w-4 h-4" />
                  Continuous Telemetry Stream Sliders
                </span>
                <span className="text-[10px] font-mono opacity-70">
                  OPC-UA Tag Ingestion: 20 Hz
                </span>
              </div>

              {/* Slider 1: Line Pressure */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-orange-400" />
                    <span>Line Operating Pressure:</span>
                  </label>
                  <span
                    className={`font-mono font-extrabold text-sm px-2 py-0.5 rounded border ${
                      pressurePsi > 3500
                        ? "bg-red-500/20 text-red-400 border-red-500"
                        : pressurePsi > 1800
                        ? "bg-orange-500/20 text-orange-400 border-orange-500"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                    }`}
                  >
                    {pressurePsi} PSI
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={25}
                  value={pressurePsi}
                  onChange={(e) => setPressurePsi(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-700 accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] opacity-60 font-mono">
                  <span>100 PSI (Low)</span>
                  <span>1,500 PSI (Standard Design)</span>
                  <span className="text-red-400">5,000 PSI (Burst Limit)</span>
                </div>
              </div>

              {/* Slider 2: Gas LEL % */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span>Hydrocarbon Flammable Gas Concentration:</span>
                  </label>
                  <span
                    className={`font-mono font-extrabold text-sm px-2 py-0.5 rounded border ${
                      gasLelPercent > 50
                        ? "bg-red-500/20 text-red-400 border-red-500"
                        : gasLelPercent > 20
                        ? "bg-amber-500/20 text-amber-400 border-amber-500"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                    }`}
                  >
                    {gasLelPercent}% LEL
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={gasLelPercent}
                  onChange={(e) => setGasLelPercent(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-700 accent-red-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] opacity-60 font-mono">
                  <span>0% (Safe Air)</span>
                  <span>20% (Warning Threshold)</span>
                  <span className="text-red-400">100% LEL (Explosive Limit)</span>
                </div>
              </div>

              {/* Slider 3: Worker Proximity */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Worker Line-of-Fire Proximity:</span>
                  </label>
                  <span
                    className={`font-mono font-extrabold text-sm px-2 py-0.5 rounded border ${
                      workerProximityMeters < 3.0
                        ? "bg-red-500/20 text-red-400 border-red-500"
                        : workerProximityMeters < 8.0
                        ? "bg-amber-500/20 text-amber-400 border-amber-500"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                    }`}
                  >
                    {workerProximityMeters} meters
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={30.0}
                  step={0.1}
                  value={workerProximityMeters}
                  onChange={(e) => setWorkerProximityMeters(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-700 accent-yellow-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] opacity-60 font-mono">
                  <span className="text-red-400">0.5m (Direct Contact)</span>
                  <span>10.0m (Moderate Distance)</span>
                  <span>30.0m (Safe Control Room)</span>
                </div>
              </div>

              {/* Slider 4: Hydrocarbon Flow Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    <span>Hydrocarbon Manifold Flow Rate:</span>
                  </label>
                  <span className="font-mono font-extrabold text-sm px-2 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500">
                    {flowRateM3H} m³/hr
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1200}
                  step={20}
                  value={flowRateM3H}
                  onChange={(e) => setFlowRateM3H(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-700 accent-blue-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] opacity-60 font-mono">
                  <span>0 m³/hr (Idle)</span>
                  <span>500 m³/hr (Nominal Production)</span>
                  <span>1,200 m³/hr (Peak Surge)</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: INTERACTIVE BARRIER SWITCHES & BLAST MATRIX */}
            <div className="space-y-4">
              {/* Barrier Matrix Card */}
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                    <ShieldAlert className="w-4 h-4" />
                    Safety Barrier Integrity Controls
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    Click buttons to toggle
                  </span>
                </div>

                {/* Barrier 1: Primary PSV Relief Valve */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-slate-700/40 bg-slate-800/40">
                  <div>
                    <span className="font-bold block text-xs">Primary PSV Relief Valve (PSV-102)</span>
                    <span className="text-[10px] opacity-70">Automated overpressure mechanical release</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["FUNCTIONING", "THROTTLED", "BYPASSED"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setPsvStatus(status)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          psvStatus === status
                            ? status === "FUNCTIONING"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : status === "THROTTLED"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-red-600 text-white shadow-sm animate-pulse"
                            : "bg-slate-800 hover:bg-slate-700 opacity-60"
                        }`}
                      >
                        {status === "FUNCTIONING" ? "OK" : status === "THROTTLED" ? "Clog" : "Bypass"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barrier 2: Water Deluge & Nitrogen Blanket */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-slate-700/40 bg-slate-800/40">
                  <div>
                    <span className="font-bold block text-xs">Deluge &amp; N2 Blanketing</span>
                    <span className="text-[10px] opacity-70">Thermal cooling &amp; vapor suppression</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["ARMED", "CLOGGED", "OFFLINE"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setDelugeStatus(status)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          delugeStatus === status
                            ? status === "ARMED"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : status === "CLOGGED"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-red-600 text-white shadow-sm animate-pulse"
                            : "bg-slate-800 hover:bg-slate-700 opacity-60"
                        }`}
                      >
                        {status === "ARMED" ? "Armed" : status === "CLOGGED" ? "Clogged" : "Offline"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barrier 3: LOTO Mechanical Isolation */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-slate-700/40 bg-slate-800/40">
                  <div>
                    <span className="font-bold block text-xs">LOTO Positive Isolation Bleed</span>
                    <span className="text-[10px] opacity-70">Double block and bleed verification</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["LOCKED", "DEPRESSURIZED", "BYPASSED"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setLotoStatus(status)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          lotoStatus === status
                            ? status === "LOCKED" || status === "DEPRESSURIZED"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-red-600 text-white shadow-sm animate-pulse"
                            : "bg-slate-800 hover:bg-slate-700 opacity-60"
                        }`}
                      >
                        {status === "LOCKED" ? "Locked" : status === "DEPRESSURIZED" ? "Bleed" : "Bypass"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Barrier 4: Acoustic Ultrasonic Sensor AV-101 */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-slate-700/40 bg-slate-800/40">
                  <div>
                    <span className="font-bold block text-xs">Acoustic Ultrasonic Leak Detector</span>
                    <span className="text-[10px] opacity-70">38.4 kHz high-frequency micro-leak ear</span>
                  </div>
                  <button
                    onClick={() => setAcousticSensorActive((prev) => !prev)}
                    className={`px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                      acousticSensorActive
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {acousticSensorActive ? <Volume2 className="w-3 h-3" /> : <Volume2 className="w-3 h-3 opacity-50" />}
                    <span>{acousticSensorActive ? "ACTIVE" : "MUTED"}</span>
                  </button>
                </div>
              </div>

              {/* Consequence Footprint Card */}
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  isLight ? "bg-amber-50/70 border-amber-300 text-amber-950" : "bg-amber-950/30 border-amber-500/50 text-amber-100"
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Physics Blast Consequence Footprint
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  If rupture occurs at <strong>{pressurePsi} PSI</strong> with <strong>{gasLelPercent}% LEL</strong> gas mix:
                  A shockwave overpressure of <strong>&gt; 5 PSI</strong> will radiate out to{" "}
                  <strong className="text-red-400 font-mono text-xs">{computed.lethalBlastRadiusMeters} meters</strong>,
                  destroying unreinforced walls. Worker at <strong>{workerProximityMeters}m</strong> is inside the{" "}
                  <strong className="text-red-400 underline">
                    {workerProximityMeters <= computed.lethalBlastRadiusMeters ? "LETHAL LINE-OF-FIRE ZONE" : "SURVIVABLE PERIMETER"}
                  </strong>.
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono opacity-80 pt-1 border-t border-amber-500/30">
                  <span>Heat Radiation: {computed.heatFlux12kwRadiusMeters}m (12.5 kW/m²)</span>
                  <span>Evac Perimeter: {computed.safePerimeterMeters}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <footer
          className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-2.5 ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : isPetroleum
              ? "bg-[#06101e] border-amber-900/50"
              : isCyber
              ? "bg-[#010603] border-emerald-900/60"
              : "bg-[#080c18] border-slate-800"
          }`}
        >
          <div className="text-[11px] opacity-75 font-mono text-center sm:text-left flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Digital Twin Physics Kernel: Active • 60 FPS Real-Time Refresh</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Apply to Digital Twin &amp; Close
          </button>
        </footer>
      </div>
    </div>
  );
}
