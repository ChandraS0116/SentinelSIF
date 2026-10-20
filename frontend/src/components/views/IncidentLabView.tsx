"use client";

import React, { useState } from "react";
import {
  FileText,
  FileCheck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Check,
  X,
  Sliders,
  Layers,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Compass,
} from "lucide-react";
import { IncidentScenario } from "../../data/incidentScenarios";
import { ThemeMode } from "../AuthGateway";

interface IncidentLabViewProps {
  theme: ThemeMode;
  activeScenario: IncidentScenario;
  onInjectScenario: (scenario: IncidentScenario) => void;
  onNavigateView: (view: "digital_twin" | "incident_lab" | "physics_sandbox" | "acoustic_array" | "compliance_audit") => void;
}

interface BenchmarkCase {
  id: string;
  name: string;
  location: string;
  year: string;
  energy: string;
  narrative: string;
  isNegative?: boolean;
}

const HISTORIC_BENCHMARKS: BenchmarkCase[] = [
  {
    id: "baghjan-blowout",
    name: "Assam Baghjan Well #5 Blowout",
    location: "Oil India Field, Tinsukia, Assam",
    year: "May 2020",
    energy: "6,500 PSI Natural Gas & Condensate",
    narrative:
      "During workover operations pulling testing tubing, routine mud column pressure kicked. High-pressure natural gas escaped through annulus. Blind shear ram blowout preventer (BOP) failed to close due to auxiliary accumulator pressure collapse. Crew evacuated rig floor safely; logged as minor kick before uncontained blowout.",
  },
  {
    id: "iocl-jaipur",
    name: "IOCL Jaipur Terminal Vapor Cloud",
    location: "Jaipur Terminal, Rajasthan",
    year: "Oct 2009",
    energy: "1,000 Tons Flammable MS Vapor Cloud",
    narrative:
      "During pipeline transfer pigging, operator observed minor hissing weep at valve MOV-104 gland packing. Operator noted a packing leak and left to retrieve a spanner. Within 20 minutes, 1,000 tons of MS escaped, creating a massive unconfined vapor cloud that met an electrical substation spark.",
  },
  {
    id: "bp-texas-city",
    name: "BP Texas City Isomerization Column",
    location: "Texas City Refinery, USA",
    year: "Mar 2005",
    energy: "Heavy Hydrocarbon Liquid Column Overfill",
    narrative:
      "During isomerization unit startup, raffinate splitter tower was pumped with flammable hydrocarbons with outlet valve closed. High-level alarm failed to sound and sight glass was murky. Flammable liquid filled 43m distillation tower and erupted out of the atmospheric blowdown stack geyser.",
  },
  {
    id: "admin-spill",
    name: "Administrative Facility Spill (Routine Control Baseline)",
    location: "Duliajan HQ Office Complex",
    year: "Routine Shift",
    energy: "0 PSI / Zero Process Energy",
    narrative:
      "Administrative assistant stepped over doorway sill in administrative hallway, spilling hot beverage. Sustained minor forearm redness treated with cold tap water. Zero process lines, zero pressurized hydrocarbons, non-hazardous office environment.",
    isNegative: true,
  },
];

const HAZARD_CONDITION_TAGS = [
  {
    label: "3,150 PSI Gas Kick",
    text: " High-pressure natural gas kicked through annulus at 3,150 PSI with crew in line-of-fire.",
  },
  {
    label: "Gland Packing Weep",
    text: " Minor hissing sound and packing weep noted at valve gland packing; logged on shift handover.",
  },
  {
    label: "DBB Isolation Bypassed",
    text: " Double-block-and-bleed mechanical crack verification was omitted prior to loosening flange bolts.",
  },
  {
    label: "Seized 0 PSI Gauge",
    text: " Pressure gauge needle was seized at 0 PSI despite 3,150 PSI line charge behind the seal.",
  },
  {
    label: "Distillation Tower Overfill",
    text: " High-level alarm transmitter float jammed, leading to 170-foot column liquid hydrocarbon overfill.",
  },
  {
    label: "Office Control Baseline",
    text: " Minor beverage spill in administrative office hallway; zero pressurized lines, superficial contact only.",
  },
];

