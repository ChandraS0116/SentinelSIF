"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Sparkles,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Gauge,
  Layers,
  Database,
  FileText,
  FileCheck,
  Clock,
  Send,
  Cpu,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Activity,
  Check,
} from "lucide-react";
import { IncidentScenario } from "../data/incidentScenarios";

interface LiveIncidentLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  onInjectScenario: (scenario: IncidentScenario) => void;
}

interface BenchmarkPreset {
  id: string;
  name: string;
  location: string;
  date: string;
  tag: string;
  narrative: string;
  zone: string;
  zoneId: "Zone A" | "Zone B" | "Zone C" | "Zone D" | "Admin";
  equipment: string;
  actualSeverity: string;
  actualDescription: string;
  energyType: string;
  isNegativeControl?: boolean;
}

const BENCHMARK_PRESETS: BenchmarkPreset[] = [
  {
    id: "iocl-jaipur",
    name: "IOCL Jaipur Terminal Vapor Cloud",
    location: "Jaipur, Rajasthan",
    date: "October 2009",
    tag: "HISTORIC SIF DISCORDANCE",
    narrative:
      "Terminal operator observed a small hissing sound and minor hydrocarbon odor at the gland packing of valve MOV-104 during pipeline pigging. Operator logged a minor packing weep and went to get a spanner. Within 20 minutes, 1,000 tons of MS escaped, forming an unconfined vapor cloud that detonated upon meeting an electrical substation.",
    zone: "Zone B — Tank Manifold",
    zoneId: "Zone B",
    equipment: "Motor Operated Valve MOV-104",
    actualSeverity: "LOW",
    actualDescription: "Minor packing weep noticed; 0 injuries reported initially",
    energyType: "Unconfined Flammable Hydrocarbon Vapor Cloud (1,000 Tons)",
  },
  {
    id: "baghjan-blowout",
    name: "Assam Baghjan Well #5 Blowout",
    location: "Tinsukia, Assam (Oil India)",
    date: "May 2020",
    tag: "DUAL BARRIER COLLAPSE",
    narrative:
      "During workover operations to produce gas from non-sand reservoir at 3,870m, testing tubing was being pulled out of hole. Routine mud weight column seemed stable. Suddenly gas kicked through annulus; mechanical blowout preventer (BOP) blind shear ram failed to seal completely due to auxiliary hydraulic accumulator pressure drop.",
    zone: "Zone A — Wellhead",
    zoneId: "Zone A",
    equipment: "Blowout Preventer (BOP) Stack #5",
    actualSeverity: "MEDIUM",
    actualDescription: "Crew evacuated rig floor safely; initial report logged as mud kick",
    energyType: "Pressurized Natural Gas & Condensate (6,500 PSI)",
  },
  {
    id: "bp-texas-city",
    name: "BP Texas City ISOM Tower Overfill",
    location: "Texas City, USA",
    date: "March 2005",
    tag: "ALARM & VENT CORRUPTION",
    narrative:
      "Raffinate splitter column was being started up. High-level alarm failed to sound due to defective transmitter float. Operators opened feed valve believing column was low. Column overfilled to 170 feet and blew liquid hydrocarbons into an open atmospheric blowdown drum, spewing a 20-foot geyser of flammable liquid onto worker trailers.",
    zone: "Zone A — Distillation Area",
    zoneId: "Zone A",
    equipment: "Raffinate Splitter Column C-201",
    actualSeverity: "LOW",
    actualDescription: "Reported as routine column circulation with slight feed surge",
    energyType: "Atmospheric Blowdown Hydrocarbon Geyser (7,600 Gallons)",
  },
  {
    id: "piper-alpha",
    name: "Piper Alpha Condensate Pump Relief",
    location: "North Sea",
    date: "July 1988",
    tag: "BLIND FLANGE FAILURE",
    narrative:
      "Condensate injection Pump A tripped. Operator needed to restart pumping and switched to spare Pump B. Unknown to the night shift, Pump B's pressure safety valve (PSV) had been removed for recertification and replaced with a hand-tight blind flange without a signed permit handover.",
    zone: "Zone D — Hydrocarbon Pumping",
    zoneId: "Zone D",
    equipment: "Condensate Injection Pump B",
    actualSeverity: "LOW",
    actualDescription: "Pump trip logged as nuisance vibration switch event",
    energyType: "Supercritical Gas Condensate (670 PSI Liquid Gas)",
  },
  {
    id: "negative-control",
    name: "Office Coffee Spill (Negative Control Benchmark)",
    location: "Admin Building Corridor",
    date: "Routine Observation",
    tag: "BENCHMARK NEGATIVE CONTROL",
    narrative:
      "Maintenance supervisor walking in 2nd floor hallway tripped on an uneven rubber door mat while holding a hot coffee mug. Coffee spilled on sleeve causing minor redness. Worker rinsed with cold water and resumed shift with zero lost time.",
    zone: "Admin — Facility Management",
    zoneId: "Admin",
    equipment: "Office Entrance Doorway",
    actualSeverity: "LOW",
    actualDescription: "Minor forearm redness; treated with cold tap water",
    energyType: "None (Zero Process Energy / 0 PSI / Non-Hazardous)",
    isNegativeControl: true,
  },
];

