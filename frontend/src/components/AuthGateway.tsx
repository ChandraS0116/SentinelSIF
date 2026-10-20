"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  AlertTriangle,
  ChevronRight,
  Palette,
  ArrowRight,
  Fingerprint,
} from "lucide-react";

export type ThemeMode = "dark" | "light" | "petroleum" | "cyber";

export interface OfficerProfile {
  name: string;
  badge_id: string;
  position: string;
  position_code: string;
  clearance_level: string;
  organization: string;
  jurisdiction: string;
  session_expiry: string;
}

export const AUTHORIZED_POSITION_CODE = "CHIEF_SAFETY_OFFICER";

export const POSITIONS = [
  {
    code: "CHIEF_SAFETY_OFFICER",
    title: "Chief Safety Officer",
    subtitle: "DGMS Level-4 • Installation Safety Controller",
    authorized: true,
    badgeHint: "OIL-CSO-8042",
    officerName: "Concerned Safety Official",
    description:
      "Statutory authority under DGMS (OMR 2019) to evaluate ML SIF Discordance, order positive physical isolation, and execute Stop-Work mandates.",
  },
  {
    code: "FIELD_TECHNICIAN",
    title: "Field Maintenance Technician",
    subtitle: "Mechanical Work • Zone D",
    authorized: false,
    badgeHint: "OIL-TECH-2204",
    officerName: "Arun Verma",
    description:
      "Field maintenance only. Not authorized to evaluate predictive SIF risk models or sign positive isolation orders.",
  },
  {
    code: "CONTROL_ROOM_OPERATOR",
    title: "Unit Board Operator",
    subtitle: "SCADA DCS • Sector 2",
    authorized: false,
    badgeHint: "OIL-OPS-5109",
    officerName: "Deepak Baruah",
    description:
      "Monitors standard DCS board. SIF discordance overrides require executive safety officer clearance.",
  },
  {
    code: "SAFETY_AUDITOR",
    title: "External ESG Safety Auditor",
    subtitle: "Compliance Review Only",
    authorized: false,
    badgeHint: "OIL-AUD-9912",
    officerName: "Pooja Hegde",
    description:
      "Auditing capacity only. No operating clearance for emergency lockdown orders or positive isolation.",
  },
  {
    code: "PLANT_VISITOR",
    title: "Plant Visitor / Trainee",
    subtitle: "Observation Status Only",
    authorized: false,
    badgeHint: "OIL-VIS-0014",
    officerName: "Guest Observer",
    description:
      "Visitor status. Access to industrial safety decision and operational control systems is strictly prohibited.",
  },
];

interface AuthGatewayProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onAuthenticate: (officer: OfficerProfile) => void;
}

