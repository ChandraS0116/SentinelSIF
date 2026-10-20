/**
 * Master Historical Hazard & Industrial Incident Registry
 * Combines famous real-world global/national oil & gas disasters (BP Texas City, Piper Alpha,
 * IOCL Jaipur, Oil India Baghjan, Chevron Richmond, HPCL Vizag) alongside live facility incidents.
 */

export interface HistoricalBarrierFailure {
  name: string;
  type: "ENGINEERING" | "ADMINISTRATIVE" | "INSTRUMENTATION" | "PROCEDURAL";
  status: "FAILED" | "ABSENT" | "BYPASSED" | "FUNCTIONING";
  detail: string;
  rootCause: string;
}

export interface HistoricalHazard {
  id: string;
  incidentNumber: string;
  title: string;
  facility: string;
  sector: string;
  date: string;
  origin: "GLOBAL_BENCHMARK" | "NATIONAL_DISASTER" | "LIVE_FACILITY";
  energyType: string;
  exposureLevel: string;
  actualSeverity: "LOW" | "MEDIUM" | "HIGH" | "FATAL" | "CRITICAL" | "NONE";
  actualDescription: string;
  potentialSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
  potentialOutcome: string;
  discordanceGap: number;
  discordanceStatus: "EXTREME" | "HIGH" | "MODERATE" | "BALANCED";
  classification: "SIF PRECURSOR" | "CRITICAL EVENT" | "SERIOUS EVENT" | "ROUTINE";
  fatalities: number;
  injuries: number;
  economicDamage: string;
  summary: string;
  narrative: string;
  barrierFailures: HistoricalBarrierFailure[];
  rootCauses: string[];
  csbFinding?: string;
  dgmsCircularReference?: string;
  lessonsLearned: string[];
  regulatoryOrder: string;
  status: "CLOSED_AUDITED" | "ACTIVE_LOCKDOWN" | "UNDER_INVESTIGATION" | "NOMINAL";
}

