from typing import Optional
from ml.actual_severity.base import ActualSeverityModelBase, ActualSeverityOutput

class MockActualSeverityModel(ActualSeverityModelBase):
    """
    Phase 5: Mock Actual Severity Model
    Returns structured probabilities for actual severity based on incident narratives.
    Will be replaced with DistilBERTActualSeverityModel in Phase 25 without breaking the contract.
    """
    def __init__(self):
        self.model_type = "mock"
        self.model_version = "mock-v1"

    def predict(self, text: str, metadata: Optional[dict] = None) -> ActualSeverityOutput:
        t = text.lower()

        # Check for explicit serious/critical consequences
        if any(w in t for w in ["fatal", "fatality", "amputation", "severe injury", "serious injury", "serious", "life-threatening", "loss of consciousness"]):
            prediction = "HIGH"
            probs = {"LOW": 0.01, "MEDIUM": 0.09, "HIGH": 0.90}
            conf = 0.90
        # Check for moderate medical treatment / lost time
        elif any(w in t for w in ["hospital", "medical treatment", "fracture", "stitches", "lost time", "lti", "deep cut"]):
            prediction = "MEDIUM"
            probs = {"LOW": 0.15, "MEDIUM": 0.75, "HIGH": 0.10}
            conf = 0.75
        # Routine / minor / near-miss / first aid / no injury
        elif any(w in t for w in ["first aid", "minor scrape", "pinched finger", "no injury", "no treatment", "spill cleaned", "mat", "tripped over"]):
            prediction = "LOW"
            probs = {"LOW": 0.88, "MEDIUM": 0.09, "HIGH": 0.03}
            conf = 0.88
        else:
            # Default to LOW for near misses where no harm is explicitly mentioned
            prediction = "LOW"
            probs = {"LOW": 0.91, "MEDIUM": 0.07, "HIGH": 0.02}
            conf = 0.91

        return ActualSeverityOutput(
            prediction=prediction,
            probabilities=probs,
            confidence=conf,
            model_type=self.model_type,
            model_version=self.model_version
        )
