import { ReportIncidentData } from "../utils/reportExport";

export interface RecalledFeature {
  detected: boolean;
  featureName: string;
  category: "SECONDARY_BARRIER_FAILURE" | "LATENT_ENERGY_RESERVE" | "INSTRUMENT_CORRUPTION" | "ZERO_LATENT_HAZARD";
  missedReason: string;
  recalledEvidence: string;
  telemetrySource: string;
  barrierImpact: {
    name: string;
    status: string;
    detail: string;
  };
}

export interface IncidentScenario extends ReportIncidentData {
  id: string;
  zoneId: "Zone A" | "Zone B" | "Zone C" | "Zone D" | "Admin";
  shortName: string;
  imageUrl?: string;
  thermalImageUrl?: string;
  recalledFeature?: RecalledFeature;
}

export const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    id: "scen-1",
    incidentNumber: "#OI-2026-00421",
    shortName: "Pump P-102: Unbolted Coupling & 3,000 PSI",
    imageUrl: "/images/pump_p102.jpg",
    thermalImageUrl: "/images/thermal_scan.jpg",
    zone: "Zone D: Pump P-102 Bay",
    zoneId: "Zone D",
    equipment: "High-Pressure Condensate Pump P-102",
    title: "Pump P-102 High-Pressure Bleed Bypass & Guard Removal",
    time: "10:42 UTC",
    narrative:
      "Technician slipped on oil sheen during alignment check on high-pressure pump P-102. 3,000 PSI line remained pressurized and coupling guard had been unbolted. Worker sustained minor knee scrape; zero lost work days.",
    energyType: "3,000 PSI Hydrostatic Pressure + 480V Rotating Shaft",
    exposureLevel: "Technician in Direct Line-of-Fire (< 1.5m)",
    actualSeverity: "LOW",
    actualDescription: "Minor slip / 0 lost work days",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Fatal line-of-fire rupture / Limb amputation",
    discordanceStatus: "HIGH",
    discordanceGap: 94,
    classification: "SIF PRECURSOR",
    barriers: [
      {
        name: "Hydrostatic Depressurization",
        status: "FAILED",
        detail: "Discharge spool remained energized at 3,000 PSI; manual bleed valve bypassed.",
      },
      {
        name: "Coupling Safety Guard",
        status: "ABSENT",
        detail: "Heavy gauge protective shroud removed during alignment check with worker in direct perimeter.",
      },
      {
        name: "Physical Positive Isolation (Blind)",
        status: "ABSENT",
        detail: "No spectacle blind flange installed; relied solely on single gate valve without tagout.",
      },
    ],
    recalledFeature: {
      detected: true,
      featureName: "Remote Emergency Bleed Actuator 24V Loop Power Failure",
      category: "SECONDARY_BARRIER_FAILURE",
      missedReason: "Field technician's report only noted the manual bleed valve. Initial NLP scan missed secondary electrical control loop telemetry.",
      recalledEvidence: "AI Deep Recall scanned SCADA alarm buffer #ALM-9042 and discovered remote bleed actuator 24V loop power tripped 18 minutes prior. Both manual AND automated remote isolation mechanisms were disabled.",
      telemetrySource: "SCADA Modbus Loop RTU-402 & PLC Rack B-12",
      barrierImpact: {
        name: "Remote Automated Bleed Actuator",
        status: "FAILED",
        detail: "24V loop power tripped 18m prior; remote isolation incapable of depressurizing 3,000 PSI line.",
      },
    },
    ragMatch: {
      id: "#OI-1832",
      similarity: 94,
      description: "Sector 4 coupling shroud failure with 3,000 PSI pressurized line caused fatal injury in 2021.",
    },
    recommendedAction: "Immediate Positive Isolation Shutdown & Application of LOTO Padlock #LOTO-8821.",
    orderNumber: "#OI-ACT-2026-892",
  },
  {
    id: "scen-2",
    incidentNumber: "#OI-2026-00388",
    shortName: "Horton Sphere V-204: Liquefied LPG Gas Leak",
    imageUrl: "/images/horton_sphere.jpg",
    thermalImageUrl: "/images/thermal_scan.jpg",
    zone: "Zone B: High Pressure Horton Spheres",
    zoneId: "Zone B",
    equipment: "Horton Sphere V-204 LPG Storage Vessel",
    title: "Horton Sphere V-204 Liquefied LPG Gland Packing Leak",
    time: "08:15 UTC",
    narrative:
      "Operator smelled pungent gas odor near Sphere V-204 base leg during routine round. Portable LEL detector alarmed at 22% LEL. Sampling manifold packing gland was leaking liquefied propane. Operator evacuated area safely without injury.",
    energyType: "25 Bar Liquefied Propane Gas + Vapor Cloud Explosion (VCE) Potential",
    exposureLevel: "Operator inside flammable vapor envelope (< 3m)",
    actualSeverity: "LOW",
    actualDescription: "Odor detected / 0 injuries logged",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Vapor cloud flash fire / BLEVE explosion",
    discordanceStatus: "HIGH",
    discordanceGap: 91,
    classification: "SIF PRECURSOR",
    barriers: [
      {
        name: "Primary Valve Gland Packing",
        status: "FAILED",
        detail: "Teflon packing gland degraded under thermal cycling, allowing fugitive LPG leakage.",
      },
      {
        name: "Fixed Perimeter LEL Gas Detector",
        status: "ABSENT",
        detail: "Sensor head #GD-204 had been unclipped for recalibration, leaving blindspot.",
      },
      {
        name: "Water Deluge Fire Spray",
        status: "FUNCTIONING",
        detail: "Sphere water cooling deluge system is operational on standby.",
      },
    ],
    recalledFeature: {
      detected: true,
      featureName: "Sphere Deluge Nozzle #3 Clogged by Mud Wasps (Water Deficit 40%)",
      category: "SECONDARY_BARRIER_FAILURE",
      missedReason: "Operator round noted gas odor and packing leak. Initial scan assumed emergency water deluge was 100% operational.",
      recalledEvidence: "AI Deep Recall cross-checked weekly preventive maintenance log PM-OI-DEL-88. Deluge nozzle #3 water spray test showed severe sediment/wasp nest clogging, reducing vapor suppression coverage by 40%.",
      telemetrySource: "SAP-PM Maintenance Order #881023 & Flow Sensor FT-204",
      barrierImpact: {
        name: "Automated Water Deluge Spray",
        status: "FAILED",
        detail: "Nozzle #3 obstructed; water delivery reduced by 40%, leaving BLEVE thermal envelope unprotected.",
      },
    },
    ragMatch: {
      id: "#OI-1240",
      similarity: 91,
      description: "Vapor cloud ignition at LPG sphere manifold resulting in major fire event in 2018.",
    },
    recommendedAction: "Trigger Automated Water Deluge & Remotely Close Sphere Emergency Shutdown Valve (ESDV-204).",
    orderNumber: "#OI-ACT-2026-741",
  },
  {
    id: "scen-3",
    incidentNumber: "#OI-2026-00512",
    shortName: "Crude Tank TK-101: Overpressure & H2S Risk",
    imageUrl: "/images/crude_tank.jpg",
    thermalImageUrl: "/images/thermal_scan.jpg",
    zone: "Zone C: Crude Storage Farm",
    zoneId: "Zone C",
    equipment: "Heavy Crude Storage Tank TK-101 (20,000 m³)",
    title: "Storage Tank TK-101 Pressure Vacuum Relief Valve Seizure",
    time: "14:20 UTC",
    narrative:
      "Field gauger observed abnormal tank roof breathing vibration on crude tank TK-101 during tanker filling. Digital pressure gauge reading 1.9x design threshold. Pressure-vacuum breathing valve was mechanically seized closed.",
    energyType: "Tank Headspace Overpressure + Toxic H2S Gas (120 ppm)",
    exposureLevel: "Gauger on tank top stairwell walkway",
    actualSeverity: "LOW",
    actualDescription: "Auditory vibration check / 0 injuries",
    potentialSeverity: "HIGH",
    potentialOutcome: "Tank roof rupture / Lethal toxic H2S cloud release",
    discordanceStatus: "HIGH",
    discordanceGap: 86,
    classification: "SIF PRECURSOR",
    barriers: [
      {
        name: "Pressure-Vacuum (PV) Breather Valve",
        status: "FAILED",
        detail: "Pallet disc stuck on seat due to heavy waxy crude vapor deposit accumulation.",
      },
      {
        name: "Nitrogen Blanket Pressure Transmitter",
        status: "FAILED",
        detail: "Transmitter PT-101 signal frozen at normal 12 mbar, masking pressure surge.",
      },
      {
        name: "Secondary Containment Bund Berm",
        status: "FUNCTIONING",
        detail: "Reinforced concrete earthen bund intact for liquid spill containment.",
      },
    ],
    recalledFeature: {
      detected: true,
      featureName: "Redundant Overfill Float Switch #LS-101 Mechanically Bound",
      category: "INSTRUMENT_CORRUPTION",
      missedReason: "Initial scan focused only on the mechanical breathing valve seizure and digital transmitter freeze.",
      recalledEvidence: "AI Deep Recall scanned acoustic vibration sensor AV-101 and determined the redundant high-high level trip float (LS-101) was also mechanically bound with waxy crude residue.",
      telemetrySource: "Acoustic Diagnostic Telemetry & Tank Farm DCS Matrix",
      barrierImpact: {
        name: "Emergency Overfill Switch (LS-101)",
        status: "FAILED",
        detail: "Redundant float switch seized in normal state, eliminating secondary high-level pump trip.",
      },
    },
    ragMatch: {
      id: "#OI-1605",
      similarity: 88,
      description: "Storage tank roof tear during rapid filling with stuck breather valve in 2020.",
    },
    recommendedAction: "Divert Crude Feed to Tank TK-102 & Open Emergency Flare Vent Header Bypass.",
    orderNumber: "#OI-ACT-2026-955",
  },
  {
    id: "scen-4",
    incidentNumber: "#OI-2026-00219",
    shortName: "Distillation C-01: Thermal Runaway",
    imageUrl: "/images/distillation_column.jpg",
    thermalImageUrl: "/images/thermal_scan.jpg",
    zone: "Zone A: Refinery Processing Columns",
    zoneId: "Zone A",
    equipment: "Fractionation Distillation Column C-01 & Reboiler",
    title: "Distillation Column C-01 Reboiler Temperature Trip Bypass",
    time: "06:50 UTC",
    narrative:
      "Temperature spike to 285°C observed on tray 14 during naphtha distillation. High-temperature shutdown interlock had been placed in bypass mode during instrument recalibration without management of change (MOC). Operator felt extreme radiant heat.",
    energyType: "285°C Thermal Heat + 12 Bar Flammable Hydrocarbon Vapor",
    exposureLevel: "Field operator on level 2 column catwalk",
    actualSeverity: "MEDIUM",
    actualDescription: "First-degree radiant heat burn / First aid",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Catastrophic column overpressure & structural collapse",
    discordanceStatus: "HIGH",
    discordanceGap: 78,
    classification: "CRITICAL EVENT",
    barriers: [
      {
        name: "Safety Instrumented System (SIS) High-Temp Trip",
        status: "FAILED",
        detail: "Software bypass jumper active on safety PLC without valid MOC permit approval.",
      },
      {
        name: "Redundant Catwalk Thermocouple",
        status: "FAILED",
        detail: "Thermocouple wire corroded; false reading delayed control room alert by 14 minutes.",
      },
      {
        name: "Emergency Column Relief Header",
        status: "FUNCTIONING",
        detail: "Spring-loaded pressure safety valves (PSV) remained operable.",
      },
    ],
    recalledFeature: {
      detected: true,
      featureName: "Reboiler Cold Quench Injection Solenoid Latency (> 45s vs 4s standard)",
      category: "LATENT_ENERGY_RESERVE",
      missedReason: "Initial scan caught the safety PLC temperature bypass jumper, but assumed physical quench injection would react instantly.",
      recalledEvidence: "AI Deep Recall scanned pneumatic valve stroke diagnostic telemetry. Actuator air supply pressure was dropping to 2.1 bar, causing emergency cold quench valve to stall for 45 seconds.",
      telemetrySource: "Smart Positioner HART Diagnostic Log #HART-C01",
      barrierImpact: {
        name: "Emergency Cold Quench Valve",
        status: "FAILED",
        detail: "Actuator supply pressure deficit delayed quench response by 45s, elevating runaway explosion risk.",
      },
    },
    ragMatch: {
      id: "#OI-1994",
      similarity: 95,
      description: "Refinery distillation column reboiler explosion during bypassed temperature trip in 2022.",
    },
    recommendedAction: "Automated Emergency Trip Re-engagement & Cold Quench Injection to Column Base.",
    orderNumber: "#OI-ACT-2026-412",
  },
  {
    id: "scen-5",
    incidentNumber: "#OI-2026-00105",
    shortName: "Site Office: Hallway Mat Slip & Fall",
    imageUrl: "/images/pump_p102.jpg",
    thermalImageUrl: "/images/thermal_scan.jpg",
    zone: "Sector 1: Administrative Site Office",
    zoneId: "Admin",
    equipment: "Administrative Office Reception Hallway",
    title: "Administrative Building Entrance Hallway Mat Trip & Fall",
    time: "09:30 UTC",
    narrative:
      "Staff member tripped over curled rubber edge of runner mat in administrative reception hallway. Worker suffered minor knee scrape. First aid ointment and bandage applied on site; returned to desk immediately.",
    energyType: "Low Gravitational Energy (< 0.5m Elevation)",
    exposureLevel: "Walking in carpeted administrative hallway",
    actualSeverity: "LOW",
    actualDescription: "Minor knee scrape / 0 days lost",
    potentialSeverity: "LOW",
    potentialOutcome: "Superficial bruise or sprain / First aid only",
    discordanceStatus: "LOW",
    discordanceGap: 0,
    classification: "ROUTINE",
    barriers: [
      {
        name: "Non-Slip Runner Adhesive Tape",
        status: "FAILED",
        detail: "Adhesive corner peeled back after floor cleaning; required replacement with beveled mat.",
      },
      {
        name: "Adequate Facility Lighting",
        status: "FUNCTIONING",
        detail: "Corridor illumination measured at 350 Lux, well within OSHA commercial standards.",
      },
      {
        name: "Housekeeping Walkway Clearance",
        status: "FUNCTIONING",
        detail: "Corridor free of tripping obstacles or electrical cables.",
      },
    ],
    recalledFeature: {
      detected: false,
      featureName: "Zero Latent Hazards Detected (100% Clean Verification)",
      category: "ZERO_LATENT_HAZARD",
      missedReason: "Comprehensive 2nd-order rescan conducted across all commercial facility logs and electrical telemetry.",
      recalledEvidence: "AI Deep Recall confirmed zero hazardous energy, zero high-pressure lines, and zero toxic atmospheres. Initial 'ROUTINE' classification verified with 100% confidence.",
      telemetrySource: "Facility BMS Telemetry & Admin Environmental Sensors",
      barrierImpact: {
        name: "Facility Deep Recall Audit",
        status: "FUNCTIONING",
        detail: "No hidden latent hazards. Routine slip-and-fall classification independently verified.",
      },
    },
    ragMatch: {
      id: "#OI-0842",
      similarity: 98,
      description: "Routine office walkway slips and trips resulting in zero lost-time incidents.",
    },
    recommendedAction: "Replace Runner with Beveled Rubber Safety Mat. No Operational LOTO Required.",
    orderNumber: "#OI-ACT-2026-105",
  },
];
