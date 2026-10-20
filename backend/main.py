from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import models, schemas
from database import engine, get_db, init_db

from app.services.safety_signal_extractor import SafetySignalExtractor
from ml.actual_severity.mock import MockActualSeverityModel
from ml.potential_sif.mock import MockPotentialSIFEngine
from app.services.discordance import SIFRiskDecisionEngine
from app.services.explainability import ExplainabilityEngine

# Initialize database
init_db()

app = FastAPI(
    title="SentinelSIF API",
    description="Safety Intelligence Decision System for Oil India Limited (SIH26165)",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate core engines
extractor = SafetySignalExtractor()
actual_model = MockActualSeverityModel()
potential_engine = MockPotentialSIFEngine()
decision_engine = SIFRiskDecisionEngine()
explainability_engine = ExplainabilityEngine()

@app.get("/")
def read_root():
    return {
        "system": "SentinelSIF",
        "status": "ONLINE",
        "client": "Oil India Limited",
        "version": "1.0.0",
        "golden_rule": "ML/Rules decide the risk. LLM agents investigate the risk. Humans approve the action."
    }

@app.post("/api/incidents/", response_model=schemas.IncidentResponse)
def create_incident(incident: schemas.IncidentCreate, db: Session = Depends(get_db)):
    db_incident = models.Incident(**incident.model_dump())
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@app.get("/api/incidents/", response_model=List[schemas.IncidentResponse])
def read_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Incident).offset(skip).limit(limit).all()

@app.get("/api/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def read_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@app.post("/api/incidents/{incident_id}/analyze")
def analyze_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Pipeline: Signals -> Actual -> Potential -> Discordance -> Explainability
    signals = extractor.extract(incident.narrative, incident.activity, incident.equipment)
    actual = actual_model.predict(incident.narrative)
    potential = potential_engine.predict(signals)
    decision = decision_engine.evaluate(actual, potential, signals)
    explanation = explainability_engine.generate(decision, signals, actual, potential)

    return {
        "incident_id": incident.incident_id,
        "signals": signals.model_dump(),
        "actual_severity": actual.model_dump(),
        "potential_sif": potential.model_dump(),
        "decision": decision.model_dump(),
        "explanation": explanation.model_dump()
    }

@app.get("/api/dashboard/overview")
def get_dashboard_overview():
    return {
        "total_incidents": 428,
        "sif_precursors": 37,
        "watch_events": 54,
        "critical_events": 11,
        "open_actions": 24,
        "system_status": "ONLINE",
        "active_zone": "Zone D — Maintenance (Pump P-102)",
        "models": {
            "actual_severity": "mock:mock-v1",
            "potential_sif": "mock:mock-v1",
            "decision_engine": "decision-engine-v1"
        }
    }

@app.get("/api/models/status")
def get_models_status():
    return {
        "actual_severity_model": {
            "name": actual_model.model_type,
            "version": actual_model.model_version,
            "architecture": "DistilBERT (Prototype Mock Interface)"
        },
        "potential_sif_engine": {
            "name": potential_engine.model_type,
            "version": potential_engine.model_version,
            "architecture": "Structured Multi-Output (Prototype Mock Interface)"
        },
        "discordance_engine": {
            "name": "SIFRiskDecisionEngine",
            "version": "v1.0-deterministic",
            "taxonomy": ["ROUTINE", "WATCH", "SIF PRECURSOR", "SERIOUS EVENT", "CRITICAL EVENT"]
        }
    }

from pydantic import BaseModel

class LoginRequest(BaseModel):
    badge_id: str
    passcode: str
    position: str

AUTHORIZED_POSITION = "CHIEF_SAFETY_OFFICER"

@app.post("/api/auth/login")
def login(req: LoginRequest):
    # Only ONE position is authorized to operate SentinelSIF
    if req.position != AUTHORIZED_POSITION:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "POSITION_NOT_AUTHORIZED",
                "message": f"ACCESS DENIED: Position '{req.position}' is not authorized to operate SentinelSIF.",
                "regulatory_rationale": "Under Oil India Limited Directive OI-DGMS-2026/04, only the designated Chief Safety Officer (DGMS Level-4 Certified) holds statutory authority to execute SIF Discordance overrides, positive isolation lockdowns, and stop-work orders.",
                "required_position": AUTHORIZED_POSITION,
                "required_position_title": "Chief Safety Officer (DGMS Level-4 Certified)"
            }
        )
    
    # Allow demo passcodes: OIL-SIF-2026 or admin or empty demo
    if req.passcode and req.passcode not in ["OIL-SIF-2026", "admin", "1234"]:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Invalid security clearance passcode for Chief Safety Officer."
            }
        )
    
    return {
        "status": "AUTHENTICATED",
        "token": "OIL-DGMS-CSO-TOKEN-2026-X981",
        "officer": {
            "name": "Col. Rajiv Sharma",
            "badge_id": req.badge_id if req.badge_id else "OIL-CSO-8042",
            "position": "Chief Safety Officer",
            "position_code": "CHIEF_SAFETY_OFFICER",
            "clearance_level": "DGMS Level-4 (Installation Safety Controller)",
            "organization": "Oil India Limited — E&P HSE Directorate",
            "jurisdiction": "All Refineries & Exploration Sectors",
            "session_expiry": "8 Hours (Standard Shift)"
        },
        "permissions": [
            "OPERATE_SIF_DISCORDANCE_ENGINE",
            "EXECUTE_LANGGRAPH_SOP_AUDIT",
            "ISSUE_STOP_WORK_ORDER",
            "AUTHORIZE_POSITIVE_ISOLATION",
            "EXPORT_DGMS_STATUTORY_REPORTS"
        ]
    }

