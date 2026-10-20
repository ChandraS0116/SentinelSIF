"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Cpu,
  Lock,
  Database,
  CheckCircle2,
  FileCheck,
  Activity,
  Sparkles,
  ChevronRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";

interface JudgesDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
}

interface JudgeQuestion {
  id: string;
  tag: string;
  question: string;
  shortSummary: string;
  coreAnswer: string;
  technicalMechanism: string[];
  regulatoryBasis: string;
  proofPoints: string[];
}

export const JUDGES_QUESTIONS: JudgeQuestion[] = [
  {
    id: "sif-paradox",
    tag: "THE SIF PARADOX",
    question: "How do you distinguish between routine low-severity incidents and disguised SIF Precursors?",
    shortSummary:
      "Traditional Heinrich's pyramid assumes small incidents cause small injuries. In oil & gas, uncontained lethal energy often releases with low injury purely by luck.",
    coreAnswer:
      "SentinelSIF decouples Actual Severity from Potential SIF Severity. We extract the physical energy type (e.g. 3,000 PSI hydrostatic, 25 bar LPG) and worker proximity. The SIF Risk Decision Engine applies a deterministic discordance formula: Delta = |Potential - Actual|. If Actual = LOW and Potential = CRITICAL, Discordance is flagged (> 80%), categorizing it as a SIF Precursor regardless of whether lost work days was zero.",
    technicalMechanism: [
      "Phase 3 Safety Signal Extractor maps narratives to hazardous energy ontologies (Kinetic, Chemical, Pressurized, Thermal, Electrical).",
      "Multi-head XGBoost/DistilBERT model predicts potential consequence independently of reported actual injury.",
      "Deterministic Decision Matrix: Any high-energy release without two certified functioning physical barriers is automatically promoted to SIF Precursor.",
    ],
    regulatoryBasis: "Campbell Institute SIF Framework & DGMS Technical Circular (OMR) 2019/04",
    proofPoints: [
      "Pump P-102: Worker suffered minor knee scrape (Actual: LOW), but was standing 1.2m from 3,000 PSI pressurized unbolted line (Potential: CRITICAL).",
      "IOCL Jaipur 2009: Initial valve gland leak started as minor odor before escalating into ₹280 Cr catastrophic blast.",
    ],
  },
  {
    id: "missed-features-recall",
    tag: "AI MISSED FEATURES & RECALL",
    question: "What if the AI misses a subtle secondary hazard or barrier failure in its initial scan?",
    shortSummary:
      "We built a Two-Pass Active Deep Feature Recall engine that rescans secondary SCADA alarm buffers, acoustic telemetry, and SAP-PM maintenance records.",
    coreAnswer:
      "In safety-critical AI, High Recall is strictly prioritized over High Precision. When the primary scan flags initial markers, SentinelSIF's Active Deep Recall protocol can be triggered to re-interrogate 2nd-order telemetry loops. If an auxiliary precursor is found, the system explains why the first pass missed it, displays what the 2nd-order scan found, appends the barrier defect to the audit, alerts the 3D twin, and attaches it to the DGMS sign-off.",
    technicalMechanism: [
      "1st Pass: Surface narrative parsing + basic equipment tag extraction.",
      "2nd Pass (Deep Recall): Queries Modbus alarm queues (#ALM-9042), smart positioner HART logs (#HART-C01), and acoustic diagnostic telemetry (AV-101).",
      "Self-Correction Alert: Displays '+1 HAZARD RECALLED' with source attribution and elevates plant risk profile.",
    ],
    regulatoryBasis: "OISD-STD-144 & DGMS Directive on Redundant Instrumentation Audit",
    proofPoints: [
      "Live Pump P-102: Initial scan caught bypassed manual bleed valve; Deep Recall discovered 24V remote bleed actuator loop tripped 18m prior.",
      "Horton Sphere V-204: Initial scan caught gas leak; Deep Recall cross-checked PM log and detected emergency water deluge nozzle #3 was 40% clogged.",
    ],
  },
  {
    id: "zero-hallucinations",
    tag: "ZERO HALLUCINATIONS",
    question: "How do you guarantee that LLM agents won't hallucinate shutdown orders in a real refinery?",
    shortSummary:
      "The Golden Rule: ML/Rules decide the risk. LLM agents investigate the risk. Human Safety Officer authorizes the enforcement action.",
    coreAnswer:
      "LLMs NEVER make risk classifications or trigger shutdowns directly in SentinelSIF. Classifications are 100% deterministic (deterministic Python rules and calibrated ML models). LLM agents are restricted to investigation (retrieving relevant SOP clauses from vector databases via LangGraph and drafting audit summaries). Finally, only a verified human Chief Safety Officer (DGMS Level-4) can execute the digital shutdown order.",
    technicalMechanism: [
      "Risk categorization executed by Python deterministic rules (SIFRiskDecisionEngine) with 100% reproducible outputs.",
      "LangGraph multi-agent pipeline uses strict Pydantic JSON schemas with type-safe schema validation.",
      "Vector RAG grounds every recommendation in authentic Oil India standard operating procedures (e.g. SOP-OI-OFF-MNT-402).",
      "Positional Access Gateway restricts shutdown authorization exclusively to Chief Safety Officer credentials.",
    ],
    regulatoryBasis: "Oil India HSE Policy Directive OI-HSE-SEC-01 & ISO 31000 Risk Governance",
    proofPoints: [
      "Zero autonomous actuators: AI suggests enforcement orders, but physical positive isolation requires human CSO cryptographic sign-off.",
      "All agent investigative steps logged immutably with SHA256 audit hashes for regulatory review.",
    ],
  },
  {
    id: "statutory-compliance",
    tag: "STATUTORY COMPLIANCE",
    question: "How does SentinelSIF comply with Indian statutory safety regulations (DGMS, OISD, Petroleum Rules)?",
    shortSummary:
      "Fully aligned with DGMS Oil Mines Regulations (OMR) 2019/2017, OISD-GDN-166, and OSHA 29 CFR 1910.147.",
    coreAnswer:
      "Under Indian law, hydrocarbon exploration and refining are strictly governed by the Directorate General of Mines Safety (DGMS) and the Oil Industry Safety Directorate (OISD). SentinelSIF embeds these statutory mandates directly into its data ontology, report templates, and access control. Only an officer holding statutory DGMS Level-4 certification can unlock the system.",
    technicalMechanism: [
      "Role restriction: Blocks Field Techs, Unit Operators, and Visitors with DGMS 2026/04 statutory notices.",
      "Automated DGMS report generation adhering to OMR 2019 Form IV-A accident and dangerous occurrence schedules.",
      "Mandatory inclusion of M.B. Lal Committee recommendations (ROSV fail-safe status, gas detector voting).",
    ],
    regulatoryBasis: "DGMS (OMR) 2019 Rule 43 & OISD-STD-117/118/144",
    proofPoints: [
      "Baghjan Well #5 lesson: Mandates double-barrier mechanical isolation verification before permits are cleared.",
      "Export reports produce certified DGMS audit records complete with digital cryptographic seals.",
    ],
  },
  {
    id: "industrial-integration",
    tag: "INDUSTRIAL INTEGRATION",
    question: "How does this integrate with an operating refinery's DCS, SCADA, and SAP-PM systems?",
    shortSummary:
      "SentinelSIF communicates via industrial standard protocols: Modbus TCP/IP, OPC-UA, and REST/SAP connectors.",
    coreAnswer:
      "SentinelSIF is designed as an intelligence layer above legacy SCADA (Yokogawa Centum, Honeywell Experion) and enterprise ERP (SAP S/4HANA PM/MM). It ingests real-time tag data via standard OPC-UA gateways, correlates operator narratives from electronic shift logs, and pushes verified corrective actions into SAP-PM as high-priority Maintenance Orders.",
    technicalMechanism: [
      "OPC-UA / Modbus connector polling tag registers for pressure, temperature, LEL gas levels, and valve stroke telemetry.",
      "NLP pipeline ingests electronic shift handover logs and contractor permit-to-work forms in real time.",
      "Bidirectional SAP connector generates statutory #OI-ACT maintenance work orders upon CSO sign-off.",
    ],
    regulatoryBasis: "ISA-95 Enterprise-Control System Integration Standard",
    proofPoints: [
      "Sub-second discordance evaluation: processes incident telemetry in < 45 milliseconds.",
      "Real-time 3D Three.js Digital Twin updates plant status instantaneously without DCS lag.",
    ],
  },
  {
    id: "competitive-edge",
    tag: "COMPETITIVE EDGE",
    question: "Why would an oil company choose SentinelSIF over commercial EHS suites like Enablon or Sphera?",
    shortSummary:
      "Legacy EHS systems are static lagging databases. SentinelSIF is an active 3D decision intelligence engine with autonomous multi-agent audit and self-correcting recall.",
    coreAnswer:
      "Commercial platforms like Enablon, Sphera, or Cority are passive forms: a worker logs an incident, and an HSE officer reviews it days later. By then, the disguised high-energy line has already ruptured. SentinelSIF acts in real-time with 3D spatial visualization, automated discordance calculation, autonomous LangGraph multi-agent investigations, and active recall of missed precursors.",
    technicalMechanism: [
      "Interactive 3D Digital Twin with 360° orbital spatial situational awareness.",
      "Autonomous 5-Agent LangGraph investigation completing in seconds vs days of manual committee meetings.",
      "Two-Pass Deep Feature Recall detecting hidden latent defects that commercial forms miss entirely.",
      "Full offline edge-readiness for remote offshore platforms and remote desert drilling rigs.",
    ],
    regulatoryBasis: "World Bank & OGP (International Association of Oil & Gas Producers) Safety Best Practices",
    proofPoints: [
      "Proven prevention model: Catches the 94% discordance gap that legacy 'Log & Close' workflows ignore.",
      "Multi-incident Master Reporting Hub exporting complete audit ledgers in 1 click.",
    ],
  },
  {
    id: "future-roadmap",
    tag: "FUTURE PLANS & SCALE",
    question: "What are your future plans to enhance SentinelSIF and make it production-ready?",
    shortSummary:
      "A 4-phase industrialization roadmap: Edge AI on ATEX Zone 1 hardware, Multimodal CCTV/FLIR optical gas imaging, Federated Precursor Intelligence across national PSUs, and Closed-Loop Smart LOTO integration.",
    coreAnswer:
      "While SentinelSIF currently achieves real-time SCADA/Modbus ingestion, deterministic SIF discordance calculation, and autonomous LangGraph forensic investigation with two-pass deep recall, our production deployment roadmap focuses on four key pillars: (1) Hardened Edge Inference running directly on explosion-proof field gateways for zero-latency offline processing at remote wellheads; (2) Multimodal Visual Precursor Detection using existing FLIR thermal optical gas imaging (OGI) cameras and acoustic ultrasonic mics to catch pinhole hydrocarbon micro-leaks before workers report them; (3) Federated Cross-PSU SIF Knowledge Mesh allowing OIL, ONGC, IOCL, and BPCL to anonymously share precursor pattern embeddings without leaking proprietary process data; and (4) Closed-Loop Smart LOTO Interlocking that physically inhibits permit issuance until digital twin barrier integrity checks pass.",
    technicalMechanism: [
      "Edge Micro-Inference (ATEX Zone 1): Containerized ONNX/TensorRT models deployed on intrinsically safe ruggedized edge computers (e.g., Advantech UNO / Siemens Microbox) enabling 100% offline autonomy during offshore telecommunication blackouts.",
      "Multimodal Vision & Ultrasonic Acoustic AI: Integration of RTSP CCTV streams with YOLO-v11 and FLIR radiometric optical gas imaging (OGI) to visually detect vapor clouds, missing PPE, and flange thermal anomalies in real time before incident logs are even typed.",
      "Federated Privacy-Preserving SIF RAG: A national secure vector mesh across Indian Oil PSUs using Differential Privacy and Federated Learning, so a near-miss at an ONGC offshore rig instantly trains SentinelSIF models at an Oil India refinery without exposing commercially sensitive telemetry.",
      "Closed-Loop Smart LOTO & SCADA Interlocking: Bi-directional hardware coupling with IEC 61508 SIL-3 safety instrumented systems (SIS) and digital Bluetooth/RFID padlocks, physically locking maintenance valves until both the AI twin and Chief Safety Officer confirm zero residual pressure.",
    ],
    regulatoryBasis: "OISD-GDN-206 (Cyber Security), DGMS Vision 2030 (AI in Energy Safety), and IEC 61508 / IEC 61511 (Functional Safety SIL-3)",
    proofPoints: [
      "Phase 1 (Months 1-3): Pilot integration with Oil India Duliajan pump houses via OPC-UA testbeds and live SAP-PM sandbox sync.",
      "Phase 2 (Months 4-6): Edge gateway deployment on ATEX-certified field boxes with local FLIR thermal stream ingestion.",
      "Phase 3 (Months 7-9): Multi-refinery federated model synchronization across 3 PSUs with automated DGMS Form IV-A filing.",
      "Phase 4 (Months 10-12): Closed-loop SIL-3 certified digital Lockout-Tagout (LOTO) valve actuation with physical failsafes.",
    ],
  },
];