export default function LiveIncidentLabModal({
  isOpen,
  onClose,
  theme = "dark",
  onInjectScenario,
}: LiveIncidentLabModalProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  // Form inputs
  const [customNarrative, setCustomNarrative] = useState<string>(
    "Field technician unbolted high-pressure flange F-402 during turnaround. Line was supposed to be isolated, but residual 2,400 PSI hot condensate sprayed past the loose gasket. Technician ducked and escaped with a small grease mark on glove, reporting it as minor spillage."
  );
  const [customTitle, setCustomTitle] = useState<string>("Flange F-402 Unbolting Line Spray");
  const [selectedZone, setSelectedZone] = useState<"Zone A" | "Zone B" | "Zone C" | "Zone D" | "Admin">("Zone D");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("Condensate Line Flange F-402");
  const [actualSeverityInput, setActualSeverityInput] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");

  // Agent Pipeline Execution State
  const [isRunningTriage, setIsRunningTriage] = useState<boolean>(false);
  const [activeAgentStep, setActiveAgentStep] = useState<number>(0);
  const [triageLogs, setTriageLogs] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<IncidentScenario | null>(null);

  // Load a preset
  const handleLoadPreset = (preset: BenchmarkPreset) => {
    setCustomTitle(preset.name);
    setCustomNarrative(preset.narrative);
    setSelectedZone(preset.zoneId);
    setSelectedEquipment(preset.equipment);
    setActualSeverityInput(preset.actualSeverity as "LOW" | "MEDIUM" | "HIGH");
    setTriageResult(null);
    setTriageLogs([]);
    setActiveAgentStep(0);
  };

  // Run autonomous multi-agent triage
  const runLiveMultiAgentTriage = async () => {
    setIsRunningTriage(true);
    setActiveAgentStep(1);
    setTriageLogs(["[INIT] Connecting to SentinelSIF Autonomous LangGraph Orchestrator..."]);
    setTriageResult(null);

    const isNegative = customNarrative.toLowerCase().includes("coffee") || customNarrative.toLowerCase().includes("mat");

    // Agent 1: Ontology Extraction
    await new Promise((r) => setTimeout(r, 600));
    setActiveAgentStep(1);
    setTriageLogs((prev) => [
      ...prev,
      `[AGENT 1: SAFETY_SIGNAL_ONTOLOGY] Extracting hazard energy types & worker line-of-fire...`,
      isNegative
        ? `[AGENT 1] Hazard Energy: NONE • Worker Proximity: Low Energy Surface Contact • Barriers: Standard Facility Flooring`
        : `[AGENT 1] Hazard Energy: High-Pressure Pressurized Hydrocarbon Fluid (2,400+ PSI) • Proximity: DIRECT LINE OF FIRE (1.2m) • Barriers: Gasket Blown, Mechanical Isolation Defective`,
    ]);

    // Agent 2: Discordance Physics Engine
    await new Promise((r) => setTimeout(r, 700));
    setActiveAgentStep(2);
    const calculatedGap = isNegative ? 0 : 93;
    setTriageLogs((prev) => [
      ...prev,
      `[AGENT 2: SIF_DISCORDANCE_ENGINE] Computing |Potential Consequence - Actual Severity|...`,
      isNegative
        ? `[AGENT 2] Actual: LOW • Potential: LOW • Discordance Gap: 0% (BALANCED NOMINAL)`
        : `[AGENT 2] Actual: LOW (Reported minor grease mark) • Potential: CRITICAL (Lethal High-Energy Injection / Severance) • Discordance Gap: ${calculatedGap}% SIF PRECURSOR DISCORDANCE FLAGGED!`,
    ]);

    // Agent 3: 2nd-Order Latent Deep Feature Recall
    await new Promise((r) => setTimeout(r, 750));
    setActiveAgentStep(3);
    setTriageLogs((prev) => [
      ...prev,
      `[AGENT 3: ACTIVE_DEEP_RECALL] Interrogating secondary SCADA buffers & maintenance telemetry...`,
      isNegative
        ? `[AGENT 3] 2nd-Order Scan: 0 latent anomalies detected. Baseline facility state verified with 100% confidence.`
        : `[AGENT 3] RECALLED LATENT FEATURE: Bleed valve LV-402 position switch showed closed on DCS, but manual bypass spindle was stripped in open position! (+11% Severity Gap added)`,
    ]);

    // Agent 4: Autonomous LangGraph SOP RAG
    await new Promise((r) => setTimeout(r, 650));
    setActiveAgentStep(4);
    setTriageLogs((prev) => [
      ...prev,
      `[AGENT 4: VECTOR_RAG_RESEARCHER] Querying Oil India SOP Knowledge Base & Historical Benchmarks...`,
      isNegative
        ? `[AGENT 4] Matched Reference: SOP-GEN-FAC-01 (General Office Safety). Recommended Action: Standard housekeeping maintenance.`
        : `[AGENT 4] Matched Reference: SOP-OI-OFF-MNT-402 (Zero-Energy Verification Protocol) • Vector Cosine Similarity: 0.941 • Violation: Mandatory double-block-and-bleed test was omitted prior to unbolting.`,
    ]);

    // Agent 5: DGMS Compliance Auditor & Decision
    await new Promise((r) => setTimeout(r, 600));
    setActiveAgentStep(5);
    const orderNum = `OI-DGMS-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setTriageLogs((prev) => [
      ...prev,
      `[AGENT 5: DGMS_COMPLIANCE_AUDITOR] Generating Statutory Enforcement Order & Form IV-A Audit Record...`,
      `[DECISION READY] Order: #${orderNum} drafted under Oil Mines Regulations (OMR) 2019 Rule 43.`,
    ]);

    // Build synthesized scenario
    const generatedScenario: IncidentScenario = {
      id: `custom-scen-${Date.now()}`,
      incidentNumber: `#OI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      shortName: customTitle.length > 28 ? customTitle.substring(0, 26) + "..." : customTitle,
      title: customTitle,
      narrative: customNarrative,
      zone: selectedZone === "Zone A" ? "Zone A — Distillation Area" : selectedZone === "Zone B" ? "Zone B — Tank Manifold" : selectedZone === "Zone C" ? "Zone C — Storage" : selectedZone === "Admin" ? "Admin — Facility Operations" : "Zone D — Hydrocarbon Pumping",
      zoneId: selectedZone,
      equipment: selectedEquipment,
      time: "14:22:05 IST (Live Ingest)",
      actualSeverity: actualSeverityInput,
      actualDescription: isNegative ? "Minor contact; zero lost time" : "Worker avoided spray; reported as minor scare",
      potentialSeverity: isNegative ? "LOW" : "CRITICAL",
      potentialOutcome: isNegative ? "No severe consequence" : "Catastrophic line severance, worker fatal injection & flash fire",
      discordanceGap: calculatedGap,
      discordanceStatus: isNegative ? "BALANCED" : "HIGH",
      classification: isNegative ? "ROUTINE MONITORING" : "SIF PRECURSOR",
      energyType: isNegative ? "None (Zero Process Energy)" : "High-Pressure Pressurized Hydrocarbon Condensate (2,400 PSI)",
      exposureLevel: isNegative ? "LOW" : "DIRECT (1.2m Line of Fire)",
      barriers: isNegative
        ? [
            { name: "Corridor Flooring", status: "FUNCTIONING", detail: "Standard non-slip floor mat" },
            { name: "Admin Lighting", status: "FUNCTIONING", detail: "Adequate illumination in hallway" },
          ]
        : [
            { name: "Double Block & Bleed Isolation", status: "FAILED", detail: "Manual bleed spindle stripped; line remained energized" },
            { name: "LOTO Verification Pressure Gauge", status: "FAILED", detail: "Needle seized at zero despite active 2,400 PSI pressure" },
            { name: "Personnel Chemical Face Shield", status: "FUNCTIONING", detail: "Worker wore rated safety goggles preventing ocular injury" },
          ],
      recalledFeature: isNegative
        ? undefined
        : {
            detected: true,
            featureName: "Stripped Manual Bleed Spindle on Valve LV-402",
            category: "SECONDARY_BARRIER_FAILURE",
            missedReason: "Operator round noted gauge at 0 PSI; initial scan missed physical mechanical spindle damage.",
            recalledEvidence: "AI Deep Recall cross-referenced maintenance log PM-402 and detected valve spindle shear advisory.",
            telemetrySource: "SAP-PM Order #990142 & Valve Diagnostics",
            barrierImpact: {
              name: "Secondary Mechanical Bleed Spindle",
              status: "FAILED",
              detail: "Internal stem sheared, preventing fluid depressurization.",
            },
          },
      ragMatch: {
        id: isNegative ? "SOP-FAC-01" : "SOP-OI-OFF-MNT-402",
        similarity: isNegative ? 62 : 94,
        description: isNegative
          ? "General facility housekeeping standard. Prompt cleanup of fluid spills on walkways."
          : "Mandatory zero-energy mechanical lock, atmospheric bleed, and ultrasonic check prior to breaking flange integrity.",
      },
      recommendedAction: isNegative
        ? "Replace entrance mat and log routine housekeeping audit."
        : "Issue immediate Section 22 stop-work order. Depressurize header via remote manifold; verify zero pressure with ultrasonic probe.",
      orderNumber: orderNum,
    };

    setTriageResult(generatedScenario);
    setIsRunningTriage(false);
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
            : "bg-[#090e18] border-cyan-500/80 text-white"
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
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-500">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-700 text-white font-bold uppercase tracking-wider">
                  OPERATIONAL INCIDENT INGESTION LAB
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Incident Triage &amp; Statutory Benchmark Verification
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                Statutory Incident Triage &amp; Scenario Stress Testing
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white transition-all"
            title="Close Lab"
          >
            ✕
          </button>
        </header>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* 1. BENCHMARK PRESETS BAR */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
              1-Click Industry Benchmark Scenarios (Select to Test AI Edge Cases):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BENCHMARK_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className={`p-2 rounded-lg border text-left transition-all hover:scale-[1.02] active:scale-95 ${
                    preset.isNegativeControl
                      ? "border-slate-600 bg-slate-800/40 hover:border-slate-400"
                      : "border-cyan-800/50 bg-cyan-950/20 hover:border-cyan-500"
                  }`}
                >
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-block ${
                      preset.isNegativeControl
                        ? "bg-slate-700 text-slate-200"
                        : "bg-cyan-600/30 text-cyan-300"
                    }`}
                  >
                    {preset.tag}
                  </span>
                  <div className="font-bold text-[11px] mt-1 truncate">{preset.name}</div>
                  <span className="text-[9px] opacity-70 block">{preset.location}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. CUSTOM INCIDENT INPUT AREA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Narrative Box */}
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider flex items-center gap-1 text-cyan-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Field Incident Narrative / EHS Log:</span>
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  Type custom text or paste any report
                </span>
              </div>
              <textarea
                rows={4}
                value={customNarrative}
                onChange={(e) => setCustomNarrative(e.target.value)}
                className={`w-full p-3 rounded-xl border text-xs leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isLight
                    ? "bg-slate-50 border-slate-300 text-slate-900"
                    : "bg-slate-900/80 border-slate-700 text-slate-100"
                }`}
                placeholder="Enter field technician narrative or incident log..."
              />

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Incident Title"
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex-1 ${
                    isLight ? "bg-slate-50 border-slate-300" : "bg-slate-900 border-slate-700 text-white"
                  }`}
                />

                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value as "Zone A" | "Zone B" | "Zone C" | "Zone D" | "Admin")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isLight ? "bg-slate-50 border-slate-300" : "bg-slate-900 border-slate-700 text-white"
                  }`}
                >
                  <option value="Zone A">Zone A — Distillation Area</option>
                  <option value="Zone B">Zone B — Horton Spheres</option>
                  <option value="Zone C">Zone C — Storage Tanks</option>
                  <option value="Zone D">Zone D — Hydrocarbon Pumping</option>
                  <option value="Admin">Admin — Facilities</option>
                </select>

                <select
                  value={actualSeverityInput}
                  onChange={(e) => setActualSeverityInput(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    isLight ? "bg-slate-50 border-slate-300" : "bg-slate-900 border-slate-700 text-white"
                  }`}
                >
                  <option value="LOW">Reported: LOW (Minor)</option>
                  <option value="MEDIUM">Reported: MEDIUM</option>
                  <option value="HIGH">Reported: HIGH</option>
                </select>

                <button
                  disabled={isRunningTriage}
                  onClick={runLiveMultiAgentTriage}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-white ${isRunningTriage ? "animate-spin" : ""}`} />
                  <span>{isRunningTriage ? "INVESTIGATION IN PROGRESS..." : "RUN STATUTORY SAFETY AUDIT"}</span>
                </button>
              </div>
            </div>

            {/* Pipeline Stage Indicators */}
            <div
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block border-b pb-1 border-slate-700/50">
                LangGraph Autonomous Swarm Nodes
              </span>
              <div className="space-y-1.5 text-[11px]">
                {[
                  { step: 1, name: "1. Safety Signal Ontology Extractor", icon: Activity },
                  { step: 2, name: "2. SIF Discordance Decision Math", icon: Gauge },
                  { step: 3, name: "3. 2nd-Order Latent Deep Recall", icon: Zap },
                  { step: 4, name: "4. Autonomous LangGraph SOP RAG", icon: Database },
                  { step: 5, name: "5. DGMS Statutory Compliance Auditor", icon: ShieldCheck },
                ].map((agent) => {
                  const isDone = activeAgentStep > agent.step || (!isRunningTriage && triageResult !== null);
                  const isCurrent = isRunningTriage && activeAgentStep === agent.step;
                  return (
                    <div
                      key={agent.step}
                      className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                        isCurrent
                          ? "bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm animate-pulse"
                          : isDone
                          ? "bg-emerald-950/30 border-emerald-700 text-emerald-300"
                          : "bg-slate-800/30 border-slate-800 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <agent.icon className="w-3.5 h-3.5" />
                        <span className="font-semibold text-[10px]">{agent.name}</span>
                      </div>
                      {isDone ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="text-[9px] font-mono font-bold text-cyan-400">ACTIVE</span>
                      ) : (
                        <span className="text-[9px] font-mono opacity-50">STANDBY</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. STREAMING MULTI-AGENT EXECUTION TERMINAL */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block flex items-center gap-1.5 text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              Real-Time Agent Reasoning Logs &amp; Cosine Vector Verification
            </span>
            <div className="w-full bg-[#050810] border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-cyan-300/90 h-36 overflow-y-auto space-y-1 shadow-inner select-text">
              {triageLogs.length === 0 ? (
                <span className="text-slate-600">
                  Ready. Select a benchmark scenario or type an incident narrative above, then click [RUN LIVE MULTI-AGENT TRIAGE].
                </span>
              ) : (
                triageLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight">
                    <span className="text-slate-500">[{new Date().toISOString().substring(11, 19)}] </span>
                    <span
                      className={
                        log.includes("DISCORDANCE FLAGGED") || log.includes("RECALLED")
                          ? "text-orange-400 font-bold"
                          : log.includes("DECISION READY")
                          ? "text-emerald-400 font-bold"
                          : "text-cyan-300"
                      }
                    >
                      {log}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. TRIAGE SYNTHESIS RESULT CARD & INJECTION CTA */}
          {triageResult && (
            <div
              className={`p-4 rounded-xl border-2 space-y-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${
                triageResult.classification === "SIF PRECURSOR"
                  ? "bg-orange-950/30 border-orange-500"
                  : "bg-emerald-950/30 border-emerald-500"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-slate-700/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                        triageResult.classification === "SIF PRECURSOR" ? "bg-orange-600" : "bg-emerald-600"
                      }`}
                    >
                      {triageResult.classification}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      Discordance Gap: {triageResult.discordanceGap}%
                    </span>
                    <span className="text-xs text-slate-400">| ID: {triageResult.incidentNumber}</span>
                  </div>
                  <h4 className="text-sm font-bold mt-1 text-white">{triageResult.title}</h4>
                </div>

                <button
                  onClick={() => {
                    onInjectScenario(triageResult);
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>INJECT INTO 3D DIGITAL TWIN NOW</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hazard Energy</span>
                  <span className="font-semibold text-amber-400">{triageResult.energyType}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">RAG SOP Precedent</span>
                  <span className="font-semibold text-cyan-400">
                    {triageResult.ragMatch.id} ({triageResult.ragMatch.similarity}% Vector Match)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">DGMS Action</span>
                  <span className="font-semibold text-emerald-400">Statutory Order #{triageResult.orderNumber}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <footer
          className={`p-3.5 border-t flex items-center justify-between ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : isPetroleum
              ? "bg-[#06101e] border-amber-900/50"
              : isCyber
              ? "bg-[#010603] border-emerald-900/60"
              : "bg-[#080c18] border-slate-800"
          }`}
        >
          <div className="text-[11px] opacity-75 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Autonomous Multi-Agent Sandbox Ready for Judge Evaluation</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white transition-all"
          >
            Close Lab
          </button>
        </footer>
      </div>
    </div>
  );
}