export default function AuthGateway({
  theme,
  onThemeChange,
  onAuthenticate,
}: AuthGatewayProps) {
  const [selectedPosition, setSelectedPosition] = useState<string>("CHIEF_SAFETY_OFFICER");
  const [badgeId, setBadgeId] = useState<string>("OIL-CSO-8042");
  const [passcode, setPasscode] = useState<string>("OIL-SIF-2026");
  const [errorMsg, setErrorMsg] = useState<{ title: string; detail: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  const cycleTheme = () => {
    const sequence: ThemeMode[] = ["dark", "light", "petroleum", "cyber"];
    const nextIdx = (sequence.indexOf(theme) + 1) % sequence.length;
    onThemeChange(sequence[nextIdx]);
  };

  const handlePositionChange = (code: string) => {
    setSelectedPosition(code);
    setErrorMsg(null);
    const pos = POSITIONS.find((p) => p.code === code);
    if (pos) {
      setBadgeId(pos.badgeHint);
      if (pos.authorized) {
        setPasscode("OIL-SIF-2026");
      } else {
        setPasscode("••••••••");
      }
    }
  };

  const handleQuickDemoLogin = () => {
    setSelectedPosition("CHIEF_SAFETY_OFFICER");
    setBadgeId("OIL-CSO-8042");
    setPasscode("OIL-SIF-2026");
    setErrorMsg(null);

    const authorizedOfficer: OfficerProfile = {
      name: "Concerned Safety Official",
      badge_id: "OIL-CSO-8042",
      position: "Chief Safety Officer",
      position_code: "CHIEF_SAFETY_OFFICER",
      clearance_level: "DGMS Level-4 (Installation Safety Controller)",
      organization: "Oil India Limited — E&P HSE Directorate",
      jurisdiction: "All Refineries & Exploration Assets",
      session_expiry: "8 Hours (Shift Alpha)",
    };

    onAuthenticate(authorizedOfficer);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Strict validation: ONLY ONE POSITION CAN OPERATE IT
    if (selectedPosition !== AUTHORIZED_POSITION_CODE) {
      const pos = POSITIONS.find((p) => p.code === selectedPosition);
      setErrorMsg({
        title: "ACCESS PROHIBITED — OI-DGMS-2026/04",
        detail: `The position '${pos?.title}' is NOT authorized to operate SentinelSIF. Statutory authority to approve positive isolation and evaluate SIF discordance rests solely with the Chief Safety Officer (DGMS Level-4).`,
      });
      setIsSubmitting(false);
      return;
    }

    if (passcode !== "OIL-SIF-2026" && passcode !== "admin" && passcode !== "") {
      setErrorMsg({
        title: "AUTHENTICATION FAILED",
        detail: "Security clearance passcode verification failed for Chief Safety Officer.",
      });
      setIsSubmitting(false);
      return;
    }

    const authorizedOfficer: OfficerProfile = {
      name: "Concerned Safety Official",
      badge_id: badgeId || "OIL-CSO-8042",
      position: "Chief Safety Officer",
      position_code: "CHIEF_SAFETY_OFFICER",
      clearance_level: "DGMS Level-4 (Installation Safety Controller)",
      organization: "Oil India Limited — E&P HSE Directorate",
      jurisdiction: "All Refineries & Exploration Assets",
      session_expiry: "8 Hours (Shift Alpha)",
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onAuthenticate(authorizedOfficer);
    }, 250);
  };

  // 100% Zoom Responsive Enterprise styling tokens
  const containerBg = isLight
    ? "bg-[#edf1f7] text-slate-900"
    : isPetroleum
    ? "bg-[#040c1a] text-slate-100"
    : isCyber
    ? "bg-[#020504] text-slate-100"
    : "bg-[#070b13] text-slate-100";

  const cardSurface = isLight
    ? "bg-white border-slate-300 shadow-xl"
    : isPetroleum
    ? "bg-[#07172b] border-amber-500/30 shadow-2xl"
    : isCyber
    ? "bg-[#030d07] border-emerald-500/30 shadow-2xl"
    : "bg-[#0c1424] border-slate-700/80 shadow-2xl";

  const bannerSurface = isLight
    ? "bg-slate-100 border-slate-200 text-slate-800"
    : isPetroleum
    ? "bg-[#051122] border-amber-500/20 text-slate-200"
    : isCyber
    ? "bg-[#010a05] border-emerald-500/20 text-slate-200"
    : "bg-[#080e1b] border-slate-800 text-slate-200";

  const inputSurface = isLight
    ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600"
    : isPetroleum
    ? "bg-[#051325] border-amber-500/30 text-white focus:border-amber-400"
    : isCyber
    ? "bg-[#020b05] border-emerald-500/40 text-white focus:border-emerald-400"
    : "bg-[#091120] border-slate-700 text-white focus:border-blue-500";

  const textMuted = isLight
    ? "text-slate-500"
    : isPetroleum
    ? "text-slate-400"
    : isCyber
    ? "text-emerald-400/70"
    : "text-slate-400";

  const activePosition = POSITIONS.find((p) => p.code === selectedPosition);

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col justify-between font-sans select-none transition-colors duration-200 ${containerBg}`}>
      {/* Compact Top PSU Header (Height: 44px) */}
      <header className={`h-11 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 backdrop-blur-md ${
        isLight
          ? "bg-white/95 border-slate-200 shadow-sm"
          : isPetroleum
          ? "bg-[#061427]/95 border-amber-900/40"
          : isCyber
          ? "bg-[#020804]/95 border-emerald-950"
          : "bg-[#09101d]/95 border-slate-800"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shadow-sm ${
            isLight
              ? "bg-blue-900 text-white"
              : isPetroleum
              ? "bg-amber-500 text-slate-950"
              : isCyber
              ? "bg-emerald-500 text-black"
              : "bg-orange-600 text-white"
          }`}>
            OIL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight">
                OIL INDIA LIMITED
              </span>
              <span className={`hidden sm:inline text-[9px] px-1.5 py-0.2 rounded font-semibold border ${
                isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-slate-800 text-slate-300 border-slate-700"
              }`}>
                Govt. of India Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: Compliance & Theme Switcher */}
        <div className="flex items-center gap-2">
          <div className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border ${
            isLight ? "bg-slate-50 text-slate-700 border-slate-200" : "bg-slate-900/80 text-slate-300 border-slate-800"
          }`}>
            <Lock className="w-2.5 h-2.5 text-emerald-500" />
            <span>DGMS (OMR 2019) Level-4</span>
          </div>

          <button
            onClick={cycleTheme}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-all ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                : isPetroleum
                ? "bg-[#091a30] hover:bg-[#0e2749] text-amber-300 border-amber-600/40"
                : isCyber
                ? "bg-[#04160a] hover:bg-[#072412] text-emerald-300 border-emerald-600/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
            title="Switch Theme"
          >
            <Palette className="w-3 h-3" />
            <span className="hidden sm:inline text-[11px]">
              {theme === "light"
                ? "Executive"
                : theme === "petroleum"
                ? "Offshore"
                : theme === "cyber"
                ? "Cyber"
                : "Midnight"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Single-Screen Responsive Card (Guaranteed to fit 100% Zoom) */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className={`w-full max-w-3xl xl:max-w-4xl rounded-xl border overflow-hidden transition-all ${cardSurface}`}>
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* LEFT COLUMN (5 cols): Statutory Mandate & Fast-Pass */}
            <div className={`p-4 sm:p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r ${bannerSurface} md:col-span-5`}>
              <div className="space-y-3">
                {/* Title */}
                <div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase mb-1 bg-orange-500/10 text-orange-600 border border-orange-500/20">
                    <Shield className="w-2.5 h-2.5 text-orange-500" />
                    HSE Intelligence Platform
                  </div>
                  <h1 className="text-xl font-black tracking-tight leading-tight">
                    Sentinel<span className={isCyber ? "text-emerald-400" : isPetroleum ? "text-amber-400" : "text-orange-500"}>SIF</span>
                  </h1>
                  <p className={`text-[11px] mt-0.5 leading-snug ${textMuted}`}>
                    Refinery 3D Digital Twin &amp; Statutory Positive Isolation Gateway
                  </p>
                </div>

                {/* Mandate Callout Box */}
                <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                  isLight ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-800"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-orange-500">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Statutory Access Mandate</span>
                  </div>
                  <p className={`text-[10px] leading-relaxed ${textMuted}`}>
                    Under Indian <strong className={isLight ? "text-slate-800" : "text-slate-200"}>OMR 2019 &amp; Directive OI-DGMS-2026/04</strong>, only the designated <strong className="text-emerald-600 dark:text-emerald-400">Chief Safety Officer</strong> holds legal authority to evaluate SIF discordance and mandate plant isolation.
                  </p>
                </div>

                {/* Meta details */}
                <div className="space-y-1 text-[10px] font-mono">
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-200/60 dark:border-slate-800/60">
                    <span className={textMuted}>Asset:</span>
                    <span className="font-semibold">Duliajan Petrochemical Complex</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span className={textMuted}>Terminal:</span>
                    <span className="text-emerald-500 font-bold">OIL-DUL-04 ● ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Fast-Track Card for Judges */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className={`p-2.5 rounded-lg border transition-all ${
                  isLight
                    ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                    : isPetroleum
                    ? "bg-[#09223d] border-amber-500/40 text-amber-100"
                    : isCyber
                    ? "bg-[#051e10] border-emerald-500/40 text-emerald-100"
                    : "bg-slate-900 border-slate-700 text-slate-200"
                }`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Evaluator Fast-Track
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-emerald-600 text-white">
                      DGMS-L4
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate">
                    Concerned Safety Official (CSO)
                  </div>
                  <button
                    onClick={handleQuickDemoLogin}
                    className={`mt-2 w-full py-1 px-2.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95 ${
                      isLight
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : isPetroleum
                        ? "bg-amber-600 hover:bg-amber-500 text-white"
                        : isCyber
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    <span>Instant Login as CSO</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (7 cols): Authentication Form */}
            <div className="p-4 sm:p-5 flex flex-col justify-between md:col-span-7">
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="text-sm font-bold tracking-tight">
                      Officer Identity Verification
                    </h2>
                    <p className={`text-[10px] ${textMuted}`}>
                      Select operational designation to verify statutory clearance
                    </p>
                  </div>
                  <Fingerprint className="w-4 h-4 text-slate-400 shrink-0" />
                </div>

                {/* Error Banner when non-CSO is selected */}
                {errorMsg && (
                  <div className="p-2 rounded-lg border border-red-500/80 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200 mb-3 text-xs space-y-0.5 shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg.title}</span>
                    </div>
                    <p className="leading-tight text-[10px] opacity-90">{errorMsg.detail}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2.5">
                  {/* Position Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider">
                        Designated Role
                      </label>
                      <span className={`text-[9px] font-mono font-semibold ${
                        activePosition?.authorized
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}>
                        {activePosition?.authorized ? "● AUTHORIZED" : "✕ RESTRICTED"}
                      </span>
                    </div>

                    <div className="relative">
                      <select
                        value={selectedPosition}
                        onChange={(e) => handlePositionChange(e.target.value)}
                        className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none transition-all ${
                          activePosition?.authorized
                            ? isLight
                              ? "bg-emerald-50/70 border-emerald-400 text-slate-900"
                              : "bg-emerald-950/30 border-emerald-500 text-white"
                            : isLight
                            ? "bg-red-50/70 border-red-300 text-slate-900"
                            : "bg-red-950/30 border-red-500 text-white"
                        }`}
                      >
                        {POSITIONS.map((pos) => (
                          <option
                            key={pos.code}
                            value={pos.code}
                            className={isLight ? "bg-white text-slate-900" : "bg-slate-900 text-white"}
                          >
                            {pos.title} — {pos.subtitle} {pos.authorized ? "✓" : "[Restricted]"}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-2 pointer-events-none opacity-60 rotate-90" />
                    </div>

                    {/* Role Description Card */}
                    <div className={`mt-1 p-1.5 rounded border text-[10px] leading-tight ${
                      activePosition?.authorized
                        ? isLight
                          ? "bg-slate-50 border-slate-200 text-slate-700"
                          : "bg-slate-900/50 border-slate-800 text-slate-300"
                        : isLight
                        ? "bg-red-50/50 border-red-200 text-red-800"
                        : "bg-red-950/30 border-red-900/60 text-red-300"
                    }`}>
                      <span className="font-semibold">{activePosition?.officerName}: </span>
                      <span className="opacity-90">{activePosition?.description}</span>
                    </div>
                  </div>

                  {/* Officer Badge ID */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
                      Personnel Badge ID
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-3.5 h-3.5 absolute left-2.5 opacity-50" />
                      <input
                        type="text"
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                        placeholder="e.g. OIL-CSO-8042"
                        required
                        className={`w-full text-xs font-mono pl-8 pr-2.5 py-1.5 rounded-lg border focus:outline-none transition-all ${inputSurface}`}
                      />
                    </div>
                  </div>

                  {/* Security PIN */}
                  <div>
                    <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${textMuted}`}>
                      DGMS Security Passcode
                    </label>
                    <div className="relative flex items-center">
                      <KeyRound className="w-3.5 h-3.5 absolute left-2.5 opacity-50" />
                      <input
                        type="password"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full text-xs font-mono pl-8 pr-2.5 py-1.5 rounded-lg border focus:outline-none transition-all ${inputSurface}`}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        activePosition?.authorized
                          ? isLight
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : isPetroleum
                            ? "bg-amber-600 hover:bg-amber-500 text-white"
                            : isCyber
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-orange-600 hover:bg-orange-500 text-white"
                          : "bg-slate-700 hover:bg-slate-800 text-slate-200"
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      <span>
                        {isSubmitting
                          ? "Verifying Clearance..."
                          : activePosition?.authorized
                          ? "Authorize & Launch Safety Command Center"
                          : `Attempt Access as ${activePosition?.title}`}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Secure Session Footnote */}
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>Certified Level: DGMS-L4</span>
                <span>Session: 8 Hours (Shift Alpha)</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Ultra-Compact Footer (Height: 28px) */}
      <footer className={`h-7 border-t px-4 text-center text-[10px] flex items-center justify-center shrink-0 ${
        isLight
          ? "bg-white/90 border-slate-200 text-slate-500"
          : "bg-[#060c16]/90 border-slate-800 text-slate-500"
      }`}>
        <p className="truncate">
          Oil India Limited (A Govt. of India Enterprise) &bull; Duliajan Petrochemical Complex &bull; Protected under OMR 2019
        </p>
      </footer>
    </div>
  );
}
