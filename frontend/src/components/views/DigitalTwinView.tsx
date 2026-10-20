"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Activity,
  Maximize2,
  Minimize2,
  Sliders,
  Bot,
  Volume2,
  Layers,
  Radio,
  Camera,
  RotateCcw,
  Zap,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Info,
  X,
  Gauge,
  Sparkles,
  Settings,
  Calendar,
  Clock,
  Compass,
  FileCheck,
  ArrowUpRight,
  Cpu,
  Database,
  Terminal,
  Lock,
  BookOpen,
  TrendingUp,
  BarChart2,
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  Check,
  RefreshCw,
} from "lucide-react";
import { IncidentScenario, INCIDENT_SCENARIOS } from "../../data/incidentScenarios";
import { ThemeMode } from "../AuthGateway";
import { PhysicsSimulationState } from "../PhysicsStressSimulator";
import { downloadExcelReport, printPDFReport } from "../../utils/reportExport";

// Dynamically import Three.js canvas with SSR disabled
const DigitalTwinCanvas = dynamic(() => import("../DigitalTwinCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-[#080d17] text-slate-500 dark:text-slate-400">
      <Activity className="w-8 h-8 animate-spin text-amber-500 mb-2" />
      <span className="font-sans text-xs tracking-wider text-slate-700 dark:text-amber-200 font-medium uppercase">
        Initializing 3D Offshore Rig Digital Twin...
      </span>
    </div>
  ),
});

interface DigitalTwinViewProps {
  theme: ThemeMode;
  activeScenario: IncidentScenario;
  physicsState: PhysicsSimulationState | null;
  onNavigateView: (view: "digital_twin" | "incident_lab" | "physics_sandbox" | "acoustic_array" | "compliance_audit") => void;
  onUpdatePhysics: (state: PhysicsSimulationState) => void;
}

export type WorkflowStep = "input" | "simulation" | "output" | "audit";

interface StageProfile {
  stageNumber: number;
  timeLabel: string;
  stageName: string;
  engineTag: string;
  architecture: string;
  pressure: number;
  flow: number;
  lel: number;
  psv: "FUNCTIONING" | "THROTTLED" | "BYPASSED";
  deluge: "ARMED" | "OFFLINE";
  loto: "LOCKED" | "DEPRESSURIZED" | "BYPASSED";
  acousticActive: boolean;
  actualSeverity: string;
  potentialSIF: string;
  discordanceGap: number;
  decisionText: string;
  formulaLatex: string;
}

