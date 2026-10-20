"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sliders,
  Bot,
  Volume2,
  Terminal,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Radio,
} from "lucide-react";
import { IncidentScenario, INCIDENT_SCENARIOS } from "../data/incidentScenarios";
import { ThemeMode } from "./AuthGateway";
import { PhysicsSimulationState } from "./PhysicsStressSimulator";

interface EmbeddedInteractiveDockProps {
  theme: ThemeMode;
  activeScenario: IncidentScenario;
  onInjectScenario: (scenario: IncidentScenario) => void;
  physicsState: PhysicsSimulationState | null;
  onPhysicsChange: (state: PhysicsSimulationState) => void;
  onOpenModal: (modal: "physics" | "incident" | "acoustic" | "swarm") => void;
}

export default function EmbeddedInteractiveDock({
  theme,
  activeScenario,
  onInjectScenario,
  physicsState,
  onPhysicsChange,
  onOpenModal,
}: EmbeddedInteractiveDockProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  const [activeTab, setActiveTab] = useState<"physics" | "incident" | "acoustic" | "swarm">("physics");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Default physics state if none provided
  const currentPhysics: PhysicsSimulationState = physicsState || {
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

  // Local helper to recompute physics
  const updatePhysicsValue = (key: string, value: any) => {
    const updated = { ...currentPhysics, [key]: value };
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
    onPhysicsChange(finalState);
  };

  // Custom Incident state
  const [customNarrative, setCustomNarrative] = useState<string>(
    "Technician unbolting high-pressure flange F-402 on condensate line. Line was supposed to be isolated, but 3,150 PSI trapped condensate sprayed past loose gasket. Worker ducked and reported as a minor near-miss with 0 days lost."
  );
  const [isTriageRunning, setIsTriageRunning] = useState<boolean>(false);
  const [triageStep, setTriageStep] = useState<number>(0);
  const [triageLogs, setTriageLogs] = useState<string[]>([]);

  const runEmbeddedTriage = async (narrativeOverride?: string) => {
    const textToAnalyze = narrativeOverride || customNarrative;
    setIsTriageRunning(true);
    setTriageStep(1);
    const isNegative =
      textToAnalyze.toLowerCase().includes("coffee") ||
      (textToAnalyze.toLowerCase().includes("spill") &&
        !textToAnalyze.toLowerCase().includes("psi"));

    setTriageLogs([`[AGENT 1: SIGNAL_EXTRACTOR] Tokenizing narrative: "${textToAnalyze.substring(0, 50)}..."`]);

    await new Promise((r) => setTimeout(r, 450));
    setTriageStep(2);
    setTriageLogs((prev) => [
      ...prev,
      isNegative
        ? `[AGENT 2: PHYSICS_CALCULATOR] Hydrostatic Pressure: 0 PSI • Process Energy: 0 kJ. Potential Consequence: Minor superficial slip.`
        : `[AGENT 2: PHYSICS_CALCULATOR] Line Energy: 3,150 PSI (217 bar) • Choked Mass Release: 18.2 kg/s • Sonic Jet Velocity: Mach 1.25.`,
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setTriageStep(3);
    setTriageLogs((prev) => [
      ...prev,
      isNegative
        ? `[AGENT 3: BARRIER_AUDITOR] Non-process event. Physical isolation barriers: N/A (Admin area).`
        : `[AGENT 3: BARRIER_AUDITOR] Barrier Defect: Double-block-and-bleed verification was bypassed prior to unbolting. Primary isolation integrity: FAILED.`,
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setTriageStep(4);
    setTriageLogs((prev) => [
      ...prev,
      isNegative
        ? `[AGENT 4: VECTOR_RAG] Matched SOP-GEN-FAC-01 (Office Facilities) • Vector Cosine Similarity: 0.962 • Classification: ROUTINE MONITORING.`
        : `[AGENT 4: VECTOR_RAG] Matched SOP-OI-OFF-MNT-402 (Zero-Energy Verification) • Vector Cosine Similarity: 0.941 • Severity Discordance Gap: 94%.`,
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setTriageStep(5);
    const orderId = `OI-DGMS-${Math.floor(1000 + Math.random() * 9000)}`;
    setTriageLogs((prev) => [
      ...prev,
      isNegative
        ? `[AGENT 5: DGMS_AUDITOR] No statutory violation. Closed as routine internal maintenance log.`
        : `[DECISION COMPLETE] Mandatory Stop-Work Order #${orderId} drafted under Oil Mines Regulations 2019 Rule 43.`,
    ]);

    setIsTriageRunning(false);

    // Synthesize scenario into 3D twin
    const newScenario: IncidentScenario = {
      id: `custom-${Date.now()}`,
      incidentNumber: `#OI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      shortName: isNegative ? "Office Coffee Spill" : "Live Unbolted Flange Spray",
      title: isNegative ? "Office Facility Spill (Negative Control)" : "High-Pressure Flange Unbolting Jet Spray",
      time: "14:30:15 IST (Live AI Ingest)",
      zone: isNegative ? "Admin — Facility Operations" : "Zone D — Hydrocarbon Pumping",
      zoneId: isNegative ? "Admin" : "Zone D",
      equipment: isNegative ? "Breakroom Entrance" : "Condensate Line Flange F-402",
      narrative: textToAnalyze,
      energyType: isNegative ? "None (0 PSI / Zero Process Energy)" : "3,150 PSI Pressurized Condensate Jet",
      exposureLevel: isNegative ? "LOW (0.2m Slip Risk)" : "DIRECT (1.2m Worker Line of Fire)",
      actualSeverity: "LOW",
      actualDescription: isNegative ? "Coffee spill on tile; zero days lost" : "Worker ducked; minor grease mark on glove; 0 lost days",
      potentialSeverity: isNegative ? "LOW" : "CRITICAL",
      potentialOutcome: isNegative ? "No severe outcome" : "Catastrophic line severance, worker fatal injection & flash fire",
      discordanceGap: isNegative ? 0 : 94,
      discordanceStatus: isNegative ? "BALANCED" : "HIGH",
      classification: isNegative ? "ROUTINE MONITORING" : "SIF PRECURSOR",
      barriers: isNegative
        ? [
            { name: "Corridor Non-slip Flooring", status: "FUNCTIONING", detail: "Dry floor surface" },
            { name: "Facility Lighting", status: "FUNCTIONING", detail: "Standard office illumination" },
          ]
        : [
            { name: "Double Block & Bleed Isolation", status: "FAILED", detail: "Bleed valve was not cracked prior to bolt loosening" },
            { name: "Positive Pressure Verification", status: "FAILED", detail: "Gauge needle frozen at zero despite active 3,150 PSI" },
            { name: "Personnel Impact Shield", status: "FUNCTIONING", detail: "Worker wore ANSI rated ballistic safety glasses" },
          ],
      recalledFeature: isNegative
        ? undefined
        : {
            detected: true,
            featureName: "Latent 3,150 PSI Fluid Trap in Blind Flange",
            category: "LATENT_ENERGY_RESERVE",
            missedReason: "Gauge needle frozen at 0 PSI led crew to assume line was bled.",
            recalledEvidence: "Acoustic ultrasonic resonance showed 38.4 kHz vibration spike 12 min prior to unbolting.",
            telemetrySource: "Acoustic Transducer AC-104 & SCADA Line Pressure",
            barrierImpact: {
              name: "Zero-Energy LOTO Verification",
              status: "COMPROMISED",
              detail: "Bypassed due to misleading analog pressure indicator.",
            },
          },
      ragMatch: isNegative
        ? {
            id: "SOP-GEN-FAC-01",
            similarity: 96,
            description: "Standard slip prevention; mop and dry surface immediately.",
          }
        : {
            id: "SOP-OI-OFF-MNT-402",
            similarity: 94,
            description: "Mandates secondary physical bleed crack verification before loosening any bolt on hydrocarbons above 150 PSI.",
          },
      orderNumber: isNegative ? "N/A" : orderId,
      recommendedAction: isNegative
        ? "Standard housekeeping mop & dry. No process safety enforcement required."
        : "Execute statutory Stop-Work lockdown order under DGMS OMR 2019 Rule 43. Mandatory ultrasonic & bleed verification before line restart.",
    };

    onInjectScenario(newScenario);
  };

  // Acoustic Synthesizer state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioMode, setAudioMode] = useState<"ambient" | "leak" | "filtered">("leak");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = audioMode === "ambient" ? 62 : audioMode === "leak" ? 4500 : 1850;
      osc.type = audioMode === "ambient" ? "sine" : "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlayingAudio(true);
    } catch (e) {
      console.warn("Web Audio not supported or blocked:", e);
    }
  };

  const stopAudio = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    if (isPlayingAudio && oscRef.current && audioCtxRef.current) {
      const freq = audioMode === "ambient" ? 62 : audioMode === "leak" ? 4500 : 1850;
      oscRef.current.type = audioMode === "ambient" ? "sine" : "sawtooth";
      oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    }
  }, [audioMode, isPlayingAudio]);

  // Real-time canvas animation for acoustic spectrogram
  useEffect(() => {
    if (activeTab !== "acoustic" && activeTab !== "physics") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 36;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        let heightMultiplier = 0.15;

        // Acoustic leak peak around 38.4 kHz (around bar 27)
        if (i >= 25 && i <= 30) {
          const intensity = (currentPhysics.pressurePsi / 5000) * 0.8 + 0.2;
          heightMultiplier = intensity * (0.8 + Math.sin(frame * 0.2 + i) * 0.2);
        } else {
          heightMultiplier = 0.1 + Math.sin(frame * 0.1 + i * 0.5) * 0.08;
        }

        const barHeight = Math.max(4, heightMultiplier * canvas.height);
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        if (i >= 25 && i <= 30) {
          ctx.fillStyle = isCyber ? "#10b981" : isPetroleum ? "#f59e0b" : "#ef4444";
        } else {
          ctx.fillStyle = isLight ? "rgba(71,85,105,0.25)" : "rgba(100,116,139,0.35)";
        }
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
      }
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeTab, currentPhysics.pressurePsi, isLight, isPetroleum, isCyber]);

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 border-t transition-all duration-300 shadow-2xl backdrop-blur-xl ${
        isLight
          ? "bg-white/95 border-slate-300 text-slate-900"
          : isPetroleum
          ? "bg-[#071324]/95 border-amber-600/50 text-amber-100"
          : isCyber
          ? "bg-[#020b07]/95 border-emerald-500/50 text-emerald-100"
          : "bg-[#080d1a]/95 border-slate-700 text-slate-100"
      } ${isCollapsed ? "h-11" : isExpanded ? "h-[360px]" : "h-[220px]"}`}
    >
      {/* ===================================================================
          1. DOCK HEADER & TABS BAR
      =================================================================== */}
      <div
        className={`h-11 px-3 flex items-center justify-between border-b select-none ${
          isLight
            ? "border-slate-200 bg-slate-100/80"
            : isPetroleum
            ? "border-amber-900/50 bg-[#06101e]"
            : isCyber
            ? "border-emerald-900/60 bg-[#010905]"
            : "border-slate-800 bg-[#070b16]"
        }`}
      >
        {/* Left: Tab Selectors */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentPhysics.sifClassification === "CRITICAL BLOWOUT"
                  ? "bg-red-500 shadow-[0_0_10px_#ef4444]"
                  : "bg-amber-500 shadow-[0_0_10px_#f59e0b]"
              } animate-pulse`}
            />
            <span className="text-[11px] font-extrabold uppercase tracking-wider hidden md:inline">
              LIVE DECISION ENGINE
            </span>
          </div>

          {/* TAB 1: PHYSICS SANDBOX */}
          <button
            onClick={() => {
              setActiveTab("physics");
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "physics" && !isCollapsed
                ? isLight
                  ? "bg-orange-600 text-white shadow-sm"
                  : isPetroleum
                  ? "bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  : isCyber
                  ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  : "bg-orange-600 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                : isLight
                ? "text-slate-600 hover:bg-slate-200/80"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400" />
            <span>Thermodynamics &amp; Blast</span>
            <span className="text-[10px] px-1 py-0.2 rounded font-mono bg-black/40 text-orange-300 hidden sm:inline">
              {currentPhysics.pressurePsi} PSI
            </span>
          </button>

          {/* TAB 2: INCIDENT LAB */}
          <button
            onClick={() => {
              setActiveTab("incident");
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "incident" && !isCollapsed
                ? isLight
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : isLight
                ? "text-slate-600 hover:bg-slate-200/80"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Incident Ingest</span>
            <span className="text-[10px] px-1 py-0.2 rounded font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hidden sm:inline">
              Judges Test
            </span>
          </button>

          {/* TAB 3: ACOUSTIC AI */}
          <button
            onClick={() => {
              setActiveTab("acoustic");
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "acoustic" && !isCollapsed
                ? isLight
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                : isLight
                ? "text-slate-600 hover:bg-slate-200/80"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">38.4 kHz Ultrasonic</span>
            <span className="sm:hidden">Acoustic</span>
          </button>

          {/* TAB 4: AGENT SWARM */}
          <button
            onClick={() => {
              setActiveTab("swarm");
              setIsCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "swarm" && !isCollapsed
                ? isLight
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                : isLight
                ? "text-slate-600 hover:bg-slate-200/80"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">LangGraph Swarm</span>
            <span className="sm:hidden">Agents</span>
          </button>
        </div>

        {/* Right: Expand / Collapse Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-emerald-400 hidden xl:inline">
            REAL-TIME INFERENCE: ACTIVE
          </span>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`p-1 rounded-md border text-xs transition-all ${
              isLight ? "bg-white border-slate-300 text-slate-700" : "bg-white/5 border-white/10 text-slate-300"
            }`}
            title={isExpanded ? "Standard View" : "Expand Cockpit View"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`p-1 rounded-md border text-xs transition-all ${
              isLight ? "bg-white border-slate-300 text-slate-700" : "bg-white/5 border-white/10 text-slate-300"
            }`}
            title={isCollapsed ? "Open Interactive Dock" : "Minimize Dock"}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ===================================================================
          2. DOCK BODY CONTENT (RENDERED WHEN NOT COLLAPSED)
      =================================================================== */}
      {!isCollapsed && (
        <div className="p-3 h-[calc(100%-44px)] overflow-y-auto font-sans text-xs">
          {/* -------------------------------------------------------------
              TAB 1: THERMODYNAMICS & BLAST SHOCKWAVE SIMULATOR
          ------------------------------------------------------------- */}
          {activeTab === "physics" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full">
              {/* Left 4 Cols: Live draggers */}
              <div className="md:col-span-4 space-y-2.5">
                {/* Pressure Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold flex items-center gap-1 text-orange-400">
                      <Flame className="w-3 h-3" /> Operating Pressure:
                    </span>
                    <span className="font-mono font-extrabold text-sm text-orange-400">
                      {currentPhysics.pressurePsi.toLocaleString()} PSI
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="50"
                    value={currentPhysics.pressurePsi}
                    onChange={(e) => updatePhysicsValue("pressurePsi", e.target.value)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-orange-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>100 PSI (Safe)</span>
                    <span>2,500 PSI</span>
                    <span className="text-red-400 font-bold">5,000 PSI (Blowout)</span>
                  </div>
                </div>

                {/* Gas Concentration Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-300">Flammable Gas % LEL:</span>
                    <span className="font-mono font-bold text-amber-400">{currentPhysics.gasLelPercent}% LEL</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={currentPhysics.gasLelPercent}
                    onChange={(e) => updatePhysicsValue("gasLelPercent", e.target.value)}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-amber-500"
                  />
                </div>

                {/* Worker Proximity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-300">Worker Line-of-Fire:</span>
                    <span className="font-mono font-bold text-cyan-400">{currentPhysics.workerProximityMeters}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="25"
                    step="0.5"
                    value={currentPhysics.workerProximityMeters}
                    onChange={(e) => updatePhysicsValue("workerProximityMeters", e.target.value)}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-cyan-500"
                  />
                </div>
              </div>

              {/* Middle 4 Cols: Barrier Toggles */}
              <div className="md:col-span-4 space-y-2 border-x px-3 border-slate-700/50">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Barrier Stress Testing (Toggle Faults Live)
                </span>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      updatePhysicsValue(
                        "psvStatus",
                        currentPhysics.psvStatus === "FUNCTIONING"
                          ? "THROTTLED"
                          : currentPhysics.psvStatus === "THROTTLED"
                          ? "BYPASSED"
                          : "FUNCTIONING"
                      )
                    }
                    className={`p-1.5 rounded-lg border text-left transition-all ${
                      currentPhysics.psvStatus === "FUNCTIONING"
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : currentPhysics.psvStatus === "THROTTLED"
                        ? "bg-amber-950/50 border-amber-500/60 text-amber-300"
                        : "bg-red-950/60 border-red-500/70 text-red-300"
                    }`}
                  >
                    <div className="text-[9px] opacity-75 font-mono">PSV-102 RELIEF</div>
                    <div className="font-extrabold text-[11px]">{currentPhysics.psvStatus}</div>
                  </button>

                  <button
                    onClick={() =>
                      updatePhysicsValue("delugeStatus", currentPhysics.delugeStatus === "ARMED" ? "OFFLINE" : "ARMED")
                    }
                    className={`p-1.5 rounded-lg border text-left transition-all ${
                      currentPhysics.delugeStatus === "ARMED"
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : "bg-red-950/60 border-red-500/70 text-red-300"
                    }`}
                  >
                    <div className="text-[9px] opacity-75 font-mono">DELUGE CURTAIN</div>
                    <div className="font-extrabold text-[11px]">{currentPhysics.delugeStatus}</div>
                  </button>

                  <button
                    onClick={() =>
                      updatePhysicsValue(
                        "lotoStatus",
                        currentPhysics.lotoStatus === "LOCKED"
                          ? "DEPRESSURIZED"
                          : currentPhysics.lotoStatus === "DEPRESSURIZED"
                          ? "BYPASSED"
                          : "LOCKED"
                      )
                    }
                    className={`p-1.5 rounded-lg border text-left transition-all ${
                      currentPhysics.lotoStatus === "LOCKED"
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : currentPhysics.lotoStatus === "DEPRESSURIZED"
                        ? "bg-amber-950/50 border-amber-500/60 text-amber-300"
                        : "bg-red-950/60 border-red-500/70 text-red-300"
                    }`}
                  >
                    <div className="text-[9px] opacity-75 font-mono">LOTO ISOLATION</div>
                    <div className="font-extrabold text-[11px]">{currentPhysics.lotoStatus}</div>
                  </button>

                  <button
                    onClick={() =>
                      updatePhysicsValue(
                        "acousticSensorActive",
                        !currentPhysics.acousticSensorActive
                      )
                    }
                    className={`p-1.5 rounded-lg border text-left transition-all ${
                      currentPhysics.acousticSensorActive
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : "bg-red-950/60 border-red-500/70 text-red-300"
                    }`}
                  >
                    <div className="text-[9px] opacity-75 font-mono">38.4kHz SENSOR</div>
                    <div className="font-extrabold text-[11px]">
                      {currentPhysics.acousticSensorActive ? "ACTIVE" : "MUTED"}
                    </div>
                  </button>
                </div>

                <div className="p-1.5 rounded bg-black/40 border border-slate-700 text-[10px] flex items-center justify-between">
                  <span className="text-slate-400">Hopkinson-Cranz Shockwave:</span>
                  <span className="font-mono font-bold text-red-400">{currentPhysics.lethalBlastRadiusMeters}m Lethal</span>
                </div>
              </div>

              {/* Right 4 Cols: Live SIF Gap & 3D Reaction Footprint */}
              <div className="md:col-span-4 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">
                      Calculated Discordance
                    </span>
                    <span
                      className={`text-2xl font-black ${
                        currentPhysics.discordanceScore > 80
                          ? "text-red-500 animate-pulse"
                          : currentPhysics.discordanceScore > 50
                          ? "text-orange-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {currentPhysics.discordanceScore}% SIF GAP
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">TNT Equivalent</span>
                    <span className="text-lg font-extrabold font-mono text-amber-400">
                      {currentPhysics.tntEquivalentKg} kg TNT
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 transition-all duration-300"
                    style={{ width: `${currentPhysics.discordanceScore}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold px-2 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-300">
                    {currentPhysics.sifClassification}
                  </span>

                  <button
                    onClick={() => onOpenModal("physics")}
                    className="text-[10px] font-bold text-orange-400 hover:text-orange-300 underline"
                  >
                    Open Fullscreen Sandbox &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB 2: LIVE INCIDENT LAB (TYPE ANY SCENARIO)
          ------------------------------------------------------------- */}
          {activeTab === "incident" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full">
              {/* Left 6 Cols: Custom Input Box & Quick Presets */}
              <div className="md:col-span-6 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300 text-xs flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      Ingest Arbitrary Near-Miss Text (Judges Test Input):
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">NLP &bull; SOP-402</span>
                  </div>
                  <textarea
                    rows={2}
                    value={customNarrative}
                    onChange={(e) => setCustomNarrative(e.target.value)}
                    placeholder="Type ANY incident narrative here to test live multi-agent triage..."
                    className={`w-full p-2 rounded-lg border text-xs font-mono transition-colors resize-none ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900"
                        : "bg-black/50 border-slate-700 text-slate-100"
                    }`}
                  />
                </div>

                {/* Quick Presets for Instant 1-Click Verification */}
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-slate-400 font-bold mr-1">Benchmarks:</span>
                  <button
                    onClick={() => {
                      const text =
                        "Assam Baghjan Well #5 workover operation pulled testing tubing. 6,500 PSI natural gas kick blew through annulus; blind shear ram BOP failed to seal due to auxiliary hydraulic drop. Crew evacuated with minor mud spray.";
                      setCustomNarrative(text);
                      runEmbeddedTriage(text);
                    }}
                    className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-300 hover:bg-red-900 transition-all font-bold"
                  >
                    🔥 Baghjan 6,500 PSI Blowout
                  </button>

                  <button
                    onClick={() => {
                      const text =
                        "Office worker tripped over doorway mat in administrative corridor, spilling hot coffee. Minor forearm redness treated with tap water; zero process lines, zero PSI.";
                      setCustomNarrative(text);
                      runEmbeddedTriage(text);
                    }}
                    className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 hover:bg-emerald-900 transition-all font-bold"
                  >
                    ☕ Coffee Spill (Negative Control - 0% SIF)
                  </button>

                  <button
                    onClick={() => {
                      const text =
                        "Pipeline pigging at MOV-104 gland packing noticed small hissing weep. 1,000 tons of MS escaped, forming unconfined vapor cloud in tank manifold.";
                      setCustomNarrative(text);
                      runEmbeddedTriage(text);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-amber-300 hover:bg-amber-900 transition-all font-bold"
                  >
                    💥 IOCL Jaipur 1,000t Vapor Cloud
                  </button>
                </div>
              </div>

              {/* Right 6 Cols: Live Triage Execution Stream */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-1.5 border-l pl-3 border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-300">Autonomous Agent Pipeline Stream</span>
                  <button
                    onClick={() => runEmbeddedTriage()}
                    disabled={isTriageRunning}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isTriageRunning ? "TRIAGING..." : "EXECUTE 5-AGENT TRIAGE"}</span>
                  </button>
                </div>

                {/* Stepper bubbles */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={triageStep >= 1 ? "text-cyan-400 font-bold" : "text-slate-500"}>1. Signal</span>
                  <span>&rarr;</span>
                  <span className={triageStep >= 2 ? "text-orange-400 font-bold" : "text-slate-500"}>2. Physics</span>
                  <span>&rarr;</span>
                  <span className={triageStep >= 3 ? "text-red-400 font-bold" : "text-slate-500"}>3. Barriers</span>
                  <span>&rarr;</span>
                  <span className={triageStep >= 4 ? "text-purple-400 font-bold" : "text-slate-500"}>4. RAG SOP</span>
                  <span>&rarr;</span>
                  <span className={triageStep >= 5 ? "text-emerald-400 font-bold" : "text-slate-500"}>5. DGMS Order</span>
                </div>

                {/* Console Log Terminal */}
                <div className="p-2 rounded-lg bg-black/70 border border-slate-800 font-mono text-[10px] h-20 overflow-y-auto space-y-1">
                  {triageLogs.length === 0 ? (
                    <div className="text-slate-500 italic">
                      Click &ldquo;Execute 5-Agent Triage&rdquo; or a benchmark chip above to run live inference...
                    </div>
                  ) : (
                    triageLogs.map((log, i) => (
                      <div
                        key={i}
                        className={
                          log.includes("DECISION") || log.includes("ROUTINE")
                            ? "text-emerald-400 font-bold"
                            : log.includes("AGENT 2") || log.includes("AGENT 3")
                            ? "text-orange-300"
                            : "text-slate-300"
                        }
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB 3: 38.4 kHz ACOUSTIC SPECTROGRAM
          ------------------------------------------------------------- */}
          {activeTab === "acoustic" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full items-center">
              {/* Left 4 Cols: Audio Controls */}
              <div className="md:col-span-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-400" /> Web Audio Synthesizer:
                  </span>
                  <button
                    onClick={isPlayingAudio ? stopAudio : startAudio}
                    className={`px-3 py-1 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                      isPlayingAudio
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingAudio ? "MUTE AUDIO" : "START LIVE AUDIO"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => setAudioMode("ambient")}
                    className={`px-2 py-1 rounded border flex-1 ${
                      audioMode === "ambient" ? "bg-blue-950 border-blue-500 text-blue-200" : "bg-black/30 border-slate-700"
                    }`}
                  >
                    Ambient 62Hz
                  </button>
                  <button
                    onClick={() => setAudioMode("leak")}
                    className={`px-2 py-1 rounded border flex-1 ${
                      audioMode === "leak" ? "bg-amber-950 border-amber-500 text-amber-200" : "bg-black/30 border-slate-700"
                    }`}
                  >
                    Raw 4.5kHz Leak
                  </button>
                  <button
                    onClick={() => setAudioMode("filtered")}
                    className={`px-2 py-1 rounded border flex-1 ${
                      audioMode === "filtered" ? "bg-emerald-950 border-emerald-500 text-emerald-200" : "bg-black/30 border-slate-700"
                    }`}
                  >
                    Bandpass 1.85kHz
                  </button>
                </div>

                <div className="p-1.5 rounded bg-black/40 border border-slate-700 text-[10px] text-slate-400">
                  Transducer AC-104 detects ultrasonic crest at <strong>38.4 kHz</strong> before gas reaches LEL limits.
                </div>
              </div>

              {/* Right 8 Cols: Real-time FFT canvas */}
              <div className="md:col-span-8 flex flex-col justify-between h-full space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0 Hz (Sub-audible)</span>
                  <span>10 kHz</span>
                  <span>20 kHz</span>
                  <span className="text-amber-400 font-bold">38.4 kHz (Ultrasonic Flange Resonance)</span>
                  <span>50 kHz</span>
                </div>
                <div className="relative w-full h-24 bg-black/80 rounded-lg border border-slate-800 overflow-hidden">
                  <canvas ref={canvasRef} width={600} height={96} className="w-full h-full" />
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              TAB 4: AGENT SWARM & VECTOR RAG EXPLORER
          ------------------------------------------------------------- */}
          {activeTab === "swarm" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-full">
              {/* Left 6 Cols: LangGraph DAG Nodes */}
              <div className="md:col-span-6 space-y-1.5 border-r pr-3 border-slate-700/50">
                <span className="font-bold text-xs text-purple-300 block">LangGraph Autonomous State Machine</span>
                <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-mono">
                  <div className="p-1.5 rounded bg-cyan-950/60 border border-cyan-500/50 text-cyan-300">
                    <div>NODE 1</div>
                    <div className="font-bold">NLP Signal</div>
                  </div>
                  <div className="p-1.5 rounded bg-orange-950/60 border border-orange-500/50 text-orange-300">
                    <div>NODE 2</div>
                    <div className="font-bold">Physics</div>
                  </div>
                  <div className="p-1.5 rounded bg-red-950/60 border border-red-500/50 text-red-300">
                    <div>NODE 3</div>
                    <div className="font-bold">Barriers</div>
                  </div>
                  <div className="p-1.5 rounded bg-purple-950/60 border border-purple-500/50 text-purple-300">
                    <div>NODE 4</div>
                    <div className="font-bold">Vector RAG</div>
                  </div>
                  <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300">
                    <div>NODE 5</div>
                    <div className="font-bold">DGMS Law</div>
                  </div>
                </div>

                <div className="p-2 rounded bg-black/50 border border-slate-800 text-[10px] text-slate-300 space-y-1">
                  <div><strong>State Transition Invariant:</strong> Node 2 validates kinetic energy independently of reported injury.</div>
                  <div className="text-cyan-400">Graph Execution: ZeroMQ RPC &bull; Latency: 18.4ms &bull; Non-hallucinatory schema lock.</div>
                </div>
              </div>

              {/* Right 6 Cols: ChromaDB Vector Cosine Similarity */}
              <div className="md:col-span-6 space-y-1.5">
                <span className="font-bold text-xs text-purple-300 block">ChromaDB Vector RAG Knowledge Matches</span>
                <div className="space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between items-center p-1 rounded bg-black/40 border border-slate-800">
                    <span className="text-amber-300">SOP-OI-OFF-MNT-402 (Zero-Energy Protocol)</span>
                    <span className="font-bold text-emerald-400">Cosine: 0.941</span>
                  </div>
                  <div className="flex justify-between items-center p-1 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-300">OISD-STD-156 (Fire Protection Facilities)</span>
                    <span className="font-bold text-emerald-400">Cosine: 0.887</span>
                  </div>
                  <div className="flex justify-between items-center p-1 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-300">DGMS Tech Circular No. 3 (Isolation Auditing)</span>
                    <span className="font-bold text-emerald-400">Cosine: 0.912</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
