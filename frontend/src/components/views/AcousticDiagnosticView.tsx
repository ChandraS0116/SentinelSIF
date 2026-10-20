"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Activity,
  Radio,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Crosshair,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import { ThemeMode } from "../AuthGateway";
import { sound } from "../../utils/audioHaptics";

interface AcousticDiagnosticViewProps {
  theme: ThemeMode;
  onNavigateView: (view: "digital_twin" | "incident_lab" | "physics_sandbox" | "acoustic_array" | "compliance_audit") => void;
}

interface TransducerNode {
  id: string;
  name: string;
  zone: string;
  frequencyKhz: number;
  amplitudeDb: number;
  status: "CRITICAL" | "NOMINAL" | "CHATTER";
  sourceDistanceM: number;
  snrDb: number;
  description: string;
}

const TRANSDUCER_NODES: TransducerNode[] = [
  {
    id: "AC-104",
    name: "Transducer AC-104 (Flange F-402 Skid)",
    zone: "Zone D (Pumping & Flash Skid)",
    frequencyKhz: 38.4,
    amplitudeDb: 48.6,
    status: "CRITICAL",
    sourceDistanceM: 1.8,
    snrDb: 31.4,
    description: "High-frequency ultrasonic orifice hiss detected. Consistent with 3,150 PSI hydrocarbon aerosol jet weeping through compressed gasket.",
  },
  {
    id: "AC-101",
    name: "Transducer AC-101 (Wellhead Manifold)",
    zone: "Zone A (Wellhead Cluster)",
    frequencyKhz: 12.4,
    amplitudeDb: 18.2,
    status: "NOMINAL",
    sourceDistanceM: 42.0,
    snrDb: 6.2,
    description: "Normal multi-phase fluid flow velocity hum. Wellhead chokes operating within nominal acoustic envelopment.",
  },
  {
    id: "AC-102",
    name: "Transducer AC-102 (Horton Spheres)",
    zone: "Zone B (Pressurized Gas Spheres)",
    frequencyKhz: 14.1,
    amplitudeDb: 24.1,
    status: "CHATTER",
    sourceDistanceM: 55.4,
    snrDb: 11.8,
    description: "Minor safety valve mechanical flutter detected. Far-field attenuation indicates no primary loss of containment.",
  },
  {
    id: "AC-103",
    name: "Transducer AC-103 (Crude Storage Farm)",
    zone: "Zone C (Atmospheric Tank Farm)",
    frequencyKhz: 9.8,
    amplitudeDb: 19.5,
    status: "NOMINAL",
    sourceDistanceM: 68.0,
    snrDb: 4.5,
    description: "Low-frequency transfer pump impeller rotational tone. No high-pressure sonic signature present.",
  },
];

