from abc import ABC, abstractmethod
from typing import Dict, Optional
from pydantic import BaseModel, Field

class ActualSeverityOutput(BaseModel):
    prediction: str = Field(..., description="Actual severity classification: LOW, MEDIUM, or HIGH")
    probabilities: Dict[str, float] = Field(..., description="Probability distribution across severity classes")
    confidence: float = Field(..., description="Estimated model confidence")
    model_type: str = Field(..., description="e.g. mock, distilbert")
    model_version: str = Field(..., description="Model version string")

class ActualSeverityModelBase(ABC):
    """
    Abstract interface for Actual Severity Models.
    Allows MockActualSeverityModel to be hot-swapped for DistilBERTActualSeverityModel in Phase 25.
    """
    @abstractmethod
    def predict(self, text: str, metadata: Optional[dict] = None) -> ActualSeverityOutput:
        """
        Takes raw incident text and optional metadata, returns structured ActualSeverityOutput.
        """
        pass
