"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Flame,
  Zap,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Database,
  FileCheck,
  XCircle,
  HelpCircle,
  Cpu,
  Lock,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  Sun,
  Moon,
  Download,
  Printer,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Check,
  Palette,
  Camera,
  Eye,
  Radio,
  Crosshair,
  Volume2,
  Sliders,
  Bot,
  Terminal,
} from "lucide-react";

import { INCIDENT_SCENARIOS, IncidentScenario } from "../data/incidentScenarios";
import { downloadExcelReport, printPDFReport } from "../utils/reportExport";
import AuthGateway, { OfficerProfile } from "./AuthGateway";
import HazardReportingHub from "./HazardReportingHub";
import JudgesDefenseModal from "./JudgesDefenseModal";
import PhysicsStressSimulator, { PhysicsSimulationState } from "./PhysicsStressSimulator";
import LiveIncidentLabModal from "./LiveIncidentLabModal";
import AcousticSpectrogramModal from "./AcousticSpectrogramModal";
import AgentSwarmTerminal from "./AgentSwarmTerminal";
import EmbeddedInteractiveDock from "./EmbeddedInteractiveDock";

// Dynamically import Three.js 3D canvas with SSR disabled
const DigitalTwinCanvas = dynamic(() => import("./DigitalTwinCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#070a0e] text-slate-400">
      <Activity className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
      <span className="font-sans text-xs tracking-wider text-slate-400 font-medium uppercase">
        Initializing 3D Refinery Digital Twin...
      </span>
    </div>
  ),
});

export type ThemeMode = "dark" | "light" | "petroleum" | "cyber";

interface DemoStepInfo {
  step: number;
  tag: string;
  title: string;
  subtitle: string;
  mode: "normal" | "sif_precursor" | "critical" | "pattern";
  activeZone: string;
}

