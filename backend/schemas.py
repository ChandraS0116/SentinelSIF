from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class IncidentBase(BaseModel):
    incident_id: str
    timestamp: datetime
    location: str
    activity: str
    equipment: str
    narrative: str
    incident_type: str
    source: str

class IncidentCreate(IncidentBase):
    pass

class SafetyFeaturesBase(BaseModel):
    hazards: List[str] = []
    energy_types: List[str] = []
    exposure_level: str
    barrier_status: str
    barrier_types: List[str] = []
    affected_personnel: str
    work_activity: str
    equipment: str
    confidence: float

class RiskAssessmentBase(BaseModel):
    actual_severity: str
    actual_confidence: float
    energy_risk_score: float
    exposure_risk_score: float
    barrier_failure_score: float
    potential_severity: str
    potential_confidence: float
    sif_discordance: str
    risk_level: str
    primary_driver: str
    explanation: str

class EvidenceBase(BaseModel):
    source_id: str
    source_type: str
    relevant_excerpt: str
    relevance_score: float

class AgentResultBase(BaseModel):
    conclusion: str
    confidence: float
    historical_matches: List[str] = []
    recommended_controls: List[str] = []
    uncertainty: List[str] = []
    evidence: List[EvidenceBase] = []

class IncidentResponse(IncidentBase):
    id: int
    safety_features: Optional[SafetyFeaturesBase] = None
    risk_assessment: Optional[RiskAssessmentBase] = None
    agent_result: Optional[AgentResultBase] = None

    class Config:
        from_attributes = True