export default function AcousticDiagnosticView({
  theme,
  onNavigateView,
}: AcousticDiagnosticViewProps) {
  const isLight = theme === "light";
  const isPetroleum = theme === "petroleum";
  const isCyber = theme === "cyber";

  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioMode, setAudioMode] = useState<"ambient" | "leak" | "filtered">("leak");
  const [gainValue, setGainValue] = useState<number>(0.05);

  // Active transducer selection
  const [selectedSensorId, setSelectedSensorId] = useState<string>("AC-104");
  const selectedSensor = TRANSDUCER_NODES.find((s) => s.id === selectedSensorId) || TRANSDUCER_NODES[0];

  // Alarm threshold slider (dB)
  const [alarmThresholdDb, setAlarmThresholdDb] = useState<number>(35.0);

  // Canvas hover state for FFT inspection
  const [hoveredFreq, setHoveredFreq] = useState<{ freqKhz: number; db: number; x: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isAlarmTriggered = selectedSensor.amplitudeDb >= alarmThresholdDb;

  const startAudio = () => {
    sound.click();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq =
        audioMode === "ambient"
          ? 62
          : audioMode === "leak"
          ? selectedSensor.frequencyKhz > 30 ? 4500 : 1800
          : 1850;
      osc.type = audioMode === "ambient" ? "sine" : "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainValue, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
      setIsPlayingAudio(true);
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  const stopAudio = () => {
    sound.click();
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    if (isPlayingAudio && oscRef.current && audioCtxRef.current) {
      const freq =
        audioMode === "ambient"
          ? 62
          : audioMode === "leak"
          ? selectedSensor.frequencyKhz > 30 ? 4500 : 1800
          : 1850;
      oscRef.current.type = audioMode === "ambient" ? "sine" : "sawtooth";
      oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    }
  }, [audioMode, isPlayingAudio, selectedSensor]);

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(gainValue, audioCtxRef.current.currentTime);
    }
  }, [gainValue]);

  // Canvas FFT frequency visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numBars = 64;
      const barWidth = canvas.width / numBars;

      // Draw faint grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw threshold line across canvas
      const thresholdY = canvas.height - (alarmThresholdDb / 60) * canvas.height;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, thresholdY);
      ctx.lineTo(canvas.width, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw threshold badge
      ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`TRIP THRESHOLD: ${alarmThresholdDb.toFixed(1)} dB`, 10, thresholdY - 5);

      // Render FFT bars
      const targetBin = Math.round((selectedSensor.frequencyKhz / 50) * numBars);

      for (let i = 0; i < numBars; i++) {
        let heightMultiplier = 0.08;

        // Peak around sensor resonance
        const distFromTarget = Math.abs(i - targetBin);
        if (distFromTarget <= 4) {
          const intensity = 1 - distFromTarget / 5;
          const peakScale = (selectedSensor.amplitudeDb / 60) * intensity;
          heightMultiplier = peakScale + Math.sin(frame * 0.18 + i) * 0.08;
        } else if (i < 8) {
          // Plant baseline hum
          heightMultiplier = 0.25 + Math.sin(frame * 0.06 + i) * 0.05;
        } else {
          // Ambient background hiss
          heightMultiplier = 0.07 + Math.sin(frame * 0.09 + i * 0.3) * 0.03;
        }

        const barHeight = Math.max(3, heightMultiplier * canvas.height);
        const x = i * barWidth;
        const y = canvas.height - barHeight;

        // Gradient coloring
        if (distFromTarget <= 3 && selectedSensor.status === "CRITICAL") {
          const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
          grad.addColorStop(0, "#f97316");
          grad.addColorStop(1, "#dc2626");
          ctx.fillStyle = grad;
          // Peak glow highlight
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 8;
        } else if (distFromTarget <= 3) {
          ctx.fillStyle = isCyber ? "#10b981" : isPetroleum ? "#f59e0b" : "#38bdf8";
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = isLight ? "rgba(71,85,105,0.25)" : "rgba(148,163,184,0.18)";
          ctx.shadowBlur = 0;
        }

        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLight, isPetroleum, isCyber, selectedSensor, alarmThresholdDb]);

  // Handle canvas mouse move for interactive frequency scrubbing
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = Math.max(0, Math.min(1, mouseX / rect.width));
    const freqKhz = relativeX * 50.0;
    const estimatedDb = Math.round(
      Math.abs(freqKhz - selectedSensor.frequencyKhz) < 3
        ? selectedSensor.amplitudeDb
        : 12 + Math.random() * 8
    );
    setHoveredFreq({ freqKhz, db: estimatedDb, x: mouseX });
  };

  const handleCanvasMouseLeave = () => {
    setHoveredFreq(null);
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 overflow-y-auto font-sans select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ===================================================================
            HEADER & LIVE TRIP ALARM BANNER
        =================================================================== */}
        {/* ===================================================================
            HEADER & LIVE TRIP ALARM BANNER
        =================================================================== */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
              <h1 className={`text-xl font-bold tracking-tight ${isLight ? "text-slate-900" : ""}`}>
                Ultrasonic Acoustic Leak Diagnostic Array
              </h1>
            </div>
            <p className={`text-xs mt-1 ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
              High-frequency piezoelectric transducer array monitoring at 38.4 kHz for early pressurized flange weep detection
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Alarm indicator badge */}
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                isAlarmTriggered
                  ? isLight
                    ? "bg-red-100 border-red-300 text-red-800 shadow-sm font-bold"
                    : "bg-red-950/60 border-red-500/60 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                  : isLight
                  ? "bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm font-bold"
                  : "bg-emerald-950/60 border-emerald-500/60 text-emerald-400"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isAlarmTriggered ? "SIF TRIP ARMED" : "NOMINAL HARMONIC"}</span>
            </div>

            <button
              onClick={isPlayingAudio ? stopAudio : startAudio}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                isPlayingAudio
                  ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/40"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40"
              }`}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? "MUTE LIVE AUDIO" : "LISTEN LIVE IN BROWSER"}</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            SECTION 1: 4-TRANSDUCER SPATIAL SELECTION MAP (INTERACTIVE)
        =================================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? "text-slate-700" : "text-slate-400"
            }`}>
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              Select Transducer Node to Isolate Channel
            </span>
            <span className={`font-mono text-[11px] ${
              isLight ? "text-slate-600 font-semibold" : "text-slate-400"
            }`}>
              Array Sampling Rate: 192 kHz &bull; Piezo Accuracy: &plusmn;0.1 dB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TRANSDUCER_NODES.map((sensor) => {
              const isSelected = selectedSensorId === sensor.id;
              return (
                <button
                  key={sensor.id}
                  onClick={() => {
                    sound.toggle();
                    setSelectedSensorId(sensor.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden active:scale-98 ${
                    isSelected
                      ? sensor.status === "CRITICAL"
                        ? isLight
                          ? "bg-orange-50 border-2 border-orange-400 shadow-md ring-2 ring-orange-300 text-slate-900"
                          : "bg-orange-950/40 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.25)] ring-1 ring-orange-500"
                        : isLight
                        ? "bg-blue-50 border-2 border-blue-400 shadow-md ring-2 ring-blue-300 text-slate-900"
                        : "bg-blue-950/40 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-blue-500"
                      : isLight
                      ? "bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono font-black text-xs ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                      {sensor.id}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                        sensor.status === "CRITICAL"
                          ? isLight
                            ? "bg-red-100 border-red-300 text-red-800"
                            : "bg-red-950/60 border-red-500/50 text-red-400"
                          : sensor.status === "CHATTER"
                          ? isLight
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-amber-950/60 border-amber-500/50 text-amber-400"
                          : isLight
                          ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                          : "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                      }`}
                    >
                      {sensor.status}
                    </span>
                  </div>

                  <div className="mt-2 space-y-0.5">
                    <div className={`font-bold text-xs truncate ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                      {sensor.zone}
                    </div>
                    <div className={`flex justify-between items-center text-[10px] font-mono pt-1 ${
                      isLight ? "text-slate-600 font-medium" : "text-slate-400"
                    }`}>
                      <span>Freq: <strong className={isLight ? "text-slate-900" : "text-slate-200"}>{sensor.frequencyKhz} kHz</strong></span>
                      <span>Amp: <strong className={
                        sensor.amplitudeDb > 35
                          ? isLight ? "text-orange-700 font-black" : "text-orange-400 font-bold"
                          : isLight ? "text-slate-900" : "text-slate-200"
                      }>{sensor.amplitudeDb} dB</strong></span>
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 ${
                        sensor.status === "CRITICAL" ? "bg-orange-500" : "bg-blue-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            SECTION 2: REAL-TIME FFT SPECTROGRAM CANVAS (WITH HOVER & SCRUBBER)
        =================================================================== */}
        <div
          className={`p-6 rounded-2xl border backdrop-blur-xl shadow-xl space-y-4 ${
            isLight
              ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50"
              : isPetroleum
              ? "bg-[#071426]/90 border-amber-500/25 text-amber-100 shadow-black/80"
              : "bg-[#090e18]/90 border-white/[0.08] text-slate-100 shadow-black/80"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? "text-blue-800 font-extrabold" : "text-blue-400"
            }`}>
              <Activity className="w-4 h-4" />
              Real-Time Fast Fourier Transform (FFT) Frequency Spectrogram
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className={isLight ? "text-slate-600 font-bold" : "text-slate-400"}>Isolated Transducer:</span>
              <span className={`font-bold ${isLight ? "text-cyan-800" : "text-cyan-400"}`}>{selectedSensor.name}</span>
            </div>
          </div>

          {/* Canvas Viewport with Hover Tracking */}
          <div className={`relative w-full h-48 rounded-xl border overflow-hidden p-2 group cursor-crosshair ${
            isLight ? "bg-slate-950 border-slate-700 shadow-inner" : "bg-black/85 border-white/10"
          }`}>
            <canvas
              ref={canvasRef}
              width={900}
              height={180}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="w-full h-full block"
            />

            {/* Hover Crosshair Overlay */}
            {hoveredFreq && (
              <div
                className="absolute top-2 pointer-events-none transform -translate-x-1/2 px-2.5 py-1 rounded bg-black/90 border border-cyan-500 text-[10px] font-mono text-cyan-300 shadow-lg flex items-center gap-1.5"
                style={{ left: `${hoveredFreq.x}px` }}
              >
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span>{hoveredFreq.freqKhz.toFixed(1)} kHz</span>
                <span>&bull;</span>
                <span>{hoveredFreq.db} dB</span>
              </div>
            )}

            {/* Critical Alert Tag pinned to canvas */}
            {selectedSensor.status === "CRITICAL" && (
              <div className="absolute top-3 right-4 px-2.5 py-1 rounded-lg bg-orange-950/90 border border-orange-500/80 font-mono text-[10px] text-orange-300 font-bold flex items-center gap-1.5 shadow-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>38.4 kHz HIGH-PRESSURE JET HISS DETECTED</span>
              </div>
            )}
          </div>

          {/* Frequency Scale Labels */}
          <div className={`flex justify-between text-[10px] font-mono pt-1 ${
            isLight ? "text-slate-600 font-semibold" : "text-slate-400"
          }`}>
            <span>0 Hz (DC)</span>
            <span>10 kHz (Audible)</span>
            <span>20 kHz (Human Limit)</span>
            <span>30 kHz (Ultrasonic)</span>
            <span className={isLight ? "text-orange-700 font-black" : "text-orange-400 font-bold"}>
              38.4 kHz (Choked Flange Orifice)
            </span>
            <span>50 kHz</span>
          </div>

          {/* Interactive Squelch / Trip Threshold Slider */}
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.02] border-white/[0.06]"
          }`}>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              <div>
                <span className={`font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                  Adjust Squelch Trip Threshold:
                </span>
                <span className={`text-[11px] block ${isLight ? "text-slate-600 font-medium" : "text-slate-400"}`}>
                  Signals exceeding this amplitude trigger an automatic SIF precursor alarm
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-64">
              <input
                type="range"
                min="20"
                max="55"
                step="0.5"
                value={alarmThresholdDb}
                onChange={(e) => {
                  setAlarmThresholdDb(Number(e.target.value));
                  sound.toggle();
                }}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-orange-500 ${
                  isLight ? "bg-slate-200" : "bg-slate-800"
                }`}
              />
              <span className={`font-mono font-bold text-xs shrink-0 w-12 text-right ${
                isLight ? "text-orange-800 font-black" : "text-orange-400 font-bold"
              }`}>
                {alarmThresholdDb.toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 3: AUDIO SYNTHESIZER RACK & TRANSDUCER TELEMETRY
        =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Audio Synthesizer Rack */}
          <div
            className={`lg:col-span-6 p-5 rounded-2xl border backdrop-blur-xl shadow-xl space-y-4 ${
              isLight
                ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50"
                : isPetroleum
                ? "bg-[#071426]/90 border-amber-500/25 text-amber-100 shadow-black/80"
                : "bg-[#090e18]/90 border-white/[0.08] text-slate-100 shadow-black/80"
            }`}
          >
            <span className={`text-xs font-bold uppercase tracking-wider block ${
              isLight ? "text-slate-700 font-bold" : "text-slate-400"
            }`}>
              Audio Synthesis &amp; Filter Bank
            </span>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => {
                  sound.toggle();
                  setAudioMode("ambient");
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  audioMode === "ambient"
                    ? isLight
                      ? "bg-blue-100 border-blue-400 text-blue-950 font-bold shadow-sm"
                      : "bg-blue-950/50 border-blue-500/60 text-blue-300 font-bold"
                    : isLight
                    ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className={`text-[10px] font-mono ${isLight ? "text-slate-600 font-bold" : "opacity-75"}`}>
                  BASE PROCESS
                </div>
                <div className="text-xs mt-0.5">62 Hz Plant Hum</div>
              </button>

              <button
                onClick={() => {
                  sound.toggle();
                  setAudioMode("leak");
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  audioMode === "leak"
                    ? isLight
                      ? "bg-orange-100 border-orange-400 text-orange-950 font-bold shadow-sm"
                      : "bg-orange-950/50 border-orange-500/60 text-orange-300 font-bold"
                    : isLight
                    ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className={`text-[10px] font-mono ${isLight ? "text-slate-600 font-bold" : "opacity-75"}`}>
                  UNMITIGATED LEAK
                </div>
                <div className="text-xs mt-0.5">4.5 kHz White Noise</div>
              </button>

              <button
                onClick={() => {
                  sound.toggle();
                  setAudioMode("filtered");
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  audioMode === "filtered"
                    ? isLight
                      ? "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold shadow-sm"
                      : "bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-bold"
                    : isLight
                    ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                    : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className={`text-[10px] font-mono ${isLight ? "text-slate-600 font-bold" : "opacity-75"}`}>
                  AI ISOLATION
                </div>
                <div className="text-xs mt-0.5">1.85 kHz Bandpass</div>
              </button>
            </div>

            <div className={`space-y-1.5 pt-2 border-t ${isLight ? "border-slate-200" : "border-white/10"}`}>
              <div className="flex justify-between items-center text-xs">
                <span className={isLight ? "text-slate-700 font-semibold" : "text-slate-400"}>
                  Headphone Output Gain Level:
                </span>
                <span className={`font-mono font-bold ${isLight ? "text-slate-900" : ""}`}>
                  {Math.round(gainValue * 1000)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.12"
                step="0.005"
                value={gainValue}
                onChange={(e) => setGainValue(Number(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-500 ${
                  isLight ? "bg-slate-200" : "bg-slate-800"
                }`}
              />
            </div>
          </div>

          {/* Sensor Diagnostics */}
          <div
            className={`lg:col-span-6 p-5 rounded-2xl border backdrop-blur-xl shadow-xl space-y-3 font-mono text-xs ${
              isLight
                ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50"
                : isPetroleum
                ? "bg-[#071426]/90 border-amber-500/25 text-amber-100 shadow-black/80"
                : "bg-[#090e18]/90 border-white/[0.08] text-slate-100 shadow-black/80"
            }`}
          >
            <span className={`text-xs font-bold uppercase tracking-wider block font-sans ${
              isLight ? "text-slate-700 font-bold" : "text-slate-400"
            }`}>
              Active Channel Telemetry &bull; {selectedSensor.id}
            </span>

            <div className="space-y-2">
              <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
              }`}>
                <span className={`font-sans ${isLight ? "text-slate-600 font-semibold" : "text-slate-400"}`}>
                  Physical Transducer Node:
                </span>
                <span className={`font-bold ${isLight ? "text-slate-900" : "text-slate-200"}`}>
                  {selectedSensor.name}
                </span>
              </div>
              <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
              }`}>
                <span className={`font-sans ${isLight ? "text-slate-600 font-semibold" : "text-slate-400"}`}>
                  Signal-to-Noise Ratio (SNR):
                </span>
                <span className={`font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                  +{selectedSensor.snrDb} dB SNR
                </span>
              </div>
              <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
                isLight ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white/[0.03] border-white/[0.06]"
              }`}>
                <span className={`font-sans ${isLight ? "text-slate-600 font-semibold" : "text-slate-400"}`}>
                  Acoustic Signal Amplitude:
                </span>
                <span className={`font-bold ${
                  selectedSensor.amplitudeDb > 35
                    ? isLight ? "text-orange-700 font-black" : "text-orange-400"
                    : isLight ? "text-slate-900" : "text-slate-200"
                }`}>
                  {selectedSensor.amplitudeDb} dB &bull; {selectedSensor.status}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border text-[11px] font-sans ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-800 font-medium shadow-sm" : "bg-white/[0.02] border-white/[0.06] text-slate-300"
              }`}>
                {selectedSensor.description}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  sound.click();
                  onNavigateView("digital_twin");
                }}
                className={`w-full py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-sm"
                    : "bg-white/[0.05] hover:bg-white/[0.1] border-white/10 text-slate-200"
                }`}
              >
                <span>Locate Transducer {selectedSensor.id} on 3D Digital Twin</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