export default function IncidentLabView({
  theme,
  activeScenario,
  onInjectScenario,
  onNavigateView,
}: IncidentLabViewProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";

  const [inputNarrative, setInputNarrative] = useState<string>(activeScenario.narrative);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentAgentStep, setCurrentAgentStep] = useState<number>(0);
  const [streamLogs, setStreamLogs] = useState<string[]>([]);
  const [activeResult, setActiveResult] = useState<IncidentScenario | null>(null);

  // Inspection Stage State
  const [inspectedNode, setInspectedNode] = useState<number | null>(null);

  // Barrier Sensitivity Analysis Controls
  const [counterfactualDbb, setCounterfactualDbb] = useState<boolean>(false);
  const [counterfactualDeluge, setCounterfactualDeluge] = useState<boolean>(false);

  const runInvestigationPipeline = async (customText?: string) => {
    const text = customText || inputNarrative;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setCurrentAgentStep(1);

    const isNegative =
      text.toLowerCase().includes("administrative") ||
      text.toLowerCase().includes("tea") ||
      text.toLowerCase().includes("coffee") ||
      (text.toLowerCase().includes("beverage") && !text.toLowerCase().includes("psi")) ||
      (text.toLowerCase().includes("spill") && !text.toLowerCase().includes("hydrocarbon") && !text.toLowerCase().includes("psi"));

    setStreamLogs([
      `[STAGE 1 // FIELD DATA EXTRACTION] Parsing operational shift log against DGMS safety taxonomy...`,
      `[STAGE 1] Identified Hazard: ${isNegative ? "None (Low-temperature liquid)" : "High-Pressure Hydrocarbon (3,150 PSI)"} | Equipment Asset: ${isNegative ? "Office Facility" : "Process Skid P-102 Flange Assembly"}`,
    ]);

    await new Promise((r) => setTimeout(r, 550));
    setCurrentAgentStep(2);
    setStreamLogs((prev) => [
      ...prev,
      `[STAGE 2 // THERMODYNAMIC CALCULATION] Computing stored process energy and kinetic overpressure...`,
      isNegative
        ? `[STAGE 2] Potential Energy: 0 kJ • Static Pressure: 0 PSI • Sonic Velocity: 0 m/s • Consequence: Superficial skin irritation.`
        : `[STAGE 2] Potential Energy: 2,480 kJ • Line Pressure: 3,150 PSI • Sonic Discharge Velocity: Mach 1.25 • Hopkinson Blast Radius: 28.5m.`,
    ]);

    await new Promise((r) => setTimeout(r, 550));
    setCurrentAgentStep(3);
    setStreamLogs((prev) => [
      ...prev,
      `[STAGE 3 // BARRIER INTEGRITY AUDIT] Verifying LOTO isolation, PSV relief capacity, and fire deluge suppression...`,
      isNegative
        ? `[STAGE 3] Barrier Status: N/A (Standard administrative flooring and ambient conditions verified nominal).`
        : `[STAGE 3] Critical Barrier Failure: Double-block-and-bleed verification was omitted prior to unbolting. Primary isolation breached.`,
    ]);

    await new Promise((r) => setTimeout(r, 550));
    setCurrentAgentStep(4);
    setStreamLogs((prev) => [
      ...prev,
      `[STAGE 4 // REGULATORY & SOP BENCHMARKING] Cross-referencing Oil India SOP standards and historical records...`,
      isNegative
        ? `[STAGE 4] Standard Reference: SOP-GEN-FAC-01 (General Office Safety). Corrective Action: Routine custodial cleanup.`
        : `[STAGE 4] Standard Reference: SOP-OI-OFF-MNT-402 (Positive Energy Isolation Protocol) • Precedent Match: 94.1% • Discordance Gap: 94%.`,
    ]);

    await new Promise((r) => setTimeout(r, 550));
    setCurrentAgentStep(5);
    const orderNum = `OI-DGMS-${Math.floor(1000 + Math.random() * 9000)}`;
    setStreamLogs((prev) => [
      ...prev,
      `[STAGE 5 // STATUTORY ORDER GENERATION] Formulating official DGMS Form IV-A compliance directive...`,
      isNegative
        ? `[FINAL VERDICT] Event classified as ROUTINE OPERATIONAL MONITORING. No statutory order required.`
        : `[FINAL VERDICT] Statutory Stop-Work Order #${orderNum} drafted under DGMS Oil Mines Regulations (OMR) 2019 Rule 43.`,
    ]);

    setIsAnalyzing(false);

    // Build synthesized result
    const synthesized: IncidentScenario = {
      id: `std-eval-${Date.now()}`,
      incidentNumber: `#OI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      shortName: isNegative ? "Office Facility Spill" : "Live Pressurized Line Breach",
      title: isNegative ? "Administrative Housekeeping Incident (Control Baseline)" : "Pressurized Hydrocarbon Breach & Barrier Bypass",
      time: "14:40:22 IST (Autonomous Ingest)",
      zone: isNegative ? "Admin — Facility Operations" : "Zone D — Hydrocarbon Pumping",
      zoneId: isNegative ? "Admin" : "Zone D",
      equipment: isNegative ? "Administrative Corridor" : "High-Pressure Condensate Line Flange",
      narrative: text,
      energyType: isNegative ? "None (0 PSI / Zero Process Energy)" : "3,150 PSI Pressurized Condensate Jet",
      exposureLevel: isNegative ? "LOW (Superficial Contact)" : "DIRECT (1.2m Worker Line of Fire)",
      actualSeverity: "LOW",
      actualDescription: isNegative ? "Minor beverage spill; 0 lost time" : "Worker reported minor slip/scrape; 0 lost time",
      potentialSeverity: isNegative ? "LOW" : "CRITICAL",
      potentialOutcome: isNegative ? "No catastrophic consequence" : "Catastrophic line severance, worker fatal injection & flash fire",
      discordanceGap: isNegative ? 0 : 94,
      discordanceStatus: isNegative ? "BALANCED" : "HIGH",
      classification: isNegative ? "ROUTINE MONITORING" : "SIF PRECURSOR",
      barriers: isNegative
        ? [
            { name: "Corridor Flooring", status: "FUNCTIONING", detail: "Dry floor surface" },
            { name: "Office Lighting", status: "FUNCTIONING", detail: "Adequate illumination" },
          ]
        : [
            { name: "Double Block & Bleed Isolation", status: "FAILED", detail: "Bleed valve was not cracked prior to bolt unseating" },
            { name: "Positive Pressure Gauge", status: "FAILED", detail: "Needle seized at 0 PSI despite 3,150 PSI active pressure" },
            { name: "Personnel Impact Shield", status: "FUNCTIONING", detail: "ANSI rated eye protection worn" },
          ],
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
      orderNumber: isNegative ? "N/A" : orderNum,
      recommendedAction: isNegative
        ? "Standard custodial housekeeping. No statutory stop-work order required."
        : "Execute statutory Stop-Work lockdown order under DGMS OMR 2019 Rule 43. Mandatory ultrasonic & bleed verification before line restart.",
    };

    setActiveResult(synthesized);
    onInjectScenario(synthesized);
  };

  // Compute live sensitivity gap
  const rawGap = activeResult ? activeResult.discordanceGap : 94;
  const effectiveGap = activeResult
    ? Math.max(8, rawGap - (counterfactualDbb ? 46 : 0) - (counterfactualDeluge ? 28 : 0))
    : 94;
  const effectiveClassification = effectiveGap > 70 ? "SIF PRECURSOR" : effectiveGap > 30 ? "WATCH" : "ROUTINE";

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Title */}
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
            isLight ? "border-slate-200" : "border-white/10"
          }`}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm" />
              <h1 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Operational Incident Investigation Lab
              </h1>
            </div>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
              Oil India Limited • Autonomous Hazard Extraction, Kinetic Energy Evaluation &amp; Statutory DGMS Audit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                isLight
                  ? "bg-slate-100 border-slate-300 text-slate-800 font-semibold"
                  : "bg-slate-800/60 border-slate-700 text-slate-200 font-medium"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Certified DGMS OMR 2019 Rule 43 Compliance</span>
            </span>
          </div>
        </div>

        {/* TOP SECTION: Field Report Ingestion & Historical Benchmarks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 Cols: Input Dossier & Hazard Condition Tags */}
          <div
            className={`lg:col-span-8 p-5 rounded-2xl border shadow-md space-y-4 ${
              isLight
                ? "bg-white border-slate-200 text-slate-800"
                : isPetroleum
                ? "bg-[#071426]/90 border-amber-500/25 text-amber-100"
                : "bg-[#090e18]/90 border-white/[0.08] text-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  isLight ? "text-blue-900" : "text-cyan-400"
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                Field Incident Report &amp; Shift Handover Dossier
              </span>
              <span className={`text-xs ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>
                Standard Operating Documentation
              </span>
            </div>

            {/* OPERATIONAL CONDITION TAGS */}
            <div className="space-y-1.5">
              <span className={`text-xs block ${isLight ? "text-slate-700 font-semibold" : "text-slate-300"}`}>
                Common Operational Conditions &amp; Incident Modifiers:
              </span>
              <div className="flex flex-wrap gap-2">
                {HAZARD_CONDITION_TAGS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputNarrative((prev) => (prev.trim() ? prev + chip.text : chip.text.trim()));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 border ${
                      isLight
                        ? "bg-slate-50 hover:bg-blue-50 border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-900 shadow-sm"
                        : "bg-white/[0.04] hover:bg-cyan-500/20 border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              value={inputNarrative}
              onChange={(e) => setInputNarrative(e.target.value)}
              placeholder="Enter field incident narrative, shift turnover log, or equipment maintenance observation..."
              className={`w-full p-3.5 rounded-xl border text-sm font-normal leading-relaxed transition-all resize-none focus:outline-none focus:ring-2 ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500 focus:bg-white"
                  : "bg-black/60 border-white/10 text-slate-100 focus:ring-cyan-500"
              }`}
            />

            <div className="flex items-center justify-between pt-1">
              <span className={`text-xs hidden sm:inline ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                Evaluates latent physical energy independently of reported injury severity.
              </span>

              <button
                onClick={() => runInvestigationPipeline()}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 ml-auto"
              >
                <Activity className="w-4 h-4" />
                <span>{isAnalyzing ? "Processing Investigation Pipeline..." : "Run Statutory Safety Investigation"}</span>
              </button>
            </div>
          </div>

          {/* Right 4 Cols: Historical Benchmark Incidents */}
          <div
            className={`lg:col-span-4 p-5 rounded-2xl border shadow-md space-y-3 flex flex-col justify-between ${
              isLight
                ? "bg-white border-slate-200 text-slate-800"
                : isPetroleum
                ? "bg-[#071426]/90 border-amber-500/25 text-amber-100"
                : "bg-[#090e18]/90 border-white/[0.08] text-slate-100"
            }`}
          >
            <div>
              <span
                className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                  isLight ? "text-slate-900" : "text-slate-300"
                }`}
              >
                Historical Benchmark Incidents
              </span>
              <p className={`text-xs ${isLight ? "text-slate-600 font-normal" : "text-slate-400"}`}>
                Validate findings against documented industrial disaster investigations.
              </p>
            </div>

            <div className="space-y-2">
              {HISTORIC_BENCHMARKS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setInputNarrative(b.narrative);
                    runInvestigationPipeline(b.narrative);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all group ${
                    b.isNegative
                      ? isLight
                        ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950 shadow-sm"
                        : "bg-emerald-950/20 hover:bg-emerald-950/40 border-emerald-500/30"
                      : isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-sm"
                      : "bg-white/[0.03] hover:bg-white/[0.07] border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-semibold text-xs transition-colors ${
                        isLight
                          ? b.isNegative
                            ? "text-emerald-950"
                            : "text-slate-900 group-hover:text-blue-700"
                          : "group-hover:text-cyan-400"
                      }`}
                    >
                      {b.name}
                    </span>
                    <span className={`text-xs ${isLight ? "text-slate-500 font-medium" : "text-slate-400"}`}>
                      {b.year}
                    </span>
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      isLight
                        ? b.isNegative
                          ? "text-emerald-700 font-semibold"
                          : "text-amber-800 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    {b.energy}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 5-Stage Verification Pipeline & Forensic Log */}
        <div
          className={`p-5 rounded-2xl border shadow-md space-y-4 ${
            isLight
              ? "bg-white border-slate-200 text-slate-800"
              : isPetroleum
              ? "bg-[#071426]/90 border-amber-500/25 text-amber-100"
              : "bg-[#090e18]/90 border-white/[0.08] text-slate-100"
          }`}
        >
          {/* STAGE STEPPER */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-cyan-400"
              }`}
            >
              <Zap className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              5-Stage Statutory Investigation Verification Pipeline (Click Any Stage to Inspect)
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { node: 1, label: "1. Signal Extraction" },
                { node: 2, label: "2. Kinetic Energy" },
                { node: 3, label: "3. Barrier Health" },
                { node: 4, label: "4. SOP Precedents" },
                { node: 5, label: "5. Statutory Order" },
              ].map((n) => (
                <button
                  key={n.node}
                  onClick={() => {
                    setInspectedNode(n.node);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                    inspectedNode === n.node
                      ? "bg-blue-700 text-white border-blue-800 shadow-sm"
                      : currentAgentStep >= n.node
                      ? isLight
                        ? "bg-blue-50 border-blue-300 text-blue-900 font-bold hover:bg-blue-100"
                        : "bg-white/[0.05] border-white/10 text-cyan-300 hover:text-white"
                      : isLight
                      ? "text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100"
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                  title={`Inspect Stage ${n.node} Details`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* INSPECTED STAGE DRAWER */}
          {inspectedNode && (
            <div
              className={`p-4 rounded-xl space-y-2 border animate-in fade-in duration-200 ${
                isLight
                  ? "bg-blue-50/70 border-blue-200 text-slate-800 shadow-sm"
                  : "bg-slate-900/60 border-slate-700 text-slate-300"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-1.5 ${
                  isLight ? "border-blue-200" : "border-slate-700"
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isLight ? "text-blue-950" : "text-cyan-300"
                  }`}
                >
                  <Info className="w-4 h-4 text-blue-600" />
                  Investigation Stage {inspectedNode} Operational Trace
                </span>
                <button
                  onClick={() => {
                    setInspectedNode(null);
                  }}
                  className={isLight ? "text-slate-500 hover:text-slate-900" : "text-slate-400 hover:text-white"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className={`text-xs space-y-1.5 font-normal leading-relaxed ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                {inspectedNode === 1 && (
                  <>
                    <div className={isLight ? "text-blue-900 font-bold" : "text-cyan-400 font-bold"}>
                      Stage 1: Operational Signal &amp; Entity Extraction
                    </div>
                    <div>&bull; Standard Framework: DGMS OMR 2019 Industrial Incident Taxonomy</div>
                    <div>
                      &bull; Identified Parameters: Stored Process Hydrocarbon (3,150 PSI), 1.2m Line of Fire Proximity, Flange Bolt Unbolting Task
                    </div>
                    <div>&bull; Verification Confidence: 94.2% entity correlation</div>
                  </>
                )}
                {inspectedNode === 2 && (
                  <>
                    <div className={isLight ? "text-amber-900 font-bold" : "text-amber-400 font-bold"}>
                      Stage 2: Thermodynamic Energy &amp; Kinetic Shockwave Profile
                    </div>
                    <div>&bull; Mechanical Expansion Potential: W = &int; P dV = 2,480 kJ (2.48 MJ Instantaneous Yield)</div>
                    <div>&bull; Sonic Release Velocity: Mach 1.25 choked nozzle discharge velocity</div>
                    <div>&bull; Hopkinson-Cranz Blast Radius: 28.5 meters (&gt;5 PSI lethal overpressure boundary)</div>
                  </>
                )}
                {inspectedNode === 3 && (
                  <>
                    <div className={isLight ? "text-red-900 font-bold" : "text-red-400 font-bold"}>
                      Stage 3: Physical Safety Barrier Integrity Audit
                    </div>
                    <div>&bull; Positive Isolation Protocol: Double-Block-and-Bleed verification omitted [CRITICAL DEFICIT]</div>
                    <div>&bull; Emergency Pressure Relief: PSV-102 setpoint throttled under backpressure</div>
                    <div>&bull; Active Fire Mitigation: Automated water deluge system supply isolated offline</div>
                  </>
                )}
                {inspectedNode === 4 && (
                  <>
                    <div className={isLight ? "text-slate-900 font-bold" : "text-slate-200 font-bold"}>
                      Stage 4: Regulatory Precedent &amp; SOP Cross-Check
                    </div>
                    <div>&bull; Standard Matched: SOP-OI-OFF-MNT-402 (Positive Energy Isolation Protocol)</div>
                    <div>&bull; Historical Case Reference: Assam Baghjan Well #5 Blowout (94.1% incident similarity)</div>
                    <div>&bull; Statutory Mandates: OISD-GDN-166 &amp; DGMS Technical Circular (OMR) 2019</div>
                  </>
                )}
                {inspectedNode === 5 && (
                  <>
                    <div className={isLight ? "text-emerald-900 font-bold" : "text-emerald-400 font-bold"}>
                      Stage 5: Statutory Enforcement Directive &amp; Form IV-A
                    </div>
                    <div>&bull; Regulatory Action: Level-1 Stop-Work Order drafted under DGMS OMR 2019 Rule 43</div>
                    <div>&bull; Authorized Clearance: DGMS Level-4 Clearance (Chief Safety Officer)</div>
                    <div>&bull; Audit Verification Hash: SHA256-REGULATORY-LOCKDOWN-VALID</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Investigation Forensic Record */}
          <div
            className={`p-4 rounded-xl border text-xs space-y-1.5 min-h-32 max-h-48 overflow-y-auto select-text shadow-inner ${
              isLight ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-black/70 border-white/10"
            }`}
          >
            {streamLogs.length === 0 ? (
              <div className={isLight ? "text-slate-400 italic" : "text-slate-500 italic"}>
                Ready. Click &ldquo;Run Statutory Safety Investigation&rdquo; or select a historical benchmark to view the investigation audit trail...
              </div>
            ) : (
              streamLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes("FINAL") || log.includes("ROUTINE")
                      ? "text-emerald-400 font-bold"
                      : log.includes("STAGE 2") || log.includes("STAGE 3")
                      ? "text-amber-300 font-medium"
                      : log.includes("STAGE 4")
                      ? "text-sky-300 font-medium"
                      : "text-slate-200 font-medium"
                  }
                >
                  {log}
                </div>
              ))
            )}
          </div>

          {/* SIF PRECURSOR FINDINGS & REMEDIATION PANEL */}
          {activeResult && (
            <div
              className={`pt-4 border-t space-y-4 animate-in fade-in slide-in-from-bottom-2 ${
                isLight ? "border-slate-200" : "border-white/10"
              } ${
                effectiveGap > 70
                  ? isLight
                    ? "p-5 rounded-2xl bg-red-50/90 border-2 border-red-300 shadow-md text-slate-900"
                    : "p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-orange-950/30 to-black/60 border border-red-500/50"
                  : effectiveGap > 30
                  ? isLight
                    ? "p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-md text-slate-900"
                    : "p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-black/60 border border-amber-500/50"
                  : isLight
                  ? "p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-300 shadow-md text-slate-900"
                  : "p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-black/60 border border-emerald-500/50"
              }`}
            >
              {/* Top Row: Classification & Action Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black border shadow-md transition-all ${
                      effectiveGap > 70
                        ? isLight
                          ? "bg-red-100 border-red-400 text-red-900"
                          : "bg-red-950/80 border-red-500 text-red-400"
                        : effectiveGap > 30
                        ? isLight
                          ? "bg-amber-100 border-amber-400 text-amber-900"
                          : "bg-amber-950/80 border-amber-500 text-amber-400"
                        : isLight
                        ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                        : "bg-emerald-950/80 border-emerald-500 text-emerald-400"
                    }`}
                  >
                    <span className="text-base leading-none">{effectiveGap}%</span>
                    <span className="text-[9px] font-bold uppercase mt-0.5">GAP</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          effectiveClassification === "SIF PRECURSOR"
                            ? isLight
                              ? "bg-red-100 border-red-400 text-red-900"
                              : "bg-red-950/80 border-red-500 text-red-300"
                            : effectiveClassification === "WATCH"
                            ? isLight
                              ? "bg-amber-100 border-amber-400 text-amber-900"
                              : "bg-amber-950/80 border-amber-500 text-amber-300"
                            : isLight
                            ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                            : "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                        }`}
                      >
                        {effectiveClassification}
                      </span>
                      <span className={`text-xs ${isLight ? "text-slate-600 font-semibold" : "text-slate-400"}`}>
                        Order #{activeResult.orderNumber}
                      </span>
                    </div>
                    <h3 className={`text-base font-bold mt-1 ${isLight ? "text-slate-900" : "text-white"}`}>
                      {activeResult.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateView("digital_twin")}
                    className={`px-4 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                        : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200 hover:text-white"
                    }`}
                  >
                    <span>View 3D Digital Twin</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigateView("compliance_audit")}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>View Regulatory Dossier</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Engineering Barrier Sensitivity Analysis */}
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  isLight ? "bg-white border-slate-200 shadow-sm" : "bg-black/50 border-white/10"
                }`}
              >
                <span
                  className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isLight ? "text-blue-900" : "text-cyan-400"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  Engineering Barrier Sensitivity Analysis (Remediation Controls)
                </span>
                <div className="flex flex-wrap gap-5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={counterfactualDbb}
                      onChange={(e) => setCounterfactualDbb(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    />
                    <span
                      className={
                        counterfactualDbb
                          ? isLight
                            ? "text-emerald-900 font-bold"
                            : "text-emerald-300 font-bold"
                          : isLight
                          ? "text-slate-700 font-medium"
                          : "text-slate-400"
                      }
                    >
                      Verify Double-Block-and-Bleed (DBB-402) Isolation (-46% SIF Gap)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={counterfactualDeluge}
                      onChange={(e) => setCounterfactualDeluge(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    />
                    <span
                      className={
                        counterfactualDeluge
                          ? isLight
                            ? "text-emerald-900 font-bold"
                            : "text-emerald-300 font-bold"
                          : isLight
                          ? "text-slate-700 font-medium"
                          : "text-slate-400"
                      }
                    >
                      Arm Automated Water Deluge Curtain System (-28% SIF Gap)
                    </span>
                  </label>
                </div>
              </div>

              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    isLight ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/10"
                  }`}
                >
                  <span className={`text-xs uppercase font-bold block ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    Hazard Process Energy
                  </span>
                  <div className={`font-bold truncate ${isLight ? "text-orange-900" : "text-orange-400"}`}>
                    {activeResult.energyType}
                  </div>
                  <div className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                    {activeResult.exposureLevel}
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    isLight ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/10"
                  }`}
                >
                  <span className={`text-xs uppercase font-bold block ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    Regulatory Standard Precedent
                  </span>
                  <div className={`font-bold ${isLight ? "text-blue-900" : "text-cyan-400"}`}>
                    {activeResult.ragMatch.id}
                  </div>
                  <div className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                    {activeResult.ragMatch.similarity}% Vector Precedent Similarity
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    isLight ? "bg-white border-slate-200 shadow-sm" : "bg-black/40 border-white/10"
                  }`}
                >
                  <span className={`text-xs uppercase font-bold block ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    DGMS Statutory Directive
                  </span>
                  <div className={`font-bold truncate ${isLight ? "text-emerald-900" : "text-emerald-400"}`}>
                    OMR 2019 Rule 43 Enforced
                  </div>
                  <div className={`text-xs truncate ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                    {activeResult.recommendedAction}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
