"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileCheck,
  ShieldCheck,
  Download,
  Printer,
  FileSpreadsheet,
  Copy,
  Check,
  Zap,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Layers,
  Activity,
  Database,
  Search,
  Sliders,
  Sparkles,
  RotateCcw,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  X,
  Info,
} from "lucide-react";
import { IncidentScenario } from "../../data/incidentScenarios";
import { HISTORICAL_HAZARDS, HistoricalHazard } from "../../data/historicalHazards";
import {
  downloadExcelReport,
  printPDFReport,
  copyJSONPayload,
  getExecutiveBriefText,
} from "../../utils/reportExport";
import { downloadMasterExcelReport } from "../../utils/masterReportExport";
import { ThemeMode, OfficerProfile } from "../AuthGateway";
import { PhysicsSimulationState } from "../PhysicsStressSimulator";
import { sound } from "../../utils/audioHaptics";

interface ComplianceAuditViewProps {
  theme: ThemeMode;
  activeScenario: IncidentScenario;
  officerProfile: OfficerProfile | null;
  physicsState: PhysicsSimulationState | null;
  autoSynthesize?: boolean;
  onNavigateView: (view: "digital_twin" | "incident_lab" | "physics_sandbox" | "acoustic_array" | "compliance_audit") => void;
}

type DossierSubTab = "order" | "blast" | "bowtie" | "capa" | "registry";

interface BowTieNodeDetail {
  id: string;
  title: string;
  category: "threat" | "preventive" | "top_event" | "mitigative" | "consequence";
  status: "FUNCTIONING" | "FAILED" | "OFFLINE" | "PARTIAL" | "UNCONTAINED";
  omrClause: string;
  degradationMechanism: string;
  mitigationAction: string;
}

const BOW_TIE_DETAILS: Record<string, BowTieNodeDetail> = {
  "threat-1": {
    id: "threat-1",
    title: "Flange Unseating (Torque Relaxation)",
    category: "threat",
    status: "FAILED",
    omrClause: "OMR 2019 Rule 43(2) - Machinery Integrity",
    degradationMechanism: "Cyclic thermal expansion and vibration leading to bolt tension loss below 65 N·m specification.",
    mitigationAction: "Mandatory ultrasonic bolt tension elongation audit before hot/cold service changeovers.",
  },
  "threat-2": {
    id: "threat-2",
    title: "Trapped Line Pressure (3,150 PSI)",
    category: "threat",
    status: "FAILED",
    omrClause: "OMR 2019 Rule 43(1)(c) - Isolation Protocols",
    degradationMechanism: "Isolation block valve passing high-pressure gas kick into isolated maintenance spool.",
    mitigationAction: "Enforce positive mechanical blind spade or double-block-bleed with atmospheric vent open.",
  },
  "barrier-dbb": {
    id: "barrier-dbb",
    title: "Double Block & Bleed (DBB)",
    category: "preventive",
    status: "FAILED",
    omrClause: "OISD-STD-105 Clause 4.2 & OMR Rule 43",
    degradationMechanism: "Maintenance technician skipped cracking the center bleed valve to atmospheric dump. Trapped 3,150 PSI was undetected.",
    mitigationAction: "Interlocked lock-out/tag-out key system requiring bleed verification before tool issuance.",
  },
  "barrier-gauge": {
    id: "barrier-gauge",
    title: "Positive Gauge Inspection",
    category: "preventive",
    status: "FAILED",
    omrClause: "OMR 2019 Rule 46 - Instrumentation Standards",
    degradationMechanism: "Local dial gauge pointer was frozen at 0 PSI due to bitumen/paraffin buildup in Bourdon tube.",
    mitigationAction: "Deploy redundant digital telemetry sensors with live SCADA heartbeat self-diagnostics.",
  },
  "barrier-shield": {
    id: "barrier-shield",
    title: "Eye & Face Impact Shield",
    category: "preventive",
    status: "FUNCTIONING",
    omrClause: "IS 8521 / DGMS Safety Circular 2018",
    degradationMechanism: "Polycarbonate ballistic visor successfully deflected the initial high-velocity washer shard, preventing corneal laceration.",
    mitigationAction: "Continue enforcement of Level-3 ballistic face shielding during line breaking operations.",
  },
  "top-event": {
    id: "top-event",
    title: "Loss of Primary Containment (LOPC)",
    category: "top_event",
    status: "UNCONTAINED",
    omrClause: "OMR 2019 Rule 43(1) - Dangerous Occurrences",
    degradationMechanism: "Catastrophic blowout of spiral-wound gasket releasing 3,150 PSI hydrocarbon vapor cloud.",
    mitigationAction: "Immediate ESD trip of upstream wellhead safety valves and deluge activation.",
  },
  "barrier-deluge": {
    id: "barrier-deluge",
    title: "Water Deluge Curtain Skid",
    category: "mitigative",
    status: "OFFLINE",
    omrClause: "NFPA 15 & OISD-STD-116",
    degradationMechanism: "Deluge supply header manual valve was closed for routine strainer cleaning without a bypass permit.",
    mitigationAction: "Install tamper switches on deluge supply valves monitored directly by central DCS.",
  },
  "barrier-acoustic": {
    id: "barrier-acoustic",
    title: "38.4 kHz Piezoelectric Ultrasonic Sensor",
    category: "mitigative",
    status: "FUNCTIONING",
    omrClause: "DGMS Tech Advisory 2021-04",
    degradationMechanism: "Successfully detected micro-orifice ultrasonic turbulence 40 minutes prior to catastrophic gasket blowout.",
    mitigationAction: "Automate automated ESD interlock when 38.4 kHz signal persists above 35 dB for >30 seconds.",
  },
  "barrier-evac": {
    id: "barrier-evac",
    title: "Area Evacuation Perimeter",
    category: "mitigative",
    status: "PARTIAL",
    omrClause: "OMR 2019 Rule 45 - Emergency Evacuation",
    degradationMechanism: "Worker was standing directly within the 3.8-meter line-of-fire cone when flange was loosened.",
    mitigationAction: "Enforce physical Exclusion Barricading within Hopkinson blast radius during first bolt loosen.",
  },
  "consequence-injection": {
    id: "consequence-injection",
    title: "Fatal Fluid Injection Injury",
    category: "consequence",
    status: "FAILED",
    omrClause: "Mines Act 1952 Section 22A",
    degradationMechanism: "High-pressure micro-jet (3,150 PSI) easily punctures standard work gloves and dermis within 0.05 seconds.",
    mitigationAction: "Zero-energy verification protocol with mandatory depressurization confirmation.",
  },
  "consequence-bleve": {
    id: "consequence-bleve",
    title: "Vapor Cloud Explosion (184 kg TNT)",
    category: "consequence",
    status: "FAILED",
    omrClause: "Manufacture, Storage and Import of Hazardous Chemicals Rules 1989",
    degradationMechanism: "Ignition of expanding flammable hydrocarbon cloud creating lethal >5 PSI overpressure wave.",
    mitigationAction: "Atmospheric gas detection grid and immediate nitrogen snuffing injection.",
  },
};