export default function CommandCenter() {
  // 4 Distinct High-Contrast Themes:
  // - dark: Midnight Obsidian (Deep dark, electric cyan & amber accents, bright white text)
  // - light: Executive Light (Crisp white/porcelain, high-contrast dark slate text)
  // - petroleum: Oil & Gas Gold (Refinery maritime navy & safety amber/gold)
  // - cyber: Cyber Tactical (OLED pure black & high-voltage neon green)
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";
  const isDark = theme === "dark";

  // Cycle through all 4 themes sequentially
  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "petroleum";
      if (prev === "petroleum") return "cyber";
      return "dark";
    });
  };

  // Positional Authentication State (Oil India Limited HSE Security Protocol)
  const [authenticatedOfficer, setAuthenticatedOfficer] = useState<OfficerProfile | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // AI Deep Feature Recall & Latent Hazard State
  const [isRecallScanning, setIsRecallScanning] = useState<boolean>(false);
  const [isRecallCompleted, setIsRecallCompleted] = useState<boolean>(false);

  const handleTriggerDeepRecall = () => {
    setIsRecallScanning(true);
    setTimeout(() => {
      setIsRecallScanning(false);
      setIsRecallCompleted(true);
    }, 1100);
  };

  // Restore authenticated session from localStorage if present
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sentinelsif_officer_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.position_code === "CHIEF_SAFETY_OFFICER") {
          setAuthenticatedOfficer(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to restore officer session:", e);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const handleAuthenticate = (officer: OfficerProfile) => {
    setAuthenticatedOfficer(officer);
    try {
      localStorage.setItem("sentinelsif_officer_session", JSON.stringify(officer));
    } catch (e) {
      console.warn("Failed to persist officer session:", e);
    }
  };

  const handleLogout = () => {
    setAuthenticatedOfficer(null);
    try {
      localStorage.removeItem("sentinelsif_officer_session");
    } catch (e) {
      console.warn("Failed to clear officer session:", e);
    }
  };

  // Sync document element class so Tailwind dark: utilities and variables activate
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const themeTitle =
    theme === "light"
      ? "Executive Light"
      : theme === "petroleum"
      ? "Oil & Gas Gold"
      : theme === "cyber"
      ? "Cyber Tactical"
      : "Midnight Dark";

  // Comprehensive theme styling tokens ensuring 100% visibility, richness & high contrast
  const t = {
    rootBg: isLight
      ? "bg-[#f4f6f9] text-slate-900"
      : isPetroleum
      ? "bg-[#050e1d] text-slate-100"
      : isCyber
      ? "bg-[#000000] text-slate-100"
      : "bg-[#080c14] text-slate-100",
    headerBg: isLight
      ? "bg-white/98 border-slate-200/90 text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-md"
      : isPetroleum
      ? "bg-[#08172c]/95 border-amber-500/25 text-white shadow-[0_1px_15px_rgba(245,158,11,0.06)] backdrop-blur-md"
      : isCyber
      ? "bg-[#020a05]/95 border-emerald-500/35 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md"
      : "bg-[#0c1322]/95 border-slate-800/80 text-white shadow-sm backdrop-blur-md",
    panelBg: isLight
      ? "bg-white/98 border-slate-200/90 text-slate-900 shadow-sm backdrop-blur-md"
      : isPetroleum
      ? "bg-[#061325]/95 border-amber-500/20 text-white shadow-sm backdrop-blur-md"
      : isCyber
      ? "bg-[#010704]/95 border-emerald-500/25 text-white shadow-sm backdrop-blur-md"
      : "bg-[#0a101c]/95 border-slate-800/80 text-white shadow-sm backdrop-blur-md",
    footerBg: isLight
      ? "bg-white border-slate-200/90 text-slate-900 shadow-[0_-1px_3px_rgba(0,0,0,0.03)]"
      : isPetroleum
      ? "bg-[#050e1d] border-amber-500/20 text-white shadow-sm"
      : isCyber
      ? "bg-[#000402] border-emerald-500/25 text-white shadow-sm"
      : "bg-[#080d16] border-slate-800/80 text-white shadow-sm",
    cardBg: isLight
      ? "bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]"
      : isPetroleum
      ? "bg-[#0c203d] border-amber-500/25 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.08)]"
      : isCyber
      ? "bg-[#04150b] border-emerald-500/35 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.12)]"
      : "bg-[#10182b] border-slate-700/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
    cardSubtleBg: isLight
      ? "bg-slate-50/80 border-slate-200/80"
      : isPetroleum
      ? "bg-[#081830]/80 border-amber-900/40"
      : isCyber
      ? "bg-[#020e06]/80 border-emerald-900/50"
      : "bg-[#0d1424]/80 border-slate-800/70",
    textHeading: isLight
      ? "text-slate-900 font-extrabold tracking-tight"
      : isPetroleum
      ? "text-white font-bold tracking-tight"
      : isCyber
      ? "text-white font-bold tracking-tight"
      : "text-white font-bold tracking-tight",
    textBody: isLight
      ? "text-slate-700"
      : isPetroleum
      ? "text-slate-200"
      : isCyber
      ? "text-emerald-100/90"
      : "text-slate-200",
    textMuted: isLight
      ? "text-slate-500 font-medium"
      : isPetroleum
      ? "text-amber-200/80 font-medium"
      : isCyber
      ? "text-emerald-400/80 font-medium"
      : "text-slate-400 font-medium",
    btnSecondary: isLight
      ? "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm hover:border-slate-400"
      : isPetroleum
      ? "bg-[#0d2242] hover:bg-[#13305c] text-amber-200 border-amber-600/50 shadow-sm"
      : isCyber
      ? "bg-[#041a0e] hover:bg-[#072a17] text-emerald-300 border-emerald-600/50 shadow-sm"
      : "bg-[#142038] hover:bg-[#1a2b4c] text-slate-100 border-slate-700/70 shadow-sm",
    btnPrimary: isLight
      ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-md active:scale-95"
      : isPetroleum
      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95"
      : isCyber
      ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.35)] active:scale-95"
      : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-md active:scale-95",
    accentBadge: isLight
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : isPetroleum
      ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
      : isCyber
      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
      : "bg-orange-950/80 text-orange-300 border-orange-500/40",
    divider: isLight
      ? "border-slate-200 bg-slate-200"
      : isPetroleum
      ? "border-amber-900/40 bg-amber-900/40"
      : isCyber
      ? "border-emerald-900/40 bg-emerald-900/40"
      : "border-slate-800/80 bg-slate-800/80",
    calloutWarning: isLight
      ? "bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm"
      : isPetroleum
      ? "bg-amber-950/40 border-amber-500/60 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.1)]"
      : isCyber
      ? "bg-amber-950/40 border-amber-400/60 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
      : "bg-amber-950/40 border-amber-600/70 text-slate-200 shadow-sm",
    calloutDanger: isLight
      ? "bg-red-50/90 border-red-300 text-red-950 shadow-sm"
      : isPetroleum
      ? "bg-red-950/40 border-red-500/60 text-red-100 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
      : isCyber
      ? "bg-red-950/40 border-red-500/70 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
      : "bg-red-950/50 border-red-500/70 text-red-200 shadow-sm",
    calloutSuccess: isLight
      ? "bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm"
      : isPetroleum
      ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.1)]"
      : isCyber
      ? "bg-emerald-950/40 border-emerald-400/70 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      : "bg-emerald-950/40 border-emerald-600/70 text-slate-200 shadow-sm",
    calloutInfo: isLight
      ? "bg-sky-50/90 border-sky-300 text-sky-950 shadow-sm"
      : isPetroleum
      ? "bg-sky-950/40 border-sky-500/60 text-sky-100"
      : isCyber
      ? "bg-cyan-950/40 border-cyan-400/60 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      : "bg-cyan-950/40 border-cyan-600/60 text-slate-200 shadow-sm",
    badgeWarning: isLight
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : isPetroleum
      ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
      : isCyber
      ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
      : "bg-amber-950/80 text-amber-300 border-amber-600/50",
    badgeDanger: isLight
      ? "bg-red-100 text-red-800 border-red-200"
      : isPetroleum
      ? "bg-red-950/80 text-red-300 border-red-500/40"
      : isCyber
      ? "bg-red-950/80 text-red-300 border-red-500/40"
      : "bg-red-950/80 text-red-300 border-red-600/50",
    badgeSuccess: isLight
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : isPetroleum
      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
      : isCyber
      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
      : "bg-emerald-950/80 text-emerald-300 border-emerald-600/50",
    selectBg: isLight
      ? "bg-white border-slate-300 text-slate-900 hover:border-slate-400"
      : isPetroleum
      ? "bg-[#0c203d] border-amber-500/40 text-amber-200 hover:border-amber-400"
      : isCyber
      ? "bg-[#04150b] border-emerald-500/40 text-emerald-200 hover:border-emerald-400"
      : "bg-[#111c33] border-slate-700 text-slate-100 hover:border-slate-500",
  };

  // Active incident scenario state (5 realistic refinery scenarios or custom live incident)
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [customInjectedScenario, setCustomInjectedScenario] = useState<IncidentScenario | null>(null);
  const activeScenario: IncidentScenario = customInjectedScenario || INCIDENT_SCENARIOS[scenarioIndex] || INCIDENT_SCENARIOS[0];

  // Dynamic Interactive Physics & Live Multi-Agent Modals
  const [showPhysicsSimulator, setShowPhysicsSimulator] = useState<boolean>(false);
  const [showIncidentLab, setShowIncidentLab] = useState<boolean>(false);
  const [showAcousticModal, setShowAcousticModal] = useState<boolean>(false);
  const [showAgentTerminal, setShowAgentTerminal] = useState<boolean>(false);
  const [activePhysicsState, setActivePhysicsState] = useState<PhysicsSimulationState | null>(null);

  // 5-Step interactive presentation state
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [officerDecision, setOfficerDecision] = useState<string | null>(null);
  const isReportUnlocked = isDemoActive && currentStep === 5 && Boolean(officerDecision);

  // Modals and 3D expansion
  const [showProcedure, setShowProcedure] = useState<boolean>(false);
  const [showFinalReport, setShowFinalReport] = useState<boolean>(false);
  const [showHazardHub, setShowHazardHub] = useState<boolean>(false);
  const [showJudgesDefense, setShowJudgesDefense] = useState<boolean>(false);
  const [is3DExpanded, setIs3DExpanded] = useState<boolean>(false);
  const [feedViewMode, setFeedViewMode] = useState<"optical" | "thermal">("optical");
  const [showImageZoom, setShowImageZoom] = useState<boolean>(false);

  // Real-time clock
  const [currentTime, setCurrentTime] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toUTCString().slice(17, 25) + " UTC");
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic step titles tailored to active scenario
  const demoSteps: DemoStepInfo[] = [
    {
      step: 1,
      tag: "STEP 1 • BASELINE",
      title: "Normal Refinery Operations",
      subtitle: "All process systems within safe envelope. 428 routine reports logged, 0 unmitigated high-energy releases.",
      mode: "normal",
      activeZone: "All Plant Sectors Nominal",
    },
    {
      step: 2,
      tag: "STEP 2 • INGESTION",
      title: "Near-Miss Ingestion & Signal Extraction",
      subtitle: `Incident ${activeScenario.incidentNumber} received: ${activeScenario.title}. Traditional severity: ${activeScenario.actualSeverity}.`,
      mode: "sif_precursor",
      activeZone: activeScenario.zone,
    },
    {
      step: 3,
      tag: "STEP 3 • DISCORDANCE",
      title: "AI SIF Discordance Detection",
      subtitle: `SentinelSIF identifies ${activeScenario.energyType}: ${activeScenario.discordanceGap}% Severity Discordance flags ${activeScenario.classification}!`,
      mode: "sif_precursor",
      activeZone: activeScenario.zone,
    },
    {
      step: 4,
      tag: "STEP 4 • INVESTIGATION",
      title: "Autonomous Multi-Agent Investigation",
      subtitle: `LangGraph agents audit SOPs, uncover ${
        activeScenario.barriers.filter((b) => b.status !== "FUNCTIONING").length
      } compromised barriers, cite historical precedent ${activeScenario.ragMatch.id}.`,
      mode: "sif_precursor",
      activeZone: activeScenario.zone,
    },
    {
      step: 5,
      tag: "STEP 5 • AUTHORIZATION",
      title: "Safety Officer Mandatory Authorization",
      subtitle: `ML decides risk. AI investigates. Human Officer approves ${activeScenario.orderNumber} enforcement.`,
      mode: "sif_precursor",
      activeZone: activeScenario.zone,
    },
  ];

  const activeStepData = demoSteps[currentStep - 1] || demoSteps[0];
  const mode = activeStepData.mode;

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => {
          if (prev >= 5) {
            setIsPlaying(false);
            return 5;
          }
          return prev + 1;
        });
      }, 5500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep]);

  const handleStepSelect = (step: number) => {
    setIsPlaying(false);
    setCurrentStep(step);
    if (step < 5) setOfficerDecision(null);
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStep === 5) setCurrentStep(1);
      setIsPlaying(true);
    }
  };

  const handleSelectScenario = (index: number) => {
    setIsPlaying(false);
    setCustomInjectedScenario(null);
    setScenarioIndex(index);
    setOfficerDecision(null);
    setIsRecallCompleted(false);
    setIsRecallScanning(false);
    if (currentStep === 1) {
      setCurrentStep(2); // Immediately jump to Step 2 so the user sees the new incident details
    }
  };

  const handleNextScenario = () => {
    const nextIdx = (scenarioIndex + 1) % INCIDENT_SCENARIOS.length;
    handleSelectScenario(nextIdx);
  };

  // Positional Access Control: Render HSE Security Gateway if officer not authenticated
  if (!authChecked || !authenticatedOfficer) {
    return (
      <AuthGateway
        theme={theme}
        onThemeChange={setTheme}
        onAuthenticate={handleAuthenticate}
      />
    );
  }

  return (
    <div
      className={`flex flex-col w-screen h-screen overflow-hidden font-sans select-none transition-colors duration-300 ${t.rootBg}`}
    >
      {/* =====================================================================
          1. TOP NAVIGATION & EXECUTIVE CONTROLLER
      ===================================================================== */}
      <header
        className={`h-12 border-b px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 backdrop-blur transition-colors duration-300 ${t.headerBg}`}
      >
        {/* Brand & Client + Scenario Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Company Brand */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isCyber
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : isPetroleum
                  ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                  : "bg-emerald-500 shadow-[0_0_8px_#10b981]"
              } animate-pulse shrink-0`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider hidden md:inline ${
                isLight ? "text-slate-700" : isPetroleum ? "text-amber-200" : isCyber ? "text-emerald-300" : "text-slate-200"
              }`}
            >
              OIL INDIA<span className="hidden 2xl:inline"> LIMITED</span>
            </span>
          </div>

          <div className={`h-4 w-px hidden sm:block ${t.divider}`} />

          {/* System Title */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`font-extrabold tracking-tight text-xs sm:text-sm ${
                isLight ? "text-slate-900" : isPetroleum ? "text-amber-50" : isCyber ? "text-emerald-50" : "text-white"
              }`}
            >
              SENTINEL
              <span className={isCyber ? "text-emerald-400" : isPetroleum ? "text-amber-400" : "text-orange-500"}>
                SIF
              </span>
            </span>
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border hidden sm:inline ${
                isLight
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : isPetroleum
                  ? "bg-[#0d1e38] text-amber-300 border-amber-700/60"
                  : isCyber
                  ? "bg-[#04140d] text-emerald-300 border-emerald-700/60"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              SIH26165
            </span>
          </div>

          <div className={`h-4 w-px hidden md:block ${t.divider}`} />

          {/* DIVERSE SCENARIO SELECTOR */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center">
              <select
                value={scenarioIndex}
                onChange={(e) => handleSelectScenario(Number(e.target.value))}
                className={`text-xs font-semibold pl-2.5 pr-7 py-1 rounded-lg border appearance-none cursor-pointer transition-colors w-36 sm:w-44 lg:w-56 truncate shadow-sm ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900 hover:border-orange-500 focus:outline-none"
                    : isPetroleum
                    ? "bg-[#0d1e38] border-amber-600/60 text-amber-300 hover:border-amber-400 focus:outline-none"
                    : isCyber
                    ? "bg-[#04140d] border-emerald-600/60 text-emerald-300 hover:border-emerald-400 focus:outline-none"
                    : "bg-slate-900 border-slate-700 text-amber-400 hover:border-amber-500 focus:outline-none"
                }`}
                title="Select from 5 realistic refinery incident scenarios"
              >
                {INCIDENT_SCENARIOS.map((scen, idx) => (
                  <option
                    key={scen.id}
                    value={idx}
                    className={
                      isLight
                        ? "bg-white text-slate-900"
                        : isPetroleum
                        ? "bg-[#091629] text-amber-100"
                        : isCyber
                        ? "bg-[#040c08] text-emerald-200"
                        : "bg-slate-900 text-slate-200"
                    }
                  >
                    {scen.incidentNumber}: {scen.shortName}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 absolute right-2 pointer-events-none opacity-50 rotate-90" />
            </div>

            <button
              onClick={handleNextScenario}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all border shadow-sm active:scale-95 shrink-0 ${
                isLight
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300"
                  : isPetroleum
                  ? "bg-[#0d1e38] hover:bg-[#122849] text-amber-200 border-amber-600/60"
                  : isCyber
                  ? "bg-[#04140d] hover:bg-[#072417] text-emerald-300 border-emerald-600/60"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
              }`}
              title="Cycle to next incident issue"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isCyber ? "text-emerald-400" : "text-amber-400"}`} />
              <span className="hidden xl:inline">Next Issue</span>
            </button>
          </div>
        </div>

        {!isDemoActive ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xl:inline">PLANT SUPERVISORY MONITORING • 0 ALARMS</span>
              <span className="xl:hidden">STANDBY</span>
            </span>

            <button
              onClick={() => {
                setIsDemoActive(true);
                setCurrentStep(2);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all animate-pulse"
              title="Start Interactive SIF Precursor Demonstration"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>START DEMO</span>
            </button>
          </div>
        ) : (
          <>
            {/* 5-Step Stepper Controller (Rigid, Sleek Responsive Design) */}
            <div
              className={`flex items-center gap-0.5 p-0.5 rounded-lg border shadow-inner ${
                isLight
                  ? "bg-slate-100 border-slate-200"
                  : isPetroleum
                  ? "bg-[#071424] border-amber-900/40"
                  : isCyber
                  ? "bg-[#020906] border-emerald-900/60"
                  : "bg-slate-900/90 border-slate-800"
              }`}
            >
              {demoSteps.map((s) => {
                const isActive = currentStep === s.step;
                const isCompleted = currentStep > s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => handleStepSelect(s.step)}
                    title={`Step ${s.step}: ${s.title}`}
                    className={`h-7 px-1.5 sm:px-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1 whitespace-nowrap shrink-0 ${
                      isActive
                        ? isCyber
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                          : isPetroleum
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/40"
                          : "bg-orange-600 text-white shadow-md shadow-orange-600/30"
                        : isCompleted
                        ? isLight
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : isPetroleum
                          ? "bg-[#0b213c] text-emerald-300 border border-emerald-800/60 hover:text-white"
                          : isCyber
                          ? "bg-[#051a10] text-emerald-400 border border-emerald-800/60 hover:text-white"
                          : "bg-slate-800/80 text-emerald-400 hover:text-white"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                        : isPetroleum
                        ? "text-amber-300/70 hover:text-amber-100 hover:bg-[#0c1f38]"
                        : isCyber
                        ? "text-emerald-400/70 hover:text-emerald-100 hover:bg-[#04140d]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive
                          ? "bg-white text-orange-600 font-extrabold"
                          : isCompleted
                          ? isLight
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-600"
                          : isLight
                          ? "bg-slate-300 text-slate-700"
                          : isPetroleum
                          ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                          : isCyber
                          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isCompleted ? "✓" : s.step}
                    </span>
                    <span className="hidden xl:inline text-[11px]">
                      {s.step === 1 && "Baseline"}
                      {s.step === 2 && "Ingest"}
                      {s.step === 3 && "Discord"}
                      {s.step === 4 && "Investigate"}
                      {s.step === 5 && "Sign-Off"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Playback Controls & Exit Demo */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`p-1 rounded-md transition-all border shadow-sm disabled:opacity-30 disabled:cursor-not-allowed ${t.btnSecondary}`}
                title="Previous Step"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                  isPlaying
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : isCyber
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : isPetroleum
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-orange-600 hover:bg-orange-500 text-white"
                }`}
                title={isPlaying ? "Pause Auto Demo" : "Start Auto Demo"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> <span className="hidden md:inline text-[11px]">PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> <span className="hidden md:inline text-[11px]">AUTO</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextStep}
                disabled={currentStep === 5}
                className={`p-1 rounded-md transition-all border shadow-sm disabled:opacity-30 disabled:cursor-not-allowed ${t.btnSecondary}`}
                title="Next Step"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsDemoActive(false);
                  setCurrentStep(1);
                  setOfficerDecision(null);
                }}
                className={`px-2 py-1 rounded-md border text-[10px] font-semibold transition-all active:scale-95 ${t.btnSecondary}`}
                title="Exit Demo and return to Standby Monitoring"
              >
                Exit Demo
              </button>
            </div>
          </>
        )}

        {/* Right Header Controls: Theme, 3D Toggle, Judges Q&A, User Profile */}
        <div className="flex items-center gap-2">
          <div className={`h-4 w-px ${t.divider}`} />

          {/* THEME SELECTOR DROPDOWN + QUICK CYCLE */}
          <div className="flex items-center gap-1">
            <div className="relative flex items-center">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeMode)}
                className={`text-xs font-bold pl-2 pr-5 py-1 rounded-md border appearance-none cursor-pointer transition-all shadow-sm max-w-[115px] sm:max-w-[130px] truncate ${t.selectBg}`}
                title="Select Visual Theme"
              >
                <option value="dark">🌙 Midnight</option>
                <option value="light">☀️ Executive</option>
                <option value="petroleum">🛢️ Offshore</option>
                <option value="cyber">⚡ Cyber</option>
              </select>
              <ChevronRight className="w-3 h-3 absolute right-1.5 pointer-events-none opacity-60 rotate-90" />
            </div>

            <button
              onClick={cycleTheme}
              className={`p-1.5 rounded-md transition-all border shadow-sm active:scale-95 shrink-0 flex items-center justify-center ${
                isLight
                  ? "bg-white hover:bg-slate-50 text-blue-600 border-blue-200 shadow-sm"
                  : isPetroleum
                  ? "bg-[#0d2242] hover:bg-[#13305c] text-amber-400 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                  : isCyber
                  ? "bg-[#041a0e] hover:bg-[#072a17] text-emerald-400 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  : "bg-[#142038] hover:bg-[#1a2b4c] text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
              }`}
              title={`Active Theme: ${themeTitle}. Click to cycle themes`}
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3D Fullscreen / Expand Toggle */}
          <button
            onClick={() => setIs3DExpanded((prev) => !prev)}
            className={`p-1.5 rounded-md transition-all border shadow-sm shrink-0 ${t.btnSecondary}`}
            title={is3DExpanded ? "Restore Sidebars" : "Expand 3D Digital Twin Fullscreen"}
          >
            {is3DExpanded ? <Minimize2 className="w-3.5 h-3.5 text-orange-500" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Judges Q&A Defense Button */}
          <button
            onClick={() => setShowJudgesDefense(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 ${
              isLight
                ? "bg-cyan-50 hover:bg-cyan-100 text-cyan-950 border-cyan-300"
                : isPetroleum
                ? "bg-[#0a233c] hover:bg-[#103153] text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
                : isCyber
                ? "bg-[#021c17] hover:bg-[#042a23] text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                : "bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border-cyan-600/50"
            }`}
            title="Open Judges Defense & Hackathon Q&A Panel"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xl:inline">Judges Q&amp;A</span>
            <span className="xl:hidden">Q&amp;A</span>
          </button>

          {/* 1. Interactive Physics Stress Simulator */}
          <button
            onClick={() => setShowPhysicsSimulator(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 bg-gradient-to-r from-orange-600/20 to-amber-600/20 hover:from-orange-600/30 hover:to-amber-600/30 border-orange-500/60 text-orange-400"
            title="Open Interactive Physics &amp; Barrier Stress Sandbox"
          >
            <Sliders className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="hidden xl:inline">Physics Sandbox</span>
            <span className="xl:hidden">Physics</span>
          </button>

          {/* 2. Custom Live Incident Lab */}
          <button
            onClick={() => setShowIncidentLab(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border-cyan-500/60 text-cyan-300"
            title="Open Custom Incident Ingestion &amp; AI Triage Lab"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xl:inline">Incident Lab</span>
            <span className="xl:hidden">Lab</span>
          </button>

          {/* 3. Ultrasonic Acoustic AI Spectrogram */}
          <button
            onClick={() => setShowAcousticModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-cyan-300"
            title="Open Ultrasonic Acoustic Leak Spectrogram"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden 2xl:inline">Acoustic AI</span>
          </button>

          {/* 4. Multi-Agent Swarm Terminal */}
          <button
            onClick={() => setShowAgentTerminal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 bg-purple-950/40 hover:bg-purple-900/50 border-purple-600/60 text-purple-300"
            title="Open Multi-Agent Swarm Reasoning Terminal &amp; DAG Graph"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="hidden 2xl:inline">Agent Swarm</span>
          </button>

          <div className={`h-4 w-px ${t.divider} hidden sm:block`} />

          {/* Authenticated Officer Badge & Security Lockout */}
          <div className="flex items-center gap-1.5">
            <div
              className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-semibold ${
                isLight
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : isPetroleum
                  ? "bg-[#0b243d] text-amber-300 border-amber-500/50"
                  : isCyber
                  ? "bg-[#051c11] text-emerald-300 border-emerald-500/60"
                  : "bg-slate-900 text-emerald-300 border-emerald-700/60"
              }`}
              title={`Authenticated Operator: ${authenticatedOfficer?.name} (${authenticatedOfficer?.badge_id}) • ${authenticatedOfficer?.clearance_level}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[11px] font-bold truncate max-w-[130px]">
                  {authenticatedOfficer?.name || "Concerned Safety Official"}
                </span>
                <span className="text-[9px] opacity-75 font-mono">
                  CSO • DGMS-L4
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`px-2 py-1 rounded-md border text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 shadow-sm ${
                isLight
                  ? "bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border-slate-300 hover:border-red-300"
                  : isPetroleum
                  ? "bg-[#0c1f36] hover:bg-red-950/60 text-amber-200 hover:text-red-300 border-amber-900/60 hover:border-red-700"
                  : isCyber
                  ? "bg-[#051a10] hover:bg-red-950/60 text-emerald-300 hover:text-red-300 border-emerald-900/60 hover:border-red-700"
                  : "bg-slate-900 hover:bg-red-950 text-slate-300 hover:text-red-300 border-slate-700 hover:border-red-700"
              }`}
              title="Lock Console & Return to HSE Authentication Gateway"
            >
              <Lock className="w-3 h-3 text-red-400" />
              <span className="hidden sm:inline text-[11px]">Lock</span>
            </button>
          </div>

          <div className={`font-mono text-[11px] pl-2 border-l hidden 2xl:block ${t.textMuted} ${t.divider}`}>
            {currentTime}
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. MAIN 3-COLUMN WORKSPACE WITH STEP-REACTIVE SIDE DATA
      ===================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* =====================================================================
            LEFT PANEL: DYNAMICALLY CHANGES PER STEP & SCENARIO
        ===================================================================== */}
        {!is3DExpanded && (
          <aside
            className={`w-64 xl:w-72 border-r flex flex-col z-20 shrink-0 backdrop-blur overflow-y-auto transition-all duration-300 ${t.panelBg}`}
          >
            {/* STEP 1: Dynamic Thermodynamic & Process Energy Telemetry */}
            {currentStep === 1 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[11px] uppercase tracking-wider block font-bold ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Thermodynamic Energy Telemetry
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/40">
                      LIVE PHYSICS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono">
                    <div className={`p-2 rounded-lg border shadow-sm ${t.cardBg}`}>
                      <span className={`text-[9px] block font-semibold ${t.textMuted}`}>PROCESS PRESSURE</span>
                      <span className="text-base font-extrabold text-orange-400">
                        {activePhysicsState ? activePhysicsState.pressurePsi.toLocaleString() : "3,150"} PSI
                      </span>
                    </div>
                    <div
                      className={`p-2 rounded-lg border shadow-sm ${
                        isLight
                          ? "bg-amber-50 border-amber-200"
                          : isCyber
                          ? "bg-[#041a0e] border-emerald-800/60"
                          : "bg-slate-900 border-amber-900/50"
                      }`}
                    >
                      <span className="text-[9px] text-amber-500 block font-semibold">TNT EQUIVALENT</span>
                      <span className="text-base font-extrabold text-amber-400">
                        {activePhysicsState ? activePhysicsState.tntEquivalentKg : 184} kg TNT
                      </span>
                    </div>
                    <div className={`p-2 rounded-lg border shadow-sm ${t.cardBg}`}>
                      <span className={`text-[9px] block font-semibold ${t.textMuted}`}>LETHAL BLAST RADIUS</span>
                      <span className="text-base font-extrabold text-red-400">
                        {activePhysicsState ? activePhysicsState.lethalBlastRadiusMeters : 28.5} m
                      </span>
                    </div>
                    <div className={`p-2 rounded-lg border shadow-sm ${t.cardBg}`}>
                      <span className={`text-[9px] block font-semibold ${t.textMuted}`}>SIF DISCORDANCE</span>
                      <span className="text-base font-extrabold text-red-500">
                        {activePhysicsState ? activePhysicsState.discordanceScore : 94}% GAP
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm space-y-1.5 ${t.cardSubtleBg}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${t.textMuted}`}>
                    Protective Barrier Integrity Status
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={t.textBody}>PSV-102 Relief Valve:</span>
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          (activePhysicsState?.psvStatus || "THROTTLED") === "FUNCTIONING"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {activePhysicsState?.psvStatus || "THROTTLED"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={t.textBody}>Deluge Water Curtain:</span>
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          (activePhysicsState?.delugeStatus || "OFFLINE") === "ARMED" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {activePhysicsState?.delugeStatus || "OFFLINE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={t.textBody}>Zero-Energy LOTO Spindle:</span>
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          (activePhysicsState?.lotoStatus || "BYPASSED") === "LOCKED"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {activePhysicsState?.lotoStatus || "BYPASSED"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={t.textBody}>38.4 kHz Ultrasonic Array:</span>
                      <span className="text-emerald-400 font-mono font-bold text-[11px]">ACTIVE ✓</span>
                    </div>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${t.calloutWarning}`}>
                  <span className="text-orange-500 font-bold text-[10px] uppercase tracking-wide block mb-0.5">
                    ⚡ Live Physics Invariant
                  </span>
                  Physical energy release potential is evaluated in real time from thermodynamic line pressure, sonic
                  velocity, and barrier integrity—never from retrospective casualty counts.
                </div>
              </div>
            )}

            {/* STEP 2: Incident Ingested (Dynamic per Scenario) */}
            {currentStep === 2 && (
              <div className="p-3 space-y-2 text-xs">
                {/* Header with Live Ping */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">
                      Live Incident Telemetry
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                    {activeScenario.time}
                  </span>
                </div>

                {/* LIVE FIELD CAMERA & FLIR THERMAL INSPECTION FEED */}
                <div className={`p-2 rounded-xl border shadow-md space-y-2 overflow-hidden ${t.cardBg}`}>
                  {/* Feed Controls Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                      <span className="font-mono text-[10px] font-bold text-red-400">
                        CAM-04 // {activeScenario.zoneId}
                      </span>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-slate-700/60 text-[9px] font-bold">
                      <button
                        onClick={() => setFeedViewMode("optical")}
                        className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                          feedViewMode === "optical"
                            ? "bg-cyan-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Camera className="w-2.5 h-2.5" />
                        <span>OPTICAL</span>
                      </button>
                      <button
                        onClick={() => setFeedViewMode("thermal")}
                        className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                          feedViewMode === "thermal"
                            ? "bg-amber-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Flame className="w-2.5 h-2.5" />
                        <span>FLIR IR</span>
                      </button>
                    </div>
                  </div>

                  {/* Real Image Container with Laser Scanline & Crosshairs */}
                  <div
                    onClick={() => setShowImageZoom(true)}
                    className="relative aspect-video rounded-lg overflow-hidden border border-slate-700/60 bg-black cursor-pointer group shadow-inner"
                    title="Click to expand high-resolution diagnostic viewport"
                  >
                    <img
                      src={
                        feedViewMode === "thermal"
                          ? activeScenario.thermalImageUrl || activeScenario.imageUrl
                          : activeScenario.imageUrl
                      }
                      alt={activeScenario.equipment}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-scanline pointer-events-none" />

                    {/* Top HUD Overlay */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 border border-cyan-500/30">
                      <Crosshair className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{feedViewMode === "thermal" ? "PEAK 142.6°C" : "60 FPS • 4K"}</span>
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-500/30">
                      {activeScenario.incidentNumber}
                    </div>

                    {/* Hover Click-to-Zoom Hint */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-2 py-1 rounded bg-black/80 text-white font-mono text-[10px] border border-white/20 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-cyan-400" /> Expand Diagnostic
                      </span>
                    </div>
                  </div>

                  {/* Acoustic & Vibration Spectrum Analyzer */}
                  <div className={`p-1.5 rounded-lg border text-xs space-y-1 ${t.cardSubtleBg}`}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-cyan-400 font-bold flex items-center gap-1">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        ACOUSTIC / VIBRATION SPECTRUM
                      </span>
                      <span className="font-mono text-slate-400 text-[9px]">42.8 dB • 28.4 Hz</span>
                    </div>

                    {/* Animated Equalizer Bars */}
                    <div className="flex items-end gap-1 h-4 pt-0.5 px-1 bg-black/30 rounded border border-slate-800/80">
                      <div className="w-full bg-cyan-400/80 rounded-t h-full animate-pulse-bar-1" />
                      <div className="w-full bg-cyan-400/90 rounded-t h-full animate-pulse-bar-2" />
                      <div className="w-full bg-amber-400 rounded-t h-full animate-pulse-bar-3" />
                      <div className="w-full bg-red-400 rounded-t h-full animate-pulse-bar-4" />
                      <div className="w-full bg-amber-400 rounded-t h-full animate-pulse-bar-5" />
                      <div className="w-full bg-cyan-400/70 rounded-t h-full animate-pulse-bar-6" />
                      <div className="w-full bg-cyan-400/80 rounded-t h-full animate-pulse-bar-2" />
                      <div className="w-full bg-red-400 rounded-t h-full animate-pulse-bar-3" />
                      <div className="w-full bg-cyan-400/90 rounded-t h-full animate-pulse-bar-1" />
                    </div>
                  </div>
                </div>

                {/* Tactical Event Breakdown */}
                <div className={`p-2.5 rounded-xl border shadow-sm space-y-1.5 ${t.cardBg}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-bold ${t.textHeading}`}>{activeScenario.equipment}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      {activeScenario.zoneId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-slate-700/40">
                    <div className={`p-1.5 rounded-lg border ${t.cardSubtleBg}`}>
                      <span className="text-[9px] text-slate-400 block font-bold">REPORTED SEVERITY</span>
                      <span className="text-emerald-400 font-extrabold">{activeScenario.actualSeverity}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{activeScenario.actualDescription}</span>
                    </div>
                    <div className="p-1.5 rounded-lg border border-red-500/40 bg-red-950/20">
                      <span className="text-[9px] text-red-400 block font-bold">HAZARDOUS ENERGY</span>
                      <span className="text-red-400 font-extrabold truncate block">{activeScenario.energyType.split(" ")[0]}</span>
                      <span className="text-[10px] text-red-300 block truncate">{activeScenario.exposureLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: The SIF Discordance Rule */}
            {currentStep === 3 && (
              <div className="p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span className="text-[11px] text-orange-500 font-bold uppercase tracking-wider">
                      SIF Discordance Engine
                    </span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${t.badgeWarning}`}>
                    CORE ML
                  </span>
                </div>

                {/* ANIMATED SEMI-CIRCULAR SVG GAUGE */}
                <div
                  className={`p-3 rounded-xl border-2 shadow-md relative overflow-hidden flex flex-col items-center justify-center ${t.calloutWarning}`}
                >
                  <div className="relative w-44 h-24 flex items-center justify-center">
                    <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                      {/* Background arc */}
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke={isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)"}
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      {/* Active colored arc */}
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="url(#sifGradientGauge)"
                        strokeWidth="8"
                        strokeDasharray="126"
                        strokeDashoffset={126 - (126 * (activeScenario.discordanceGap / 100))}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="sifGradientGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="40%" stopColor="#f59e0b" />
                          <stop offset="85%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Central Numeric Readout */}
                    <div className="absolute top-8 flex flex-col items-center">
                      <span className="text-2xl font-black font-mono tracking-tight text-red-500 animate-pulse">
                        {activeScenario.discordanceGap}%
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                        DISCORDANCE GAP
                      </span>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                      {activeScenario.classification} DETECTED
                    </span>
                  </div>
                </div>

                {/* VISUAL CONTRAST: PERCEPTION VS PHYSICAL REALITY */}
                <div className={`p-2.5 rounded-xl border shadow-sm space-y-1.5 ${t.cardBg}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider flex justify-between">
                    <span className={t.textMuted}>Telemetry Divergence</span>
                    <span className="text-cyan-400 font-mono">18.8x EXPOSURE</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className={`p-1.5 rounded-lg border ${t.cardSubtleBg}`}>
                      <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        FIELD REPORT
                      </div>
                      <div className="font-extrabold text-[11px] text-emerald-400 mt-0.5">
                        {activeScenario.actualSeverity}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {activeScenario.actualDescription}
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg border border-red-500/40 bg-red-950/30">
                      <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        POTENTIAL SIF
                      </div>
                      <div className="font-extrabold text-[11px] text-red-400 mt-0.5">
                        {activeScenario.potentialSeverity}
                      </div>
                      <div className="text-[9px] text-red-300 truncate">
                        {activeScenario.potentialOutcome}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DETERMINISTIC LAW PILL */}
                <div className={`p-2 rounded-lg border text-[10px] space-y-1 ${t.cardSubtleBg}`}>
                  <div className="font-bold font-mono text-cyan-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    DETERMINISTIC SIF PRINCIPLE
                  </div>
                  <p className="text-[10px] leading-snug opacity-90">
                    High energy (<strong>{activeScenario.energyType.split(" ")[0]}</strong>) + Compromised Barrier = Mandatory SIF Precursor, regardless of injury severity.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 4: LangGraph Agent Orchestration */}
            {currentStep === 4 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    Multi-Agent Investigation
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${t.calloutInfo}`}
                  >
                    LANGGRAPH
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm space-y-1.5 ${t.cardBg}`}>
                  <span className={`text-[10px] uppercase font-bold block ${t.textMuted}`}>
                    Autonomous Agent Workflow
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={t.textBody}>1. Signal Extractor</span>
                      <span className="text-emerald-500 font-bold">Done ✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={t.textBody}>2. Discordance Evaluator</span>
                      <span className="text-emerald-500 font-bold">Done ✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={t.textBody}>3. SOP Audit Agent</span>
                      <span className="text-emerald-500 font-bold">Done ✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={t.textBody}>4. Historical RAG Match</span>
                      <span className="text-emerald-500 font-bold">Done ✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={t.textBody}>5. Action Formulator</span>
                      <span className="text-emerald-500 font-bold">Done ✓</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border space-y-1.5 ${t.calloutInfo}`}
                >
                  <span className="text-cyan-400 font-bold text-[10px] uppercase tracking-wide block">
                    📚 Historical RAG Match
                  </span>
                  <div className={`text-xs font-bold ${t.textHeading}`}>
                    Incident {activeScenario.ragMatch.id} ({activeScenario.ragMatch.similarity}% Match)
                  </div>
                  <p className={`text-[11px] leading-relaxed ${t.textBody}`}>
                    {activeScenario.ragMatch.description}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5: Audit & Decision Provenance */}
            {currentStep === 5 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                    Auditable Decision Trace
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${t.badgeSuccess}`}
                  >
                    PHASE 8
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm space-y-1.5 ${t.cardBg}`}>
                  <span className={`text-[10px] uppercase font-bold block ${t.textMuted}`}>
                    Deterministic Audit Record
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className={t.textMuted}>Engine:</span>
                      <span className={`font-bold ${t.textHeading}`}>SIFRiskDecisionEngine</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={t.textMuted}>Rules Version:</span>
                      <span className="text-cyan-400 font-bold">v1.0-deterministic</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={t.textMuted}>Confidence:</span>
                      <span className="text-emerald-500 font-bold">92% Calibrated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={t.textMuted}>Classification:</span>
                      <span className="text-orange-500 font-bold">{activeScenario.classification}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border space-y-1 ${t.calloutSuccess}`}
                >
                  <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-wide block">
                    🛡️ The Golden Rule Invariant
                  </span>
                  <p className={`text-[11px] leading-relaxed ${t.textBody}`}>
                    &ldquo;ML/Rules decide the risk. LLM agents investigate the risk. Human Safety Officer authorizes the enforcement action.&rdquo;
                  </p>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* =====================================================================
            CENTER VIEWPORT: 3D DIGITAL TWIN + FLOATING CENTER BANNER
        ===================================================================== */}
        <main className="flex-1 relative flex flex-col overflow-hidden">
          {/* FLOATING STEP BANNER (Spacious, Beautiful, Non-Truncated) */}
          <div className="absolute top-4 left-0 right-0 z-10 pointer-events-none flex justify-center px-4">
            <div
              className={`px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 text-xs pointer-events-auto border transition-all ${
                isLight
                  ? "bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/40"
                  : isPetroleum
                  ? "bg-[#0d1e38]/95 border-amber-600/70 text-amber-50 shadow-amber-950/60"
                  : isCyber
                  ? "bg-[#04140d]/95 border-emerald-500/70 text-emerald-50 shadow-emerald-950/60"
                  : "bg-[#090d16]/95 border-slate-700 text-white shadow-black/80"
              }`}
            >
              {!isDemoActive ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wide shadow-sm uppercase shrink-0 flex items-center gap-1 animate-pulse">
                    <Zap className="w-3 h-3" />
                    JUDGES INTERACTIVE ARENA
                  </span>
                  <span className={`font-bold text-xs sm:text-sm tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    Test Live Inference &bull; Not a Static Database:
                  </span>
                  <button
                    onClick={() => {
                      const state: PhysicsSimulationState = {
                        pressurePsi: 4500,
                        gasLelPercent: 92,
                        workerProximityMeters: 1.2,
                        flowRateM3H: 950,
                        psvStatus: "BYPASSED",
                        delugeStatus: "OFFLINE",
                        lotoStatus: "BYPASSED",
                        acousticSensorActive: true,
                        discordanceScore: 98,
                        sifClassification: "CRITICAL BLOWOUT",
                        tntEquivalentKg: 340,
                        lethalBlastRadiusMeters: 36.5,
                        heatFlux12kwRadiusMeters: 52.0,
                        safePerimeterMeters: 95.0,
                        isRuptureImminent: true,
                      };
                      setActivePhysicsState(state);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-[11px] shadow-sm transition-all active:scale-95 flex items-center gap-1"
                    title="Simulate 4,500 PSI High-Pressure Line Rupture"
                  >
                    <Flame className="w-3 h-3" />
                    <span>💥 4,500 PSI Blowout</span>
                  </button>
                  <button
                    onClick={() => {
                      const coffee = INCIDENT_SCENARIOS.find((s) => s.id === "scen-5") || INCIDENT_SCENARIOS[4];
                      setCustomInjectedScenario(coffee);
                      setIsDemoActive(true);
                      setCurrentStep(3);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[11px] shadow-sm transition-all active:scale-95"
                    title="Prove 0% SIF Precursor on Non-Hazardous Incident (Negative Control)"
                  >
                    ☕ Coffee Spill (0% SIF Proof)
                  </button>
                  <button
                    onClick={() => setShowIncidentLab(true)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-extrabold text-[11px] shadow-sm transition-all active:scale-95"
                    title="Type any arbitrary incident narrative to test live multi-agent triage"
                  >
                    ⚡ Type Any Incident
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-white font-extrabold text-[10px] tracking-wide shadow-sm uppercase shrink-0 ${
                      isCyber ? "bg-emerald-600" : isPetroleum ? "bg-amber-600" : "bg-orange-600"
                    }`}
                  >
                    {activeStepData.tag}
                  </span>
                  <span className={`font-bold text-sm tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {activeStepData.title}
                  </span>
                  {currentStep > 1 && (
                    <span
                      className={`font-medium hidden md:inline ${
                        isLight
                          ? "text-slate-500"
                          : isPetroleum
                          ? "text-amber-300/80"
                          : isCyber
                          ? "text-emerald-300/80"
                          : "text-slate-400"
                      }`}
                    >
                      • {activeScenario.incidentNumber}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 360° Interaction Hint (Bottom-Left) */}
          <div
            className={`absolute bottom-4 left-4 z-10 text-xs px-3 py-1.5 rounded-lg border pointer-events-none shadow-md backdrop-blur-md font-medium transition-colors ${
              isLight
                ? "bg-white/90 text-slate-700 border-slate-200"
                : isPetroleum
                ? "bg-[#091629]/90 text-amber-200 border-amber-900/60"
                : isCyber
                ? "bg-[#030806]/90 text-emerald-200 border-emerald-900/70"
                : "bg-slate-900/90 text-slate-200 border-slate-800"
            }`}
          >
            🖱️ Orbit: Left Click + Drag • Zoom: Scroll • Pan: Right Click
          </div>

          {/* Floating Live Interactive HUD on 3D Canvas */}
          <div className="absolute top-16 left-4 z-20 flex flex-wrap items-center gap-2 font-sans text-xs">
            <button
              onClick={() => setShowPhysicsSimulator(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white border border-orange-500/60 shadow-lg backdrop-blur-md transition-all active:scale-95 group"
              title="Open Live Physics & Barrier Stress Sandbox"
            >
              <Sliders className="w-3.5 h-3.5 text-orange-400 group-hover:rotate-45 transition-transform" />
              <span className="font-bold">
                Live Physics: {activePhysicsState ? `${activePhysicsState.pressurePsi} PSI` : "3,150 PSI"}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-mono">
                {activePhysicsState ? `${activePhysicsState.discordanceScore}% Gap` : "94% Gap"}
              </span>
            </button>

            <button
              onClick={() => setShowIncidentLab(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white border border-cyan-500/60 shadow-lg backdrop-blur-md transition-all active:scale-95"
              title="Test Any Custom Incident or Landmark Benchmark"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">Test ANY Incident</span>
            </button>

            <button
              onClick={() => setShowAcousticModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white border border-blue-500/60 shadow-lg backdrop-blur-md transition-all active:scale-95"
              title="Listen to 38.4 kHz Ultrasonic Leak Spectrogram"
            >
              <Volume2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold">38.4 kHz Acoustic AI</span>
            </button>
          </div>

          {/* 3D Canvas Viewport */}
          <div className="absolute inset-0 w-full h-full">
            <DigitalTwinCanvas
              mode={mode}
              currentStep={currentStep}
              officerDecision={officerDecision}
              hideOverlays={showProcedure || showFinalReport}
              theme={theme}
              zoneFocus={activeScenario.zoneId}
              isExpanded={is3DExpanded}
              onToggleExpand={() => setIs3DExpanded((prev) => !prev)}
              onSelectZone={() => {}}
              onOpenProcedure={() => setShowProcedure(true)}
              hasRecalledHazard={isRecallCompleted && !!activeScenario.recalledFeature?.detected}
              recalledFeatureName={activeScenario.recalledFeature?.featureName}
              physicsState={activePhysicsState || undefined}
              showBlastFootprint={!!activePhysicsState && activePhysicsState.pressurePsi > 1000}
            />
          </div>

          {/* PERSISTENT REAL-TIME INTERACTIVE COCKPIT DOCK */}
          <EmbeddedInteractiveDock
            theme={theme}
            activeScenario={activeScenario}
            onInjectScenario={(newScen) => {
              setCustomInjectedScenario(newScen);
              if (!isDemoActive) setIsDemoActive(true);
              setCurrentStep(3);
            }}
            physicsState={activePhysicsState}
            onPhysicsChange={(st) => setActivePhysicsState(st)}
            onOpenModal={(m) => {
              if (m === "physics") setShowPhysicsSimulator(true);
              if (m === "incident") setShowIncidentLab(true);
              if (m === "acoustic") setShowAcousticModal(true);
              if (m === "swarm") setShowAgentTerminal(true);
            }}
          />
        </main>

        {/* =====================================================================
            RIGHT PANEL: DYNAMICALLY CHANGES PER STEP & SCENARIO
        ===================================================================== */}
        {!is3DExpanded && (
          <aside
            className={`w-72 xl:w-80 border-l flex flex-col z-20 shrink-0 backdrop-blur overflow-y-auto transition-all duration-300 ${t.panelBg}`}
          >
            {/* STANDBY: Refinery Continuous Monitoring & Scenario Simulator */}
            {!isDemoActive && (
              <div className="p-3 space-y-3 text-xs">
                <div className={`border-b pb-2 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-orange-400 animate-pulse" />
                      PREDICTIVE INFERENCE ARENA
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                        isLight
                          ? "bg-orange-100 text-orange-800 border-orange-300"
                          : "bg-orange-950 text-orange-300 border-orange-700"
                      }`}
                    >
                      LIVE ML &bull; 0 DELAY
                    </span>
                  </div>
                  <h2 className={`text-sm font-bold mt-1 ${t.textHeading}`}>
                    Autonomous Decision Engine
                  </h2>
                  <span className={`text-[11px] block mt-0.5 ${t.textMuted}`}>
                    Coupled thermodynamic physics &amp; LangGraph multi-agent pipeline
                  </span>
                </div>

                {/* Selected Scenario Preview Card */}
                <div className={`p-3 rounded-xl border shadow-sm space-y-2 ${t.cardBg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      Target Simulation Scenario
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                      {activeScenario.zoneId}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className={`font-bold text-xs ${t.textHeading}`}>{activeScenario.equipment}</div>
                    <div className="text-[11px] text-amber-400 font-medium">{activeScenario.title}</div>
                    <p className={`text-[11px] leading-relaxed pt-1.5 border-t border-slate-700/40 ${t.textMuted}`}>
                      &ldquo;{activeScenario.narrative}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Action Button to Begin Demo */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setIsDemoActive(true);
                      setCurrentStep(2);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>INGEST INCIDENT &amp; START DEMO</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDemoActive(true);
                      setCurrentStep(1);
                    }}
                    className={`w-full py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${t.btnSecondary}`}
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>View Step 1 Baseline Telemetry</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: Baseline Monitoring (Only when demo is started at step 1) */}
            {isDemoActive && currentStep === 1 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className={`border-b pb-2 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                      STEP 1 • BASELINE
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                        isLight
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-emerald-950 text-emerald-300 border-emerald-700"
                      }`}
                    >
                      ALL NOMINAL
                    </span>
                  </div>
                  <h2 className={`text-sm font-bold mt-1 ${t.textHeading}`}>
                    Plant Baseline Monitoring
                  </h2>
                  <span className={`text-[11px] block mt-0.5 ${t.textMuted}`}>
                    Zero active precursor anomalies
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-center">
                  <div className={`p-2 rounded-lg border shadow-sm ${t.cardBg}`}>
                    <span className={`text-[10px] block font-bold uppercase ${t.textMuted}`}>
                      ACTUAL SEVERITY
                    </span>
                    <span className="text-sm font-extrabold text-emerald-500 block mt-0.5">NONE</span>
                    <span className={`text-[10px] block mt-0.5 ${t.textMuted}`}>Standard shift</span>
                  </div>
                  <div className={`p-2 rounded-lg border shadow-sm ${t.cardBg}`}>
                    <span className={`text-[10px] block font-bold uppercase ${t.textMuted}`}>
                      POTENTIAL SIF
                    </span>
                    <span className="text-sm font-extrabold text-slate-400 block mt-0.5">NONE</span>
                    <span className={`text-[10px] block mt-0.5 ${t.textMuted}`}>No hazard pathway</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm space-y-1.5 ${t.cardBg}`}>
                  <div className="flex justify-between text-xs">
                    <span className={`font-bold ${t.textMuted}`}>DISCORDANCE GAP</span>
                    <span className="text-emerald-500 font-bold">0% (BALANCED)</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-800"}`}>
                    <div className="h-full bg-emerald-500" style={{ width: "0%" }} />
                  </div>
                  <div className={`text-[10px] mt-0.5 ${t.textMuted}`}>
                    No severity delta between reported injury and energy state.
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${t.cardSubtleBg} ${t.textBody}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wide block mb-0.5 ${t.textMuted}`}>
                    Continuous Monitoring
                  </span>
                  SentinelSIF is standing by, monitoring incoming EHS event narratives across all refinery sectors.
                </div>

                <button
                  onClick={handleNextStep}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${t.btnPrimary}`}
                >
                  <span>INGEST INCIDENT {activeScenario.incidentNumber}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* STEP 2: Traditional System Blindspot (Dynamic per Scenario) */}
            {currentStep === 2 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className={`border-b pb-2 ${t.divider}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                      STEP 2 • TRIAGE
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${t.badgeWarning}`}
                    >
                      EHS BLINDSPOT
                    </span>
                  </div>
                  <h2 className={`text-sm font-bold mt-1 ${t.textHeading}`}>
                    Traditional Safety Assessment
                  </h2>
                  <span className={`text-[11px] block mt-0.5 ${t.textMuted}`}>
                    Classified as Routine {activeScenario.actualSeverity} Severity
                  </span>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm space-y-1.5 ${t.cardBg}`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={t.textMuted}>Reported Consequence:</span>
                    <span className="text-emerald-500 font-bold">{activeScenario.actualDescription}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={t.textMuted}>Actual Severity Grade:</span>
                    <span className="text-emerald-500 font-bold">{activeScenario.actualSeverity}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={t.textMuted}>Legacy Action:</span>
                    <span className={`font-bold ${t.textBody}`}>Log &amp; Close</span>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border leading-relaxed space-y-1 ${t.calloutWarning}`}
                >
                  <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wide block">
                    ⚠️ The Hidden Danger
                  </span>
                  <p className="text-[11px]">
                    Because actual consequence was low, legacy reporting systems will <strong>ignore this event</strong>. However, unmitigated {activeScenario.energyType} remained active!
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${t.btnPrimary}`}
                >
                  <span>RUN AI DISCORDANCE SCAN</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* STEP 3: SIF Discordance Discovery (Dynamic per Scenario) */}
            {currentStep === 3 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className={`border-b pb-2 ${t.divider}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                      STEP 3 • AI DISCORDANCE
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${t.badgeWarning}`}
                    >
                      {activeScenario.classification}
                    </span>
                  </div>
                  <h2 className={`text-sm font-bold mt-1 ${t.textHeading}`}>
                    🚨 {activeScenario.classification} Triggered!
                  </h2>
                  <span className={`text-[11px] block mt-0.5 ${t.textMuted}`}>
                    Severity Discordance Gap: {activeScenario.discordanceGap}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className={`p-2 rounded-lg border shadow-sm ${t.cardBg}`}>
                    <span className={`text-[9px] block font-bold uppercase ${t.textMuted}`}>
                      ACTUAL SEVERITY
                    </span>
                    <span className="text-sm font-extrabold text-emerald-500 block mt-0.5">{activeScenario.actualSeverity}</span>
                    <span className={`text-[10px] block mt-0.5 truncate ${t.textMuted}`}>
                      {activeScenario.actualDescription}
                    </span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border-2 shadow-md ${t.calloutDanger}`}
                  >
                    <span className="text-[9px] text-red-500 block font-bold uppercase">POTENTIAL SIF</span>
                    <span className="text-sm font-extrabold text-red-500 animate-pulse block mt-0.5">
                      {activeScenario.potentialSeverity}
                    </span>
                    <span className="text-[10px] block mt-0.5 truncate text-red-400">
                      {activeScenario.potentialOutcome}
                    </span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm space-y-1 ${t.cardBg}`}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className={`font-bold ${t.textMuted}`}>DISCORDANCE GAP</span>
                    <span className="text-orange-500 font-bold">
                      {activeScenario.discordanceGap}% ({activeScenario.discordanceStatus})
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-slate-800"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-700"
                      style={{ width: `${activeScenario.discordanceGap}%` }}
                    />
                  </div>
                  <div className={`flex justify-between text-[10px] mt-1 ${t.textMuted}`}>
                    <span>Calibrated Confidence</span>
                    <span className={`font-bold ${t.textHeading}`}>92% Certainty</span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm ${t.cardBg}`}>
                  <span className={`text-[10px] uppercase tracking-wider block mb-1 font-bold ${t.textMuted}`}>
                    Phase 8 Deterministic Rationale
                  </span>
                  <ul className={`space-y-1 text-xs leading-snug ${t.textBody}`}>
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>
                        Consequence: <strong>{activeScenario.actualSeverity}</strong> ({activeScenario.actualDescription}).
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">•</span>
                      <span>
                        Hazard: <strong>{activeScenario.energyType}</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>
                        Compromised: <strong>{activeScenario.barriers[0].name}</strong> ({activeScenario.barriers[0].status}).
                      </span>
                    </li>
                  </ul>
                </div>

                {/* AI DEEP FEATURE RECALL & SELF-CORRECTION CONTROLLER */}
                <div
                  className={`p-2.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                    isRecallCompleted && activeScenario.recalledFeature?.detected
                      ? isLight
                        ? "bg-amber-50/90 border-amber-400 text-amber-950 shadow-sm"
                        : "bg-amber-950/40 border-amber-500/80 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : isRecallCompleted && !activeScenario.recalledFeature?.detected
                      ? isLight
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                        : "bg-emerald-950/30 border-emerald-500/60 text-emerald-100"
                      : t.cardBg
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-amber-500">
                      <Zap className="w-3 h-3 text-amber-400" />
                      AI Feature Recall &amp; Latent Scan
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        isRecallScanning
                          ? "bg-blue-600 text-white animate-pulse"
                          : isRecallCompleted
                          ? activeScenario.recalledFeature?.detected
                            ? "bg-amber-500 text-black animate-pulse"
                            : "bg-emerald-600 text-white"
                          : isLight
                          ? "bg-slate-200 text-slate-700"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {isRecallScanning
                        ? "SCANNING..."
                        : isRecallCompleted
                        ? activeScenario.recalledFeature?.detected
                          ? "+1 HAZARD RECALLED"
                          : "VERIFIED CLEAN"
                        : "STANDBY"}
                    </span>
                  </div>

                  {isRecallScanning ? (
                    <div className="py-2 text-center space-y-1">
                      <Activity className="w-4 h-4 animate-spin text-amber-500 mx-auto" />
                      <p className="text-[10px] text-amber-400 font-mono">
                        Rescanning 2nd-order SCADA loops, vibration telemetry &amp; secondary barrier archives...
                      </p>
                    </div>
                  ) : isRecallCompleted ? (
                    activeScenario.recalledFeature?.detected ? (
                      <div className="space-y-1 pt-1 border-t border-amber-500/30 text-[11px]">
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Latent Safety Feature Recovered!</span>
                        </div>
                        <p className="font-semibold text-xs text-white">
                          {activeScenario.recalledFeature.featureName}
                        </p>
                        <div className="text-[10px] leading-snug space-y-0.5">
                          <div>
                            <span className="text-red-400 font-bold">Why Initial AI Scan Missed It: </span>
                            <span className="opacity-85">{activeScenario.recalledFeature.missedReason}</span>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-bold">What Deep Recall Discovered: </span>
                            <span className="opacity-90">{activeScenario.recalledFeature.recalledEvidence}</span>
                          </div>
                        </div>
                        <div className="text-[9px] font-mono opacity-70 pt-0.5 border-t border-amber-500/20">
                          Source: {activeScenario.recalledFeature.telemetrySource}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5 pt-1 border-t border-emerald-500/30 text-[11px]">
                        <div className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Zero Latent Hazards Missed</span>
                        </div>
                        <p className="text-[10px] opacity-80 leading-snug">
                          Deep 2nd-order recall scanned 100% of auxiliary logs. No hidden electrical, pressure, or toxic hazards present.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1">
                      <p className={`text-[10px] leading-tight ${t.textMuted}`}>
                        If initial AI model missed subtle secondary hazards, trigger Deep Recall to re-evaluate 2nd-order telemetry.
                      </p>
                      <button
                        onClick={handleTriggerDeepRecall}
                        className={`w-full py-1.5 px-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                          isLight
                            ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                            : isPetroleum
                            ? "bg-[#0f243f] hover:bg-[#15345b] text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            : isCyber
                            ? "bg-[#051e12] hover:bg-[#072a19] text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                            : "bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-600/50"
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Run AI Deep Feature Recall Scan</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextStep}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${t.btnPrimary}`}
                >
                  <span>LAUNCH AGENT INVESTIGATION</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* STEP 4: Barrier Integrity & LangGraph Audit (Dynamic per Scenario) */}
            {currentStep === 4 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className={`border-b pb-2 ${t.divider}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      STEP 4 • BARRIER AUDIT
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                        activeScenario.barriers.filter((b) => b.status !== "FUNCTIONING").length +
                        (isRecallCompleted && activeScenario.recalledFeature?.detected ? 1 : 0) > 0
                          ? t.badgeDanger
                          : t.badgeSuccess
                      }`}
                    >
                      {activeScenario.barriers.filter((b) => b.status !== "FUNCTIONING").length +
                        (isRecallCompleted && activeScenario.recalledFeature?.detected ? 1 : 0)}{" "}
                      COMPROMISED
                    </span>
                  </div>
                  <h2 className={`text-sm font-bold mt-1 ${t.textHeading}`}>
                    LangGraph Barrier Audit
                  </h2>
                  <span className={`text-[11px] block mt-0.5 ${t.textMuted}`}>
                    Asset: {activeScenario.equipment}
                  </span>
                </div>

                {/* Physical Equipment Snapshot */}
                <div
                  onClick={() => setShowImageZoom(true)}
                  className="relative h-20 rounded-xl overflow-hidden border border-slate-700/60 cursor-pointer group shadow-md"
                  title="Click to expand high-resolution asset capture"
                >
                  <img
                    src={activeScenario.imageUrl}
                    alt={activeScenario.equipment}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end p-2 justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-cyan-400 flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" /> PHYSICAL ASSET AUDIT
                      </span>
                      <span className="text-xs font-bold text-white block truncate max-w-[180px]">
                        {activeScenario.equipment}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-black/80 text-amber-300 border border-amber-500/40">
                      {activeScenario.zoneId}
                    </span>
                  </div>
                </div>

                <div className={`p-2.5 rounded-lg border shadow-sm space-y-2 ${t.cardBg}`}>
                  <div className="text-[10px] uppercase font-bold flex justify-between">
                    <span className={t.textMuted}>Critical Barriers</span>
                    <span className="text-cyan-400 font-semibold">SOP-OI-OFF-MNT-402</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {activeScenario.barriers.map((barrier, bIdx) => (
                      <div
                        key={bIdx}
                        className={`py-1 border-b last:border-0 ${t.divider}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {barrier.status === "FAILED" ? (
                              <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                              </span>
                            ) : barrier.status === "ABSENT" ? (
                              <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500 shrink-0"></span>
                            )}
                            <span className={`font-bold text-[11px] ${t.textHeading}`}>
                              {barrier.name}
                            </span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded-full font-bold text-[9px] ${
                              barrier.status === "FAILED" || barrier.status === "ABSENT"
                                ? t.badgeDanger
                                : t.badgeSuccess
                            }`}
                          >
                            {barrier.status} {barrier.status === "FUNCTIONING" ? "✓" : "❌"}
                          </span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-relaxed pl-3.5 ${t.textMuted}`}>
                          {barrier.detail}
                        </p>
                      </div>
                    ))}

                    {/* RECALLED LATENT BARRIER (If Deep Recall Active) */}
                    {isRecallCompleted &&
                      activeScenario.recalledFeature?.detected &&
                      activeScenario.recalledFeature.barrierImpact && (
                        <div
                          className={`p-2 rounded-lg border my-1 transition-all ${
                            isLight
                              ? "bg-amber-50 border-amber-400 text-amber-950 shadow-sm"
                              : "bg-amber-950/50 border-amber-500/80 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-amber-400 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                              {activeScenario.recalledFeature.barrierImpact.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-full font-bold text-[9px] bg-amber-500 text-black shrink-0">
                              RECALLED • {activeScenario.recalledFeature.barrierImpact.status} ❌
                            </span>
                          </div>
                          <p className="text-[10px] mt-1 leading-relaxed opacity-90">
                            {activeScenario.recalledFeature.barrierImpact.detail}
                          </p>
                          <div className="text-[9px] font-mono opacity-75 mt-1 pt-1 border-t border-amber-500/20">
                            Source: {activeScenario.recalledFeature.telemetrySource}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Prompt to run recall if not yet executed */}
                {!isRecallCompleted && (
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${
                      isLight ? "bg-amber-50/70 border-amber-200" : "bg-slate-900/70 border-slate-700"
                    }`}
                  >
                    <div className="text-[10px] leading-tight flex-1">
                      <span className="font-bold text-amber-400 block">Latent Barrier Check:</span>
                      <span className={t.textMuted}>Check 2nd-order logs for missed failures</span>
                    </div>
                    <button
                      onClick={handleTriggerDeepRecall}
                      disabled={isRecallScanning}
                      className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] shrink-0 flex items-center gap-1 transition-all shadow-sm active:scale-95"
                    >
                      {isRecallScanning ? <Activity className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      <span>{isRecallScanning ? "Scanning..." : "Run Recall"}</span>
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowProcedure(true)}
                  className={`w-full py-1.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${t.btnSecondary}`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-orange-500" />
                  <span>INSPECT FULL SOP WORK PERMIT</span>
                </button>

                <button
                  onClick={handleNextStep}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${t.btnPrimary}`}
                >
                  <span>PROCEED TO HUMAN SIGN-OFF</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* STEP 5: Safety Officer Sign-Off & Quick Export */}
            {currentStep === 5 && (
              <div className="p-3 space-y-2.5 text-xs">
                <div className={`border-b pb-2 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      STEP 5 • AUTHORIZATION
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                        isLight
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-emerald-950 text-emerald-300 border-emerald-700"
                      }`}
                    >
                      MANDATORY
                    </span>
                  </div>
                  <h2 className={`text-sm font-bold mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                    Safety Officer Authorization
                  </h2>
                  <span className={`text-[11px] block mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Enforcement Order: {activeScenario.orderNumber}
                  </span>
                </div>

                {/* Authenticated Officer Credential Banner */}
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 shadow-sm ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-800"
                      : isPetroleum
                      ? "bg-[#08182b] border-amber-600/30 text-amber-100"
                      : isCyber
                      ? "bg-[#03140a] border-emerald-600/40 text-emerald-100"
                      : "bg-[#0e1626] border-slate-700/80 text-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="leading-tight space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                        Authorized Safety Controller
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                        DGMS-L4
                      </span>
                    </div>
                    <div className="font-bold text-xs truncate">
                      {authenticatedOfficer?.name || "Concerned Safety Official"}
                    </div>
                    <div className={`text-[10px] font-mono ${t.textMuted}`}>
                      Badge: {authenticatedOfficer?.badge_id || "OIL-CSO-8042"} • Statutory Controller
                    </div>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-lg border shadow-sm space-y-1 text-xs ${t.cardSubtleBg}`}
                >
                  <span className={`text-[10px] uppercase font-bold block ${t.textMuted}`}>
                    Mandatory Corrective Action
                  </span>
                  <p className={`leading-relaxed text-[11px] ${t.textBody}`}>
                    {activeScenario.recommendedAction}
                  </p>
                </div>

                {/* Latent Precursor Appended Stamp (If Deep Recall Active) */}
                {isRecallCompleted && activeScenario.recalledFeature?.detected && (
                  <div
                    className={`p-2 rounded-lg border text-xs space-y-1 ${
                      isLight
                        ? "bg-amber-50 border-amber-300 text-amber-950"
                        : "bg-amber-950/40 border-amber-600/50 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] uppercase text-amber-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        AI Deep Recall Precursor Appended
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-amber-500 text-black">
                        +1 HAZARD
                      </span>
                    </div>
                    <p className="text-[10px] leading-tight">
                      Statutory mandate incorporates recalled defect:{" "}
                      <strong>{activeScenario.recalledFeature.featureName}</strong>.
                    </p>
                  </div>
                )}

                {officerDecision ? (
                  <div
                    className={`p-2.5 rounded-lg border-2 space-y-1 shadow-md ${
                      isLight
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                        : "bg-emerald-950/70 border-emerald-500 text-emerald-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      POSITIVE ISOLATION ENFORCED
                    </div>
                    <div className={`text-[11px] ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>
                      {officerDecision}
                    </div>
                    <div className="text-[10px] font-mono opacity-80 pt-0.5 border-t border-emerald-600/40">
                      Digitally signed by: {authenticatedOfficer?.name || "Concerned Safety Official"} [{authenticatedOfficer?.badge_id || "OIL-CSO-8042"}] • Logged to DGMS ledger ✓
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] uppercase font-bold block ${t.textMuted}`}>
                      Officer Action Required:
                    </span>
                    <button
                      onClick={() => setOfficerDecision("POSITIVE ISOLATION ENFORCED & APPROVED")}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      APPROVE LOCKDOWN ORDER
                    </button>
                    <button
                      onClick={() => setOfficerDecision("FIELD CLARIFICATION REQUESTED")}
                      className={`w-full py-1.5 rounded-lg border flex items-center justify-center gap-1.5 transition-all text-xs font-semibold ${t.btnSecondary}`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Request Field Verification
                    </button>
                  </div>
                )}

                {/* STRICT REGULATORY AUDIT REPORT GATE: UNLOCKED ONLY AFTER OFFICER SIGN-OFF */}
                <div className={`pt-2.5 border-t ${t.divider} space-y-2`}>
                  {!officerDecision ? (
                    /* LOCKED REPORT BANNER */
                    <div
                      className={`p-3 rounded-xl border-2 border-dashed text-center space-y-1.5 transition-all ${
                        isLight
                          ? "bg-amber-50/70 border-amber-300 text-slate-800"
                          : "bg-amber-950/20 border-amber-600/40 text-amber-200"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                        <Lock className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="text-[11px] font-black uppercase tracking-wider text-amber-500">
                        Regulatory Audit Report Locked
                      </div>
                      <p className={`text-[10px] leading-tight ${t.textMuted}`}>
                        Per DGMS Level-4 statutory compliance, the official incident report is locked until the Chief Safety Officer reviews evidence and executes a signed lockdown order above.
                      </p>
                      <div className="text-[9px] font-mono text-amber-400 bg-amber-950/60 py-0.5 px-2 rounded border border-amber-700/50 inline-block">
                        Awaiting Officer Authorization ⬆️
                      </div>
                    </div>
                  ) : (
                    /* UNLOCKED & CERTIFIED REPORT CONTROLS */
                    <div
                      className={`p-2.5 rounded-xl border space-y-2 shadow-lg transition-all animate-in fade-in duration-300 ${
                        isLight
                          ? "bg-emerald-50/90 border-emerald-400 text-emerald-950"
                          : isPetroleum
                          ? "bg-[#092219] border-emerald-500/80 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          : isCyber
                          ? "bg-[#031c0e] border-emerald-500/80 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "bg-emerald-950/40 border-emerald-500/70 text-emerald-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>AUDIT REPORT CERTIFIED</span>
                        </div>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500 text-black">
                          DGMS COMPLIANT
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-300/80 font-mono">
                        Signed: {authenticatedOfficer?.badge_id || "OIL-CSO-8042"} • Ready for Export
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          onClick={() =>
                            downloadExcelReport(
                              {
                                ...activeScenario,
                                recalledFeature: isRecallCompleted ? activeScenario.recalledFeature : undefined,
                              },
                              officerDecision,
                              authenticatedOfficer
                            )
                          }
                          className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1 text-xs shadow-md transition-all active:scale-95"
                          title="Download official audit spreadsheet"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Excel (.csv)</span>
                        </button>

                        <button
                          onClick={() =>
                            printPDFReport(
                              {
                                ...activeScenario,
                                recalledFeature: isRecallCompleted ? activeScenario.recalledFeature : undefined,
                              },
                              officerDecision,
                              authenticatedOfficer
                            )
                          }
                          className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1 text-xs shadow-md transition-all active:scale-95"
                          title="Print or save executive PDF report"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print PDF</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setShowFinalReport(true)}
                        className={`w-full py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${t.btnSecondary}`}
                      >
                        <FileText className="w-3.5 h-3.5 text-orange-500" />
                        <span>View Full Audit Record</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStepSelect(1)}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 mt-1 ${t.btnSecondary}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Presentation</span>
                </button>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* =====================================================================
          3. BOTTOM PIPELINE WORKFLOW PROGRESS BAR
      ===================================================================== */}
      <footer
        className={`h-11 sm:h-12 border-t px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 backdrop-blur transition-colors duration-300 ${t.footerBg}`}
      >
        {/* Workflow Pipeline Stepper Bar */}
        <div className="flex-1 max-w-3xl">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep >= 1
                    ? "bg-emerald-600 text-white"
                    : isLight
                    ? "bg-slate-200 text-slate-500"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                ✓
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 1
                    ? isCyber
                      ? "text-emerald-400 font-bold"
                      : isPetroleum
                      ? "text-amber-400 font-bold"
                      : "text-orange-500 font-bold"
                    : isLight
                    ? "text-slate-700"
                    : isPetroleum
                    ? "text-amber-200/80"
                    : isCyber
                    ? "text-emerald-200/80"
                    : "text-slate-300"
                }`}
              >
                1. Baseline
              </span>
            </div>
            <div
              className={`h-0.5 flex-1 mx-2 ${
                currentStep >= 2
                  ? isCyber
                    ? "bg-emerald-500"
                    : "bg-emerald-600"
                  : isLight
                  ? "bg-slate-200"
                  : isPetroleum
                  ? "bg-amber-900/40"
                  : isCyber
                  ? "bg-emerald-950"
                  : "bg-slate-800"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep >= 2
                    ? "bg-emerald-600 text-white"
                    : isLight
                    ? "bg-slate-200 text-slate-500"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                ✓
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 2
                    ? isCyber
                      ? "text-emerald-400 font-bold"
                      : isPetroleum
                      ? "text-amber-400 font-bold"
                      : "text-orange-500 font-bold"
                    : isLight
                    ? "text-slate-700"
                    : isPetroleum
                    ? "text-amber-200/80"
                    : isCyber
                    ? "text-emerald-200/80"
                    : "text-slate-300"
                }`}
              >
                2. Ingestion
              </span>
            </div>
            <div
              className={`h-0.5 flex-1 mx-2 ${
                currentStep >= 3
                  ? isCyber
                    ? "bg-emerald-500"
                    : "bg-emerald-600"
                  : isLight
                  ? "bg-slate-200"
                  : isPetroleum
                  ? "bg-amber-900/40"
                  : isCyber
                  ? "bg-emerald-950"
                  : "bg-slate-800"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep >= 3
                    ? "bg-emerald-600 text-white"
                    : isLight
                    ? "bg-slate-200 text-slate-500"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                ✓
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 3
                    ? isCyber
                      ? "text-emerald-400 font-bold"
                      : isPetroleum
                      ? "text-amber-400 font-bold"
                      : "text-orange-500 font-bold"
                    : isLight
                    ? "text-slate-700"
                    : isPetroleum
                    ? "text-amber-200/80"
                    : isCyber
                    ? "text-emerald-200/80"
                    : "text-slate-300"
                }`}
              >
                3. ML Discordance
              </span>
            </div>
            <div
              className={`h-0.5 flex-1 mx-2 ${
                currentStep >= 4
                  ? isCyber
                    ? "bg-emerald-500"
                    : "bg-emerald-600"
                  : isLight
                  ? "bg-slate-200"
                  : isPetroleum
                  ? "bg-amber-900/40"
                  : isCyber
                  ? "bg-emerald-950"
                  : "bg-slate-800"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep >= 4
                    ? "bg-emerald-600 text-white"
                    : isLight
                    ? "bg-slate-200 text-slate-500"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                ✓
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 4
                    ? isCyber
                      ? "text-emerald-400 font-bold"
                      : isPetroleum
                      ? "text-amber-400 font-bold"
                      : "text-orange-500 font-bold"
                    : isLight
                    ? "text-slate-700"
                    : isPetroleum
                    ? "text-amber-200/80"
                    : isCyber
                    ? "text-emerald-200/80"
                    : "text-slate-300"
                }`}
              >
                4. AI Investigation
              </span>
            </div>
            <div
              className={`h-0.5 flex-1 mx-2 ${
                currentStep === 5
                  ? isCyber
                    ? "bg-emerald-500 animate-pulse"
                    : isPetroleum
                    ? "bg-amber-500 animate-pulse"
                    : "bg-orange-500 animate-pulse"
                  : isLight
                  ? "bg-slate-200"
                  : isPetroleum
                  ? "bg-amber-900/40"
                  : isCyber
                  ? "bg-emerald-950"
                  : "bg-slate-800"
              }`}
            />

            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentStep === 5
                    ? isCyber
                      ? "bg-emerald-600 text-white shadow-[0_0_8px_#10b981]"
                      : isPetroleum
                      ? "bg-amber-600 text-white shadow-[0_0_8px_#f59e0b]"
                      : "bg-orange-600 text-white shadow-[0_0_8px_#ea580c]"
                    : isLight
                    ? "bg-slate-200 text-slate-500"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                👤
              </div>
              <span
                className={`text-xs font-bold ${
                  currentStep === 5
                    ? isCyber
                      ? "text-emerald-400"
                      : isPetroleum
                      ? "text-amber-400"
                      : "text-orange-500"
                    : isLight
                    ? "text-slate-700"
                    : isPetroleum
                    ? "text-amber-200/80"
                    : isCyber
                    ? "text-emerald-200/80"
                    : "text-slate-300"
                }`}
              >
                5. Human Sign-Off
              </span>
            </div>
          </div>
        </div>

        {/* Focus zone pill */}
        <div className={`pl-6 border-l text-xs hidden md:block ${t.divider}`}>
          <div className={`text-[10px] font-semibold uppercase tracking-wider ${t.textMuted}`}>FOCAL ASSET</div>
          <div className={`font-bold text-xs ${t.textHeading}`}>{activeScenario.zone}</div>
        </div>
      </footer>

      {/* =====================================================================
          4. COMPREHENSIVE FINAL AUDIT REPORT MODAL (PDF & EXCEL EXPORT)
      ===================================================================== */}
      {showFinalReport && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 lg:p-8">
          <div
            className={`w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 ${
              isLight
                ? "bg-white border-slate-300 text-slate-900"
                : isPetroleum
                ? "bg-[#091629] border-amber-600/80 text-amber-50"
                : isCyber
                ? "bg-[#030a06] border-emerald-500/80 text-emerald-50"
                : "bg-[#0c121e] border-orange-500/80 text-white"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isLight
                  ? "bg-slate-50 border-slate-200"
                  : isPetroleum
                  ? "bg-[#06101e] border-amber-900/50"
                  : isCyber
                  ? "bg-[#010603] border-emerald-900/60"
                  : "bg-[#090e18] border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                    isReportUnlocked
                      ? "bg-orange-600/20 border-orange-500 text-orange-500"
                      : "bg-amber-500/20 border-amber-500 text-amber-500"
                  }`}
                >
                  {isReportUnlocked ? (
                    <FileText className="w-6 h-6 text-orange-500" />
                  ) : (
                    <Lock className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide text-white ${
                        isReportUnlocked ? "bg-orange-600" : "bg-amber-600"
                      }`}
                    >
                      {isReportUnlocked
                        ? "OIL INDIA LIMITED • SIF AUDIT"
                        : "DGMS LEVEL-4 RESTRICTED"}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {isDemoActive && currentStep > 1
                        ? `ID: ${activeScenario.incidentNumber}`
                        : "SUPERVISORY STANDBY"}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-bold mt-0.5 tracking-tight ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {isReportUnlocked
                      ? "FINAL INVESTIGATION & REGULATORY SIF AUDIT REPORT"
                      : "STATUTORY REGULATORY AUDIT REPORT • RESTRICTED ACCESS"}
                  </h3>
                </div>
              </div>

              {/* Action Buttons in Modal Header */}
              <div className="flex items-center gap-2">
                {isReportUnlocked && (
                  <>
                    <button
                      onClick={() =>
                        downloadExcelReport(
                          {
                            ...activeScenario,
                            recalledFeature: isRecallCompleted
                              ? activeScenario.recalledFeature
                              : undefined,
                          },
                          officerDecision,
                          authenticatedOfficer
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                      title="Download report as CSV / Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">Download Excel</span>
                    </button>

                    <button
                      onClick={() =>
                        printPDFReport(
                          {
                            ...activeScenario,
                            recalledFeature: isRecallCompleted
                              ? activeScenario.recalledFeature
                              : undefined,
                          },
                          officerDecision,
                          authenticatedOfficer
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                      title="Download / Print styled PDF"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowFinalReport(false)}
                  className={`p-1.5 rounded-lg text-xs flex items-center border transition-all ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                  title="Close Report"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Complete Report Layout OR Locked Compliance Gate */}
            {!isReportUnlocked ? (
              <div className="p-8 overflow-y-auto space-y-6 text-center max-w-2xl mx-auto my-auto text-xs">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center mx-auto text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <Lock className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                    Statutory DGMS Compliance Protocol
                  </span>
                  <h3 className={`text-xl font-extrabold ${t.textHeading}`}>
                    Regulatory Audit Report Locked
                  </h3>
                  <p className={`text-xs leading-relaxed max-w-lg mx-auto ${t.textMuted}`}>
                    Per Directorate General of Mines Safety (DGMS) Level-4 compliance and OISD-156 mandates, comprehensive incident forensic records, barrier failure audits, and exportable regulatory ledgers are strictly restricted until an authenticated Chief Safety Officer completes the investigation and signs off in Step 5.
                  </p>
                </div>

                {/* Requirements Checklist */}
                <div className={`p-4 rounded-xl border text-left space-y-2.5 max-w-md mx-auto ${t.cardBg}`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Audit Verification Pipeline
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Continuous Plant Telemetry
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">NOMINAL</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isDemoActive ? "bg-emerald-500" : "bg-slate-500"}`} />
                      SIF Incident Ingestion
                    </span>
                    <span className={`font-bold font-mono ${isDemoActive ? "text-emerald-400" : "text-slate-500"}`}>
                      {isDemoActive ? activeScenario.incidentNumber : "PENDING DEMO"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${currentStep >= 3 ? "bg-emerald-500" : "bg-slate-500"}`} />
                      Severity Discordance Analysis
                    </span>
                    <span className={`font-bold font-mono ${currentStep >= 3 ? "text-emerald-400" : "text-slate-500"}`}>
                      {currentStep >= 3 ? `${activeScenario.discordanceGap}% GAP` : "PENDING"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isRecallCompleted ? "bg-emerald-500" : "bg-slate-500"}`} />
                      Latent Barrier &amp; Deep Recall
                    </span>
                    <span className={`font-bold font-mono ${isRecallCompleted ? "text-emerald-400" : "text-slate-500"}`}>
                      {isRecallCompleted ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${officerDecision ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                      CSO Regulatory Sign-Off
                    </span>
                    <span className={`font-bold font-mono ${officerDecision ? "text-emerald-400" : "text-amber-400"}`}>
                      {officerDecision ? "AUTHORIZED" : "AWAITING SIGN-OFF"}
                    </span>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="pt-2">
                  {!isDemoActive ? (
                    <button
                      onClick={() => {
                        setShowFinalReport(false);
                        setIsDemoActive(true);
                        setCurrentStep(2);
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all inline-flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>INGEST INCIDENT &amp; START DEMO</span>
                    </button>
                  ) : currentStep < 5 ? (
                    <button
                      onClick={() => {
                        setShowFinalReport(false);
                        setCurrentStep(5);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all inline-flex items-center gap-2"
                    >
                      <span>Proceed to Step 5: Officer Sign-Off</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <p className="text-xs text-amber-400 font-semibold">
                      Please select an enforcement order in the Step 5 side panel to certify and release this report.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Executive Summary Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${t.cardBg}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                    EXECUTIVE AUDIT SUMMARY
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                      activeScenario.classification === "SIF PRECURSOR"
                        ? "bg-orange-500/20 text-orange-500 border-orange-500"
                        : "bg-red-500/20 text-red-500 border-red-500"
                    }`}
                  >
                    {activeScenario.classification}
                  </span>
                </div>
                <h4 className={`text-base font-bold ${t.textHeading}`}>
                  {activeScenario.title}
                </h4>
                <p className={`leading-relaxed text-xs ${t.textBody}`}>
                  {activeScenario.narrative}
                </p>
              </div>

              {/* SECTION 1: Key Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${t.cardBg}`}>
                  <span className={`text-[10px] block font-bold uppercase ${t.textMuted}`}>ACTUAL CONSEQUENCE</span>
                  <span className="font-extrabold text-emerald-500 text-sm mt-0.5 block">{activeScenario.actualSeverity}</span>
                  <span className={`text-[11px] block truncate ${t.textMuted}`}>{activeScenario.actualDescription}</span>
                </div>
                <div className={`p-3 rounded-xl border ${t.cardBg}`}>
                  <span className={`text-[10px] block font-bold uppercase ${t.textMuted}`}>POTENTIAL SIF</span>
                  <span className="font-extrabold text-red-500 text-sm mt-0.5 block">{activeScenario.potentialSeverity}</span>
                  <span className={`text-[11px] block truncate ${t.textMuted}`}>{activeScenario.potentialOutcome}</span>
                </div>
                <div className={`p-3 rounded-xl border ${t.cardBg}`}>
                  <span className={`text-[10px] block font-bold uppercase ${t.textMuted}`}>SEVERITY GAP</span>
                  <span className="font-extrabold text-orange-500 text-sm mt-0.5 block">{activeScenario.discordanceGap}% GAP</span>
                  <span className={`text-[11px] block ${t.textMuted}`}>{activeScenario.discordanceStatus} DISCORDANCE</span>
                </div>
                <div className={`p-3 rounded-xl border ${t.cardBg}`}>
                  <span className={`text-[10px] block font-bold uppercase ${t.textMuted}`}>AI CONFIDENCE</span>
                  <span className="font-extrabold text-cyan-500 text-sm mt-0.5 block">92% Composite</span>
                  <span className={`text-[11px] block ${t.textMuted}`}>Deterministic Rule</span>
                </div>
              </div>

              {/* SECTION 2: Safety Signal Ontology */}
              <div className={`p-4 rounded-xl border space-y-2 ${t.cardBg}`}>
                <span className="text-[11px] text-cyan-500 font-bold uppercase tracking-wider block">
                  Phase 3 • Safety Signal Ontology Extraction
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className={`${t.textMuted} font-medium`}>Hazard Energy: </span>
                    <span className={`font-bold ${t.textHeading}`}>{activeScenario.energyType}</span>
                  </div>
                  <div>
                    <span className={`${t.textMuted} font-medium`}>Worker Exposure: </span>
                    <span className={`font-bold ${t.textHeading}`}>{activeScenario.exposureLevel}</span>
                  </div>
                  <div>
                    <span className={`${t.textMuted} font-medium`}>Target Asset: </span>
                    <span className={`font-bold ${t.textHeading}`}>{activeScenario.equipment}</span>
                  </div>
                  <div>
                    <span className={`${t.textMuted} font-medium`}>Plant Sector: </span>
                    <span className={`font-bold ${t.textHeading}`}>{activeScenario.zone}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Barrier Integrity Audit Table */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${t.cardBg}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-orange-500 font-bold uppercase tracking-wider">
                    Phase 8 • Barrier Integrity Audit (SOP-402 Standard)
                  </span>
                  <span className={`text-xs font-medium ${t.textMuted}`}>
                    {activeScenario.barriers.filter((b) => b.status !== "FUNCTIONING").length +
                      (isRecallCompleted && activeScenario.recalledFeature?.detected ? 1 : 0)}{" "}
                    Non-Compliant
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {activeScenario.barriers.map((barrier, bIdx) => (
                    <div
                      key={bIdx}
                      className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        barrier.status === "FAILED" || barrier.status === "ABSENT"
                          ? isLight
                            ? "bg-red-50/70 border-red-200"
                            : "bg-red-950/30 border-red-800/50"
                          : isLight
                          ? "bg-emerald-50/70 border-emerald-200"
                          : "bg-emerald-950/30 border-emerald-800/50"
                      }`}
                    >
                      <div>
                        <span className={`font-bold ${t.textHeading}`}>{barrier.name}</span>
                        <p className={`text-xs mt-0.5 leading-relaxed ${t.textMuted}`}>
                          {barrier.detail}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 self-start sm:self-center ${
                          barrier.status === "FAILED" || barrier.status === "ABSENT"
                            ? isLight
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : "bg-red-950 text-red-300 border border-red-700"
                            : isLight
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-700"
                        }`}
                      >
                        {barrier.status} {barrier.status === "FUNCTIONING" ? "✓" : "❌"}
                      </span>
                    </div>
                  ))}

                  {/* RECALLED LATENT BARRIER (Modal Audit Table) */}
                  {isRecallCompleted &&
                    activeScenario.recalledFeature?.detected &&
                    activeScenario.recalledFeature.barrierImpact && (
                      <div
                        className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isLight
                            ? "bg-amber-50/90 border-amber-300 text-amber-950"
                            : "bg-amber-950/40 border-amber-500/70 text-amber-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-amber-500 flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              {activeScenario.recalledFeature.barrierImpact.name}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed opacity-90">
                            {activeScenario.recalledFeature.barrierImpact.detail}
                          </p>
                          <span className="text-[10px] font-mono opacity-75 mt-0.5 block">
                            Source: {activeScenario.recalledFeature.telemetrySource}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 self-start sm:self-center bg-amber-500 text-black">
                          RECALLED BY AI • {activeScenario.recalledFeature.barrierImpact.status} ❌
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* SECTION 3B: AI Deep Feature Recall Discovery */}
              {isRecallCompleted && activeScenario.recalledFeature?.detected && (
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isLight
                      ? "bg-amber-50/90 border-amber-400 text-amber-950"
                      : "bg-amber-950/40 border-amber-500/80 text-amber-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Section 3B • AI Deep Feature Recall &amp; Latent Precursor Discovery
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500 text-black">
                      RECOVERED PRECURSOR
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-amber-400">
                    {activeScenario.recalledFeature.featureName}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-amber-500/20">
                    <div>
                      <span className="font-bold text-red-400 block text-[10px] uppercase">
                        Why Initial AI Pass Missed It:
                      </span>
                      <p className="text-[11px] opacity-90 leading-tight mt-0.5">
                        {activeScenario.recalledFeature.missedReason}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-400 block text-[10px] uppercase">
                        What 2nd-Order Deep Recall Uncovered:
                      </span>
                      <p className="text-[11px] opacity-90 leading-tight mt-0.5">
                        {activeScenario.recalledFeature.recalledEvidence}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono opacity-80 pt-1 border-t border-amber-500/20">
                    Telemetry Attribution: {activeScenario.recalledFeature.telemetrySource}
                  </div>
                </div>
              )}

              {/* SECTION 4: Autonomous LangGraph RAG Precedent */}
              <div className={`p-4 rounded-xl border space-y-1.5 ${t.cardBg}`}>
                <span className="text-[11px] text-cyan-500 font-bold uppercase tracking-wider block">
                  LangGraph Autonomous RAG Historical Precedent
                </span>
                <div className={`text-xs font-bold ${t.textHeading}`}>
                  Matched Reference Case: {activeScenario.ragMatch.id} ({activeScenario.ragMatch.similarity}% Vector Similarity)
                </div>
                <p className={`text-xs leading-relaxed ${t.textBody}`}>
                  {activeScenario.ragMatch.description}
                </p>
              </div>

              {/* SECTION 5: Safety Officer Sign-Off & Regulatory Enforcement */}
              <div
                className={`p-4 rounded-xl border-2 space-y-2 ${
                  officerDecision
                    ? isLight
                      ? "bg-emerald-50/80 border-emerald-500"
                      : "bg-emerald-950/40 border-emerald-500"
                    : isLight
                    ? "bg-amber-50/80 border-amber-500"
                    : "bg-amber-950/40 border-amber-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                    MANDATORY ENFORCEMENT &amp; HUMAN SIGN-OFF
                  </span>
                  <span className={`text-xs font-mono ${t.textMuted}`}>
                    ORDER: {activeScenario.orderNumber}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${t.textBody}`}>
                  {activeScenario.recommendedAction}
                </p>

                <div className={`pt-2 border-t ${t.divider} space-y-1 text-xs`}>
                  <div className="flex items-center justify-between">
                    <span className={`${t.textMuted} font-medium`}>Authorized Safety Officer:</span>
                    <span className="font-bold">
                      {authenticatedOfficer?.name || "Concerned Safety Official"} ({authenticatedOfficer?.badge_id || "OIL-CSO-8042"})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${t.textMuted} font-medium`}>Clearance / Jurisdiction:</span>
                    <span className="font-mono text-[11px] opacity-80">
                      {authenticatedOfficer?.clearance_level || "DGMS Level-4"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`${t.textMuted} font-medium`}>Sign-Off Status:</span>
                    <span className="font-bold text-emerald-500">
                      {officerDecision ? officerDecision : "PENDING HUMAN SAFETY OFFICER ACTION"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Modal Footer */}
            <div
              className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isLight
                  ? "bg-slate-100 border-slate-200"
                  : isPetroleum
                  ? "bg-[#06101e] border-amber-900/50"
                  : isCyber
                  ? "bg-[#010603] border-emerald-900/60"
                  : "bg-[#090e18] border-slate-800"
              }`}
            >
              <div className="text-xs text-slate-500 font-mono text-center sm:text-left">
                {isReportUnlocked
                  ? `Audit Hash: SHA256-${activeScenario.incidentNumber.replace("#", "")}-9042-EHS`
                  : "DGMS Audit Lock: PENDING-LEGAL-AUTHORIZATION"}
              </div>

              <div className="flex items-center gap-2">
                {isReportUnlocked && (
                  <>
                    <button
                      onClick={() =>
                        downloadExcelReport(
                          activeScenario,
                          officerDecision,
                          authenticatedOfficer
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel (.csv)</span>
                    </button>
                    <button
                      onClick={() =>
                        printPDFReport(
                          activeScenario,
                          officerDecision,
                          authenticatedOfficer
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>PDF Report</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowFinalReport(false)}
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. DETAILED SAFETY OPERATING PROCEDURE (SOP-402) MODAL
      ===================================================================== */}
      {showProcedure && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6">
          <div
            className={`w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 ${
              isLight
                ? "bg-white border-orange-500 text-slate-900"
                : isPetroleum
                ? "bg-[#091629] border-amber-500/80 text-amber-50"
                : isCyber
                ? "bg-[#030a06] border-emerald-500/80 text-emerald-50"
                : "bg-[#0c121e] border-orange-500/80 text-white"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isLight
                  ? "bg-slate-50 border-slate-200"
                  : isPetroleum
                  ? "bg-[#06101e] border-amber-900/50"
                  : isCyber
                  ? "bg-[#010603] border-emerald-900/60"
                  : "bg-[#090e18] border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-950 border border-orange-600 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-900/60 text-orange-300 border border-orange-700 font-bold">
                      OIL INDIA LIMITED | SAFETY STANDARD
                    </span>
                    <span className="text-xs text-slate-400">DOC: SOP-OI-OFF-MNT-402 (Rev. 4)</span>
                  </div>
                  <h3 className={`text-sm font-bold mt-0.5 tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                    {activeScenario.equipment.toUpperCase()} MAINTENANCE &amp; LOTO PROTOCOL
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowProcedure(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                  isLight
                    ? "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
                }`}
              >
                <XCircle className="w-4 h-4" /> CLOSE
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Equipment Metadata */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border text-xs ${t.cardBg}`}
              >
                <div>
                  <span className={`${t.textMuted} font-semibold block text-[10px] uppercase`}>ASSET ID</span>
                  <span className={`font-bold mt-0.5 block ${t.textHeading}`}>{activeScenario.equipment}</span>
                </div>
                <div>
                  <span className={`${t.textMuted} font-semibold block text-[10px] uppercase`}>HAZARD ENERGY</span>
                  <span className="font-bold text-red-500 mt-0.5 block">{activeScenario.energyType}</span>
                </div>
                <div>
                  <span className={`${t.textMuted} font-semibold block text-[10px] uppercase`}>PLANT ZONE</span>
                  <span className="font-bold text-orange-500 mt-0.5 block">{activeScenario.zone}</span>
                </div>
                <div>
                  <span className={`${t.textMuted} font-semibold block text-[10px] uppercase`}>ACTION ORDER</span>
                  <span className="font-bold text-cyan-500 mt-0.5 block">{activeScenario.orderNumber}</span>
                </div>
              </div>

              {/* Step-by-Step Procedure Checklist */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between ${t.textMuted}`}>
                  <span>Mandatory Energy Isolation Sequence</span>
                  <span className="text-red-500 text-[11px] font-bold">
                    ⚠️ {activeScenario.barriers.filter((b) => b.status !== "FUNCTIONING").length} BARRIERS COMPROMISED
                  </span>
                </h4>

                <div className="space-y-2">
                  <div
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${t.cardSubtleBg}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                      <div>
                        <span className={`font-bold text-xs ${t.textHeading}`}>Work Area Permitting &amp; Shift Handover</span>
                        <p className={`text-xs mt-0.5 leading-relaxed ${t.textMuted}`}>
                          Control room notified, valid work permit verified, standby safety technician stationed.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold text-[10px] shrink-0">
                      COMPLETED ✓
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${t.cardSubtleBg}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                      <div>
                        <span className={`font-bold text-xs ${t.textHeading}`}>Electrical Drive Isolation (LOTO)</span>
                        <p className={`text-xs mt-0.5 leading-relaxed ${t.textMuted}`}>
                          Primary feeder breaker racked out at MCC; Safety Padlock applied with Danger Tag.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600 font-bold text-[10px] shrink-0">
                      COMPLETED ✓
                    </span>
                  </div>

                  {activeScenario.barriers.map((barrier, bIdx) => (
                    <div
                      key={bIdx}
                      className={`p-3 rounded-xl border-2 flex items-start justify-between gap-3 ${
                        barrier.status === "FAILED" || barrier.status === "ABSENT"
                          ? isLight
                            ? "bg-red-50 border-red-400"
                            : "bg-red-950/40 border-red-600"
                          : isLight
                          ? "bg-emerald-50 border-emerald-400"
                          : "bg-emerald-950/40 border-emerald-600"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                            barrier.status === "FAILED" || barrier.status === "ABSENT"
                              ? "bg-red-950 text-red-400"
                              : "bg-emerald-950 text-emerald-400"
                          }`}
                        >
                          {bIdx + 3}
                        </span>
                        <div>
                          <span
                            className={`font-bold text-xs ${
                              barrier.status === "FAILED" || barrier.status === "ABSENT" ? "text-red-600" : "text-emerald-600"
                            }`}
                          >
                            {barrier.name}
                          </span>
                          <p className={`text-xs mt-0.5 leading-relaxed ${t.textBody}`}>
                            {barrier.detail}
                          </p>
                          {barrier.status !== "FUNCTIONING" && (
                            <p className="text-red-600 font-bold text-[11px] mt-1">
                              🚨 FAILURE IDENTIFIED: Barrier {barrier.status.toLowerCase()} during activity!
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                          barrier.status === "FAILED" || barrier.status === "ABSENT"
                            ? "bg-red-900 text-red-100 border border-red-400 animate-pulse"
                            : "bg-emerald-950 text-emerald-400 border border-emerald-600"
                        }`}
                      >
                        {barrier.status} {barrier.status === "FUNCTIONING" ? "✓" : "❌"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnostic Rationale */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  isLight
                    ? "bg-orange-50 border-orange-300 text-slate-800"
                    : "bg-gradient-to-r from-orange-950/60 to-slate-900 border-orange-500/80 text-slate-300"
                }`}
              >
                <span className="text-orange-600 font-bold uppercase tracking-wider block text-[11px]">
                  🧠 SentinelSIF Precursor Diagnostic
                </span>
                <p className="leading-relaxed text-xs">
                  Because consequence was categorized as {activeScenario.actualSeverity}, traditional safety systems classified this event as a <strong className="text-emerald-600">Low Severity Routine Near Miss</strong>. SentinelSIF analyzed the energy pathway and barrier telemetry, revealing compromised barriers. SentinelSIF immediately flagged the discordance: <strong>LOW ACTUAL + CRITICAL POTENTIAL = {activeScenario.classification}</strong>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`p-4 border-t flex items-center justify-between ${
                isLight
                  ? "bg-slate-50 border-slate-200"
                  : isPetroleum
                  ? "bg-[#06101e] border-amber-900/50"
                  : isCyber
                  ? "bg-[#010603] border-emerald-900/60"
                  : "bg-[#090e18] border-slate-800"
              }`}
            >
              <span className="text-xs text-slate-500 font-mono">
                Audit Hash: SHA256-OI-2026-9042-SOP | Certified Oil India Safety Intelligence System
              </span>
              <button
                onClick={() => setShowProcedure(false)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all"
              >
                RETURN TO COMMAND CENTER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Hazard Intelligence & Reporting Hub Modal */}
      <HazardReportingHub
        isOpen={showHazardHub}
        onClose={() => setShowHazardHub(false)}
        theme={theme}
        authenticatedOfficer={authenticatedOfficer}
      />

      {/* Judges Q&A Defense Panel Modal */}
      <JudgesDefenseModal
        isOpen={showJudgesDefense}
        onClose={() => setShowJudgesDefense(false)}
        theme={theme}
      />

      {/* Live Physics & Barrier Stress Sandbox Modal */}
      <PhysicsStressSimulator
        isOpen={showPhysicsSimulator}
        onClose={() => setShowPhysicsSimulator(false)}
        theme={theme}
        onStateChange={setActivePhysicsState}
      />

      {/* Live Custom Incident Ingestion & AI Triage Lab Modal */}
      <LiveIncidentLabModal
        isOpen={showIncidentLab}
        onClose={() => setShowIncidentLab(false)}
        theme={theme}
        onInjectScenario={(customScen) => {
          setCustomInjectedScenario(customScen);
          setIsDemoActive(true);
          setCurrentStep(3); // Jump to discordance phase so the user immediately sees the AI evaluation
          setOfficerDecision(null);
        }}
      />

      {/* Ultrasonic Acoustic AI Spectrogram Modal */}
      <AcousticSpectrogramModal
        isOpen={showAcousticModal}
        onClose={() => setShowAcousticModal(false)}
        theme={theme}
      />

      {/* Autonomous Multi-Agent Swarm Reasoning Terminal */}
      <AgentSwarmTerminal
        isOpen={showAgentTerminal}
        onClose={() => setShowAgentTerminal(false)}
        theme={theme}
      />

      {/* High-Resolution Diagnostic Camera & FLIR Viewport Modal */}
      {showImageZoom && (
        <div
          onClick={() => setShowImageZoom(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#080d18] border border-cyan-500/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0c1424]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono text-xs font-bold text-cyan-400">
                  PTZ CAMERA DIAGNOSTIC • {activeScenario.equipment}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => setFeedViewMode("optical")}
                    className={`px-3 py-1 rounded transition-all ${
                      feedViewMode === "optical" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    OPTICAL HD
                  </button>
                  <button
                    onClick={() => setFeedViewMode("thermal")}
                    className={`px-3 py-1 rounded transition-all ${
                      feedViewMode === "thermal" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    FLIR IR THERMAL
                  </button>
                </div>
                <button
                  onClick={() => setShowImageZoom(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Main Image with HUD */}
            <div className="relative aspect-video bg-black overflow-hidden">
              <img
                src={
                  feedViewMode === "thermal"
                    ? activeScenario.thermalImageUrl || activeScenario.imageUrl
                    : activeScenario.imageUrl
                }
                alt={activeScenario.equipment}
                className="w-full h-full object-cover"
              />
              {/* Laser scanline */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-scanline pointer-events-none" />

              {/* HUD Crosshairs */}
              <div className="absolute top-4 left-4 font-mono text-xs text-cyan-300 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/40 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  TARGET ACQUIRED: {activeScenario.equipment}
                </div>
                <div className="text-[11px] text-slate-300">
                  LOCATION: {activeScenario.zone} • {activeScenario.zoneId}
                </div>
                <div className="text-[11px] text-amber-400">
                  PEAK TEMPERATURE: 142.6°C (FLIR Delta: +74.2°C)
                </div>
                <div className="text-[11px] text-red-400">
                  HAZARDOUS ENVELOPE: {activeScenario.energyType}
                </div>
              </div>

              <div className="absolute bottom-4 right-4 font-mono text-xs text-slate-300 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 space-y-0.5 text-right">
                <div>TIME: {currentTime}</div>
                <div className="text-emerald-400">STATUS: LIVE TELEMETRY STREAMING</div>
                <div className="text-slate-400">DGMS-L4-CERTIFIED AUDIT VIEWPORT</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
