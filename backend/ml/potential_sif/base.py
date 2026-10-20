from abc import ABC, abstractmethod
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field

class PotentialSIFOutput(BaseModel):
    energy_risk: str = Field(..., description="Energy severity level: LOW, MEDIUM, or HIGH")
    exposure_risk: str = Field(..., description="Exposure severity level: LOW, MEDIUM, or HIGH")
    barrier_failure_risk: str = Field(..., description="Barrier failure risk: LOW, MEDIUM, or HIGH")
    potential_outcome: str = Field(..., description="Predicted potential outcome: MINOR, SERIOUS, or CRITICAL")
    potential_severity: str = Field(..., description="Normalized potential severity: LOW, MEDIUM, or HIGH")
    probabilities: Optional[Dict[str, float]] = Field(default=None, description="Multi-output probability distribution")
    confidence: float = Field(..., description="Calibrated confidence score")
    model_type: str = Field(..., description="e.g. mock, xgboost_multioutput")
    model_version: str = Field(..., description="Model version string")

class PotentialSIFEngineBase(ABC):
    """
    Abstract interface for Potential SIF Engines.
    Allows MockPotentialSIFEngine to be hot-swapped for structured XGBoost in Phase 25.
    """
    @abstractmethod
    def predict(self, safety_signals: Any) -> PotentialSIFOutput:
        """
        Consumes structured safety signals (from Phase 3 ontology) and returns multi-output PotentialSIFOutput.
        """
        pass
