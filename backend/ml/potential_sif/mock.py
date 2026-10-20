from typing import Union, Dict, Any
from ml.potential_sif.base import PotentialSIFEngineBase, PotentialSIFOutput
from app.schemas.safety_ontology import SafetySignals, BarrierStatus, ExposureLevel

class MockPotentialSIFEngine(PotentialSIFEngineBase):
    """
    Phase 6: Mock Potential SIF Engine
    Accepts structured safety features (Energy, Exposure, Barrier) and predicts multi-output potential risks.
    Will be replaced with multi-output structured XGBoost in Phase 25.
    """
    def __init__(self):
        self.model_type = "mock"
        self.model_version = "mock-v1"

    def predict(self, safety_signals: Union[SafetySignals, Dict[str, Any]]) -> PotentialSIFOutput:
        if isinstance(safety_signals, dict):
            hazards = safety_signals.get("hazards", [])
            energy_types = safety_signals.get("energy_types", [])
            exposure = str(safety_signals.get("exposure_level", "Unknown"))
            barrier_status = str(safety_signals.get("barrier_status", "UNKNOWN"))
        else:
            hazards = [h.value if hasattr(h, 'value') else str(h) for h in safety_signals.hazards]
            energy_types = [e.value if hasattr(e, 'value') else str(e) for e in safety_signals.energy_types]
            exposure = safety_signals.exposure_level.value if hasattr(safety_signals.exposure_level, 'value') else str(safety_signals.exposure_level)
            barrier_status = safety_signals.barrier_status.value if hasattr(safety_signals.barrier_status, 'value') else str(safety_signals.barrier_status)

        # 1. Energy Risk Assessment
        high_energy_keywords = ["pressure", "electrical", "chemical", "gravitational", "fall", "mechanical", "rotating", "moving equipment"]
        medium_energy_keywords = ["thermal", "kinetic", "stored energy"]

        energy_str = " ".join([e.lower() for e in energy_types] + [h.lower() for h in hazards])
        
        if any(k in energy_str for k in high_energy_keywords):
            energy_risk = "HIGH"
            energy_score = 0.92
        elif any(k in energy_str for k in medium_energy_keywords):
            energy_risk = "MEDIUM"
            energy_score = 0.60
        else:
            energy_risk = "LOW"
            energy_score = 0.15

        # 2. Exposure Risk Assessment
        high_exposure_levels = [
            "direct", "prolonged", "worker in hazard zone", 
            "worker near energized equipment", "worker beneath suspended load", 
            "worker near pressurized equipment"
        ]
        exposure_lower = exposure.lower()
        if any(lvl in exposure_lower for lvl in high_exposure_levels):
            exposure_risk = "HIGH"
            exposure_score = 0.88
        elif "potential" in exposure_lower:
            exposure_risk = "MEDIUM"
            exposure_score = 0.55
        elif "none" in exposure_lower:
            exposure_risk = "LOW"
            exposure_score = 0.05
        else:
            exposure_risk = "MEDIUM" if energy_risk == "HIGH" else "LOW"
            exposure_score = 0.40

        # 3. Barrier Failure Risk Assessment
        barrier_upper = barrier_status.upper()
        if barrier_upper in ["FAILED", "ABSENT"]:
            barrier_failure_risk = "HIGH"
            barrier_score = 0.95
        elif barrier_upper == "UNKNOWN":
            barrier_failure_risk = "MEDIUM"
            barrier_score = 0.50
        elif barrier_upper == "FUNCTIONING":
            barrier_failure_risk = "LOW"
            barrier_score = 0.10
        else:
            barrier_failure_risk = "LOW"
            barrier_score = 0.20

        # 4. SIF Pathway Synthesis
        # Pathway: Hazard -> Energy -> Exposure -> Failed Barrier -> Potential Outcome
        if energy_risk == "HIGH" and exposure_risk == "HIGH" and barrier_failure_risk == "HIGH":
            potential_severity = "HIGH"
            potential_outcome = "CRITICAL"
            confidence = 0.94
        elif energy_risk == "HIGH" and (exposure_risk == "HIGH" or barrier_failure_risk == "HIGH"):
            potential_severity = "HIGH"
            potential_outcome = "CRITICAL" if exposure_risk == "HIGH" else "SERIOUS"
            confidence = 0.89
        elif energy_risk in ["HIGH", "MEDIUM"] and exposure_risk in ["HIGH", "MEDIUM"] and barrier_failure_risk in ["HIGH", "MEDIUM"]:
            potential_severity = "MEDIUM"
            potential_outcome = "SERIOUS"
            confidence = 0.82
        elif energy_risk == "LOW" and exposure_risk == "LOW":
            potential_severity = "LOW"
            potential_outcome = "MINOR"
            confidence = 0.91
        else:
            potential_severity = "LOW"
            potential_outcome = "MINOR"
            confidence = 0.80

        probabilities = {
            "energy_risk_prob": energy_score,
            "exposure_risk_prob": exposure_score,
            "barrier_failure_prob": barrier_score,
            "potential_sif_prob": 0.91 if potential_severity == "HIGH" else (0.55 if potential_severity == "MEDIUM" else 0.12)
        }

        return PotentialSIFOutput(
            energy_risk=energy_risk,
            exposure_risk=exposure_risk,
            barrier_failure_risk=barrier_failure_risk,
            potential_outcome=potential_outcome,
            potential_severity=potential_severity,
            probabilities=probabilities,
            confidence=confidence,
            model_type=self.model_type,
            model_version=self.model_version
        )
