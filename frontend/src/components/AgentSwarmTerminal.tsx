"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal,
  Cpu,
  Layers,
  Database,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot,
  Activity,
  Zap,
} from "lucide-react";

interface AgentSwarmTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
}

export default function AgentSwarmTerminal({
  isOpen,
  onClose,
  theme = "dark",
}: AgentSwarmTerminalProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  const [activeTab, setActiveTab] = useState<"terminal" | "dag" | "rag">("terminal");
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([
    "[00:00:01.014] [OPC-UA] Polling NodeId: ns=2;s=Refinery.ZoneD.Pump102.PT_Discharge -> 3,150.4 PSI",
    "[00:00:01.032] [OPC-UA] Polling NodeId: ns=2;s=Refinery.ZoneD.Pump102.LEL_GasDet -> 78.2% LEL",
    "[00:00:01.045] [MODBUS] RTU-402 register #40018 (PSV Bypass Valve Status) -> 0x01 (BYPASSED)",
    "[00:00:01.078] [LANGGRAPH] State Transition: graph.invoke(initial_state) -> Event: DISCORDANCE_EVALUATION",
    "[00:00:01.092] [AGENT: SIGNAL_EXTRACTOR] Extracted: { energy: 'PRESSURE', value: 3150, unit: 'PSI', exposure: 'DIRECT' }",
    "[00:00:01.124] [AGENT: SIF_DECISION] Computing delta: |Potential(5.0) - Actual(1.0)| -> Discordance: 94.2%",
    "[00:00:01.148] [AGENT: DEEP_RECALL] 2nd-order scan: discovered 24V loop power trip on remote actuator #ALM-9042",
    "[00:00:01.189] [AGENT: VECTOR_RAG] Querying ChromaDB collection 'oil_india_sops' with top_k=3",
    "[00:00:01.212] [AGENT: VECTOR_RAG] Match 1: SOP-OI-OFF-MNT-402 (Cosine Similarity: 0.942)",
    "[00:00:01.245] [AGENT: DGMS_AUDITOR] Generating Form IV-A payload; signed by Concerned Safety Official (DGMS-L4)",
    "[00:00:01.280] [SYSTEM] Telemetry broadcasted to 3D Digital Twin WebSocket client in 4.2ms",
  ]);

  // Periodic simulated live stream
  useEffect(() => {
    if (!isStreaming || !isOpen) return;

    const interval = setInterval(() => {
      const ms = Math.floor(Math.random() * 900 + 100);
      const psi = (3150 + (Math.random() * 12 - 6)).toFixed(1);
      const lel = (78 + (Math.random() * 2 - 1)).toFixed(1);
      const timestamp = new Date().toISOString().substring(11, 23);

      const possibleLogs = [
        `[${timestamp}] [OPC-UA] Tag PT-102: ${psi} PSI • LEL-204: ${lel}% • Acoustic AV-101: 38.4 kHz (Peak)`,
        `[${timestamp}] [AGENT: DISCORDANCE_WATCH] Re-evaluating Bayesian SIF probability matrix -> P(SIF)=0.942`,
        `[${timestamp}] [LANGGRAPH: NODE_TICK] Memory checkpoint verified (Thread #thread_oil_9042, State: ACTIVE)`,
        `[${timestamp}] [DGMS_COMPLIANCE] Heartbeat OK: Statutory verification seal valid (Hash: SHA256-4021)`,
      ];

      const newLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
      setLogs((prev) => [...prev.slice(-40), newLog]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isStreaming, isOpen]);

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
            : "bg-[#090e18] border-purple-500/80 text-white"
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
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500 flex items-center justify-center text-purple-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold uppercase tracking-wider">
                  AUTONOMOUS MULTI-AGENT SWARM
                </span>
                <span className="text-xs font-mono opacity-70">
                  LangGraph Core Engine &amp; Vector RAG Explorer
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight mt-0.5">
                Under-The-Hood Agent Reasoning, OPC-UA Telemetry &amp; Vector Similarity
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab navigation */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
              isLight ? "bg-slate-200 border-slate-300" : "bg-slate-900 border-slate-800"
            }`}>
              <button
                onClick={() => setActiveTab("terminal")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === "terminal"
                    ? "bg-purple-600 text-white shadow-sm"
                    : isLight
                    ? "text-slate-700 hover:text-slate-900 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Live Terminal
              </button>
              <button
                onClick={() => setActiveTab("dag")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === "dag"
                    ? "bg-purple-600 text-white shadow-sm"
                    : isLight
                    ? "text-slate-700 hover:text-slate-900 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                LangGraph DAG
              </button>
              <button
                onClick={() => setActiveTab("rag")}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === "rag"
                    ? "bg-purple-600 text-white shadow-sm"
                    : isLight
                    ? "text-slate-700 hover:text-slate-900 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Vector RAG
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border text-xs transition-all ml-2 font-bold ${
                isLight
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
              }`}
              title="Close Terminal"
            >
              ✕
            </button>
          </div>
        </header>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* TAB 1: LIVE TERMINAL STREAM */}
          {activeTab === "terminal" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? "text-purple-800" : "text-purple-400"
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  Real-Time Inter-Agent Message Passing (OPC-UA / ZeroMQ Bus)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsStreaming((prev) => !prev)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 border ${
                      isStreaming
                        ? isLight
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-emerald-600/20 text-emerald-400 border-emerald-500"
                        : isLight
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-amber-600/20 text-amber-400 border-amber-500"
                    }`}
                  >
                    {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isStreaming ? "Streaming ON" : "Paused"}</span>
                  </button>
                  <button
                    onClick={() => setLogs([])}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                      isLight
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                    }`}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="w-full bg-[#04060d] border-2 border-purple-500/30 rounded-xl p-3 font-mono text-[11px] text-purple-300/90 h-96 overflow-y-auto space-y-1 shadow-inner select-text">
                {logs.map((line, idx) => (
                  <div key={idx} className="leading-tight">
                    <span
                      className={
                        line.includes("DISCORDANCE") || line.includes("RECALLED")
                          ? "text-orange-400 font-bold"
                          : line.includes("OPC-UA")
                          ? "text-cyan-300"
                          : line.includes("VECTOR_RAG")
                          ? "text-emerald-400"
                          : "text-purple-300"
                      }
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LANGGRAPH DAG VISUALIZER */}
          {activeTab === "dag" && (
            <div className="space-y-4">
              <span className={`text-xs font-bold uppercase tracking-wider block ${
                isLight ? "text-purple-800" : "text-purple-400"
              }`}>
                LangGraph State Machine Architecture &amp; Execution Graph
              </span>

              <div className={`p-4 rounded-xl border space-y-3 ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-800"
              }`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {[
                    { title: "Input Node", desc: "OPC-UA Telemetry + EHS Narrative", color: isLight ? "border-cyan-600 text-cyan-900" : "border-cyan-500 text-cyan-400" },
                    { title: "Agent 1: Extractor", desc: "Energy & Line-of-Fire Ontology", color: isLight ? "border-blue-600 text-blue-900" : "border-blue-500 text-blue-400" },
                    { title: "Agent 2: Discordance", desc: "|Potential - Actual| Math", color: isLight ? "border-orange-600 text-orange-900" : "border-orange-500 text-orange-400" },
                    { title: "Agent 3: Recall", desc: "2nd-Order Latent Feature Rescan", color: isLight ? "border-amber-600 text-amber-900" : "border-amber-500 text-amber-400" },
                    { title: "Agent 4: RAG", desc: "Oil India SOP Vector Match", color: isLight ? "border-emerald-600 text-emerald-900" : "border-emerald-500 text-emerald-400" },
                    { title: "Agent 5: DGMS", desc: "Statutory Order & Human CSO", color: isLight ? "border-purple-600 text-purple-900" : "border-purple-500 text-purple-400" },
                  ].map((node, i) => (
                    <React.Fragment key={i}>
                      <div className={`p-3 rounded-xl border-2 flex-1 text-center shadow-md ${
                        isLight ? "bg-white border-slate-300" : "bg-slate-800/80"
                      } ${node.color}`}>
                        <span className="font-extrabold text-xs block">{node.title}</span>
                        <span className={`text-[10px] mt-0.5 block ${isLight ? "text-slate-700 font-semibold" : "opacity-75"}`}>
                          {node.desc}
                        </span>
                      </div>
                      {i < 5 && <ChevronRight className="w-4 h-4 opacity-40 shrink-0 hidden sm:block" />}
                    </React.Fragment>
                  ))}
                </div>

                <div className={`p-3 rounded-lg border text-[11px] leading-relaxed space-y-1 ${
                  isLight ? "bg-white border-slate-200 text-slate-800 shadow-sm" : "bg-black/40 border-slate-800 text-slate-300"
                }`}>
                  <div className={`font-bold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>
                    Strict Golden Governance Rule:
                  </div>
                  <p>
                    <strong>ML &amp; Deterministic Rules decide the risk.</strong> LLM Agents investigate the context and SOP precedents via LangGraph. <strong>Only an authenticated Human Chief Safety Officer executes shutdown orders.</strong> LLMs never hold direct autonomous actuator control over plant machinery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VECTOR RAG EXPLORER */}
          {activeTab === "rag" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? "text-emerald-800" : "text-emerald-400"
                }`}>
                  <Database className="w-3.5 h-3.5" />
                  Oil India Statutory SOP Embeddings (ChromaDB / Vector RAG)
                </span>
                <span className={`text-[10px] font-mono ${isLight ? "text-slate-600 font-semibold" : "opacity-70"}`}>
                  Embedding Model: text-embedding-3-small (1536 dims)
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: "SOP-OI-OFF-MNT-402",
                    title: "Oil India Hydrocarbon Positive Isolation & Mechanical LOTO Standard",
                    similarity: 0.942,
                    clause: "Section 4.2.1",
                    excerpt:
                      "Prior to unbolting any hydrocarbon discharge flange above 150 PSI, a physical double-block-and-bleed isolation must be verified. Bleed valves must be mechanically exercised, and ultrasonic acoustic checks must confirm zero internal differential pressure.",
                  },
                  {
                    id: "OISD-STD-156",
                    title: "Oil Industry Safety Directorate • Standard Operating Practices in Refining",
                    similarity: 0.887,
                    clause: "Rule 11.4",
                    excerpt:
                      "Pressure relief valves (PSV) undergoing recalibration must have certified car-sealed open standby valves online. Blind flanges must be stamped with test pressure ratings and witnessed by an Installation Safety Controller.",
                  },
                  {
                    id: "DGMS-OMR-2019-R43",
                    title: "Directorate General of Mines Safety • Oil Mines Regulations 2019",
                    similarity: 0.831,
                    clause: "Statutory Form IV-A",
                    excerpt:
                      "Every dangerous occurrence involving high-pressure line severance, uncontained hydrocarbon release, or barrier failure shall be reported within 24 hours to the Chief Inspector of Mines, regardless of whether bodily injury occurred.",
                  },
                ].map((doc, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border space-y-1.5 ${
                    isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "border-slate-800 bg-slate-900/60"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-xs ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>
                          {doc.id}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                          isLight
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}>
                          Cosine Similarity: {doc.similarity}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono ${isLight ? "text-slate-600 font-semibold" : "text-slate-400"}`}>
                        {doc.clause}
                      </span>
                    </div>
                    <div className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>
                      {doc.title}
                    </div>
                    <p className={`text-[11px] leading-relaxed italic ${
                      isLight ? "text-slate-700 font-medium" : "opacity-80"
                    }`}>
                      &ldquo;{doc.excerpt}&rdquo;
                    </p>
                  </div>
                ))}
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
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>LangGraph Multi-Agent Orchestrator • 5 Nodes Active</span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isLight
                ? "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            Close Terminal
          </button>
        </footer>
      </div>
    </div>
  );
}