export const HISTORICAL_HAZARDS: HistoricalHazard[] = [
  // =========================================================================
  // REAL-WORLD DISASTER 1: BP Texas City Isomerization Explosion (2005)
  // =========================================================================
  {
    id: "haz-bp-2005",
    incidentNumber: "#CSB-2005-04-I-TX",
    title: "BP Texas City ISOM Raffinate Splitter Overfill & Vapor Cloud Explosion",
    facility: "BP Texas City Refinery",
    sector: "Isomerization (ISOM) Unit",
    date: "March 23, 2005",
    origin: "GLOBAL_BENCHMARK",
    energyType: "7,600 Gallons Flammable Liquid Hydrocarbon + High-Energy Vapor Cloud",
    exposureLevel: "Contractor trailers placed inside 120m blast radius",
    actualSeverity: "FATAL",
    actualDescription: "15 worker fatalities, 180 serious injuries, entire ISOM destroyed",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Catastrophic multi-unit vapor cloud explosion & structural collapse",
    discordanceGap: 96,
    discordanceStatus: "EXTREME",
    classification: "CRITICAL EVENT",
    fatalities: 15,
    injuries: 180,
    economicDamage: "$2.1 Billion USD",
    summary:
      "During startup of the isomerization raffinate splitter tower, liquid was continuously fed while manual discharge valves remained closed. The 170-foot column filled completely, routing boiling hydrocarbons into a 1950s atmospheric blowdown drum with open stack, creating a massive ground-level vapor cloud that ignited from an idling diesel truck.",
    narrative:
      "At 02:00, operators initiated startup of the raffinate splitter column. Heavy aromatics were fed into the column for 3 hours without drawing off liquid. The tower level transmitter range ended at 9 feet (on a 170-foot column); float was mechanically stuck indicating level was dropping. High-level alarm failed to sound. Hydrocarbons filled overhead condenser spools and breached safety relief valves into the atmospheric blowdown stack, geysering into the contractor trailer park.",
    barrierFailures: [
      {
        name: "Displacement Level Transmitter (LT-5102)",
        type: "INSTRUMENTATION",
        status: "FAILED",
        detail: "Displacer torque tube seized; transmitter output clamped at 82% while column was 100% full (170 ft liquid head).",
        rootCause: "Preventive maintenance skipped; calibration deferred during turnaround.",
      },
      {
        name: "Hardwired High-High Level Alarm",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Secondary independent float switch wire disconnected inside junction box JB-14.",
        rootCause: "No pre-startup safety review (PSSR) verification before flammable introduction.",
      },
      {
        name: "Atmospheric Blowdown Drum & Vent Stack",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Relief valves vented directly to atmospheric stack instead of closed flare header system.",
        rootCause: "Outdated 1950s design; management rejected flare system retrofits due to capital cost.",
      },
      {
        name: "Facility Siting & Trailer Placement",
        type: "ADMINISTRATIVE",
        status: "ABSENT",
        detail: "Occupied contractor office trailers sited 121 feet from ISOM blowdown drum.",
        rootCause: "API RP 752 siting guidelines ignored; no quantitative blast overpressure risk assessment.",
      },
    ],
    rootCauses: [
      "Faulty level instrumentation and failed secondary high-level switch.",
      "Venting relief streams to atmospheric stack rather than closed relief flare.",
      "Inadequate control room staffing during hazardous startup (1 operator managing 3 units).",
      "Siting occupied mobile trailers within flammable vapor explosion envelope.",
    ],
    csbFinding:
      "U.S. Chemical Safety Board Report 2005-04-I-TX: BP Texas City was operating with obsolete atmospheric blowdown technology and defective safety instrumentation. Management failed to heed multiple precursor warnings and near-misses.",
    dgmsCircularReference: "DGMS Tech Circular (Petroleum) 2007/02 — Mandate on Automated Flare Headers",
    lessonsLearned: [
      "Eliminate atmospheric blowdown drums; route all volatile hydrocarbon relief to elevated smokeless flares.",
      "Install independent hardwired High-High SIL-3 level shutdown trips on all distillation towers.",
      "Strict enforcement of API RP 752/753 personnel siting perimeters away from process boundaries.",
    ],
    regulatoryOrder: "OSHA-EHS-ENF-2005-0881 / DGMS-DIR-2007-09",
    status: "CLOSED_AUDITED",
  },

  // =========================================================================
  // REAL-WORLD DISASTER 2: Piper Alpha North Sea Offshore Explosion (1988)
  // =========================================================================
  {
    id: "haz-piper-1988",
    incidentNumber: "#CULLEN-1990-UK",
    title: "Piper Alpha Platform Condensate Pump Safety Valve Bypass & Catastrophic Fire",
    facility: "Piper Alpha Offshore Platform",
    sector: "Module C — Gas Compression & Condensate Injection",
    date: "July 6, 1988",
    origin: "GLOBAL_BENCHMARK",
    energyType: "600 Bar Liquefied Condensate Gas + Subsea Inter-Platform Gas Trunklines",
    exposureLevel: "226 offshore personnel on isolated production platform",
    actualSeverity: "FATAL",
    actualDescription: "167 fatalities, platform fully destroyed and collapsed into North Sea",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Total offshore platform destruction and catastrophic life loss",
    discordanceGap: 98,
    discordanceStatus: "EXTREME",
    classification: "CRITICAL EVENT",
    fatalities: 167,
    injuries: 62,
    economicDamage: "$3.4 Billion USD",
    summary:
      "Condensate injection Pump A pressure safety valve (PSV-504) was removed for overhaul and replaced with a hand-tight blind flange. When primary Pump B tripped, night shift operators unaware of the missing safety valve switched to Pump A. High pressure condensate leaked past the unbolted blind flange, igniting fire that ruptured connecting high-pressure gas pipelines.",
    narrative:
      "At 18:00, day-shift maintenance contractors unbolted safety relief valve PSV-504 from Condensate Pump A. A temporary blanking flange was fitted hand-tight with two bolts. The permit-to-work was left on the maintenance supervisor's desk instead of being formally handed over to the night-shift custodian. At 21:45, main Condensate Pump B tripped. Operators attempted multiple restarts before activating standby Pump A. Condensate at 45 bar surged past the hand-tight blind flange.",
    barrierFailures: [
      {
        name: "Permit-to-Work (PTW) Cross-Shift Handover",
        type: "PROCEDURAL",
        status: "FAILED",
        detail: "Permit #PTW-8812 was separated from operating log; night shift had zero visibility into Pump A status.",
        rootCause: "Informal handover culture; lack of centralized electronic permit-to-work tracking.",
      },
      {
        name: "Positive Isolation Blind Flange Torque",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Blind flange installed with only two hand-tightened finger bolts; failed immediately under 45 bar.",
        rootCause: "Uncertified temporary blanking; absence of tagout lock and torque verification stamp.",
      },
      {
        name: "Automated Fire Deluge Water System",
        type: "ENGINEERING",
        status: "BYPASSED",
        detail: "Deluge pumps set to manual mode to prevent divers being sucked into sea water intakes.",
        rootCause: "Operating procedure kept deluge in manual even when no diving operations were taking place.",
      },
      {
        name: "Emergency Subsea Pipeline Isolation Valves (SSIV)",
        type: "ENGINEERING",
        status: "ABSENT",
        detail: "No subsea isolation valves on Tartan and Claymore gas pipelines connecting to Piper Alpha.",
        rootCause: "Connecting platforms continued pumping high-pressure gas into Piper Alpha fire for over 1 hour.",
      },
    ],
    rootCauses: [
      "Permit-to-Work system breakdown with failure of shift-to-shift communication.",
      "Unbolted blind flange placed without positive LOTO padlock.",
      "Firewater deluge pumps locked in manual mode.",
      "Lack of subsea ESD valves allowing connected platforms to feed high-pressure fuel to the fire.",
    ],
    csbFinding:
      "Lord Cullen Public Inquiry (1990): The disaster was directly caused by the lack of clear shift handover communication and reliance on paper permits without physical interlocks or positive isolation verification.",
    dgmsCircularReference: "DGMS Offshore Directive 1993/01 — Positive Isolation & Shift Handover Rules",
    lessonsLearned: [
      "Mandatory Safety Case regime for all offshore and petrochemical installations.",
      "Electronic, auditable Permit-to-Work systems integrated with physical LOTO keys.",
      "Subsea Isolation Valves (SSIV) required on all high-pressure marine export risers.",
    ],
    regulatoryOrder: "UK-HSE-CULLEN-1990 / DGMS-OFFSHORE-93",
    status: "CLOSED_AUDITED",
  },

  // =========================================================================
  // REAL-WORLD DISASTER 3: IOCL Jaipur Terminal Vapor Cloud Explosion (2009)
  // =========================================================================
  {
    id: "haz-iocl-2009",
    incidentNumber: "#MB-OISD-2009-JP",
    title: "Indian Oil Corporation (IOCL) Jaipur Terminal Massive Tank Farm Vapor Cloud Blast",
    facility: "IOCL Jaipur Bulk POL Terminal, Sitapura",
    sector: "Tank Farm — MS / HSD High-Volume Storage",
    date: "October 29, 2009",
    origin: "NATIONAL_DISASTER",
    energyType: "60,000 Kiloliters Motor Spirit (Petrol) & Diesel + Unconfined Vapor Cloud",
    exposureLevel: "Industrial zone and adjoining educational institutes (< 5km)",
    actualSeverity: "FATAL",
    actualDescription: "11 fatalities, 150+ injuries, all 11 bulk storage tanks destroyed, ₹280 Cr loss",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Total terminal annihilation and catastrophic regional toxic fallout",
    discordanceGap: 95,
    discordanceStatus: "EXTREME",
    classification: "CRITICAL EVENT",
    fatalities: 11,
    injuries: 150,
    economicDamage: "₹280 Crore INR",
    summary:
      "During a routine line clearance operation from tank 4012 to pipeline header, a hammer-blind valve was opened while the motor operated valve (MOV) remained cracked. A massive jet of motor spirit (petrol) sprayed into the air at high pressure. Personnel could not approach the leak to close valves manually because remote shutoff valves (ROV) were absent. The cloud ignited after 75 minutes.",
    narrative:
      "At 19:15, operators prepared to transfer petrol from Tank 4012. Valve operations were carried out without positive isolation on the main header. As technicians opened the valve bonnet, pressurized petrol shot out like a fountain. The vapor cloud spread across 5 km². Operators were forced to flee without being able to activate emergency shutoffs because buttons were situated inside the flammable vapor zone. After 75 minutes of fuel dispersion, an electrical spark ignited the cloud.",
    barrierFailures: [
      {
        name: "Remotely Operated Shutoff Valve (ROSV / ROV)",
        type: "ENGINEERING",
        status: "ABSENT",
        detail: "Terminal lacked remote shutoff valves located outside bund walls to isolate tank base spools.",
        rootCause: "OISD-117 standard recommendation for ROSVs had been delayed and not implemented.",
      },
      {
        name: "Fixed Hydrocarbon Gas Detectors",
        type: "INSTRUMENTATION",
        status: "ABSENT",
        detail: "Tank farm bund lacked fixed flammable gas detector grid with automatic trip logic.",
        rootCause: "Relying on human smell and manual portable gas detectors during transfers.",
      },
      {
        name: "Fail-Safe Actuated ESD Pushbuttons",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Emergency shut-off buttons were located within the vapor cloud envelope, making them unreachable.",
        rootCause: "Siting of safety controls violated OISD safety clearance guidelines.",
      },
      {
        name: "Positive Blind Mechanical Isolation",
        type: "PROCEDURAL",
        status: "FAILED",
        detail: "Valve bonnet unbolted before confirming upstream hydrostatic zero energy state.",
        rootCause: "Inadequate Operating Procedure (SOP) compliance and lack of PTW verification.",
      },
    ],
    rootCauses: [
      "Absence of Remotely Operated Shutoff Valves (ROVs) on tank body nozzles.",
      "Emergency push buttons located inside the hazard zone rather than in the central control room.",
      "Lack of fixed automatic gas detection systems with acoustic/visual terminal alarms.",
      "Execution of line clearing and valve maintenance without positive double-block-and-bleed isolation.",
    ],
    csbFinding:
      "M.B. Lal Committee Investigation Report (2010): The Jaipur disaster could have been prevented within 90 seconds if fail-safe remotely operated valves had been installed outside the bund wall.",
    dgmsCircularReference: "OISD-GDN-166 / M.B. Lal Recommendation #01 — Mandatory ROSVs on POL Tanks",
    lessonsLearned: [
      "Mandatory installation of ROSVs with pneumatic/spring-return actuators on all hydrocarbon storage tanks.",
      "Automated hydrocarbon gas detection loops integrated directly into Emergency Shutdown (ESD) PLCs.",
      "Emergency push buttons and control consoles sited in blast-resistant control rooms > 100m away.",
    ],
    regulatoryOrder: "MOPNG-MBLAL-2010-DIR-01 / OISD-STD-117-REV",
    status: "CLOSED_AUDITED",
  },

  // =========================================================================
  // REAL-WORLD DISASTER 4: Oil India Limited Baghjan Well #5 Blowout (2020)
  // =========================================================================
  {
    id: "haz-baghjan-2020",
    incidentNumber: "#OIL-DGMS-2020-BJ5",
    title: "Oil India Limited (OIL) Baghjan Well #5 High-Pressure Gas Blowout & Inferno",
    facility: "Oil India Limited — Baghjan Oilfield, Tinsukia, Assam",
    sector: "Well #5 Exploration & Workover Rig",
    date: "May 27, 2020",
    origin: "NATIONAL_DISASTER",
    energyType: "High-Pressure Natural Gas (320 Bar) + Volatile Condensate Reservoir Energy",
    exposureLevel: "Local communities, Dibru-Saikhowa National Park, and 200+ site personnel",
    actualSeverity: "FATAL",
    actualDescription: "3 OIL firefighters lost, 2,500 families evacuated, well burned for 160 days",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Subsurface reservoir breach, catastrophic blowout, and regional environmental devastation",
    discordanceGap: 97,
    discordanceStatus: "EXTREME",
    classification: "CRITICAL EVENT",
    fatalities: 3,
    injuries: 12,
    economicDamage: "₹450 Crore INR",
    summary:
      "During workover operations to extract gas from a new sand layer at Baghjan Well #5, contractors removed the Blowout Preventer (BOP) stack before testing well integrity and placing a permanent bridge plug. Well hydrostatic barrier failed, causing an uncontrollable 320 bar natural gas blowout that spewed condensate for 13 days before catching fire and burning for 160 days.",
    narrative:
      "At 10:30 on May 27, workover contractor crew removed the secondary Blowout Preventer (BOP) on Well #5 while servicing tubing. The well was on kill-fluid brine mud. However, mud column hydrostatic pressure dropped below formation pressure. Natural gas broke through the mud column, expelling brine into the air. With the BOP unbolted and no secondary shear ram operational, crews had zero mechanical barrier to stop the 320 bar geyser. On June 9, the gas cloud ignited into a 100m flame tower.",
    barrierFailures: [
      {
        name: "Hydrostatic Liquid Mud Barrier",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Drilling kill-fluid brine density dropped below formation pore pressure, allowing gas kick.",
        rootCause: "Inadequate mud logging telemetry and failure to monitor kill-tank volume return.",
      },
      {
        name: "Hydraulic Blowout Preventer (BOP) Stack",
        type: "ENGINEERING",
        status: "BYPASSED",
        detail: "BOP unbolted and lifted before positive mechanical bridge plug was verified pressure-tight.",
        rootCause: "Procedural shortcut taken by contractor without approval from OIL Installation Manager.",
      },
      {
        name: "Secondary Mechanical Bridge Plug",
        type: "ENGINEERING",
        status: "ABSENT",
        detail: "No retrievable bridge plug set in the casing before nipple-down of the surface BOP.",
        rootCause: "Violation of DGMS Oil Mines Regulation (OMR) 2017 Rule 43 on double-barrier well isolation.",
      },
      {
        name: "Contractor Safety Supervision & PTW",
        type: "ADMINISTRATIVE",
        status: "FAILED",
        detail: "Work executed without designated OIL Level-4 Safety Officer present at rig floor.",
        rootCause: "Lapse in statutory contractor oversight and failure to enforce stop-work authority.",
      },
    ],
    rootCauses: [
      "Removal of the BOP before establishing two tested mechanical barriers.",
      "Underbalanced hydrostatic fluid column allowing formation gas kick.",
      "Contractor non-compliance with statutory DGMS OMR standard operating procedures.",
      "Failure of site management to exercise positive stop-work authority when mud volume surged.",
    ],
    csbFinding:
      "National Green Tribunal (NGT) & DGMS Inquiry Report (2020): Baghjan Well #5 was operated without mandatory environmental clearances and in violation of double-barrier well control rules during workover operations.",
    dgmsCircularReference: "DGMS (OMR) Circular 2021/03 — Mandatory Well Control Double-Barrier Protocols",
    lessonsLearned: [
      "Strict enforcement of the 'Two-Barrier Principle' at all times during well workovers.",
      "Continuous automated mud pit volume and trip tank electronic acoustic telemetry.",
      "Mandatory presence of certified DGMS Level-4 Installation Safety Officer for critical rig operations.",
    ],
    regulatoryOrder: "NGT-OA-43-2020 / DGMS-DIR-OMR-2020-14",
    status: "CLOSED_AUDITED",
  },

  // =========================================================================
  // REAL-WORLD DISASTER 5: Chevron Richmond Refinery Pipe Rupture (2012)
  // =========================================================================
  {
    id: "haz-chev-2012",
    incidentNumber: "#CSB-2012-03-I-CA",
    title: "Chevron Richmond Refinery Crude Unit 4-Side-Cut High-Temperature Pipe Rupture",
    facility: "Chevron Richmond Refinery, California",
    sector: "Crude Unit #4 — Atmospheric Distillation Tower",
    date: "August 6, 2012",
    origin: "GLOBAL_BENCHMARK",
    energyType: "640°F (338°C) Light Gas Oil Hydrocarbon + 20 Bar Process Pressure",
    exposureLevel: "19 firefighters and operators in direct line-of-fire beneath leaking pipe",
    actualSeverity: "HIGH",
    actualDescription: "19 responders narrowly escaped fireball; 15,000 residents sought medical care for smoke",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "19 responder fatalities and catastrophic atmospheric column collapse",
    discordanceGap: 93,
    discordanceStatus: "HIGH",
    classification: "SIF PRECURSOR",
    fatalities: 0,
    injuries: 6,
    economicDamage: "$420 Million USD",
    summary:
      "A 52-inch section of 8-inch carbon steel pipe in the crude unit side-cut circuit had degraded to razor-thin thickness (0.04 inches) due to sulfidation corrosion. Operators noticed a small vapor leak and attempted hot-work clamp installation while the line was online. The pipe ruptured completely, engulfing 19 personnel in a massive hydrocarbon fireball.",
    narrative:
      "At 15:50, operators detected a small hydrocarbon leak through insulation on the 4-side-cut crude pipe. Instead of shutting down the unit, Chevron managers opted to remove insulation with hot-work fire hoses to install an online clamp. As technicians poked the insulation, the corroded pipe wall catastrophically breached. A massive dense cloud of light gas oil boiled into the atmosphere. The 19 workers scrambled through the darkness as the cloud ignited into a giant fireball.",
    barrierFailures: [
      {
        name: "Piping Material Specification (Corrosion Resistance)",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Carbon steel with < 0.1% silicon had been installed; suffered rapid high-temperature sulfidation.",
        rootCause: "Chevron metallurgists recommended replacing pipe with 9-Cr alloy 10 years prior; ignored to save cost.",
      },
      {
        name: "Positive Isolation Shutdown Protocol",
        type: "ADMINISTRATIVE",
        status: "FAILED",
        detail: "Unit continued running at full rate with leaking 640°F flammable line; stop-work order was not issued.",
        rootCause: "Production pressure prioritized over process safety shutdown.",
      },
      {
        name: "Ultrasonic Thickness Non-Destructive Testing (NDT)",
        type: "PROCEDURAL",
        status: "FAILED",
        detail: "Corrosion inspection protocol inspected only 2 points on the circuit; missed the thinned 52-inch spool.",
        rootCause: "Inadequate 100% component inspection protocol for circuits susceptible to sulfidation.",
      },
      {
        name: "Personal Line-of-Fire Protection",
        type: "ADMINISTRATIVE",
        status: "FAILED",
        detail: "19 personnel positioned in direct line-of-fire without knowing structural integrity of line.",
        rootCause: "Lack of exclusion zone enforcement during unidentified active flammable leaks.",
      },
    ],
    rootCauses: [
      "Failure to upgrade vulnerable carbon steel piping to corrosion-resistant alloy.",
      "Failure to shutdown the process unit immediately upon identifying an active flammable leak.",
      "Inadequate inspection program failing to identify localized thinning.",
      "Placing emergency responders and operators in direct line-of-fire.",
    ],
    csbFinding:
      "U.S. Chemical Safety Board Report 2012-03-I-CA: Chevron prioritized continued production over process safety by attempting an online repair on a dangerously degraded pipe instead of shutting down.",
    dgmsCircularReference: "DGMS Tech Circular (OMR) 2014/05 — Integrity Assessment of Corrosive Hydrocarbon Lines",
    lessonsLearned: [
      "Strict requirement to replace all carbon steel piping in high-temperature sulfidation service with minimum 9% Chromium.",
      "Mandatory stop-work authority: any active leak on lines > 500°F requires immediate emergency shutdown.",
      "100% volumetric inspection coverage for critical process piping circuits.",
    ],
    regulatoryOrder: "CSB-2012-03-I-CA / CAL-OSHA-2013-091",
    status: "CLOSED_AUDITED",
  },

  // =========================================================================
  // REAL-WORLD DISASTER 6: HPCL Vizag Refinery LPG Blast (1997)
  // =========================================================================
  {
    id: "haz-hpcl-1997",
    incidentNumber: "#OISD-1997-VZ",
    title: "Hindustan Petroleum (HPCL) Vizag Refinery LPG Pipeline Rupture & Sphere Fire",
    facility: "HPCL Visakhapatnam (Vizag) Refinery",
    sector: "LPG Spherical Storage & Transfer Terminal",
    date: "September 14, 1997",
    origin: "NATIONAL_DISASTER",
    energyType: "Pressurized Liquefied Petroleum Gas (LPG) + BLEVE Fireball",
    exposureLevel: "Refinery administrative complex and adjoining residential quarters",
    actualSeverity: "FATAL",
    actualDescription: "60 fatalities, administrative block destroyed, LPG sphere collapsed",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Multi-sphere BLEVE chain reaction and total refinery destruction",
    discordanceGap: 97,
    discordanceStatus: "EXTREME",
    classification: "CRITICAL EVENT",
    fatalities: 60,
    injuries: 110,
    economicDamage: "₹180 Crore INR",
    summary:
      "During transfer of LPG from an offshore jetty tanker to refinery spherical storage, underground transfer pipeline suffered a sudden brittle fracture. LPG escaped under 14 bar pressure, creating a massive dense vapor cloud that entered the administrative complex air conditioning intake and ignited, triggering a catastrophic Boiling Liquid Expanding Vapor Explosion (BLEVE).",
    narrative:
      "At 06:30, offloading of 1,200 MT LPG from marine tanker was underway. The 14-inch underground pipeline had suffered severe external soil corrosion and cyclic fatigue. The pipe split open near the refinery boundary. A dense cloud of propane/butane pooled in low-lying administrative areas. The vapor found an ignition source in a vehicle engine. The resulting blast shattered surrounding buildings and engulfed nearby Sphere #4, culminating in a BLEVE fireball visible 25 km away.",
    barrierFailures: [
      {
        name: "Pipeline Cathodic Protection & Smart Pigging",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Underground pipeline lacked effective impressed current cathodic protection and smart pig audit.",
        rootCause: "Inspection intervals exceeded 12 years without integrity testing.",
      },
      {
        name: "Emergency Isolation Automated ESD Valve",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "No fast-acting actuated shutdown valve at the battery limit between jetty and refinery.",
        rootCause: "Relying on manual gate valves requiring 25 minutes of wheel rotation.",
      },
      {
        name: "Administrative Building Siting Distance",
        type: "ADMINISTRATIVE",
        status: "ABSENT",
        detail: "Administrative building and worker canteen sited < 90m from high-pressure LPG storage spheres.",
        rootCause: "Violation of statutory OISD-118 separation distance requirements.",
      },
    ],
    rootCauses: [
      "Catastrophic failure of underground uninspected LPG transfer pipeline.",
      "Absence of automatic remote shutdown valves on LPG transfer lines.",
      "Unsafe proximity of administrative offices and personnel to hazardous storage areas.",
    ],
    csbFinding:
      "Government of India Inquiry Committee: Failure to maintain pipeline integrity through non-destructive testing and absence of automatic quick-closing isolation valves caused the loss of 60 lives.",
    dgmsCircularReference: "OISD-STD-118 & DGMS Petroleum Directive 1998/02",
    lessonsLearned: [
      "Mandatory 5-year Intelligent Pigging for all cross-country and inter-facility hydrocarbon lines.",
      "Fail-safe quick-closing ESD valves with emergency closure time < 15 seconds.",
      "Strict minimum 300m buffer zones between bulk LPG spheres and occupied administrative buildings.",
    ],
    regulatoryOrder: "MOPNG-OISD-VZ-1997-ENF",
    status: "CLOSED_AUDITED",
  },

  // =========================================================================
  // LIVE FACILITY SCENARIO 7: Pump P-102 High-Pressure Bleed Bypass
  // =========================================================================
  {
    id: "scen-1",
    incidentNumber: "#OI-2026-00421",
    title: "High-Pressure Condensate Pump P-102 Bleed Bypass & Guard Removal",
    facility: "Oil India Limited — Duliajan Central Processing Facility",
    sector: "Zone D: Condensate Pump P-102 Bay",
    date: "Current Shift — 10:42 UTC",
    origin: "LIVE_FACILITY",
    energyType: "3,000 PSI Hydrostatic Pressure + 480V Rotating Shaft",
    exposureLevel: "Technician in Direct Line-of-Fire (< 1.5m)",
    actualSeverity: "LOW",
    actualDescription: "Technician slipped on oil sheen, minor knee scrape, 0 lost work days",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Fatal line-of-fire rupture, high-pressure fluid injection, limb amputation",
    discordanceGap: 94,
    discordanceStatus: "HIGH",
    classification: "SIF PRECURSOR",
    fatalities: 0,
    injuries: 1,
    economicDamage: "₹0 (Prevented)",
    summary:
      "A technician conducting alignment check slipped on an oil sheen. The manual bleed valve had been bypassed leaving 3,000 PSI pressurized liquid in the spool, and the rotating coupling guard had been removed while the worker was within 1.5m.",
    narrative:
      "Technician slipped on oil sheen during alignment check on high-pressure pump P-102. 3,000 PSI line remained pressurized and coupling guard had been unbolted. Worker sustained minor knee scrape; zero lost work days. AI Discordance flagged 94% gap between actual minor scrape and potential fatal projectile line-of-fire.",
    barrierFailures: [
      {
        name: "Hydrostatic Depressurization",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Discharge spool remained energized at 3,000 PSI; manual bleed valve bypassed.",
        rootCause: "Failure to verify zero mechanical energy prior to alignment permit issuance.",
      },
      {
        name: "Coupling Safety Guard Shroud",
        type: "ENGINEERING",
        status: "ABSENT",
        detail: "Heavy gauge protective shroud removed during alignment check with worker in direct perimeter.",
        rootCause: "Contractor failed to replace guard before running diagnostic energization.",
      },
      {
        name: "Physical Positive Isolation (Blind)",
        type: "PROCEDURAL",
        status: "ABSENT",
        detail: "No spectacle blind flange installed; relied solely on single gate valve without tagout.",
        rootCause: "LOTO protocol skipped due to shift time pressure.",
      },
      {
        name: "Remote Automated Bleed Actuator (Recalled)",
        type: "INSTRUMENTATION",
        status: "FAILED",
        detail: "24V loop power tripped 18m prior; remote isolation incapable of depressurizing 3,000 PSI line.",
        rootCause: "Secondary SCADA Modbus Loop RTU-402 tripped due to power supply failure.",
      },
    ],
    rootCauses: [
      "Permit-to-work issued without zero-energy physical verification.",
      "Removal of rotating coupling guard during energized diagnostic check.",
      "Latent 24V loop failure disabling automated remote bleed actuator.",
    ],
    dgmsCircularReference: "DGMS Tech Circular (OMR) 2019/04 — Mechanical Isolation Standards",
    lessonsLearned: [
      "Enforce mandatory physical double-block-and-bleed with lockable blind flange.",
      "Interlock coupling shrouds with motor starter circuits.",
      "Continuous SCADA loop power monitoring for automated safety bleed actuators.",
    ],
    regulatoryOrder: "#OI-ACT-2026-892",
    status: "ACTIVE_LOCKDOWN",
  },

  // =========================================================================
  // LIVE FACILITY SCENARIO 8: Horton Sphere V-204 LPG Gland Leak
  // =========================================================================
  {
    id: "scen-2",
    incidentNumber: "#OI-2026-00388",
    title: "Horton Sphere V-204 Liquefied LPG Gland Packing Leak",
    facility: "Oil India Limited — Duliajan Central Processing Facility",
    sector: "Zone B: High Pressure Horton Spheres",
    date: "Current Shift — 08:15 UTC",
    origin: "LIVE_FACILITY",
    energyType: "25 Bar Liquefied Propane Gas + Vapor Cloud Explosion (VCE) Potential",
    exposureLevel: "Operator inside flammable vapor envelope (< 3m)",
    actualSeverity: "LOW",
    actualDescription: "Operator smelled gas odor, 0 injuries logged",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Vapor cloud flash fire / BLEVE explosion",
    discordanceGap: 91,
    discordanceStatus: "HIGH",
    classification: "SIF PRECURSOR",
    fatalities: 0,
    injuries: 0,
    economicDamage: "₹0 (Prevented)",
    summary:
      "Operator smelled pungent gas odor near Sphere V-204 base leg. Portable detector alarmed at 22% LEL. Sampling manifold packing gland was leaking liquefied propane. Fixed gas detector was unclipped for calibration, and deluge nozzle #3 was clogged by mud wasps.",
    narrative:
      "Operator smelled pungent gas odor near Sphere V-204 base leg during routine round. Portable LEL detector alarmed at 22% LEL. Sampling manifold packing gland was leaking liquefied propane. Operator evacuated area safely without injury. SentinelSIF flagged 91% discordance due to BLEVE thermal hazard.",
    barrierFailures: [
      {
        name: "Primary Valve Gland Packing",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Teflon packing gland degraded under thermal cycling, allowing fugitive LPG leakage.",
        rootCause: "Preventive maintenance gland packing replacement schedule delayed.",
      },
      {
        name: "Fixed Perimeter LEL Gas Detector",
        type: "INSTRUMENTATION",
        status: "ABSENT",
        detail: "Sensor head #GD-204 had been unclipped for recalibration without temporary backup.",
        rootCause: "Calibration procedure lacked temporary sniffing unit coverage.",
      },
      {
        name: "Sphere Automated Water Deluge (Recalled)",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Nozzle #3 obstructed by mud wasp nest; water spray coverage reduced by 40%.",
        rootCause: "Weekly spray test skipped in preventive maintenance order PM-OI-DEL-88.",
      },
    ],
    rootCauses: [
      "Degraded Teflon valve gland packing in high thermal cycle service.",
      "Removal of primary LEL gas detector without deploying temporary portable monitor.",
      "Failure to verify water deluge nozzle readiness against insect/sediment obstruction.",
    ],
    dgmsCircularReference: "OISD-STD-144 & DGMS OMR Circular 2018/02",
    lessonsLearned: [
      "Install bellows-sealed zero-emission isolation valves on all liquefied gas manifolds.",
      "Implement redundancy voting logic on fixed LEL detector networks.",
      "Perform monthly deluge flow discharge tests with visual nozzle inspection.",
    ],
    regulatoryOrder: "#OI-ACT-2026-741",
    status: "ACTIVE_LOCKDOWN",
  },

  // =========================================================================
  // LIVE FACILITY SCENARIO 9: Crude Storage Tank TK-101 Breather Seizure
  // =========================================================================
  {
    id: "scen-3",
    incidentNumber: "#OI-2026-00312",
    title: "Heavy Crude Storage Tank TK-101 Breather Valve Seizure & Overfill Risk",
    facility: "Oil India Limited — Duliajan Central Processing Facility",
    sector: "Zone C: Heavy Crude Tank Farm",
    date: "Current Shift — 06:30 UTC",
    origin: "LIVE_FACILITY",
    energyType: "Hydrocarbon Overfill Hydrostatic Pressure + Explosive Vapor Ingestion",
    exposureLevel: "Tank farm bund perimeter (< 10m)",
    actualSeverity: "LOW",
    actualDescription: "Gasket weeping / 0 personnel injured",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Atmospheric tank roof rupture / catastrophic tank farm boilover",
    discordanceGap: 88,
    discordanceStatus: "HIGH",
    classification: "SIF PRECURSOR",
    fatalities: 0,
    injuries: 0,
    economicDamage: "₹0 (Prevented)",
    summary:
      "During heavy transfer from Well #14, roof breathing PVRV seized closed with waxy crude deposit while radar level transmitter froze. Liquid level rose to 98% capacity with zero operator awareness.",
    narrative:
      "Crude oil transfer from Well #14 was filling Tank TK-101. Pressure vacuum relief valve (PVRV-101) pallet seized shut due to paraffin wax deposit. Digital level transmitter froze at 68% due to electronics failure. Tank filled to 98% before pressure switch alerted control room.",
    barrierFailures: [
      {
        name: "Roof Pressure Vacuum Relief Valve (PVRV-101)",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Pallet seized closed by heavy paraffin wax buildup; incapable of venting overpressure.",
        rootCause: "Steam trace heating on vent pipe had been isolated.",
      },
      {
        name: "Primary Radar Level Transmitter (LT-101)",
        type: "INSTRUMENTATION",
        status: "FAILED",
        detail: "Internal analog-to-digital converter frozen at 68% level output.",
        rootCause: "Signal freeze failure mode without heartbeat diagnostic detection.",
      },
      {
        name: "Emergency Overfill Float Switch #LS-101 (Recalled)",
        type: "INSTRUMENTATION",
        status: "FAILED",
        detail: "Redundant float switch mechanically bound in normal position by asphaltic scale.",
        rootCause: "Acoustic diagnostic telemetry AV-101 detected guide wire mechanical binding.",
      },
    ],
    rootCauses: [
      "Wax buildup seizing atmospheric breathing valves.",
      "Undetected analog signal freeze on digital level transmitter.",
      "Mechanical binding of secondary independent high-high level trip float.",
    ],
    dgmsCircularReference: "API 2350 Overfill Protection & OISD-STD-117",
    lessonsLearned: [
      "Adopt API 2350 4th Edition overfill prevention protocols with triple modular redundancy (TMR).",
      "Mandatory heat tracing on all wax-bearing hydrocarbon vents.",
      "Acoustic and diagnostic monitoring of float guide wires.",
    ],
    regulatoryOrder: "#OI-ACT-2026-619",
    status: "ACTIVE_LOCKDOWN",
  },

  // =========================================================================
  // LIVE FACILITY SCENARIO 10: Distillation Column C-01 Runaway Exotherm
  // =========================================================================
  {
    id: "scen-4",
    incidentNumber: "#OI-2026-00287",
    title: "Distillation Column C-01 Reboiler Thermal Runaway & PLC Safety Bypass",
    facility: "Oil India Limited — Duliajan Central Processing Facility",
    sector: "Zone A: Primary Distillation Columns",
    date: "Current Shift — 04:10 UTC",
    origin: "LIVE_FACILITY",
    energyType: "420°C Thermal Runaway Exotherm + 18 Bar High-Pressure Distillate Vapor",
    exposureLevel: "Distillation unit deck and adjoining piping rack",
    actualSeverity: "LOW",
    actualDescription: "Flange insulation scorched / 0 injuries logged",
    potentialSeverity: "CRITICAL",
    potentialOutcome: "Overpressure column rupture / massive hydrocarbon vapor release",
    discordanceGap: 93,
    discordanceStatus: "HIGH",
    classification: "SIF PRECURSOR",
    fatalities: 0,
    injuries: 0,
    economicDamage: "₹0 (Prevented)",
    summary:
      "Temperature transmitter on Reboiler C-01 spiked to 420°C (limit 340°C). Safety interlock was discovered bypassed with physical jumper clip. Cold quench injection valve experienced severe pneumatic latency (> 45s vs 4s standard).",
    narrative:
      "Reboiler C-01 temperature control loop malfunctioned. The primary safety shutdown trip had been physically bypassed with an unlogged jumper wire by maintenance to prevent nuisance trips during startup. Column temperature spiked into critical exotherm envelope.",
    barrierFailures: [
      {
        name: "Automated Safety PLC Temperature Interlock",
        type: "INSTRUMENTATION",
        status: "BYPASSED",
        detail: "Interlock loop physically jumpered with clip wire; safety logic inhibited in rack B-02.",
        rootCause: "Unapproved management of change (MOC) bypass without CSO sign-off.",
      },
      {
        name: "Emergency Cold Quench Solenoid Valve (Recalled)",
        type: "ENGINEERING",
        status: "FAILED",
        detail: "Pneumatic actuator air supply pressure deficit caused 45s stroke latency (standard 4s).",
        rootCause: "Smart positioner HART log #HART-C01 revealed air supply drop to 2.1 bar.",
      },
      {
        name: "Primary Overpressure Relief Valve (PSV-C01)",
        type: "ENGINEERING",
        status: "FUNCTIONING",
        detail: "Relief valve certified and operable; lifted at 18.2 bar to prevent shell overstress.",
        rootCause: "Maintained within test window.",
      },
    ],
    rootCauses: [
      "Unauthorized physical electrical jumper applied to safety-critical shutdown PLC.",
      "Deficient pneumatic air supply causing emergency quench valve stroke delay.",
      "Absence of electronic bypass management system.",
    ],
    dgmsCircularReference: "DGMS Tech Circular 2020/01 — Control of Safety Interlock Bypasses",
    lessonsLearned: [
      "Implement hard-coded digital bypass tracking requiring dual-key cryptographic authorization.",
      "Independent pneumatic accumulators on all emergency quench valves.",
      "Automated alarm whenever safety interlock is bypassed > 15 minutes.",
    ],
    regulatoryOrder: "#OI-ACT-2026-532",
    status: "ACTIVE_LOCKDOWN",
  },

  // =========================================================================
  // LIVE FACILITY SCENARIO 11: Site Office Slip & Fall (Clean Control Benchmark)
  // =========================================================================
  {
    id: "scen-5",
    incidentNumber: "#OI-2026-00109",
    title: "Administrative Office Corridor Wet Flooring Trip (Clean Control)",
    facility: "Oil India Limited — Duliajan Central Processing Facility",
    sector: "Administrative Zone: HQ Building Ground Floor",
    date: "Current Shift — 02:00 UTC",
    origin: "LIVE_FACILITY",
    energyType: "Zero Hazardous Energy (Kinetic Fall < 1m)",
    exposureLevel: "Office staff in non-process administrative building",
    actualSeverity: "LOW",
    actualDescription: "Employee slipped on damp corridor tile; minor ankle contusion",
    potentialSeverity: "NONE",
    potentialOutcome: "First aid / standard office housekeeping",
    discordanceGap: 0,
    discordanceStatus: "BALANCED",
    classification: "ROUTINE",
    fatalities: 0,
    injuries: 1,
    economicDamage: "₹0",
    summary:
      "Employee slipped on damp floor tile outside office canteen. Initial AI classification: ROUTINE. Deep Recall scan independently verified zero high-pressure lines, zero toxic gases, and zero process energies.",
    narrative:
      "Office staff slipped on freshly mopped floor tile outside reception. Sustained minor ankle contusion treated with ice pack. Event was correctly classified as ROUTINE (0% discordance). SentinelSIF Deep Recall verified zero latent precursors with 100% confidence.",
    barrierFailures: [
      {
        name: "Facility Deep Recall Verification",
        type: "ADMINISTRATIVE",
        status: "FUNCTIONING",
        detail: "No hidden process energies, high pressure, or toxic hazards present.",
        rootCause: "Purely commercial facility slip event.",
      },
    ],
    rootCauses: [
      "Janitorial staff failed to post 'Wet Floor' caution cone after cleaning.",
    ],
    dgmsCircularReference: "General Workplace Safety Guidelines 2018",
    lessonsLearned: [
      "Place prominent warning signage during floor cleaning.",
      "Install anti-skid floor tiles in high-traffic administrative corridors.",
    ],
    regulatoryOrder: "#OI-ACT-2026-109-ROUTINE",
    status: "NOMINAL",
  },
];
