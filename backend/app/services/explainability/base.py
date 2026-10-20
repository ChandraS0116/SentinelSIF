from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.schemas.safety_ontology import SafetySignals
from app.schemas.risk_decision import RiskDecisionOutput
from app.schemas.explainability import ExplainabilityOutput
from ml.actual_severity.base import ActualSeverityOutput
from ml.potential_sif.base import PotentialSIFOutput

class ExplainabilityEngineBase(ABC):
    """
    Abstract interface for Explainability Services (Phase 8).
    Decouples deterministic rule-based explainability from any future LLM or multi-agent enhancements.
    Consumes authoritative outputs from Phase 7 (SIFRiskDecisionEngine) and generates
    structured, transparent, and auditable explanations.
    """

    @abstractmethod
    def generate_explanation(
        self,
        risk_decision: RiskDecisionOutput,
        safety_signals: SafetySignals,
        actual_severity: ActualSeverityOutput,
        potential_sif: PotentialSIFOutput,
        incident: Optional[Any] = None,
        recurrence_context: Optional[Dict[str, Any]] = None
    ) -> ExplainabilityOutput:
        """
        Consumes structured risk pipeline outputs and returns an ExplainabilityOutput.
        """
        pass

    def generate(
        self,
        decision: RiskDecisionOutput,
        signals: SafetySignals,
        actual: ActualSeverityOutput,
        potential: PotentialSIFOutput,
        incident: Optional[Any] = None,
        recurrence_context: Optional[Dict[str, Any]] = None
    ) -> ExplainabilityOutput:
        """
        Backwards-compatible convenience alias.
        """
        return self.generate_explanation(
            risk_decision=decision,
            safety_signals=signals,
            actual_severity=actual,
            potential_sif=potential,
            incident=incident,
            recurrence_context=recurrence_context
        )