const SIMULATION_STAGES: StageProfile[] = [
  {
    stageNumber: 1,
    timeLabel: "T - 40m",
    stageName: "Ultrasonic Acoustic Sensing",
    engineTag: "MODEL 1: ACOUSTIC SPECTRAL DETECTOR",
    architecture: "STFT + Wavelet Kurtosis Transient Analyzer",
    pressure: 1250,
    flow: 320,
    lel: 8,
    psv: "FUNCTIONING",
    deluge: "ARMED",
    loto: "LOCKED",
    acousticActive: true,
    actualSeverity: "0.0% (Zero Harm)",
    potentialSIF: "25.0% (Nominal)",
    discordanceGap: 25,
    decisionText: "Acoustic 38.4 kHz micro-orifice hiss detected before human or thermal perception.",
    formulaLatex: "K(f) = <|S(t,f)|^4> / <|S(t,f)|^2>^2 - 2 = 3.84σ (Z > 3.0σ)",
  },
  {
    stageNumber: 2,
    timeLabel: "T - 20m",
    stageName: "Packing Gland Weep (SIF Paradox)",
    engineTag: "MODEL 2: NEURAL SIF DISCORDANCE ENGINE",
    architecture: "Dual-Head RoBERTa-Industrial + XGBoost Energy Risk",
    pressure: 2400,
    flow: 520,
    lel: 28,
    psv: "FUNCTIONING",
    deluge: "ARMED",
    loto: "BYPASSED",
    acousticActive: true,
    actualSeverity: "5.8% (Minor Drip / 0 Lost Days)",
    potentialSIF: "98.4% (FATAL LINE-OF-FIRE BLOWOUT)",
    discordanceGap: 93,
    decisionText: "SIF Paradox unmasked: Minor actual drip hides 98.4% potential blowout with tech at 1.8m.",
    formulaLatex: "Δ_SIF = |S_potential - S_actual| = |0.984 - 0.058| = 92.6%",
  },
  {
    stageNumber: 3,
    timeLabel: "T - 5m",
    stageName: "Barrier Breach & LEL Surge",
    engineTag: "MODEL 3: LANGGRAPH 5-AGENT BARRIER SWARM",
    architecture: "Multi-Agent P&ID & SCADA Cross-Audit DAG",
    pressure: 3150,
    flow: 750,
    lel: 78,
    psv: "THROTTLED",
    deluge: "OFFLINE",
    loto: "BYPASSED",
    acousticActive: true,
    actualSeverity: "12.0% (Near-Miss Escalation)",
    potentialSIF: "99.2% (IMMINENT RUPTURE)",
    discordanceGap: 97,
    decisionText: "2 of 3 barriers breached: DBB bypassed & pressure gauge seized at 0 PSI false zero.",
    formulaLatex: "P(Containment) = ∏(1 - p_fail,i) = 0.0033 (< 0.05 Critical)",
  },
  {
    stageNumber: 4,
    timeLabel: "T - 0m",
    stageName: "Supersonic Sonic Jet Rupture",
    engineTag: "MODEL 4: THERMODYNAMIC BLAST ENGINE",
    architecture: "Compressible Fluid Mechanics & Hopkinson-Cranz",
    pressure: 4200,
    flow: 980,
    lel: 95,
    psv: "BYPASSED",
    deluge: "OFFLINE",
    loto: "BYPASSED",
    acousticActive: false,
    actualSeverity: "98.0% (Catastrophic Loss)",
    potentialSIF: "100.0% (MASSIVE BLAST DETONATION)",
    discordanceGap: 100,
    decisionText: "Mach 1.25 choked sonic jet. 184 kg TNT equivalent overpressure (R_lethal = 28.5m).",
    formulaLatex: "W = ∫P dV = 2.48 MJ | Mach = 1.25 | R_lethal = 28.5m",
  },
  {
    stageNumber: 5,
    timeLabel: "T + 1m",
    stageName: "DGMS Statutory Lockdown",
    engineTag: "MODEL 5: AUTONOMOUS STATUTORY ENFORCER",
    architecture: "DGMS OMR 2019 Rule 43 & Automated Deluge",
    pressure: 650,
    flow: 0,
    lel: 15,
    psv: "BYPASSED",
    deluge: "ARMED",
    loto: "DEPRESSURIZED",
    acousticActive: true,
    actualSeverity: "0.0% (Zero Harm Enforced)",
    potentialSIF: "15.0% (Controlled Relief)",
    discordanceGap: 15,
    decisionText: "Statutory Stop-Work Order #DGMS-2026-0892 executed. Deluge active; pressure vented to flare.",
    formulaLatex: "DGMS Rule 43(1) ⟹ ESD Trip: 1.15s | Depressurize 4,200 ➔ 650 PSI",
  },
];

