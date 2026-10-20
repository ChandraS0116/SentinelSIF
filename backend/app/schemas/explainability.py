from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field

class SeverityDetail(BaseModel):
    level: str = Field(..., description="Severity classification level: LOW, MEDIUM, HIGH")
    confidence: float = Field(..., description="Estimated model confidence score")

class DiscordanceDetail(BaseModel):
    actual: str = Field(..., description="Actual severity: LOW, MEDIUM, HIGH")
    potential: str = Field(..., description="Potential severity: LOW, MEDIUM, HIGH")
    present: bool = Field(..., description="Whether a significant severity discordance exists")
    status: str = Field(..., description="Discordance status level: HIGH or LOW")
    gap_description: str = Field(..., description="Concise description of the severity delta")
    actual_severity: Optional[str] = Field(default=None, description="Alias for actual severity level")
    potential_severity: Optional[str] = Field(default=None, description="Alias for potential severity level")

    def model_post_init(self, __context: Any) -> None:
        if self.actual_severity is None:
            self.actual_severity = self.actual
        if self.potential_severity is None:
            self.potential_severity = self.potential

# Backward-compatibility alias
DiscordanceSummary = DiscordanceDetail

class KeyRiskFactor(BaseModel):
    factor: str = Field(..., description="Risk dimension: Energy, Exposure, Barrier, Recurrence")
    level: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH")
    value: str = Field(..., description="Specific factor descriptor or detail")

    def __str__(self) -> str:
        return f"{self.level} {self.factor.lower()} ({self.value})"

    def __contains__(self, item: str) -> bool:
        return item in str(self) or item in self.factor or item in self.level or item in self.value

class BarrierFinding(BaseModel):
    barrier: str = Field(..., description="Barrier name or category (e.g. LOTO, Guarding, PPE)")
    status: str = Field(..., description="Status: FUNCTIONING, FAILED, ABSENT, UNKNOWN")
    impact: str = Field(..., description="Operational safety impact of the barrier condition")

class UncertaintyItem(BaseModel):
    field: str = Field(..., description="Feature with missing or ambiguous data (e.g. barrier_status)")
    status: str = Field(..., description="Current status, e.g. UNKNOWN or LOW_CONFIDENCE")
    prompt_for_officer: str = Field(..., description="Actionable question for the safety officer to clarify")

class DecisionBasis(BaseModel):
    engine: str = Field(default="SIFRiskDecisionEngine", description="Decision engine identifier")
    rules_version: str = Field(default="v1.0-deterministic", description="Version of decision rules")
    actual_model: str = Field(..., description="Provenance of actual severity model")
    potential_model: str = Field(..., description="Provenance of potential SIF model")
    calibrated_confidence: float = Field(..., description="Calibrated confidence score")
    evaluated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Evaluation ISO timestamp")

class DecisionTrace(BaseModel):
    actual_severity: str = Field(..., description="Actual severity: LOW, MEDIUM, HIGH")
    potential_severity: str = Field(..., description="Potential severity: LOW, MEDIUM, HIGH")
    energy_risk: str = Field(..., description="Hazard energy risk: LOW, MEDIUM, HIGH")
    exposure_risk: str = Field(..., description="Worker exposure risk: LOW, MEDIUM, HIGH")
    barrier_failure_risk: str = Field(..., description="Barrier failure risk: LOW, MEDIUM, HIGH")
    potential_outcome: str = Field(..., description="Potential consequence outcome: MINOR, SERIOUS, CRITICAL")
    discordance: bool = Field(..., description="Whether discordance was triggered")
    final_classification: str = Field(..., description="Authoritative risk classification from Phase 7")

class ExplainabilityOutput(BaseModel):
    classification: str = Field(..., description="Taxonomy classification: ROUTINE, WATCH, SIF PRECURSOR, SERIOUS EVENT, CRITICAL EVENT")
    actual_severity: SeverityDetail = Field(..., description="Structured actual severity level and confidence")
    potential_severity: SeverityDetail = Field(..., description="Structured potential severity level and confidence")
    discordance: DiscordanceDetail = Field(..., description="Actual vs Potential discordance assessment")
    why_flagged: List[str] = Field(default_factory=list, description="Structured factual reasons for the classification")
    key_risk_factors: List[KeyRiskFactor] = Field(default_factory=list, description="Key high-level risk factors")
    barrier_findings: List[BarrierFinding] = Field(default_factory=list, description="Structured evaluation of critical barriers")
    potential_consequences: List[str] = Field(default_factory=list, description="Realistic potential consequence outcomes")
    uncertainties: List[UncertaintyItem] = Field(default_factory=list, description="Identified unknowns or missing information")
    decision_basis: DecisionBasis = Field(..., description="Provenance and engine metadata")
    decision_trace: DecisionTrace = Field(..., description="Machine-readable decision trace")
    causal_pathway: str = Field(..., description="Hazard -> Energy -> Exposure -> Barrier -> Outcome pathway")
    human_summary: str = Field(..., description="Executive explanation ready for command center display")
    evidence: List[Any] = Field(default_factory=list, description="Audit evidence references (Phase 15 Mock RAG)")

# Backward-compatibility alias
ExplanationReport = ExplainabilityOutput