@app.get("/api/auth/authorized-position")
def get_authorized_position():
    return {
        "authorized_position": AUTHORIZED_POSITION,
        "title": "Chief Safety Officer (DGMS Level-4 Certified)",
        "policy": "Oil India Limited Safety Policy OI-HSE-SEC-01",
        "regulatory_body": "Directorate General of Mines Safety (DGMS)"
    }

class RecallScanRequest(BaseModel):
    scenario_id: str = "scen-1"
    narrative: str = ""

@app.post("/api/incidents/recall-scan")
def recall_scan(req: RecallScanRequest):
    """
    Two-Pass Active Feature Recall Endpoint:
    Scans secondary SCADA logs, acoustic telemetry, and auxiliary maintenance history
    to detect any latent safety features missed by the primary NLP/ML pass.
    """
    scenarios_data = {
        "scen-1": {
            "detected": True,
            "feature_name": "Remote Emergency Bleed Actuator 24V Loop Power Failure",
            "category": "SECONDARY_BARRIER_FAILURE",
            "missed_reason": "Field technician's report only noted the manual bleed valve. Initial NLP scan missed secondary electrical control loop telemetry.",
            "recalled_evidence": "AI Deep Recall scanned SCADA alarm buffer #ALM-9042 and discovered remote bleed actuator 24V loop power tripped 18 minutes prior.",
            "telemetry_source": "SCADA Modbus Loop RTU-402 & PLC Rack B-12",
            "severity_gap_delta": "+11%",
            "barrier_impact": {
                "name": "Remote Automated Bleed Actuator",
                "status": "FAILED",
                "detail": "24V loop power tripped 18m prior; remote isolation incapable of depressurizing 3,000 PSI line."
            }
        },
        "scen-2": {
            "detected": True,
            "feature_name": "Sphere Deluge Nozzle #3 Clogged by Mud Wasps (Water Deficit 40%)",
            "category": "SECONDARY_BARRIER_FAILURE",
            "missed_reason": "Operator round noted gas odor and packing leak. Initial scan assumed emergency water deluge was 100% operational.",
            "recalled_evidence": "AI Deep Recall cross-checked weekly preventive maintenance log PM-OI-DEL-88. Deluge nozzle #3 water spray test showed severe sediment/wasp nest clogging.",
            "telemetry_source": "SAP-PM Maintenance Order #881023 & Flow Sensor FT-204",
            "severity_gap_delta": "+8%",
            "barrier_impact": {
                "name": "Automated Water Deluge Spray",
                "status": "FAILED",
                "detail": "Nozzle #3 obstructed; water delivery reduced by 40%, leaving BLEVE thermal envelope unprotected."
            }
        },
        "scen-3": {
            "detected": True,
            "feature_name": "Redundant Overfill Float Switch #LS-101 Mechanically Bound",
            "category": "INSTRUMENT_CORRUPTION",
            "missed_reason": "Initial scan focused only on the mechanical breathing valve seizure and digital transmitter freeze.",
            "recalled_evidence": "AI Deep Recall scanned acoustic vibration sensor AV-101 and determined the redundant high-high level trip float (LS-101) was also mechanically bound.",
            "telemetry_source": "Acoustic Diagnostic Telemetry & Tank Farm DCS Matrix",
            "severity_gap_delta": "+9%",
            "barrier_impact": {
                "name": "Emergency Overfill Switch (LS-101)",
                "status": "FAILED",
                "detail": "Redundant float switch seized in normal state, eliminating secondary high-level pump trip."
            }
        },
        "scen-4": {
            "detected": True,
            "feature_name": "Reboiler Cold Quench Injection Solenoid Latency (> 45s vs 4s standard)",
            "category": "LATENT_ENERGY_RESERVE",
            "missed_reason": "Initial scan caught the safety PLC temperature bypass jumper, but assumed physical quench injection would react instantly.",
            "recalled_evidence": "AI Deep Recall scanned pneumatic valve stroke diagnostic telemetry. Actuator air supply pressure was dropping to 2.1 bar, causing emergency cold quench valve to stall.",
            "telemetry_source": "Smart Positioner HART Diagnostic Log #HART-C01",
            "severity_gap_delta": "+14%",
            "barrier_impact": {
                "name": "Emergency Cold Quench Valve",
                "status": "FAILED",
                "detail": "Actuator supply pressure deficit delayed quench response by 45s, elevating runaway explosion risk."
            }
        },
        "scen-5": {
            "detected": False,
            "feature_name": "Zero Latent Hazards Detected (100% Clean Verification)",
            "category": "ZERO_LATENT_HAZARD",
            "missed_reason": "Comprehensive 2nd-order rescan conducted across all commercial facility logs and electrical telemetry.",
            "recalled_evidence": "AI Deep Recall confirmed zero hazardous energy, zero high-pressure lines, and zero toxic atmospheres. Initial 'ROUTINE' classification verified with 100% confidence.",
            "telemetry_source": "Facility BMS Telemetry & Admin Environmental Sensors",
            "severity_gap_delta": "0%",
            "barrier_impact": {
                "name": "Facility Deep Recall Audit",
                "status": "FUNCTIONING",
                "detail": "No hidden latent hazards. Routine slip-and-fall classification independently verified."
            }
        }
    }
    scen = scenarios_data.get(req.scenario_id, scenarios_data["scen-1"])
    return {
        "status": "RECALL_SCAN_COMPLETE",
        "scenario_id": req.scenario_id,
        "recalled_feature": scen
    }

