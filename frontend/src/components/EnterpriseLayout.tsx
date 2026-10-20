"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Globe,
  Bot,
  Sliders,
  Volume2,
  VolumeX,
  FileCheck,
  ShieldCheck,
  Palette,
  ChevronRight,
  ChevronDown,
  Sparkles,
  LogOut,
  Flame,
  Search,
  Command,
  X,
  ArrowRight,
} from "lucide-react";
import { INCIDENT_SCENARIOS, IncidentScenario } from "../data/incidentScenarios";
import AuthGateway, { OfficerProfile, ThemeMode } from "./AuthGateway";
import { PhysicsSimulationState } from "./PhysicsStressSimulator";
import DigitalTwinView from "./views/DigitalTwinView";
import IncidentLabView from "./views/IncidentLabView";
import PhysicsSandboxView from "./views/PhysicsSandboxView";
import AcousticDiagnosticView from "./views/AcousticDiagnosticView";
import ComplianceAuditView from "./views/ComplianceAuditView";
import { sound } from "../utils/audioHaptics";

export type EnterpriseView =
  | "digital_twin"
  | "incident_lab"
  | "physics_sandbox"
  | "acoustic_array"
  | "compliance_audit";

export default function EnterpriseLayout() {
  // Theme state - Default to high-tech Light theme as requested
  const [theme, setTheme] = useState<ThemeMode>("light");
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  // Authentication State
  const [authenticatedOfficer, setAuthenticatedOfficer] = useState<OfficerProfile | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Command Palette State (Ctrl+K)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [paletteQuery, setPaletteQuery] = useState<string>("");

  // Audio Haptics Mute State - Default Muted
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Restore authenticated session from localStorage
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
      console.warn("Failed to restore session:", e);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAuthenticate = (officer: OfficerProfile) => {
    setAuthenticatedOfficer(officer);
    try {
      localStorage.setItem("sentinelsif_officer_session", JSON.stringify(officer));
    } catch (e) {}
  };

  const handleLogout = () => {
    sound.click();
    setAuthenticatedOfficer(null);
    try {
      localStorage.removeItem("sentinelsif_officer_session");
    } catch (e) {}
  };

  // Sync document element class for theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
    root.setAttribute("data-theme", theme);
  }, [theme]);

  // Active View State
  const [currentView, setCurrentView] = useState<EnterpriseView>("digital_twin");

  // Active Scenario State
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [customScenario, setCustomScenario] = useState<IncidentScenario | null>(null);
  const activeScenario = customScenario || INCIDENT_SCENARIOS[scenarioIndex] || INCIDENT_SCENARIOS[0];

  // Shared Physics Simulation State
  const [physicsState, setPhysicsState] = useState<PhysicsSimulationState | null>(null);

  // Auto-synthesis flag when entering Dossier
  const [autoSynthesizeDossier, setAutoSynthesizeDossier] = useState<boolean>(false);

  const handleTakeOutput = () => {
    sound.click();
    setAutoSynthesizeDossier(true);
    setCurrentView("compliance_audit");
  };

  const handleNavClick = (view: EnterpriseView) => {
    sound.click();
    setCurrentView(view);
  };

  // Positional Access Control
  if (!authChecked || !authenticatedOfficer) {
    return (
      <AuthGateway
        theme={theme}
        onThemeChange={setTheme}
        onAuthenticate={handleAuthenticate}
      />
    );
  }

  // Filtered command palette items
  const commandItems = [
    {
      id: "view-dt",
      label: "3D Digital Twin View",
      category: "Navigation",
      action: () => setCurrentView("digital_twin"),
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: "view-lab",
      label: "AI Incident Multi-Agent Lab",
      category: "Navigation",
      action: () => setCurrentView("incident_lab"),
      icon: <Bot className="w-4 h-4 text-purple-400" />,
    },
    {
      id: "view-physics",
      label: "Hopkinson Blast Physics Sandbox",
      category: "Navigation",
      action: () => setCurrentView("physics_sandbox"),
      icon: <Sliders className="w-4 h-4 text-orange-400" />,
    },
    {
      id: "view-acoustic",
      label: "Ultrasonic Acoustic Array (38.4 kHz)",
      category: "Navigation",
      action: () => setCurrentView("acoustic_array"),
      icon: <Volume2 className="w-4 h-4 text-blue-400" />,
    },
    {
      id: "view-dossier",
      label: "DGMS Executive Safety Dossier & Audit Hub",
      category: "Navigation",
      action: () => setCurrentView("compliance_audit"),
      icon: <FileCheck className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "act-take-output",
      label: "Synthesize Live Regulatory Output Dossier",
      category: "Quick Action",
      action: handleTakeOutput,
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    },
    ...INCIDENT_SCENARIOS.map((scen, idx) => ({
      id: `scen-${scen.id}`,
      label: `Switch Scenario: ${scen.incidentNumber} - ${scen.shortName}`,
      category: "Incident Benchmark",
      action: () => {
        setCustomScenario(null);
        setScenarioIndex(idx);
      },
      icon: <Activity className="w-4 h-4 text-red-400" />,
    })),
  ].filter((item) =>
    item.label.toLowerCase().includes(paletteQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col w-screen h-screen overflow-hidden font-sans select-none transition-colors duration-300 relative ${
        isLight
          ? "bg-[#f8fafc] text-slate-900"
          : isPetroleum
          ? "bg-[#040a14] text-slate-100"
          : "bg-[#070b12] text-slate-100"
      }`}
    >
      {/* ATMOSPHERIC BACKGROUND RADIAL ACCENTS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* ===================================================================
          1. CLASSY ENTERPRISE TOP NAVIGATION (48px)
      =================================================================== */}
      <header
        className={`h-12 px-4 border-b flex items-center justify-between z-30 shrink-0 backdrop-blur-2xl transition-colors duration-300 ${
          isLight
            ? "bg-white/90 border-slate-200"
            : isPetroleum
            ? "bg-[#06101e]/90 border-amber-900/40"
            : "bg-[#080d17]/90 border-white/[0.08]"
        }`}
      >
        {/* Left: Oil India Limited Brand & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                OIL INDIA LIMITED
              </span>
              <span className="text-xs font-black tracking-tight mt-0.5">
                SENTINEL<span className={isPetroleum ? "text-amber-400" : "text-orange-500"}>SIF</span>
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Scenario Quick Selector */}
          <div className="relative flex items-center hidden md:flex">
            <select
              value={scenarioIndex}
              onChange={(e) => {
                sound.toggle();
                setCustomScenario(null);
                setScenarioIndex(Number(e.target.value));
              }}
              className={`text-xs font-semibold pl-2 pr-6 py-1 rounded-lg border appearance-none cursor-pointer transition-all max-w-[200px] truncate ${
                isLight
                  ? "bg-slate-100 border-slate-300 text-slate-800"
                  : "bg-white/[0.04] border-white/10 text-slate-200 hover:border-white/20"
              }`}
              title="Select Active Incident Case"
            >
              {INCIDENT_SCENARIOS.map((scen, idx) => (
                <option
                  key={scen.id}
                  value={idx}
                  className={isLight ? "bg-white text-slate-900" : "bg-[#0b1322] text-slate-100"}
                >
                  {scen.incidentNumber}: {scen.shortName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none opacity-50" />
          </div>

          {/* Quick Command Palette Trigger (Ctrl+K) */}
          <button
            onClick={() => {
              sound.click();
              setIsCommandPaletteOpen(true);
            }}
            className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] transition-all font-mono ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 shadow-sm"
                : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-400 hover:text-slate-200"
            }`}
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3 h-3" />
            <span>Search or jump...</span>
            <kbd className={`px-1.5 py-0.5 rounded border text-[9px] ${
              isLight ? "bg-white border-slate-300 text-slate-800 shadow-sm" : "bg-black/40 border-white/10"
            }`}>Ctrl+K</kbd>
          </button>
        </div>

        {/* Center: Sleek Nav Pill Switcher */}
        <nav
          className={`flex items-center gap-1 p-0.5 rounded-xl border backdrop-blur-xl ${
            isLight
              ? "bg-slate-100 border-slate-300 shadow-sm"
              : isPetroleum
              ? "bg-[#071324] border-amber-900/40"
              : "bg-white/[0.03] border-white/[0.08]"
          }`}
        >
          {/* 1. Digital Twin */}
          <button
            onClick={() => handleNavClick("digital_twin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === "digital_twin"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/[0.12] text-white shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">3D Twin</span>
          </button>

          {/* 2. Incident Lab */}
          <button
            onClick={() => handleNavClick("incident_lab")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === "incident_lab"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/[0.12] text-white shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Incident Lab</span>
          </button>

          {/* 3. Physics Sandbox */}
          <button
            onClick={() => handleNavClick("physics_sandbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === "physics_sandbox"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/[0.12] text-white shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">Physics</span>
          </button>

          {/* 4. Acoustic Array */}
          <button
            onClick={() => handleNavClick("acoustic_array")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === "acoustic_array"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/[0.12] text-white shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Acoustic</span>
          </button>

          {/* 5. Executive Safety Dossier & Audit */}
          <button
            onClick={() => {
              sound.click();
              setAutoSynthesizeDossier(false);
              setCurrentView("compliance_audit");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentView === "compliance_audit"
                ? isLight
                  ? "bg-white text-slate-900 shadow-sm"
                  : "bg-white/[0.12] text-white shadow-sm"
                : isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Executive Dossier</span>
          </button>
        </nav>

        {/* Right: Sound Toggle, Theme Dropdown, Take Output CTA, & Officer Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Audio Haptics Mute Button */}
          <button
            onClick={() => {
              const nextMuted = sound.toggleMute();
              setIsMuted(nextMuted);
              if (!nextMuted) sound.click();
            }}
            className={`p-1.5 rounded-lg border transition-all ${
              isMuted
                ? "bg-red-950/40 border-red-500/40 text-red-400"
                : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white"
            }`}
            title={isMuted ? "Audio Haptics Muted (Click to Unmute)" : "Audio Haptics Enabled (Click to Mute)"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Theme Dropdown */}
          <div className="relative flex items-center">
            <select
              value={theme}
              onChange={(e) => {
                sound.toggle();
                setTheme(e.target.value as ThemeMode);
              }}
              className={`text-xs font-semibold pl-2 pr-5 py-1 rounded-lg border appearance-none cursor-pointer transition-all ${
                isLight
                  ? "bg-slate-100 border-slate-300 text-slate-800"
                  : "bg-white/[0.04] border-white/10 text-slate-200"
              }`}
              title="Switch Visual Theme"
            >
              <option value="dark">Midnight</option>
              <option value="light">Titanium</option>
              <option value="petroleum">Petroleum</option>
            </select>
            <ChevronDown className="w-2.5 h-2.5 absolute right-1.5 pointer-events-none opacity-50" />
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* GLOBAL "TAKE OUTPUT" CTA BUTTON */}
          <button
            onClick={handleTakeOutput}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md shadow-orange-950/40 transition-all flex items-center gap-1.5 active:scale-95 animate-pulse hover:animate-none"
            title="Synthesize and take official executive safety intelligence output"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Take Output</span>
          </button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Officer Badge */}
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-medium ${
              isLight
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-white/[0.04] border-white/10 text-slate-200"
            }`}
            title={`Authorized CSO: ${authenticatedOfficer.name} (${authenticatedOfficer.badge_id})`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="hidden md:inline font-bold text-[11px]">
              {authenticatedOfficer.name.split(" ")[0]} &bull; CSO
            </span>

            <button
              onClick={handleLogout}
              className="p-1 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================================
          2. MAIN VIEWPORT (SEAMLESS VIEW ROUTING)
      =================================================================== */}
      <main className="flex-1 relative overflow-hidden">
        {currentView === "digital_twin" && (
          <DigitalTwinView
            theme={theme}
            activeScenario={activeScenario}
            physicsState={physicsState}
            onNavigateView={setCurrentView}
            onUpdatePhysics={setPhysicsState}
          />
        )}

        {currentView === "incident_lab" && (
          <IncidentLabView
            theme={theme}
            activeScenario={activeScenario}
            onInjectScenario={(newScen) => {
              setCustomScenario(newScen);
            }}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === "physics_sandbox" && (
          <PhysicsSandboxView
            theme={theme}
            physicsState={physicsState}
            onUpdatePhysics={setPhysicsState}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === "acoustic_array" && (
          <AcousticDiagnosticView
            theme={theme}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === "compliance_audit" && (
          <ComplianceAuditView
            theme={theme}
            activeScenario={activeScenario}
            officerProfile={authenticatedOfficer}
            physicsState={physicsState}
            autoSynthesize={autoSynthesizeDossier}
            onNavigateView={setCurrentView}
          />
        )}
      </main>

      {/* ===================================================================
          3. COMMAND PALETTE MODAL (CTRL+K)
      =================================================================== */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-in fade-in">
          <div
            className={`max-w-xl w-full rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
              isLight
                ? "bg-white border-slate-300 text-slate-800"
                : isPetroleum
                ? "bg-[#091526] border-amber-500/30 text-slate-100"
                : "bg-[#0d1524] border-white/20 text-slate-100"
            }`}
          >
            {/* Search Input */}
            <div className={`p-3 border-b flex items-center gap-3 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}>
              <Search className={`w-4 h-4 shrink-0 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Type a command, jump to view, or search scenario..."
                className={`w-full bg-transparent text-sm focus:outline-none font-sans ${
                  isLight ? "text-slate-900 placeholder:text-slate-500 font-medium" : "placeholder:text-slate-500"
                }`}
              />
              <button
                onClick={() => {
                  sound.click();
                  setIsCommandPaletteOpen(false);
                }}
                className={isLight ? "p-1 rounded-lg text-slate-500 hover:text-slate-900" : "p-1 rounded-lg text-slate-400 hover:text-white"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {commandItems.length === 0 ? (
                <div className={`p-4 text-center text-xs ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  No matching commands or benchmarks found.
                </div>
              ) : (
                commandItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.click();
                      item.action();
                      setIsCommandPaletteOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between group active:scale-99 ${
                      isLight ? "hover:bg-slate-100 text-slate-800" : "hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg border ${
                        isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-white/[0.04] border-white/[0.08]"
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <span className={`font-semibold text-xs block ${
                          isLight ? "text-slate-900 group-hover:text-cyan-800" : "text-slate-200 group-hover:text-white"
                        }`}>
                          {item.label}
                        </span>
                        <span className={`text-[10px] font-mono ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 transition-colors ${
                      isLight ? "text-slate-400 group-hover:text-cyan-700" : "text-slate-500 group-hover:text-cyan-400"
                    }`} />
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className={`p-2 border-t flex items-center justify-between text-[10px] font-mono px-3 ${
              isLight ? "border-slate-200 bg-slate-50 text-slate-600 font-semibold" : "border-white/10 bg-black/20 text-slate-400"
            }`}>
              <span>Navigate with mouse or click</span>
              <span>ESC to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