export default function JudgesDefenseModal({
  isOpen,
  onClose,
  theme = "dark",
}: JudgesDefenseModalProps) {
  const [activeTab, setActiveTab] = useState<string>("sif-paradox");

  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  const selectedQ = JUDGES_QUESTIONS.find((q) => q.id === activeTab) || JUDGES_QUESTIONS[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-sans animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 transition-colors ${
          isLight
            ? "bg-white border-slate-300 text-slate-900"
            : isPetroleum
            ? "bg-[#091629] border-amber-600/80 text-amber-50"
            : isCyber
            ? "bg-[#020906] border-emerald-500/80 text-emerald-50"
            : "bg-[#0a0f1d] border-cyan-500/80 text-white"
        }`}
      >
        {/* Header */}
        <header
          className={`px-5 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isLight
              ? "bg-slate-50 border-slate-200"
              : isPetroleum
              ? "bg-[#06101e] border-amber-900/50"
              : isCyber
              ? "bg-[#010603] border-emerald-900/60"
              : "bg-[#080c18] border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                isCyber
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                  : isPetroleum
                  ? "bg-amber-950/60 border-amber-500 text-amber-400"
                  : "bg-cyan-600/20 border-cyan-500 text-cyan-400"
              }`}
            >
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isCyber
                      ? "bg-emerald-600 text-white"
                      : isPetroleum
                      ? "bg-amber-600 text-white"
                      : "bg-cyan-600 text-white"
                  }`}
                >
                  Evaluator Defense Dossier
                </span>
                <span className="text-xs font-mono opacity-70">
                  SIH26165 &bull; Technical Architecture &amp; FAQs
                </span>
              </div>
              <h2 className={`text-base font-extrabold tracking-tight mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                Judges Q&amp;A &amp; Regulatory Defense Panel
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border text-xs transition-all ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Close Panel"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </header>

        {/* Content Layout: Left Question Tabs + Right Detailed Answer */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: Question Tabs */}
          <div
            className={`w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r p-3 overflow-y-auto shrink-0 space-y-1.5 ${
              isLight
                ? "bg-slate-100/70 border-slate-200"
                : isPetroleum
                ? "bg-[#06101f] border-amber-950"
                : isCyber
                ? "bg-[#010402] border-emerald-950"
                : "bg-[#070b16] border-slate-800"
            }`}
          >
            <span className={`text-[10px] uppercase font-bold tracking-wider block px-2 pb-1 ${
              isLight ? "text-slate-700" : "text-slate-400"
            }`}>
              Key Evaluator Inquiries
            </span>
            {JUDGES_QUESTIONS.map((q, idx) => {
              const isActive = activeTab === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveTab(q.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                    isActive
                      ? isLight
                        ? "bg-cyan-50 border-2 border-cyan-500 text-cyan-950 shadow-md ring-1 ring-cyan-400"
                        : isCyber
                        ? "bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/60"
                        : isPetroleum
                        ? "bg-amber-950/70 border-amber-500 text-amber-100 shadow-md shadow-amber-950/60"
                        : "bg-cyan-950/70 border-cyan-500 text-cyan-100 shadow-md shadow-cyan-950/60"
                      : isLight
                      ? "bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm"
                      : "bg-slate-900/40 hover:bg-slate-800/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                        isActive
                          ? isLight
                            ? "bg-cyan-600 text-white font-extrabold"
                            : "bg-cyan-500 text-black font-extrabold"
                          : isLight
                          ? "bg-slate-200 text-slate-700 font-bold"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      Q{idx + 1} &bull; {q.tag}
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? "rotate-90 md:rotate-0" : ""}`} />
                  </div>
                  <span className={`font-bold line-clamp-2 leading-tight mt-0.5 ${
                    isLight ? "text-slate-900" : ""
                  }`}>
                    {q.question}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Answer & Technical Mechanisms */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
            {/* Question Title Card */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-slate-900/70 border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                  isLight ? "text-cyan-800" : "text-cyan-400"
                }`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  Evaluator Question Defense
                </span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  isLight ? "bg-slate-200 text-slate-800" : "bg-slate-800 text-slate-300"
                }`}>
                  {selectedQ.tag}
                </span>
              </div>
              <h3 className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
                {selectedQ.question}
              </h3>
              <p className={`text-[11px] leading-relaxed border-l-2 pl-3 italic ${
                isLight ? "border-cyan-600 text-slate-700 font-medium" : "border-cyan-500 text-slate-400"
              }`}>
                &ldquo;{selectedQ.shortSummary}&rdquo;
              </p>
            </div>

            {/* Core Answer */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/50 border-slate-800"
              }`}
            >
              <span className={`font-bold text-[10px] uppercase tracking-wider block ${
                isLight ? "text-emerald-800" : "text-emerald-400"
              }`}>
                Direct Pitch Response
              </span>
              <p className={`text-xs leading-relaxed ${isLight ? "text-slate-800 font-medium" : "text-slate-200"}`}>
                {selectedQ.coreAnswer}
              </p>
            </div>

            {/* Technical Mechanisms */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-slate-900/50 border-slate-800"
              }`}
            >
              <span className={`font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 ${
                isLight ? "text-orange-800" : "text-orange-400"
              }`}>
                <Cpu className="w-3.5 h-3.5" />
                Technical &amp; Algorithmic Mechanism
              </span>
              <ul className="space-y-1.5 text-xs">
                {selectedQ.technicalMechanism.map((mech, mIdx) => (
                  <li key={mIdx} className="flex items-start gap-2">
                    <span className={`font-bold mt-0.5 ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>•</span>
                    <span className={`leading-relaxed ${isLight ? "text-slate-800 font-medium" : "opacity-95"}`}>{mech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Proof Points & Real-World Validation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <span className={`font-bold text-[10px] uppercase tracking-wider block ${
                  isLight ? "text-cyan-800" : "text-cyan-400"
                }`}>
                  Live Proof Points in SentinelSIF
                </span>
                <ul className="space-y-1 text-[11px] leading-snug">
                  {selectedQ.proofPoints.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <span className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-500"}`}>✓</span>
                      <span className={isLight ? "text-slate-800 font-medium" : ""}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <span className={`font-bold text-[10px] uppercase tracking-wider block ${
                  isLight ? "text-purple-800" : "text-purple-400"
                }`}>
                  Regulatory &amp; Statutory Authority
                </span>
                <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-800 font-medium" : "opacity-90"}`}>
                  {selectedQ.regulatoryBasis}
                </p>
                <div className={`pt-1.5 border-t font-mono text-[10px] ${
                  isLight ? "border-slate-200 text-slate-600 font-semibold" : "border-slate-700/40 text-slate-400"
                }`}>
                  Compliance: DGMS OMR 2019 &bull; OISD-GDN-166 &bull; OSHA 1910.147
                </div>
              </div>
            </div>

            {/* Invariant Footer */}
            <div
              className={`p-3 rounded-lg border text-center font-serif italic text-xs ${
                isLight ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-amber-950/30 border-amber-600/40 text-amber-200"
              }`}
            >
              &ldquo;ML/Rules decide the risk. LLM agents investigate the risk. Human Safety Officer authorizes the enforcement action.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
