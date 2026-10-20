from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from app.schemas.safety_ontology import RiskTaxonomy

class RiskDecisionOutput(BaseModel):
    classification: RiskTaxonomy = Field(..., description="Final risk classification: ROUTINE, WATCH, SIF PRECURSOR, SERIOUS EVENT, CRITICAL EVENT")
    actual_severity: str = Field(..., description="Actual consequence severity: LOW, MEDIUM, HIGH")
    potential_severity: str = Field(..., description="Potential SIF severity: LOW, MEDIUM, HIGH")
    sif_discordance: str = Field(..., description="Discordance status: HIGH or LOW")
    confidence: float = Field(..., description="Overall decision confidence")
    primary_driver: str = Field(..., description="Primary causal factor driving the risk classification")
    energy_risk: str = Field(..., description="Energy risk component: LOW, MEDIUM, HIGH")
    exposure_risk: str = Field(..., description="Worker exposure component: LOW, MEDIUM, HIGH")
    barrier_failure_risk: str = Field(..., description="Barrier failure component: LOW, MEDIUM, HIGH")
    potential_outcome: str = Field(..., description="Potential consequence outcome: MINOR, SERIOUS, CRITICAL")
    reasons: List[str] = Field(default_factory=list, description="Structured factual reasons for flag")
    explanation: str = Field(..., description="Full multi-line auditable explanation")
    recurrence_flag: bool = Field(default=False, description="Whether systemic recurrence was detected")
    model_metadata: Dict[str, str] = Field(default_factory=dict, description="Metadata of participating models")