export default function ComplianceAuditView({
  theme,
  activeScenario,
  officerProfile,
  physicsState,
  autoSynthesize = false,
  onNavigateView,
}: ComplianceAuditViewProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  // Dynamic Synthesis State
  const [isSynthesized, setIsSynthesized] = useState<boolean>(autoSynthesize);
  const [synthesisStage, setSynthesisStage] = useState<number>(autoSynthesize ? 4 : 0);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState<DossierSubTab>("order");

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Historical Registry Search
  const [registrySearch, setRegistrySearch] = useState<string>("");

  // Interactive Bow-Tie Inspector Drawer State
  const [selectedBowTieNode, setSelectedBowTieNode] = useState<BowTieNodeDetail | null>(null);

  // Interactive CAPA Directives Checklist State (5 Items)
  const [capaState, setCapaState] = useState<Record<string, boolean>>({
    "CAPA-01": true,
    "CAPA-02": true,
    "CAPA-03": false,
    "CAPA-04": false,
    "CAPA-05": false,
  });

  const verifiedCapaCount = Object.values(capaState).filter(Boolean).length;
  const complianceScorePercent = Math.round((verifiedCapaCount / 5) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compile / Synthesize Live Output Dossier
  const handleSynthesizeOutput = async () => {
    sound.click();
    setIsCompiling(true);
    setSynthesisStage(1);

    await new Promise((r) => setTimeout(r, 350));
    setSynthesisStage(2);

    await new Promise((r) => setTimeout(r, 350));
    setSynthesisStage(3);

    await new Promise((r) => setTimeout(r, 350));
    setSynthesisStage(4);
    setIsCompiling(false);
    setIsSynthesized(true);
    sound.success();
    showToast("Live Executive Dossier Synthesized Successfully");
  };

  const handleToggleCapa = (capaId: string) => {
    const nextVal = !capaState[capaId];
    setCapaState((prev) => ({ ...prev, [capaId]: nextVal }));
    if (nextVal) {
      sound.toggle();
      if (verifiedCapaCount + 1 === 5) {
        sound.success();
        showToast("All DGMS Statutory CAPA Directives Remediated & Certified!");
      }
    } else {
      sound.click();
    }
  };

  // Harmonized dynamic metrics
  const linePressure = physicsState?.pressurePsi || 3150;
  const tntEquivalent = physicsState?.tntEquivalentKg || 184;
  const blastRadius = physicsState?.lethalBlastRadiusMeters || 28.5;
  const heatFluxRadius = physicsState?.heatFlux12kwRadiusMeters || 42.0;
  const safePerimeter = physicsState?.safePerimeterMeters || 75.0;
  const discordanceGap = physicsState?.discordanceScore || activeScenario.discordanceGap;

  const officerName = officerProfile?.name || "Concerned Safety Official";
  const officerBadge = officerProfile?.badge_id || "OIL-CSO-8042";
  const orderNumber = activeScenario.orderNumber || "OI-DGMS-ORD-4192";

  // Filtered benchmark hazards
  const filteredHazards = useMemo(() => {
    if (!registrySearch.trim()) return HISTORICAL_HAZARDS;
    const q = registrySearch.toLowerCase();
    return HISTORICAL_HAZARDS.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.incidentNumber.toLowerCase().includes(q) ||
        h.facility.toLowerCase().includes(q) ||
        h.sector.toLowerCase().includes(q) ||
        h.energyType.toLowerCase().includes(q)
    );
  }, [registrySearch]);

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans select-none relative">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-top-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ===================================================================
            1. HEADER & GLOBAL "TAKE OUTPUT" ACTIONS
        =================================================================== */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
              <h1 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Executive Safety Intelligence Dossier &amp; Audit Hub
              </h1>
            </div>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
              Directorate General of Mines Safety (DGMS) Statutory Enforcement &bull; Oil Mines Regulations (OMR) 2019 Rule 43
            </p>
          </div>

          {/* Quick Output Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isSynthesized ? (
              <>
                {/* 1. Take PDF */}
                <button
                  onClick={() => {
                    sound.click();
                    printPDFReport(
                      activeScenario,
                      "APPROVED & ENFORCED UNDER OMR 2019 RULE 43",
                      officerProfile
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                  title="Generate high-DPI printable PDF statutory dossier"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Take PDF Dossier</span>
                </button>

                {/* 2. Take Excel */}
                <button
                  onClick={() => {
                    sound.click();
                    downloadExcelReport(
                      activeScenario,
                      "APPROVED & ENFORCED UNDER OMR 2019 RULE 43",
                      officerProfile
                    );
                  }}
                  className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                      : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200 hover:text-white"
                  }`}
                  title="Download structured engineering audit ledger (.csv)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Take Excel / CSV</span>
                </button>

                {/* 3. Take JSON */}
                <button
                  onClick={() => {
                    sound.click();
                    const json = copyJSONPayload(activeScenario, physicsState);
                    navigator.clipboard.writeText(json);
                    showToast("SCADA JSON Payload Copied to Clipboard");
                  }}
                  className={`px-3 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                      : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200 hover:text-white"
                  }`}
                  title="Copy formatted JSON telemetry for SCADA/MES ingestion"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Take JSON</span>
                </button>

                {/* 4. Copy Brief */}
                <button
                  onClick={() => {
                    sound.click();
                    const brief = getExecutiveBriefText(activeScenario, physicsState);
                    navigator.clipboard.writeText(brief);
                    showToast("Executive Brief Copied to Clipboard");
                  }}
                  className={`px-3 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                      : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200 hover:text-white"
                  }`}
                  title="Copy 3-paragraph executive summary text"
                >
                  <FileCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Copy Brief</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSynthesizeOutput}
                disabled={isCompiling}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>{isCompiling ? "COMPILING TELEMETRY..." : "SYNTHESIZE LIVE OUTPUT DOSSIER"}</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================
            2. PRE-SYNTHESIS STATION (RESOLVES "SHOWING REPORT BEFORE DEMO")
        =================================================================== */}
        {!isSynthesized && (
          <div
            className={`p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl text-center space-y-6 ${
              isLight
                ? "bg-white/95 border-slate-200 text-slate-800"
                : isPetroleum
                ? "bg-[#071324]/90 border-amber-500/25 text-amber-100"
                : "bg-[#090e18]/90 border-white/[0.08] text-slate-100"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h2 className={`text-lg font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
                Ready to Synthesize Live Safety Intelligence Output
              </h2>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                Click below to aggregate the live thermodynamic telemetry, compromised barrier findings, and multi-agent SOP vectors into an authoritative DGMS Form IV-A regulatory dossier.
              </p>
            </div>

            {/* Live Input Summary Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs font-mono">
              <div className={`p-3 rounded-xl text-left border ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
              }`}>
                <span className={`text-[10px] font-sans block uppercase font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Active Sector</span>
                <span className={`font-bold truncate block mt-0.5 ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>{activeScenario.zone}</span>
              </div>
              <div className={`p-3 rounded-xl text-left border ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
              }`}>
                <span className={`text-[10px] font-sans block uppercase font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Line Pressure</span>
                <span className={`font-bold block mt-0.5 ${isLight ? "text-orange-700" : "text-orange-400"}`}>{linePressure.toLocaleString()} PSI</span>
              </div>
              <div className={`p-3 rounded-xl text-left border ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
              }`}>
                <span className={`text-[10px] font-sans block uppercase font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Barrier Status</span>
                <span className={`font-bold block mt-0.5 ${isLight ? "text-red-700" : "text-red-400"}`}>
                  {physicsState?.psvStatus || "THROTTLED"} &bull; LOTO BYPASSED
                </span>
              </div>
              <div className={`p-3 rounded-xl text-left border ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
              }`}>
                <span className={`text-[10px] font-sans block uppercase font-bold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Regulatory Rule</span>
                <span className={`font-bold block mt-0.5 ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>{orderNumber || "OMR 2019 R-43"}</span>
              </div>
            </div>

            {/* Compilation Progress Bar */}
            {isCompiling && (
              <div className="max-w-md mx-auto space-y-2 pt-2 font-mono text-[11px]">
                <div className={`w-full h-2 rounded-full overflow-hidden border ${
                  isLight ? "bg-slate-200 border-slate-300" : "bg-black/50 border-white/10"
                }`}>
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${synthesisStage * 25}%` }}
                  />
                </div>
                <div className={`font-bold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>
                  {synthesisStage === 1 && "1/4 Aggregating thermodynamic physics & acoustic sensors..."}
                  {synthesisStage === 2 && "2/4 Auditing barrier deficits against DGMS Oil Mines Regulations 2019 Rule 43..."}
                  {synthesisStage === 3 && "3/4 Cryptographically certifying with Chief Safety Officer private key..."}
                  {synthesisStage === 4 && "4/4 Compiling high-definition multi-format executive dossier..."}
                </div>
              </div>
            )}

            {!isCompiling && (
              <div className="pt-2">
                <button
                  onClick={handleSynthesizeOutput}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl transition-all active:scale-95 flex items-center gap-2 mx-auto"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>SYNTHESIZE LIVE OUTPUT DOSSIER NOW</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            3. SYNTHESIZED EXECUTIVE DOSSIER WORKSPACE
        =================================================================== */}
        {isSynthesized && (
          <div className="space-y-4">
            {/* SUB-PANEL NAVIGATION BAR */}
            <div
              className={`p-1 rounded-2xl border backdrop-blur-xl flex flex-wrap items-center justify-between gap-2 ${
                isLight
                  ? "bg-slate-100/90 border-slate-200"
                  : isPetroleum
                  ? "bg-[#071324] border-amber-900/40"
                  : "bg-white/[0.03] border-white/[0.08]"
              }`}
            >
              <div className="flex items-center gap-1 overflow-x-auto">
                {/* 1. Form IV-A */}
                <button
                  onClick={() => {
                    sound.toggle();
                    setActiveSubTab("order");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubTab === "order"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "bg-white/[0.12] text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Statutory Order (Form IV-A)</span>
                </button>

                {/* 2. Blast & Physics Consequence */}
                <button
                  onClick={() => {
                    sound.toggle();
                    setActiveSubTab("blast");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubTab === "blast"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "bg-white/[0.12] text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Blast &amp; Consequence Profile</span>
                </button>

                {/* 3. Bow-Tie Barrier Diagram */}
                <button
                  onClick={() => {
                    sound.toggle();
                    setActiveSubTab("bowtie");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubTab === "bowtie"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "bg-white/[0.12] text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Bow-Tie Barrier Tree</span>
                </button>

                {/* 4. CAPA Action Schedule */}
                <button
                  onClick={() => {
                    sound.toggle();
                    setActiveSubTab("capa");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubTab === "capa"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "bg-white/[0.12] text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                  <span>5-Point CAPA Directive ({complianceScorePercent}%)</span>
                </button>

                {/* 5. Master Historical Registry */}
                <button
                  onClick={() => {
                    sound.toggle();
                    setActiveSubTab("registry");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeSubTab === "registry"
                      ? isLight
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "bg-white/[0.12] text-white shadow-sm"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-blue-500" />
                  <span>Historical Registry (14 Cases)</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className={`flex items-center gap-2 pr-2 text-[10px] font-mono hidden sm:flex ${
                isLight ? "text-slate-600 font-semibold" : "text-slate-400"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SYNTHESIZED &bull; VALIDATED</span>
              </div>
            </div>

            {/* -------------------------------------------------------------
                SUB-PANEL 1: STATUTORY ORDER FORM IV-A
            ------------------------------------------------------------- */}
            {activeSubTab === "order" && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-6 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50"
                    : isPetroleum
                    ? "bg-[#071324]/95 border-amber-500/25 text-amber-100 shadow-black/80"
                    : "bg-[#090e18]/95 border-white/[0.08] text-slate-100 shadow-black/80"
                }`}
              >
                {/* Government Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b gap-3 ${
                  isLight ? "border-slate-200" : "border-white/10"
                }`}>
                  <div>
                    <span className={`text-[10px] font-mono tracking-widest uppercase block ${
                      isLight ? "text-slate-600 font-bold" : "text-slate-400"
                    }`}>
                      GOVERNMENT OF INDIA &bull; MINISTRY OF LABOUR &amp; EMPLOYMENT
                    </span>
                    <h2 className={`text-base font-black tracking-tight mt-0.5 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      DIRECTORATE GENERAL OF MINES SAFETY (DGMS)
                    </h2>
                    <span className={`text-xs font-bold block mt-0.5 ${
                      isLight ? "text-orange-700" : "text-orange-400"
                    }`}>
                      Statutory Order #{orderNumber} under OMR 2019 Rule 43
                    </span>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <span className={`text-[10px] block ${isLight ? "text-slate-600 font-bold" : "text-slate-400"}`}>INSTALLATION CODE</span>
                    <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>OIL-DULIAJAN-REF-04</span>
                    <span className={`text-[10px] block mt-0.5 font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>STATUS: ENFORCED</span>
                  </div>
                </div>

                {/* Telemetry Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className={`p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
                  }`}>
                    <span className={`text-[10px] uppercase font-sans font-bold block ${isLight ? "text-slate-600" : "text-slate-400"}`}>Incident Tag</span>
                    <span className={`font-extrabold text-sm ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>{activeScenario.incidentNumber}</span>
                    <span className={`text-[10px] block mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{activeScenario.zone}</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
                  }`}>
                    <span className={`text-[10px] uppercase font-sans font-bold block ${isLight ? "text-slate-600" : "text-slate-400"}`}>Equipment / Hazard</span>
                    <span className={`font-bold text-sm ${isLight ? "text-slate-900 font-black" : "text-slate-200"}`}>{activeScenario.equipment}</span>
                    <span className={`text-[10px] block mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{linePressure.toLocaleString()} PSI Hydrocarbon</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
                  }`}>
                    <span className={`text-[10px] uppercase font-sans font-bold block ${isLight ? "text-slate-600" : "text-slate-400"}`}>Severity Discordance</span>
                    <span className={`font-extrabold text-sm ${isLight ? "text-red-700" : "text-red-400"}`}>{discordanceGap}% SIF Gap</span>
                    <span className={`text-[10px] block mt-0.5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>{activeScenario.classification}</span>
                  </div>
                </div>

                {/* Narrative */}
                <div className="space-y-1.5 text-xs">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
                    Factual Event Narrative &amp; Shift Log
                  </span>
                  <p className={`leading-relaxed p-3.5 rounded-xl border ${
                    isLight
                      ? "bg-slate-50 border-slate-200 text-slate-800 font-medium"
                      : "bg-white/[0.02] border-white/[0.06] text-slate-300"
                  }`}>
                    &ldquo;{activeScenario.narrative}&rdquo;
                  </p>
                </div>

                {/* Mandatory Barrier Audit */}
                <div className="space-y-2 text-xs">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
                    Critical Barrier Compliance Ledger
                  </span>
                  <div className="space-y-1.5">
                    {activeScenario.barriers.map((b, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2.5 rounded-xl border ${
                          isLight
                            ? "bg-slate-50 border-slate-200 shadow-sm"
                            : "bg-white/[0.02] border-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              b.status === "FUNCTIONING" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          <span className={`font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{b.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[11px] hidden sm:inline ${
                            isLight ? "text-slate-600 font-medium" : "text-slate-400"
                          }`}>{b.detail}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                              b.status === "FUNCTIONING"
                                ? isLight
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                  : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                                : isLight
                                ? "bg-red-100 border-red-300 text-red-800"
                                : "bg-red-950/40 border-red-500/40 text-red-300"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CSO Digital Seal */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isLight ? "bg-slate-100 border-slate-300 shadow-sm" : "bg-black/40 border-white/10"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isLight
                        ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                        : "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-mono uppercase font-bold block ${
                        isLight ? "text-emerald-800" : "text-emerald-400"
                      }`}>
                        DIGITALLY SEALED &bull; DGMS LEVEL-4 STATUTORY CLEARANCE
                      </span>
                      <span className={`font-black text-sm ${isLight ? "text-slate-900" : "text-slate-200"}`}>{officerName}</span>
                      <span className={`text-[10px] font-mono block ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                        Badge: {officerBadge} &bull; Certified: {new Date().toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        sound.click();
                        printPDFReport(
                          activeScenario,
                          "APPROVED & ENFORCED UNDER OMR 2019 RULE 43",
                          officerProfile
                        );
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Form IV-A PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-PANEL 2: BLAST & CONSEQUENCE PROFILE
            ------------------------------------------------------------- */}
            {activeSubTab === "blast" && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-6 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50"
                    : isPetroleum
                    ? "bg-[#071324]/95 border-amber-500/25 text-amber-100 shadow-black/80"
                    : "bg-[#090e18]/95 border-white/[0.08] text-slate-100 shadow-black/80"
                }`}
              >
                <div>
                  <h2 className={`text-base font-black tracking-tight flex items-center gap-2 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Thermodynamic Physics &amp; Hopkinson-Cranz Blast Overpressure</span>
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                    Direct mathematical calculation of vapor cloud detonation, blast overpressure waves, and thermal radiant flux.
                  </p>
                </div>

                {/* Contrast: Reported vs Potential */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-emerald-950/20 border-emerald-500/30"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      isLight ? "text-emerald-800" : "text-emerald-400"
                    }`}>
                      Shift Log: Reported Injury Consequence
                    </span>
                    <div className={`text-sm font-black ${
                      isLight ? "text-emerald-950" : "text-emerald-300"
                    }`}>{activeScenario.actualSeverity}</div>
                    <p className={`text-[11px] leading-relaxed ${
                      isLight ? "text-slate-700 font-medium" : "text-slate-300"
                    }`}>{activeScenario.actualDescription}</p>
                    <div className={`text-[10px] font-mono pt-1 ${
                      isLight ? "text-emerald-800 font-semibold" : "text-emerald-400/80"
                    }`}>
                      Days Away From Work (DAFW): 0 &bull; OSHA Recordable: Minor First Aid
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${
                    isLight ? "bg-red-50 border-red-300 shadow-sm" : "bg-red-950/20 border-red-500/30"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      isLight ? "text-red-800" : "text-red-400"
                    }`}>
                      True Latent Physical Potential
                    </span>
                    <div className={`text-sm font-black ${
                      isLight ? "text-red-950" : "text-red-300"
                    }`}>{activeScenario.potentialSeverity}</div>
                    <p className={`text-[11px] leading-relaxed ${
                      isLight ? "text-slate-700 font-medium" : "text-slate-300"
                    }`}>{activeScenario.potentialOutcome}</p>
                    <div className={`text-[10px] font-mono pt-1 ${
                      isLight ? "text-red-800 font-semibold" : "text-red-400/80"
                    }`}>
                      Process Energy: 2.48 MJ &bull; Choked Sonic Velocity: Mach 1.25
                    </div>
                  </div>
                </div>

                {/* Hopkinson Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className={`p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
                  }`}>
                    <span className={`text-[9px] uppercase font-sans font-bold block ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}>Operating Pressure</span>
                    <span className={`text-lg font-black ${
                      isLight ? "text-orange-700" : "text-orange-400"
                    }`}>{linePressure.toLocaleString()} PSI</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
                  }`}>
                    <span className={`text-[9px] uppercase font-sans font-bold block ${
                      isLight ? "text-slate-600" : "text-slate-400"
                    }`}>TNT Equivalent</span>
                    <span className={`text-lg font-black ${
                      isLight ? "text-amber-800" : "text-amber-400"
                    }`}>{tntEquivalent} kg TNT</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    isLight ? "bg-red-50 border-red-300 shadow-sm" : "bg-red-950/30 border-red-500/30"
                  }`}>
                    <span className={`text-[9px] uppercase font-sans font-bold block ${
                      isLight ? "text-red-800" : "text-red-300"
                    }`}>Lethal Blast (&gt;5 PSI)</span>
                    <span className={`text-lg font-black ${
                      isLight ? "text-red-700" : "text-red-400"
                    }`}>{blastRadius} m</span>
                  </div>
                  <div className={`p-3 rounded-xl border ${
                    isLight ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-emerald-950/30 border-emerald-500/30"
                  }`}>
                    <span className={`text-[9px] uppercase font-sans font-bold block ${
                      isLight ? "text-emerald-800" : "text-emerald-300"
                    }`}>Safe Perimeter</span>
                    <span className={`text-lg font-black ${
                      isLight ? "text-emerald-700" : "text-emerald-400"
                    }`}>{safePerimeter} m</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      sound.click();
                      onNavigateView("physics_sandbox");
                    }}
                    className={`px-4 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                        : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200"
                    }`}
                  >
                    <span>Open Interactive Physics Sandbox</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-PANEL 3: BOW-TIE BARRIER DIAGRAM (INTERACTIVE CLICKABLE NODES)
            ------------------------------------------------------------- */}
            {activeSubTab === "bowtie" && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-6 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50"
                    : isPetroleum
                    ? "bg-[#071324]/95 border-amber-500/25 text-amber-100 shadow-black/80"
                    : "bg-[#090e18]/95 border-white/[0.08] text-slate-100 shadow-black/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className={`text-base font-black tracking-tight flex items-center gap-2 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      <Layers className="w-4 h-4 text-cyan-500" />
                      <span>Bow-Tie Barrier Degradation Analysis</span>
                    </h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                      Click any threat, barrier, or consequence node to inspect root-cause degradation mechanisms and statutory OMR clauses.
                    </p>
                  </div>
                  <div className={`text-[11px] font-mono flex items-center gap-1 ${
                    isLight ? "text-cyan-800 font-bold" : "text-cyan-400"
                  }`}>
                    <Info className="w-3.5 h-3.5" />
                    <span>Interactive Nodes (Click to Inspect)</span>
                  </div>
                </div>

                {/* Bow-Tie Visual Layout with Interactive Clickable Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 text-xs items-center">
                  {/* Column 1: Initiating Threats */}
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                      isLight ? "text-slate-700 font-bold" : "text-slate-400"
                    }`}>
                      Initiating Threats
                    </span>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["threat-1"]);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all space-y-1 active:scale-98 ${
                        isLight
                          ? "bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm"
                          : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className={`font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>Flange Unseating</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>Torque relaxation &amp; bolt fatigue</div>
                    </button>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["threat-2"]);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all space-y-1 active:scale-98 ${
                        isLight
                          ? "bg-slate-50 hover:bg-slate-100 border-slate-200 shadow-sm"
                          : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className={`font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>Trapped Line Pressure</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>3,150 PSI line charged during cold work</div>
                    </button>
                  </div>

                  {/* Column 2: Preventive Barriers */}
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                      isLight ? "text-orange-700 font-bold" : "text-orange-400"
                    }`}>
                      Preventive Barriers
                    </span>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["barrier-dbb"]);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all active:scale-98 ${
                        isLight
                          ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-900 shadow-sm"
                          : "bg-red-950/30 hover:bg-red-950/50 border-red-500/40 text-red-300"
                      }`}
                    >
                      <span className="font-bold block">Double Block &amp; Bleed</span>
                      <span className={`text-[10px] ${isLight ? "text-red-700 font-semibold" : "opacity-75"}`}>FAILED &bull; Bleed not cracked</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["barrier-gauge"]);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all active:scale-98 ${
                        isLight
                          ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-900 shadow-sm"
                          : "bg-red-950/30 hover:bg-red-950/50 border-red-500/40 text-red-300"
                      }`}
                    >
                      <span className="font-bold block">Positive Gauge Inspection</span>
                      <span className={`text-[10px] ${isLight ? "text-red-700 font-semibold" : "opacity-75"}`}>FAILED &bull; Dial seized at 0 PSI</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["barrier-shield"]);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all active:scale-98 ${
                        isLight
                          ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900 shadow-sm"
                          : "bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                      }`}
                    >
                      <span className="font-bold block">Eye Impact Shield</span>
                      <span className={`text-[10px] ${isLight ? "text-emerald-700 font-semibold" : "opacity-75"}`}>FUNCTIONING &bull; Deflected shard</span>
                    </button>
                  </div>

                  {/* Column 3: Top Event (Center) */}
                  <button
                    onClick={() => {
                      sound.click();
                      setSelectedBowTieNode(BOW_TIE_DETAILS["top-event"]);
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-b from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 border-2 border-orange-400 text-center space-y-2 shadow-xl transition-all active:scale-98 cursor-pointer text-white"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-orange-200 block font-mono">
                      TOP HAZARD EVENT (CLICK)
                    </span>
                    <div className="font-black text-sm text-white">Loss of Primary Containment</div>
                    <p className="text-[10px] text-orange-100">
                      Uncontained 3,150 PSI hydrocarbon aerosol jet release into work corridor.
                    </p>
                  </button>

                  {/* Column 4: Mitigative Barriers */}
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                      isLight ? "text-cyan-700 font-bold" : "text-cyan-400"
                    }`}>
                      Mitigative Barriers
                    </span>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["barrier-deluge"]);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all active:scale-98 ${
                        isLight
                          ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-900 shadow-sm"
                          : "bg-red-950/30 hover:bg-red-950/50 border-red-500/40 text-red-300"
                      }`}
                    >
                      <span className="font-bold block">Water Deluge Curtain</span>
                      <span className={`text-[10px] ${isLight ? "text-red-700 font-semibold" : "opacity-75"}`}>OFFLINE &bull; Supply valve isolated</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["barrier-acoustic"]);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all active:scale-98 ${
                        isLight
                          ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900 shadow-sm"
                          : "bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                      }`}
                    >
                      <span className="font-bold block">38.4 kHz Ultrasonic Sensor</span>
                      <span className={`text-[10px] ${isLight ? "text-emerald-700 font-semibold" : "opacity-75"}`}>ACTIVE &bull; 40 min early weep alarm</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["barrier-evac"]);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all active:scale-98 ${
                        isLight
                          ? "bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                          : "bg-amber-950/30 hover:bg-amber-950/50 border-amber-500/40 text-amber-300"
                      }`}
                    >
                      <span className="font-bold block">Area Evacuation Zone</span>
                      <span className={`text-[10px] ${isLight ? "text-amber-800 font-semibold" : "opacity-75"}`}>PARTIAL &bull; Worker in line-of-fire</span>
                    </button>
                  </div>

                  {/* Column 5: Catastrophic Consequences */}
                  <div className="space-y-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${
                      isLight ? "text-red-700 font-bold" : "text-red-400"
                    }`}>
                      Potential Consequences
                    </span>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["consequence-injection"]);
                      }}
                      className={`w-full text-left p-3 rounded-xl border space-y-1 transition-all active:scale-98 ${
                        isLight
                          ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-900 shadow-sm"
                          : "bg-red-950/30 hover:bg-red-950/50 border-red-500/40 text-red-300"
                      }`}
                    >
                      <div className={`font-black ${isLight ? "text-red-900" : "text-red-300"}`}>Fatal Fluid Injection</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-700 font-medium" : "text-slate-300"}`}>Direct 3,150 PSI skin perforation</div>
                    </button>
                    <button
                      onClick={() => {
                        sound.click();
                        setSelectedBowTieNode(BOW_TIE_DETAILS["consequence-bleve"]);
                      }}
                      className={`w-full text-left p-3 rounded-xl border space-y-1 transition-all active:scale-98 ${
                        isLight
                          ? "bg-red-50 hover:bg-red-100 border-red-300 text-red-900 shadow-sm"
                          : "bg-red-950/30 hover:bg-red-950/50 border-red-500/40 text-red-300"
                      }`}
                    >
                      <div className={`font-black ${isLight ? "text-red-900" : "text-red-300"}`}>Vapor Cloud Detonation</div>
                      <div className={`text-[10px] ${isLight ? "text-slate-700 font-medium" : "text-slate-300"}`}>184 kg TNT overpressure shockwave</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-PANEL 4: 5-POINT STATUTORY CAPA DIRECTIVE (INTERACTIVE VERIFICATION)
            ------------------------------------------------------------- */}
            {activeSubTab === "capa" && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-6 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50"
                    : isPetroleum
                    ? "bg-[#071324]/95 border-amber-500/25 text-amber-100 shadow-black/80"
                    : "bg-[#090e18]/95 border-white/[0.08] text-slate-100 shadow-black/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className={`text-base font-black tracking-tight flex items-center gap-2 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-purple-500" />
                      <span>Statutory Corrective &amp; Preventive Actions (CAPA Directive)</span>
                    </h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                      Check off remediations as verified by field engineering to advance statutory compliance certification.
                    </p>
                  </div>

                  {/* Dynamic Compliance Progress Bar */}
                  <div className="w-full sm:w-64 space-y-1 text-right">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className={isLight ? "text-slate-600" : "text-slate-400"}>DGMS Compliance:</span>
                      <span className={
                        isLight
                          ? complianceScorePercent === 100 ? "text-emerald-700" : "text-amber-800"
                          : complianceScorePercent === 100 ? "text-emerald-400" : "text-amber-400"
                      }>
                        {complianceScorePercent}% ({verifiedCapaCount}/5 Verified)
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden border ${
                      isLight ? "bg-slate-200 border-slate-300" : "bg-black/50 border-white/10"
                    }`}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          complianceScorePercent === 100
                            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                            : "bg-gradient-to-r from-amber-500 to-orange-500"
                        }`}
                        style={{ width: `${complianceScorePercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 100% Compliance Seal */}
                {complianceScorePercent === 100 && (
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 ${
                    isLight ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-emerald-950/40 border-emerald-500/50"
                  }`}>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                      <div>
                        <span className={`text-xs font-black block ${
                          isLight ? "text-emerald-950" : "text-emerald-300"
                        }`}>
                          DGMS FORM IV-A STATUTORY REMEDIATION COMPLETE
                        </span>
                        <span className={`text-[11px] font-medium ${
                          isLight ? "text-slate-700" : "text-slate-300"
                        }`}>
                          All mandatory physical barriers and training directives have been audited and verified.
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-mono text-xs font-extrabold shadow-md shrink-0">
                      FULLY CERTIFIED
                    </span>
                  </div>
                )}

                {/* CAPA List with Interactive Checkboxes */}
                <div className="space-y-3 text-xs">
                  {[
                    {
                      id: "CAPA-01",
                      timeframe: "IMMEDIATE (24 HOURS)",
                      title: "Physical Double-Block-and-Bleed Verification",
                      action:
                        "Issue mandatory hold-point requiring secondary mechanical bleed cracking to 0 PSI before loosening any bolt on lines exceeding 150 PSI.",
                      owner: "Lead Mechanical Engineer &bull; Zone D Maintenance",
                    },
                    {
                      id: "CAPA-02",
                      timeframe: "48 HOURS",
                      title: "38.4 kHz Piezoelectric Ultrasonic Array Re-Calibration",
                      action:
                        "Calibrate sensor node AC-104 and verify threshold frequency bandpass at 38.4 kHz. Audit SCADA alarming link.",
                      owner: "Instrumentation &amp; Control Team",
                    },
                    {
                      id: "CAPA-03",
                      timeframe: "72 HOURS",
                      title: "Relief Valve PSV-102 Bench Pressure Test",
                      action:
                        "Remove primary relief valve PSV-102 for full bench pop-test and setpoint recertification under OISD-132 standards.",
                      owner: "Safety Relief Valve Workshop",
                    },
                    {
                      id: "CAPA-04",
                      timeframe: "7 DAYS",
                      title: "SOP-OI-OFF-MNT-402 Workforce Retraining",
                      action:
                        "Conduct mandatory classroom and field LOTO refresher training for all maintenance crew and contract supervisors.",
                      owner: "EHS Training Directorate",
                    },
                    {
                      id: "CAPA-05",
                      timeframe: "14 DAYS",
                      title: "Statutory DGMS Form IV-A Regulatory Closure Filing",
                      action:
                        "Submit certified investigation findings, Hopkinson blast analysis, and barrier audit trail to Regional DGMS Inspector.",
                      owner: "Concerned Safety Official (DGMS Inspector)",
                    },
                  ].map((capa) => {
                    const isChecked = !!capaState[capa.id];
                    return (
                      <div
                        key={capa.id}
                        onClick={() => handleToggleCapa(capa.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 active:scale-99 ${
                          isChecked
                            ? isLight
                              ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                              : "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/70"
                            : isLight
                            ? "bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm"
                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? "bg-emerald-600 border-emerald-400 text-white"
                                : isLight
                                ? "border-slate-300 bg-white"
                                : "border-white/30 bg-black/40 text-transparent"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-mono font-black ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>{capa.id}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                                isLight
                                  ? "bg-orange-100 border-orange-300 text-orange-800"
                                  : "bg-orange-950/60 border-orange-500/40 text-orange-300"
                              }`}>
                                {capa.timeframe}
                              </span>
                              <span className={`font-bold text-sm ${
                                isChecked
                                  ? isLight ? "text-emerald-950 font-black" : "text-emerald-200"
                                  : isLight ? "text-slate-900" : "text-slate-100"
                              }`}>
                                {capa.title}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${
                              isLight ? "text-slate-700 font-medium" : "text-slate-300"
                            }`}>{capa.action}</p>
                            <div className={`text-[10px] font-mono ${
                              isLight ? "text-slate-600 font-semibold" : "text-slate-400"
                            }`}>{capa.owner}</div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-8 sm:pl-0">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border ${
                              isChecked
                                ? isLight
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                  : "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                                : isLight
                                ? "bg-amber-100 border-amber-300 text-amber-800"
                                : "bg-amber-950/60 border-amber-500/50 text-amber-300"
                            }`}
                          >
                            {isChecked ? "VERIFIED & ENFORCED" : "PENDING AUDIT"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-PANEL 5: MASTER HISTORICAL REGISTRY (14 CASES)
            ------------------------------------------------------------- */}
            {activeSubTab === "registry" && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-6 ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/50"
                    : isPetroleum
                    ? "bg-[#071324]/95 border-amber-500/25 text-amber-100 shadow-black/80"
                    : "bg-[#090e18]/95 border-white/[0.08] text-slate-100 shadow-black/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-base font-black tracking-tight flex items-center gap-2 ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}>
                      <Database className="w-4 h-4 text-blue-500" />
                      <span>Master Historical Disaster &amp; Hazard Registry</span>
                    </h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                      Comprehensive industrial database of 14 benchmark events including Assam Baghjan, IOCL Jaipur, and BP Texas City.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      sound.click();
                      downloadMasterExcelReport(HISTORICAL_HAZARDS, officerProfile);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Download Master 14-Incident Excel Ledger</span>
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Search historical hazards by title, site, hazard energy, or sector..."
                    className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-mono transition-all ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        : "bg-black/40 border-white/10 text-slate-200 focus:outline-none focus:border-cyan-500"
                    }`}
                  />
                </div>

                {/* Table */}
                <div className={`overflow-x-auto rounded-xl border ${
                  isLight ? "border-slate-200 shadow-sm" : "border-white/10"
                }`}>
                  <table className="w-full text-left text-xs font-mono">
                    <thead className={`text-[10px] uppercase font-sans font-bold border-b ${
                      isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-white/[0.04] text-slate-400 border-white/10"
                    }`}>
                      <tr>
                        <th className="p-3">Incident ID</th>
                        <th className="p-3">Title &amp; Facility</th>
                        <th className="p-3">Year</th>
                        <th className="p-3">Hazard Energy</th>
                        <th className="p-3">Classification</th>
                        <th className="p-3 text-right">Discordance Gap</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-white/5"}`}>
                      {filteredHazards.map((h) => (
                        <tr key={h.id} className={`transition-colors ${
                          isLight ? "hover:bg-slate-50 text-slate-800" : "hover:bg-white/[0.02] text-slate-200"
                        }`}>
                          <td className={`p-3 font-bold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>{h.incidentNumber}</td>
                          <td className="p-3 font-sans">
                            <div className={`font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>{h.title}</div>
                            <div className={`text-[10px] ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>{h.facility}</div>
                          </td>
                          <td className={`p-3 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>{h.date}</td>
                          <td className={`p-3 font-sans text-[11px] ${isLight ? "text-amber-800 font-semibold" : "text-amber-300"}`}>{h.energyType}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                h.classification === "CRITICAL EVENT"
                                  ? isLight
                                    ? "bg-red-100 border-red-300 text-red-800"
                                    : "bg-red-950/60 border-red-500/50 text-red-400"
                                  : h.classification === "SIF PRECURSOR"
                                  ? isLight
                                    ? "bg-orange-100 border-orange-300 text-orange-800"
                                    : "bg-orange-950/60 border-orange-500/50 text-orange-400"
                                  : isLight
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                  : "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                              }`}
                            >
                              {h.classification}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-black ${isLight ? "text-slate-900" : "text-slate-200"}`}>{h.discordanceGap}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            MODAL: BOW-TIE BARRIER NODE INSPECTOR
        =================================================================== */}
        {selectedBowTieNode && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div
              className={`max-w-lg w-full rounded-3xl border shadow-2xl p-6 space-y-4 ${
                isLight
                  ? "bg-white border-slate-300 text-slate-800"
                  : isPetroleum
                  ? "bg-[#091526] border-amber-500/30 text-amber-100"
                  : "bg-[#0e1626] border-white/20 text-slate-100"
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${
                isLight ? "border-slate-200" : "border-white/10"
              }`}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      selectedBowTieNode.status === "FUNCTIONING"
                        ? "bg-emerald-500"
                        : selectedBowTieNode.status === "PARTIAL"
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                  />
                  <h3 className={`font-bold text-sm tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>{selectedBowTieNode.title}</h3>
                </div>
                <button
                  onClick={() => {
                    sound.click();
                    setSelectedBowTieNode(null);
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    isLight ? "text-slate-500 hover:text-slate-800 hover:bg-slate-100" : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
                }`}>
                  <span className={`text-[10px] font-mono font-bold uppercase block ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
                    Statutory Rule &bull; DGMS Mandate
                  </span>
                  <p className={`font-bold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>{selectedBowTieNode.omrClause}</p>
                </div>

                <div className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
                }`}>
                  <span className={`text-[10px] font-mono font-bold uppercase block ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
                    Root-Cause Degradation Mechanism
                  </span>
                  <p className={`leading-relaxed ${isLight ? "text-slate-800 font-medium" : "text-slate-300"}`}>{selectedBowTieNode.degradationMechanism}</p>
                </div>

                <div className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-emerald-950/30 border-emerald-500/30"
                }`}>
                  <span className={`text-[10px] font-mono font-bold uppercase block ${
                    isLight ? "text-emerald-800" : "text-emerald-400"
                  }`}>
                    Mandated Engineering Remediation
                  </span>
                  <p className={`leading-relaxed ${isLight ? "text-emerald-950 font-medium" : "text-emerald-200"}`}>{selectedBowTieNode.mitigationAction}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    sound.click();
                    setSelectedBowTieNode(null);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 border shadow-sm"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
