import re
from typing import Optional
from app.schemas.safety_ontology import (
    SafetySignals, HazardType, EnergyType, ExposureLevel, 
    BarrierType, BarrierStatus
)

class SafetySignalExtractor:
    """
    Phase 3: Hybrid extraction component.
    Converts incident descriptions & metadata into structured SafetySignals.
    Combines domain ontology and rule-based semantic patterns.
    """

    def extract(self, text: str, activity: Optional[str] = None, equipment: Optional[str] = None) -> SafetySignals:
        t = (text + " " + (activity or "") + " " + (equipment or "")).lower()
        
        hazards = []
        energies = []
        barrier_types = []
        barrier_status = BarrierStatus.UNKNOWN
        exposure_level = ExposureLevel.UNKNOWN
        potential_contact = None
        potential_outcome = None

        # 1. Hazard & Energy detection
        if any(w in t for w in ["pressure", "psi", "flange leak", "pipeline", "pressurized", "valve"]):
            hazards.append(HazardType.PRESSURE)
            energies.append(EnergyType.PRESSURE)

        if any(w in t for w in ["electric", "energized", "voltage", "cable", "short circuit", "wiring", "breaker"]):
            hazards.append(HazardType.ELECTRICAL)
            energies.append(EnergyType.ELECTRICAL)

        if any(w in t for w in ["rotating", "coupling", "pump", "gear", "belt", "nip point", "crush", "pinch"]):
            hazards.append(HazardType.MECHANICAL)
            hazards.append(HazardType.MOVING_EQUIPMENT)
            energies.append(EnergyType.MECHANICAL)
            energies.append(EnergyType.KINETIC)

        if any(w in t for w in ["fell", "falling", "dropped", "scaffold", "height", "tier"]):
            hazards.append(HazardType.FALL)
            energies.append(EnergyType.GRAVITATIONAL)

        if any(w in t for w in ["forklift", "truck", "vehicle", "reversed", "backing", "mobile equipment"]):
            hazards.append(HazardType.VEHICLE)
            energies.append(EnergyType.KINETIC)

        if any(w in t for w in ["chemical", "acid", "toxic", "h2s", "gas leak", "vapor"]):
            hazards.append(HazardType.CHEMICAL)
            energies.append(EnergyType.CHEMICAL)

        if any(w in t for w in ["fire", "flame", "spark", "hot work", "welding"]):
            hazards.append(HazardType.FIRE)
            energies.append(EnergyType.THERMAL)

        # 2. Barrier identification & Barrier status
        if any(w in t for w in ["loto", "isolation", "isolated", "depressuriz"]):
            barrier_types.append(BarrierType.LOTO)
            barrier_types.append(BarrierType.ISOLATION)
            if any(w in t for w in ["failed", "not fully isolated", "not isolated", "not safely depressurized", "missing", "without isolation"]):
                barrier_status = BarrierStatus.FAILED
            elif any(w in t for w in ["isolated", "verified loto", "depressurized"]):
                barrier_status = BarrierStatus.FUNCTIONING

        if any(w in t for w in ["guard", "coupling guard", "cover", "interlock"]):
            barrier_types.append(BarrierType.GUARDING)
            if any(w in t for w in ["removed", "missing", "absent", "failed", "bypassed"]):
                barrier_status = BarrierStatus.ABSENT if "absent" in t or "removed" in t or "missing" in t else BarrierStatus.FAILED
            elif "in place" in t:
                barrier_status = BarrierStatus.FUNCTIONING

        if any(w in t for w in ["exclusion zone", "barrier", "barricade"]):
            barrier_types.append(BarrierType.EXCLUSION_ZONE)
            if any(w in t for w in ["missing", "absent", "not established", "no exclusion"]):
                barrier_status = BarrierStatus.ABSENT
            elif "established" in t:
                barrier_status = BarrierStatus.FUNCTIONING

        if any(w in t for w in ["alarm", "reverse alarm", "sensor"]):
            barrier_types.append(BarrierType.ALARM)
            if any(w in t for w in ["malfunctioning", "failed", "disabled", "inaudible"]):
                barrier_status = BarrierStatus.FAILED

        if any(w in t for w in ["ppe", "glasses", "gloves", "helmet", "hard hat"]):
            barrier_types.append(BarrierType.PPE)
            if "wore ppe" in t or "wearing ppe" in t:
                if barrier_status == BarrierStatus.UNKNOWN:
                    barrier_status = BarrierStatus.FUNCTIONING

        # 3. Exposure Level
        if any(w in t for w in ["technician entered", "passing operator", "jump out of the way", "operator entered", "worker entered", "worker nearby", "direct proximity"]):
            exposure_level = ExposureLevel.DIRECT
            potential_contact = "Direct line of fire / high energy proximity"
        elif any(w in t for w in ["near", "beside", "vicinity", "approached"]):
            exposure_level = ExposureLevel.POTENTIAL
            potential_contact = "Proximity to energized zone"
        elif any(w in t for w in ["mat", "hallway", "office", "door", "stumbled", "tripped over an uneven"]):
            exposure_level = ExposureLevel.NONE
            potential_contact = "Low energy surface contact"

        # Specific worker context checks
        if "suspended" in t or "scaffold" in t:
            exposure_level = ExposureLevel.WORKER_BENEATH_SUSPENDED_LOAD
        elif "pressur" in t and exposure_level in [ExposureLevel.DIRECT, ExposureLevel.POTENTIAL]:
            exposure_level = ExposureLevel.WORKER_NEAR_PRESSURIZED

        # Deduplicate
        hazards = list(dict.fromkeys(hazards))
        energies = list(dict.fromkeys(energies))
        barrier_types = list(dict.fromkeys(barrier_types))

        return SafetySignals(
            hazards=hazards,
            energy_types=energies,
            exposure_level=exposure_level,
            barrier_types=barrier_types,
            barrier_status=barrier_status,
            potential_contact=potential_contact,
            potential_outcome=potential_outcome,
            confidence=0.92 if hazards or energies else 0.70
        )
