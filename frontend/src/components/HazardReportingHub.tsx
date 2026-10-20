"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Printer,
  XCircle,
  Search,
  Filter,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  ArrowLeft,
  FileText,
  Activity,
  Zap,
} from "lucide-react";
import { HISTORICAL_HAZARDS, HistoricalHazard } from "../data/historicalHazards";
import { downloadMasterExcelReport, printMasterPDFReport } from "../utils/masterReportExport";
import { OfficerProfile } from "./AuthGateway";

interface HazardReportingHubProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  authenticatedOfficer?: OfficerProfile | null;
  onSelectScenarioForDemo?: (scenarioId: string) => void;
}

export default function HazardReportingHub({
  isOpen,
  onClose,
  theme = "dark",
  authenticatedOfficer,
  onSelectScenarioForDemo,
}: HazardReportingHubProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilter] = useState<string>("ALL");
  const [classificationFilter, setClassificationFilter] = useState<string>("ALL");
  const [selectedHazard, setSelectedHazard] = useState<HistoricalHazard | null>(null);

  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  // Filtered dataset
  const filteredHazards = useMemo(() => {
    return HISTORICAL_HAZARDS.filter((h) => {
      const matchesSearch =
        searchQuery === "" ||
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.energyType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOrigin = originFilter === "ALL" || h.origin === originFilter;
      const matchesClass = classificationFilter === "ALL" || h.classification === classificationFilter;

      return matchesSearch && matchesOrigin && matchesClass;
    });
  }, [searchQuery, originFilter, classificationFilter]);

  // Aggregate KPI metrics
  const totalCount = HISTORICAL_HAZARDS.length;
  const sifPrecursorCount = HISTORICAL_HAZARDS.filter((h) => h.classification === "SIF PRECURSOR").length;
  const criticalDisasterCount = HISTORICAL_HAZARDS.filter((h) => h.classification === "CRITICAL EVENT").length;
  const routineCount = HISTORICAL_HAZARDS.filter((h) => h.classification === "ROUTINE").length;

  const totalBarriersChecked = HISTORICAL_HAZARDS.reduce((acc, h) => acc + h.barrierFailures.length, 0);
  const totalBarriersFailed = HISTORICAL_HAZARDS.reduce(
    (acc, h) =>
      acc +
      h.barrierFailures.filter((b) => b.status === "FAILED" || b.status === "ABSENT" || b.status === "BYPASSED").length,
    0
  );
  const barrierDeficitRate = Math.round((totalBarriersFailed / Math.max(1, totalBarriersChecked)) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none font-sans animate-in fade-in duration-200">
      <div
        className={`w-full max-w-6xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 transition-colors ${
          isLight
            ? "bg-white border-slate-300 text-slate-900"
            : isPetroleum
            ? "bg-[#091629] border-amber-600/80 text-amber-50"
            : isCyber
            ? "bg-[#020906] border-emerald-500/80 text-emerald-50"
            : "bg-[#0a0f1d] border-orange-500/80 text-white"
        }`}
      >
        {/* =====================================================================
            HEADER: TITLE + EXPORT ACTIONS + CLOSE
        ===================================================================== */}
        <header
          className={`px-5 py-3.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 ${
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
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isCyber
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                  : isPetroleum
                  ? "bg-amber-950/60 border-amber-500 text-amber-400"
                  : "bg-orange-600/20 border-orange-500 text-orange-500"
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isCyber
                      ? "bg-emerald-600 text-white"
                      : isPetroleum
                      ? "bg-amber-600 text-white"
                      : "bg-orange-600 text-white"
                  }`}
                >
                  Oil India Limited • DGMS Ledger
                </span>
                <span className="text-xs font-mono opacity-70">
                  Standard: OMR 2019 &bull; OISD-GDN-166
                </span>
              </div>
              <h2 className={`text-base font-extrabold tracking-tight mt-0.5 ${isLight ? "text-slate-900" : "text-white"}`}>
                Master Hazard Intelligence &amp; SIF Precursor Registry
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => downloadMasterExcelReport(HISTORICAL_HAZARDS, authenticatedOfficer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Download complete multi-hazard register as Microsoft Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Master Excel</span>
            </button>

            <button
              onClick={() => printMasterPDFReport(HISTORICAL_HAZARDS, authenticatedOfficer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Print official executive PDF audit report with all case studies"
            >
              <Printer className="w-4 h-4" />
              <span>Print Master PDF</span>
            </button>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border text-xs transition-all ${
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
              }`}
              title="Close Registry"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* =====================================================================
            KPI DASHBOARD RIBBON
        ===================================================================== */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3.5 border-b text-xs shrink-0 ${
            isLight
              ? "bg-slate-100/80 border-slate-200"
              : isPetroleum
              ? "bg-[#050c17] border-amber-950"
              : isCyber
              ? "bg-[#010402] border-emerald-950"
              : "bg-[#060914] border-slate-800/80"
          }`}
        >
          <div className={`p-2 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Hazards</span>
            <span className="text-base font-extrabold text-blue-500 block">{totalCount}</span>
            <span className="text-[10px] opacity-70">Indexed Events</span>
          </div>

          <div className={`p-2 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">SIF Precursors</span>
            <span className="text-base font-extrabold text-orange-500 block">{sifPrecursorCount}</span>
            <span className="text-[10px] opacity-70">Disguised Energy</span>
          </div>

          <div className={`p-2 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Major Disasters</span>
            <span className="text-base font-extrabold text-red-500 block">{criticalDisasterCount}</span>
            <span className="text-[10px] opacity-70">Global &amp; National</span>
          </div>

          <div className={`p-2 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Routine Controls</span>
            <span className="text-base font-extrabold text-emerald-500 block">{routineCount}</span>
            <span className="text-[10px] opacity-70">Zero Latent SIF</span>
          </div>

          <div className={`p-2 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Barrier Deficit</span>
            <span className="text-base font-extrabold text-amber-500 block">{barrierDeficitRate}%</span>
            <span className="text-[10px] opacity-70">{totalBarriersFailed} / {totalBarriersChecked} Failed</span>
          </div>

          <div className={`p-2 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"}`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">DGMS Compliance</span>
            <span className="text-base font-extrabold text-emerald-500 block">98.4%</span>
            <span className="text-[10px] opacity-70">Level-4 Verified</span>
          </div>
        </div>

        {/* =====================================================================
            BODY: SEARCH/FILTER + TABLE OR DOSSIER VIEW
        ===================================================================== */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {selectedHazard ? (
            /* ===============================================================
               INDIVIDUAL HAZARD DOSSIER VIEW
            =============================================================== */
            <div className="space-y-4 text-xs animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                <button
                  onClick={() => setSelectedHazard(null)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all text-xs ${
                    isLight
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to All Hazards Ledger</span>
                </button>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                      selectedHazard.classification === "CRITICAL EVENT"
                        ? "bg-red-500/20 text-red-400 border-red-500/60"
                        : selectedHazard.classification === "SIF PRECURSOR"
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/60"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/60"
                    }`}
                  >
                    {selectedHazard.classification}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {selectedHazard.incidentNumber}
                  </span>
                </div>
              </div>

              {/* Dossier Header Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/80 border-slate-800"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h3 className={`text-base font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {selectedHazard.title}
                  </h3>
                  <span className="text-xs font-semibold text-cyan-400 font-mono">
                    {selectedHazard.facility} &bull; {selectedHazard.sector}
                  </span>
                </div>
                <p className="leading-relaxed opacity-90 text-[11px]">{selectedHazard.summary}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/40 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Incident Date:</span>
                    <span className="font-semibold">{selectedHazard.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Hazard Energy:</span>
                    <span className="font-semibold text-orange-400">{selectedHazard.energyType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Casualties:</span>
                    <span className="font-semibold text-red-400">
                      {selectedHazard.fatalities} Fatal / {selectedHazard.injuries} Injured
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Loss Impact:</span>
                    <span className="font-semibold">{selectedHazard.economicDamage}</span>
                  </div>
                </div>
              </div>

              {/* Discordance Gap & Consequence Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div
                  className={`p-3.5 rounded-xl border space-y-2 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <span className="font-bold text-[10px] uppercase tracking-wider text-orange-500 block">
                    Actual vs Potential SIF Discordance
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-700/40">
                      <span className="text-[9px] uppercase font-bold text-emerald-400 block">Actual Severity</span>
                      <span className="text-sm font-extrabold text-emerald-400 block mt-0.5">
                        {selectedHazard.actualSeverity}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {selectedHazard.actualDescription}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-red-950/30 border border-red-700/40">
                      <span className="text-[9px] uppercase font-bold text-red-400 block">Potential SIF</span>
                      <span className="text-sm font-extrabold text-red-400 block mt-0.5">
                        {selectedHazard.potentialSeverity}
                      </span>
                      <span className="text-[10px] text-red-300 block truncate">
                        {selectedHazard.potentialOutcome}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-slate-400 font-bold">Severity Gap:</span>
                    <span className="font-extrabold text-orange-500 font-mono">
                      {selectedHazard.discordanceGap}% ({selectedHazard.discordanceStatus})
                    </span>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border space-y-2 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <span className="font-bold text-[10px] uppercase tracking-wider text-cyan-400 block">
                    Official Investigative Finding
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {selectedHazard.csbFinding ||
                      "Internal SentinelSIF multi-agent investigation validated against DGMS Oil Mines Regulations (OMR) 2019."}
                  </p>
                  <div className="pt-1 border-t border-slate-700/40 text-[10px] font-mono text-slate-400">
                    Regulatory Mandate: {selectedHazard.regulatoryOrder}
                  </div>
                </div>
              </div>

              {/* Barrier Breakdown Table */}
              <div
                className={`p-4 rounded-xl border space-y-2.5 ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-orange-500">
                    Safety Barrier Integrity Audit &amp; Failure Modes
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {selectedHazard.barrierFailures.filter((b) => b.status !== "FUNCTIONING").length} /{" "}
                    {selectedHazard.barrierFailures.length} Defective
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedHazard.barrierFailures.map((barrier, bIdx) => (
                    <div
                      key={bIdx}
                      className={`p-2.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs ${
                        barrier.status === "FAILED" || barrier.status === "ABSENT" || barrier.status === "BYPASSED"
                          ? isLight
                            ? "bg-red-50 border-red-200 text-red-950"
                            : "bg-red-950/30 border-red-800/50 text-red-200"
                          : isLight
                          ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                          : "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{barrier.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {barrier.type}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-90 mt-0.5">{barrier.detail}</p>
                        <div className="text-[10px] opacity-75 mt-0.5">
                          <strong>Root Cause:</strong> {barrier.rootCause}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 self-start md:self-center ${
                          barrier.status === "FAILED" || barrier.status === "ABSENT" || barrier.status === "BYPASSED"
                            ? "bg-red-500 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {barrier.status} {barrier.status === "FUNCTIONING" ? "✓" : "❌"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Causes & Lessons Learned */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div
                  className={`p-3.5 rounded-xl border space-y-1.5 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <span className="font-bold text-[10px] uppercase tracking-wider text-red-400 block">
                    Identified Root Causes
                  </span>
                  <ul className="space-y-1 text-[11px] leading-snug">
                    {selectedHazard.rootCauses.map((rc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{rc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`p-3.5 rounded-xl border space-y-1.5 ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-400 block">
                    Lessons Learned &amp; SentinelSIF Controls
                  </span>
                  <ul className="space-y-1 text-[11px] leading-snug">
                    {selectedHazard.lessonsLearned.map((ll, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{ll}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* ===============================================================
               MASTER DATA LEDGER & FILTER TABLE VIEW
            =============================================================== */
            <div className="space-y-3.5">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by hazard, ID, equipment, or refinery sector..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs outline-none transition-colors ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-orange-500"
                        : "bg-slate-900 border-slate-700 text-slate-100 focus:border-orange-500"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={originFilter}
                    onChange={(e) => setOriginFilter(e.target.value)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-800"
                        : "bg-slate-900 border-slate-700 text-slate-200"
                    }`}
                  >
                    <option value="ALL">All Hazard Origins</option>
                    <option value="GLOBAL_BENCHMARK">Global Disasters (BP, Piper Alpha, Chevron)</option>
                    <option value="NATIONAL_DISASTER">National Disasters (IOCL, Baghjan, HPCL)</option>
                    <option value="LIVE_FACILITY">Live Facility Scenarios (Zone A-D)</option>
                  </select>

                  <select
                    value={classificationFilter}
                    onChange={(e) => setClassificationFilter(e.target.value)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold ${
                      isLight
                        ? "bg-slate-50 border-slate-300 text-slate-800"
                        : "bg-slate-900 border-slate-700 text-slate-200"
                    }`}
                  >
                    <option value="ALL">All Classifications</option>
                    <option value="SIF PRECURSOR">SIF Precursor</option>
                    <option value="CRITICAL EVENT">Critical Event</option>
                    <option value="ROUTINE">Routine Control</option>
                  </select>
                </div>
              </div>

              {/* Table of Hazards */}
              <div
                className={`rounded-xl border overflow-hidden shadow-sm ${
                  isLight ? "border-slate-200" : "border-slate-800"
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={isLight ? "bg-slate-100 text-slate-700" : "bg-slate-900/80 text-slate-300"}>
                        <th className="py-2.5 px-3 font-bold">Incident Ref</th>
                        <th className="py-2.5 px-3 font-bold">Hazard Title &amp; Location</th>
                        <th className="py-2.5 px-3 font-bold">Origin</th>
                        <th className="py-2.5 px-3 font-bold">Actual vs Potential</th>
                        <th className="py-2.5 px-3 font-bold">Discordance</th>
                        <th className="py-2.5 px-3 font-bold">Classification</th>
                        <th className="py-2.5 px-3 font-bold">Barriers</th>
                        <th className="py-2.5 px-3 font-bold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {filteredHazards.map((hazard) => {
                        const failedCount = hazard.barrierFailures.filter(
                          (b) => b.status === "FAILED" || b.status === "ABSENT" || b.status === "BYPASSED"
                        ).length;

                        return (
                          <tr
                            key={hazard.id}
                            className={`transition-colors hover:bg-orange-500/5 cursor-pointer ${
                              isLight ? "hover:bg-slate-50" : ""
                            }`}
                            onClick={() => setSelectedHazard(hazard)}
                          >
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-400 whitespace-nowrap">
                              {hazard.incidentNumber}
                              <span className="block text-[10px] opacity-70 font-sans font-normal">
                                {hazard.date}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 max-w-xs">
                              <div className="font-bold text-xs truncate" title={hazard.title}>
                                {hazard.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {hazard.facility} &bull; {hazard.sector}
                              </div>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  hazard.origin === "GLOBAL_BENCHMARK"
                                    ? "bg-purple-950 text-purple-300 border border-purple-800"
                                    : hazard.origin === "NATIONAL_DISASTER"
                                    ? "bg-blue-950 text-blue-300 border border-blue-800"
                                    : "bg-amber-950 text-amber-300 border border-amber-800"
                                }`}
                              >
                                {hazard.origin.replace(/_/g, " ")}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1 font-bold text-[11px]">
                                <span
                                  className={
                                    hazard.actualSeverity === "LOW" || hazard.actualSeverity === "NONE"
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }
                                >
                                  {hazard.actualSeverity}
                                </span>
                                <span className="text-slate-500">&rarr;</span>
                                <span className="text-red-400">{hazard.potentialSeverity}</span>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-mono font-bold text-xs ${
                                    hazard.discordanceGap > 80
                                      ? "text-orange-500"
                                      : hazard.discordanceGap > 0
                                      ? "text-amber-400"
                                      : "text-emerald-400"
                                  }`}
                                >
                                  {hazard.discordanceGap}%
                                </span>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${
                                  hazard.classification === "CRITICAL EVENT"
                                    ? "bg-red-500/20 text-red-400 border-red-500/60"
                                    : hazard.classification === "SIF PRECURSOR"
                                    ? "bg-orange-500/20 text-orange-400 border-orange-500/60"
                                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/60"
                                }`}
                              >
                                {hazard.classification}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                              <span
                                className={failedCount > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}
                              >
                                {failedCount}
                              </span>
                              <span className="text-slate-500"> / {hazard.barrierFailures.length} Deficits</span>
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedHazard(hazard);
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-all"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>
                  Showing <strong>{filteredHazards.length}</strong> of <strong>{totalCount}</strong> recorded hazards
                  and precursor benchmarks
                </span>
                <span className="font-mono">Oil India Limited E&amp;P HSE Directorate</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