export default function DigitalTwinView({
  theme,
  activeScenario,
  physicsState,
  onNavigateView,
  onUpdatePhysics,
}: DigitalTwinViewProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";

  // Primary 4-Step Workflow State
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<WorkflowStep>("simulation");

  // Step 1: Input Parameters State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(activeScenario.id || "scen-1");
  const [inputPressure, setInputPressure] = useState<number>(3150);
  const [inputFlow, setInputFlow] = useState<number>(750);
  const [inputLel, setInputLel] = useState<number>(78);
  const [inputProximity, setInputProximity] = useState<number>(1.8);
  const [inputAcousticMode, setInputAcousticMode] = useState<boolean>(true);
  const [inputDbbStatus, setInputDbbStatus] = useState<"BYPASSED" | "LOCKED">("BYPASSED");
  const [inputGaugeStatus, setInputGaugeStatus] = useState<"SEIZED_ZERO" | "CALIBRATED">("SEIZED_ZERO");
  const [inputPsvStatus, setInputPsvStatus] = useState<"THROTTLED" | "FUNCTIONING">("THROTTLED");
  const [inputDelugeStatus, setInputDelugeStatus] = useState<"OFFLINE" | "ARMED">("OFFLINE");
  const [inputNarrative, setInputNarrative] = useState<string>(
    "Shift technician reported minor weeping drip at flange F-402 packing gland. Worker slipped on sheen with minor scrape (0 lost work days). Line remains energized at 3,150 PSI."
  );

  // Step 2: 3D Simulation Timeline State (100% SILENT)
  const [stageIndex, setStageIndex] = useState<number>(1);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3.5);

  // Live System Clock
  const [timeString, setTimeString] = useState<string>("22:32:50");
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setTimeString(d.toTimeString().split(" ")[0] || "22:32:50");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync physics when simulation stage changes
  const applyStage = (idx: number) => {
    setStageIndex(idx);
    const evt = SIMULATION_STAGES[idx];
    const tnt = Math.round((evt.pressure * evt.flow * (evt.lel / 100)) / 12500);
    const blast = Math.round(Math.pow(tnt + 1, 0.33) * 4.8 * 10) / 10;
    const gap = evt.discordanceGap;

    onUpdatePhysics({
      pressurePsi: evt.pressure,
      gasLelPercent: evt.lel,
      workerProximityMeters: inputProximity,
      flowRateM3H: evt.flow,
      psvStatus: evt.psv,
      delugeStatus: evt.deluge,
      lotoStatus: evt.loto,
      acousticSensorActive: evt.acousticActive,
      discordanceScore: gap,
      sifClassification: gap > 80 ? "CRITICAL BLOWOUT" : gap > 50 ? "SIF PRECURSOR" : "ROUTINE",
      tntEquivalentKg: tnt,
      lethalBlastRadiusMeters: blast,
      heatFlux12kwRadiusMeters: blast * 1.5,
      safePerimeterMeters: blast * 2.5,
      isRuptureImminent: evt.pressure > 4000,
    });
  };

  // Initialize stage
  useEffect(() => {
    applyStage(1);
  }, []);

  // Automatic Step Progression Loop (100% SILENT - ZERO AUDIO CALLS)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let countdownTimer: NodeJS.Timeout;

    const baseDuration = 3.5 / playbackSpeed;

    if (isPlayingTimeline && activeWorkflowStep === "simulation") {
      setCountdownSeconds(Number(baseDuration.toFixed(1)));

      countdownTimer = setInterval(() => {
        setCountdownSeconds((prev) => (prev <= 0.2 ? Number(baseDuration.toFixed(1)) : Number((prev - 0.1).toFixed(1))));
      }, 100);

      timer = setInterval(() => {
        setStageIndex((prev) => {
          const next = (prev + 1) % SIMULATION_STAGES.length;
          applyStage(next);
          return next;
        });
      }, Math.round(baseDuration * 1000));
    }

    return () => {
      clearInterval(timer);
      clearInterval(countdownTimer);
    };
  }, [isPlayingTimeline, playbackSpeed, activeWorkflowStep]);

  // Handle Scenario Preset Selection
  const handleSelectPreset = (scen: IncidentScenario) => {
    setSelectedScenarioId(scen.id);
    setInputPressure(scen.discordanceGap > 80 ? 3150 : scen.discordanceGap > 50 ? 2400 : 1250);
    setInputLel(scen.discordanceGap > 80 ? 78 : 28);
    setInputNarrative(scen.narrative);
    setInputDbbStatus(scen.barriers.some((b) => b.name.includes("Depressurization") && b.status === "FAILED") ? "BYPASSED" : "LOCKED");
  };

  // Run Simulation Handler from Step 1
  const handleRunSimulation = () => {
    applyStage(1);
    setIsPlayingTimeline(true);
    setActiveWorkflowStep("simulation");
  };

  const currentStage = SIMULATION_STAGES[stageIndex] || SIMULATION_STAGES[0];
  const currentPressure = physicsState ? physicsState.pressurePsi : currentStage.pressure;

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none font-sans flex flex-col transition-colors duration-300 ${
        isLight ? "bg-[#f8fafc] text-slate-800" : "bg-[#080d17] text-slate-100"
      }`}
    >
      {/* ===================================================================
          MASTER TOP WORKFLOW NAVIGATION HEADER (THE 4 PILLARS)
      =================================================================== */}
      <header
        className={`h-14 px-4 border-b flex items-center justify-between z-30 shrink-0 backdrop-blur-xl transition-colors ${
          isLight ? "bg-white/95 border-slate-200 shadow-sm" : "bg-[#091222]/95 border-white/10 shadow-lg"
        }`}
      >
        {/* Left: Brand & Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                OIL INDIA LIMITED
              </span>
              <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                SENTINEL<span className="text-amber-500">SIF</span> PROCESS SAFETY
              </span>
            </div>
          </div>
          <span className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block" />
          <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold hidden md:inline">
            SCADA ACTIVE &bull; {currentPressure} PSI
          </span>
        </div>

        {/* Center: The 4 Primary Workflow Pillars */}
        <nav
          className={`flex items-center gap-1 p-1 rounded-xl border ${
            isLight ? "bg-slate-100 border-slate-300" : "bg-black/40 border-white/10"
          }`}
        >
          {/* 1. Input */}
          <button
            onClick={() => setActiveWorkflowStep("input")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeWorkflowStep === "input"
                ? "bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400"
                : isLight
                ? "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. Input Parameters</span>
          </button>

          {/* 2. 3D Twin Simulation */}
          <button
            onClick={() => setActiveWorkflowStep("simulation")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeWorkflowStep === "simulation"
                ? "bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400"
                : isLight
                ? "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2. 3D Model Simulation</span>
          </button>

          {/* 3. Output */}
          <button
            onClick={() => setActiveWorkflowStep("output")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeWorkflowStep === "output"
                ? "bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400"
                : isLight
                ? "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. AI Output &amp; SIF Gap</span>
          </button>

          {/* 4. Data Audit */}
          <button
            onClick={() => setActiveWorkflowStep("audit")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeWorkflowStep === "audit"
                ? "bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400"
                : isLight
                ? "text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>4. Data &amp; Audit Check</span>
          </button>
        </nav>

        {/* Right: Clock & Quick Scenario Name */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>{timeString} UTC</span>
          </div>
        </div>
      </header>

      {/* ===================================================================
          BODY CONTENT: SWITCHES BASED ON ACTIVE WORKFLOW STEP
      =================================================================== */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {/* =================================================================
            PILLAR 1: HOW INPUT IS TAKEN (HAZARD & TELEMETRY INGESTION)
        ================================================================= */}
        {activeWorkflowStep === "input" && (
          <div className="w-full h-full overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <span>Step 1: Hazard Telemetry &amp; Narrative Ingestion Station</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Configure real-time SCADA telemetry, verify physical safety barrier states, or select an industrial benchmark scenario.
              </p>
            </div>

            {/* A. Historical Benchmark Scenarios */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                Select Benchmark Incident Preset:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INCIDENT_SCENARIOS.slice(0, 3).map((scen) => (
                  <button
                    key={scen.id}
                    onClick={() => handleSelectPreset(scen)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedScenarioId === scen.id
                        ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-400/30"
                        : isLight
                        ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
                        : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                      <span>{scen.incidentNumber}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{scen.zoneId}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {scen.shortName}
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {scen.narrative}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* B. Live Telemetry Sliders & Barriers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Numeric Telemetry Sliders */}
              <div
                className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                  isLight ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
                }`}
              >
                <h3 className="text-xs font-black uppercase font-mono tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  <span>Real-Time Process Energy Parameters:</span>
                </h3>

                {/* Pressure Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Operating Line Pressure (PSI):</span>
                    <span className="text-amber-600 dark:text-amber-400 text-sm font-black">{inputPressure} PSI</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="50"
                    value={inputPressure}
                    onChange={(e) => setInputPressure(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>500 PSI (Low)</span>
                    <span>3,150 PSI (Supercritical)</span>
                    <span>5,000 PSI (Burst Limit)</span>
                  </div>
                </div>

                {/* Gas LEL% Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Flammable Vapor Concentration (% LEL):</span>
                    <span className="text-red-600 dark:text-red-400 text-sm font-black">{inputLel}% LEL</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={inputLel}
                    onChange={(e) => setInputLel(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>0% (Safe)</span>
                    <span>50% (Alarm Limit)</span>
                    <span>100% (Explosion Lower Limit)</span>
                  </div>
                </div>

                {/* Worker Proximity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span>Technician Line-of-Fire Proximity:</span>
                    <span className="text-orange-600 dark:text-orange-400 text-sm font-black">{inputProximity} meters</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15"
                    step="0.1"
                    value={inputProximity}
                    onChange={(e) => setInputProximity(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>0.5m (Direct Contact)</span>
                    <span>1.8m (Maintenance Radius)</span>
                    <span>15m (Perimeter)</span>
                  </div>
                </div>

                {/* Acoustic Mode Toggle */}
                <div className="flex items-center justify-between pt-2 border-t text-xs font-mono">
                  <span>Acoustic Transducer AC-104:</span>
                  <button
                    onClick={() => setInputAcousticMode(!inputAcousticMode)}
                    className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                      inputAcousticMode
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm"
                        : "bg-slate-200 dark:bg-white/10 text-slate-500 border-transparent"
                    }`}
                  >
                    {inputAcousticMode ? "38.4 kHz Ultrasonic Peak (ACTIVE)" : "Audible Background (<20 kHz)"}
                  </button>
                </div>
              </div>

              {/* Right Column: Physical Barrier Integrity & Narrative */}
              <div
                className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                  isLight ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
                }`}
              >
                <h3 className="text-xs font-black uppercase font-mono tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Physical Safety Barrier Verification:</span>
                </h3>

                <div className="space-y-2 text-xs font-mono">
                  {/* DBB Isolation */}
                  <div className="flex items-center justify-between p-2 rounded-xl border">
                    <div>
                      <strong className="block">Double-Block-and-Bleed (DBB):</strong>
                      <span className="text-[10px] text-slate-500">Positive mechanical isolation verification</span>
                    </div>
                    <button
                      onClick={() => setInputDbbStatus(inputDbbStatus === "BYPASSED" ? "LOCKED" : "BYPASSED")}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        inputDbbStatus === "BYPASSED" ? "bg-red-100 text-red-700 border border-red-300" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {inputDbbStatus}
                    </button>
                  </div>

                  {/* Pressure Gauge Diaphragm */}
                  <div className="flex items-center justify-between p-2 rounded-xl border">
                    <div>
                      <strong className="block">Gauge PG-402 Diaphragm:</strong>
                      <span className="text-[10px] text-slate-500">Stuck needle false zero check</span>
                    </div>
                    <button
                      onClick={() => setInputGaugeStatus(inputGaugeStatus === "SEIZED_ZERO" ? "CALIBRATED" : "SEIZED_ZERO")}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        inputGaugeStatus === "SEIZED_ZERO" ? "bg-red-100 text-red-700 border border-red-300" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {inputGaugeStatus}
                    </button>
                  </div>

                  {/* PSV Relief Valve */}
                  <div className="flex items-center justify-between p-2 rounded-xl border">
                    <div>
                      <strong className="block">PSV-102 Safety Relief Valve:</strong>
                      <span className="text-[10px] text-slate-500">Overpressure discharge capacity</span>
                    </div>
                    <button
                      onClick={() => setInputPsvStatus(inputPsvStatus === "THROTTLED" ? "FUNCTIONING" : "THROTTLED")}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                        inputPsvStatus === "THROTTLED" ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {inputPsvStatus}
                    </button>
                  </div>
                </div>

                {/* Shift Handover Narrative Textarea */}
                <div className="space-y-1 pt-2 border-t">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Shift Handover Log / Operator Field Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={inputNarrative}
                    onChange={(e) => setInputNarrative(e.target.value)}
                    className={`w-full p-2.5 text-xs rounded-xl border font-sans focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isLight ? "bg-slate-50 border-slate-300 text-slate-900" : "bg-black/40 border-white/10 text-white"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Run Action CTA */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunSimulation}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-sm shadow-xl hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center gap-2 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Ingest Input &amp; Run 3D SIF Simulation ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            PILLAR 2: HOW THE WORK IS SHOWN ON 3D MODEL (CLEAN DIGITAL TWIN)
        ================================================================= */}
        {activeWorkflowStep === "simulation" && (
          <div className="w-full h-full relative">
            {/* 100% CLEAN 3D CANVAS IN BACKGROUND */}
            <div className="absolute inset-0 w-full h-full z-0">
              <DigitalTwinCanvas
                mode="sif_precursor"
                currentStep={stageIndex + 1}
                officerDecision={null}
                hideOverlays={false}
                theme={theme}
                zoneFocus="Zone D"
                isExpanded={true}
                onToggleExpand={() => {}}
                onSelectZone={() => {}}
                onOpenProcedure={() => setActiveWorkflowStep("output")}
                physicsState={physicsState || undefined}
                showBlastFootprint={currentPressure > 1200}
                isPlaying={isPlayingTimeline}
                onTogglePlay={() => setIsPlayingTimeline(!isPlayingTimeline)}
                onStepChange={(step: number) => applyStage(step - 1)}
              />
            </div>

            {/* Compact Floating Stage Info Pill (Top Center - Minimal & Non-Intrusive) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div
                className={`pointer-events-auto px-5 py-2 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center gap-3 transition-colors ${
                  isLight ? "bg-white/95 border-amber-400 text-slate-900" : "bg-[#091222]/90 border-amber-500/40 text-white"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                  {currentStage.timeLabel} &bull; {currentStage.stageName}
                </span>
                <span className="h-3 w-px bg-slate-300 dark:bg-white/20" />
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                  {currentStage.engineTag}
                </span>
              </div>
            </div>

            {/* Bottom Timeline Transport Bar (Clean, Floating Scrubber) */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2">
              <div
                className={`pointer-events-auto px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 text-xs transition-colors ${
                  isLight ? "bg-white/95 border-slate-300 text-slate-800" : "bg-[#091222]/95 border-amber-500/40 text-slate-200"
                }`}
              >
                {/* Play/Pause */}
                <button
                  onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                  className="p-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-md"
                  title={isPlayingTimeline ? "Pause Simulation" : "Play Simulation"}
                >
                  {isPlayingTimeline ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                </button>

                {/* Speed Multiplier */}
                <div className="flex items-center rounded-lg border overflow-hidden text-[10px] font-mono">
                  {[0.5, 1.0, 2.0].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-1 font-bold transition-colors ${
                        playbackSpeed === spd
                          ? "bg-amber-500 text-white"
                          : isLight
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                {/* The 5 Chronological Stages */}
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  {SIMULATION_STAGES.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyStage(idx)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        stageIndex === idx
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md ring-1 ring-white/30"
                          : isLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-white/[0.04] hover:bg-white/10 text-slate-300"
                      }`}
                    >
                      {step.timeLabel}
                    </button>
                  ))}
                </div>

                {/* Countdown */}
                <div className={`text-[10px] font-mono flex items-center gap-1 pl-2 border-l ${isLight ? "text-amber-800 border-slate-300" : "text-amber-300 border-white/10"}`}>
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>{countdownSeconds}s</span>
                </div>
              </div>

              {/* Advance CTA to Step 3 */}
              <button
                onClick={() => setActiveWorkflowStep("output")}
                className="pointer-events-auto px-5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-white dark:bg-white/10 dark:hover:bg-white/20 font-bold text-xs shadow-lg backdrop-blur-md border border-white/10 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>View AI Decision &amp; SIF Analysis ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            PILLAR 3: HOW OUTPUT IS SHOWN (AI DECISION & SIF GAP)
        ================================================================= */}
        {activeWorkflowStep === "output" && (
          <div className="w-full h-full overflow-y-auto p-6 max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Step 3: AI Safety Decision &amp; SIF Discordance Output</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                SentinelSIF evaluates multi-model inferences, unmasks disguised SIF precursors, and computes exact thermodynamic blast consequences.
              </p>
            </div>

            {/* Grand SIF Decision Card */}
            <div
              className={`p-6 rounded-3xl border-2 shadow-xl space-y-4 ${
                currentStage.discordanceGap > 80
                  ? isLight
                    ? "bg-red-50/90 border-red-400 text-slate-900"
                    : "bg-red-950/20 border-red-500/60 text-slate-100"
                  : isLight
                  ? "bg-amber-50/90 border-amber-400 text-slate-900"
                  : "bg-amber-950/20 border-amber-500/60 text-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
                  <span className="text-sm font-black uppercase font-mono tracking-wider text-red-600 dark:text-red-400">
                    AI SYSTEM VERDICT: CRITICAL SIF PRECURSOR DETECTED
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-red-600 text-white">
                  DISCORDANCE GAP: {currentStage.discordanceGap}%
                </span>
              </div>

              {/* The SIF Paradox Comparison Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className={`p-4 rounded-2xl border ${isLight ? "bg-white" : "bg-black/30"} space-y-1`}>
                  <span className="text-[10px] font-mono font-black uppercase text-emerald-600 block">
                    HEAD 1: ACTUAL SEVERITY
                  </span>
                  <div className="text-lg font-black text-emerald-700">{currentStage.actualSeverity}</div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Evaluates physical harm sustained. Shift report noted minor wipe &amp; 0 lost time days.
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${isLight ? "bg-white" : "bg-black/30"} space-y-1`}>
                  <span className="text-[10px] font-mono font-black uppercase text-red-600 block">
                    HEAD 2: POTENTIAL SIF
                  </span>
                  <div className="text-lg font-black text-red-600">{currentStage.potentialSIF}</div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Evaluates process energy capacity (3,150 PSI) and technician in direct line of fire (1.8m).
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${isLight ? "bg-white" : "bg-black/30"} space-y-1`}>
                  <span className="text-[10px] font-mono font-black uppercase text-amber-600 block">
                    SIF PARADOX SOLVED
                  </span>
                  <div className="text-sm font-bold text-amber-800 dark:text-amber-300">Precursor Unmasked</div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Traditional Heinrich pyramid categorizes this as minor. SentinelSIF auto-escalates to Level-1 alert.
                  </p>
                </div>
              </div>
            </div>

            {/* Blast Physics & Barrier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blast Mechanics */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isLight ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
                }`}
              >
                <h3 className="text-xs font-black uppercase font-mono tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Thermodynamic Blast Mechanics:</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl border bg-slate-50 dark:bg-black/20">
                    <span className="text-[10px] text-slate-500 block">Mechanical Work:</span>
                    <strong className="text-sm text-slate-900 dark:text-white">2.48 MegaJoules</strong>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-slate-50 dark:bg-black/20">
                    <span className="text-[10px] text-slate-500 block">Sonic Jet Velocity:</span>
                    <strong className="text-sm text-slate-900 dark:text-white">Mach 1.25 (Choked)</strong>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-slate-50 dark:bg-black/20">
                    <span className="text-[10px] text-slate-500 block">TNT Equivalent:</span>
                    <strong className="text-sm text-red-600">184 kg TNT Eq</strong>
                  </div>
                  <div className="p-2.5 rounded-xl border bg-slate-50 dark:bg-black/20">
                    <span className="text-[10px] text-slate-500 block">Lethal Blast Radius:</span>
                    <strong className="text-sm text-red-600">28.5 meters</strong>
                  </div>
                </div>
              </div>

              {/* Multi-Agent Barrier Verdict */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isLight ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
                }`}
              >
                <h3 className="text-xs font-black uppercase font-mono tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <span>LangGraph Multi-Agent Swarm Audit:</span>
                </h3>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-xl border bg-slate-50 dark:bg-black/20">
                    <span>P&amp;ID Isolation Check:</span>
                    <span className="font-bold text-red-600">DBB Bypassed (Breach)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl border bg-slate-50 dark:bg-black/20">
                    <span>SCADA Sensor Cross-Audit:</span>
                    <span className="font-bold text-red-600">PG-402 Seized at 0 PSI False Zero</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl border bg-slate-50 dark:bg-black/20">
                    <span>Barrier Survival Probability:</span>
                    <span className="font-bold text-amber-600 font-mono">P(Containment) = 0.33%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance CTA to Step 4 */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveWorkflowStep("audit")}
                className="px-6 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black text-xs shadow-xl flex items-center gap-2 active:scale-95 transition-all"
              >
                <Database className="w-4 h-4" />
                <span>Check Data &amp; Regulatory Audit Trail ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            PILLAR 4: HOW I CHECK THE DATA (SCADA TELEMETRY & AUDIT LEDGER)
        ================================================================= */}
        {activeWorkflowStep === "audit" && (
          <div className="w-full h-full overflow-y-auto p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-500" />
                  <span>Step 4: Data &amp; Audit Inspection Console</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Examine full time-series SCADA sensor telemetry, multi-agent reasoning logs, and export certified regulatory dossiers.
                </p>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadExcelReport(activeScenario, "DGMS Level-1 Stop Work Enforcement", { name: "Concerned Safety Official", clearance_level: "DGMS Level-4 Certified" })}
                  className="px-3.5 py-2 rounded-xl font-bold font-mono text-xs border flex items-center gap-1.5 shadow-sm bg-white dark:bg-white/10 hover:bg-slate-50 text-slate-800 dark:text-white active:scale-95 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={() => printPDFReport(activeScenario, "DGMS Level-1 Stop Work Enforcement", { name: "Concerned Safety Official", clearance_level: "DGMS Level-4 Certified" })}
                  className="px-3.5 py-2 rounded-xl font-bold font-mono text-xs border flex items-center gap-1.5 shadow-sm bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF Dossier</span>
                </button>
              </div>
            </div>

            {/* SCADA Telemetry Stream Table */}
            <div
              className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
                isLight ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
              }`}
            >
              <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                SCADA Sensor Real-Time Telemetry Stream:
              </h3>

              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left">
                  <thead className={`border-b text-[10px] ${isLight ? "text-slate-500 border-slate-200" : "text-slate-400 border-white/10"}`}>
                    <tr>
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Sensor Tag</th>
                      <th className="pb-2">Asset Location</th>
                      <th className="pb-2">Process Value</th>
                      <th className="pb-2">Normal Range</th>
                      <th className="pb-2 text-right">Alarm State</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? "divide-slate-200 text-slate-800" : "divide-white/5 text-slate-200"}`}>
                    <tr>
                      <td className="py-2.5 text-slate-500">22:32:48 UTC</td>
                      <td className="py-2.5 font-bold text-cyan-600">PT-101</td>
                      <td className="py-2.5">Zone D Wellhead Discharge</td>
                      <td className="py-2.5 font-bold text-red-600">{currentPressure} PSI</td>
                      <td className="py-2.5 text-slate-500">1,000 - 2,500 PSI</td>
                      <td className="py-2.5 text-right font-bold text-red-600">CRITICAL SURGE</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-500">22:32:48 UTC</td>
                      <td className="py-2.5 font-bold text-orange-600">PG-402</td>
                      <td className="py-2.5">Discharge Gauge Diaphragm</td>
                      <td className="py-2.5 font-bold text-red-600">0 PSI (STUCK)</td>
                      <td className="py-2.5 text-slate-500">1,000 - 2,500 PSI</td>
                      <td className="py-2.5 text-right font-bold text-red-600">SEIZED NEEDLE</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-500">22:32:49 UTC</td>
                      <td className="py-2.5 font-bold text-cyan-600">AC-104</td>
                      <td className="py-2.5">Piezoelectric Flange Sensor</td>
                      <td className="py-2.5 font-bold text-cyan-700">38.4 kHz (84 dB)</td>
                      <td className="py-2.5 text-slate-500">&lt; 20 kHz Background</td>
                      <td className="py-2.5 text-right font-bold text-amber-600">ORIFICE HISS</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-500">22:32:50 UTC</td>
                      <td className="py-2.5 font-bold text-purple-600">LE-204</td>
                      <td className="py-2.5">Wellhead Vapor Boundary</td>
                      <td className="py-2.5 font-bold text-red-600">{currentStage.lel}% LEL</td>
                      <td className="py-2.5 text-slate-500">0 - 20% LEL</td>
                      <td className="py-2.5 text-right font-bold text-red-600">VAPOR SPIKE</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-500">22:32:50 UTC</td>
                      <td className="py-2.5 font-bold text-emerald-600">ESD-V-101</td>
                      <td className="py-2.5">Subsea Wellhead Choke</td>
                      <td className="py-2.5 font-bold text-emerald-700">TRIP ACTIVATED</td>
                      <td className="py-2.5 text-slate-500">Normal Open</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">ISOLATION CLOSED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* DGMS Statutory Compliance Order Form IV-A */}
            <div
              className={`p-5 rounded-2xl border space-y-3 shadow-sm ${
                isLight ? "bg-white border-slate-200" : "bg-white/[0.02] border-white/10"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-black uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                  DGMS Statutory Order Form IV-A (Certified Legal Ledger)
                </span>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  SHA-256 HASH VERIFIED
                </span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                <p>
                  <strong>Statutory Authority:</strong> Directorate General of Mines Safety (DGMS), Oil Mines Regulations 2019, Rule 43(1) - Mandatory Cessation of High-Pressure Operations.
                </p>
                <p>
                  <strong>Finding:</strong> Flange F-402 experienced localized gasket decompression under 3,150 PSI line energy with DBB isolation bypassed. SIF Discordance Gap calculated at 92.6%, constituting an unmasked fatal precursor.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/30 border font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  Digital Signature: Concerned Safety Official, Statutory Safety Controller &bull; Certificate ID: OIL-CSO-8042-DGMS &bull; Ledger Block: #892014
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