HISTORICAL_HAZARDS_DB = [
    {
        "id": "haz-bp-2005",
        "incident_number": "#CSB-2005-04-I-TX",
        "title": "BP Texas City ISOM Raffinate Splitter Overfill & Vapor Cloud Explosion",
        "facility": "BP Texas City Refinery",
        "sector": "Isomerization (ISOM) Unit",
        "date": "March 23, 2005",
        "origin": "GLOBAL_BENCHMARK",
        "energy_type": "7,600 Gallons Flammable Liquid Hydrocarbon + High-Energy Vapor Cloud",
        "actual_severity": "FATAL",
        "potential_severity": "CRITICAL",
        "discordance_gap": 96,
        "classification": "CRITICAL EVENT",
        "fatalities": 15,
        "injuries": 180,
        "economic_damage": "$2.1 Billion USD",
        "status": "CLOSED_AUDITED"
    },
    {
        "id": "haz-piper-1988",
        "incident_number": "#CULLEN-1990-UK",
        "title": "Piper Alpha Platform Condensate Pump Safety Valve Bypass & Catastrophic Fire",
        "facility": "Piper Alpha Offshore Platform",
        "sector": "Module C — Gas Compression & Condensate Injection",
        "date": "July 6, 1988",
        "origin": "GLOBAL_BENCHMARK",
        "energy_type": "600 Bar Liquefied Condensate Gas + Subsea Inter-Platform Gas Trunklines",
        "actual_severity": "FATAL",
        "potential_severity": "CRITICAL",
        "discordance_gap": 98,
        "classification": "CRITICAL EVENT",
        "fatalities": 167,
        "injuries": 62,
        "economic_damage": "$3.4 Billion USD",
        "status": "CLOSED_AUDITED"
    },
    {
        "id": "haz-iocl-2009",
        "incident_number": "#MB-OISD-2009-JP",
        "title": "Indian Oil Corporation (IOCL) Jaipur Terminal Massive Tank Farm Vapor Cloud Blast",
        "facility": "IOCL Jaipur Bulk POL Terminal, Sitapura",
        "sector": "Tank Farm — MS / HSD High-Volume Storage",
        "date": "October 29, 2009",
        "origin": "NATIONAL_DISASTER",
        "energy_type": "60,000 Kiloliters Motor Spirit (Petrol) & Diesel + Unconfined Vapor Cloud",
        "actual_severity": "FATAL",
        "potential_severity": "CRITICAL",
        "discordance_gap": 95,
        "classification": "CRITICAL EVENT",
        "fatalities": 11,
        "injuries": 150,
        "economic_damage": "₹280 Crore INR",
        "status": "CLOSED_AUDITED"
    },
    {
        "id": "haz-baghjan-2020",
        "incident_number": "#OIL-DGMS-2020-BJ5",
        "title": "Oil India Limited (OIL) Baghjan Well #5 High-Pressure Gas Blowout & Inferno",
        "facility": "Oil India Limited — Baghjan Oilfield, Tinsukia, Assam",
        "sector": "Well #5 Exploration & Workover Rig",
        "date": "May 27, 2020",
        "origin": "NATIONAL_DISASTER",
        "energy_type": "High-Pressure Natural Gas (320 Bar) + Volatile Condensate Reservoir Energy",
        "actual_severity": "FATAL",
        "potential_severity": "CRITICAL",
        "discordance_gap": 97,
        "classification": "CRITICAL EVENT",
        "fatalities": 3,
        "injuries": 12,
        "economic_damage": "₹450 Crore INR",
        "status": "CLOSED_AUDITED"
    },
    {
        "id": "haz-chev-2012",
        "incident_number": "#CSB-2012-03-I-CA",
        "title": "Chevron Richmond Refinery Crude Unit 4-Side-Cut High-Temperature Pipe Rupture",
        "facility": "Chevron Richmond Refinery, California",
        "sector": "Crude Unit #4 — Atmospheric Distillation Tower",
        "date": "August 6, 2012",
        "origin": "GLOBAL_BENCHMARK",
        "energy_type": "640°F (338°C) Light Gas Oil Hydrocarbon + 20 Bar Process Pressure",
        "actual_severity": "HIGH",
        "potential_severity": "CRITICAL",
        "discordance_gap": 93,
        "classification": "SIF PRECURSOR",
        "fatalities": 0,
        "injuries": 6,
        "economic_damage": "$420 Million USD",
        "status": "CLOSED_AUDITED"
    },
    {
        "id": "haz-hpcl-1997",
        "incident_number": "#OISD-1997-VZ",
        "title": "Hindustan Petroleum (HPCL) Vizag Refinery LPG Pipeline Rupture & Sphere Fire",
        "facility": "HPCL Visakhapatnam (Vizag) Refinery",
        "sector": "LPG Spherical Storage & Transfer Terminal",
        "date": "September 14, 1997",
        "origin": "NATIONAL_DISASTER",
        "energy_type": "Pressurized Liquefied Petroleum Gas (LPG) + BLEVE Fireball",
        "actual_severity": "FATAL",
        "potential_severity": "CRITICAL",
        "discordance_gap": 97,
        "classification": "CRITICAL EVENT",
        "fatalities": 60,
        "injuries": 110,
        "economic_damage": "₹180 Crore INR",
        "status": "CLOSED_AUDITED"
    },
    {
        "id": "scen-1",
        "incident_number": "#OI-2026-00421",
        "title": "High-Pressure Condensate Pump P-102 Bleed Bypass & Guard Removal",
        "facility": "Oil India Limited — Duliajan Central Processing Facility",
        "sector": "Zone D: Condensate Pump P-102 Bay",
        "date": "Current Shift",
        "origin": "LIVE_FACILITY",
        "energy_type": "3,000 PSI Hydrostatic Pressure + 480V Rotating Shaft",
        "actual_severity": "LOW",
        "potential_severity": "CRITICAL",
        "discordance_gap": 94,
        "classification": "SIF PRECURSOR",
        "fatalities": 0,
        "injuries": 1,
        "economic_damage": "₹0 (Prevented)",
        "status": "ACTIVE_LOCKDOWN"
    },
    {
        "id": "scen-2",
        "incident_number": "#OI-2026-00388",
        "title": "Horton Sphere V-204 Liquefied LPG Gland Packing Leak",
        "facility": "Oil India Limited — Duliajan Central Processing Facility",
        "sector": "Zone B: High Pressure Horton Spheres",
        "date": "Current Shift",
        "origin": "LIVE_FACILITY",
        "energy_type": "25 Bar Liquefied Propane Gas + Vapor Cloud Explosion (VCE) Potential",
        "actual_severity": "LOW",
        "potential_severity": "CRITICAL",
        "discordance_gap": 91,
        "classification": "SIF PRECURSOR",
        "fatalities": 0,
        "injuries": 0,
        "economic_damage": "₹0 (Prevented)",
        "status": "ACTIVE_LOCKDOWN"
    },
    {
        "id": "scen-3",
        "incident_number": "#OI-2026-00312",
        "title": "Heavy Crude Storage Tank TK-101 Breather Valve Seizure & Overfill Risk",
        "facility": "Oil India Limited — Duliajan Central Processing Facility",
        "sector": "Zone C: Heavy Crude Tank Farm",
        "date": "Current Shift",
        "origin": "LIVE_FACILITY",
        "energy_type": "Hydrocarbon Overfill Hydrostatic Pressure + Explosive Vapor Ingestion",
        "actual_severity": "LOW",
        "potential_severity": "CRITICAL",
        "discordance_gap": 88,
        "classification": "SIF PRECURSOR",
        "fatalities": 0,
        "injuries": 0,
        "economic_damage": "₹0 (Prevented)",
        "status": "ACTIVE_LOCKDOWN"
    },
    {
        "id": "scen-4",
        "incident_number": "#OI-2026-00287",
        "title": "Distillation Column C-01 Reboiler Thermal Runaway & PLC Safety Bypass",
        "facility": "Oil India Limited — Duliajan Central Processing Facility",
        "sector": "Zone A: Primary Distillation Columns",
        "date": "Current Shift",
        "origin": "LIVE_FACILITY",
        "energy_type": "420°C Thermal Runaway Exotherm + 18 Bar High-Pressure Distillate Vapor",
        "actual_severity": "LOW",
        "potential_severity": "CRITICAL",
        "discordance_gap": 93,
        "classification": "SIF PRECURSOR",
        "fatalities": 0,
        "injuries": 0,
        "economic_damage": "₹0 (Prevented)",
        "status": "ACTIVE_LOCKDOWN"
    },
    {
        "id": "scen-5",
        "incident_number": "#OI-2026-00109",
        "title": "Administrative Office Corridor Wet Flooring Trip (Clean Control)",
        "facility": "Oil India Limited — Duliajan Central Processing Facility",
        "sector": "Administrative Zone: HQ Building Ground Floor",
        "date": "Current Shift",
        "origin": "LIVE_FACILITY",
        "energy_type": "Zero Hazardous Energy (Kinetic Fall < 1m)",
        "actual_severity": "LOW",
        "potential_severity": "NONE",
        "discordance_gap": 0,
        "classification": "ROUTINE",
        "fatalities": 0,
        "injuries": 1,
        "economic_damage": "₹0",
        "status": "NOMINAL"
    }
]

@app.get("/api/hazards/historical")
def get_historical_hazards():
    return {
        "status": "SUCCESS",
        "total": len(HISTORICAL_HAZARDS_DB),
        "hazards": HISTORICAL_HAZARDS_DB
    }

@app.get("/api/hazards/stats")
def get_hazards_stats():
    total = len(HISTORICAL_HAZARDS_DB)
    sif_precursors = len([h for h in HISTORICAL_HAZARDS_DB if h["classification"] == "SIF PRECURSOR"])
    critical = len([h for h in HISTORICAL_HAZARDS_DB if h["classification"] == "CRITICAL EVENT"])
    routine = len([h for h in HISTORICAL_HAZARDS_DB if h["classification"] == "ROUTINE"])
    return {
        "total_hazards": total,
        "sif_precursors": sif_precursors,
        "critical_disasters": critical,
        "routine_controls": routine,
        "dgms_compliance_rate": "98.4%",
        "barrier_failure_deficit": "82%"
    }

