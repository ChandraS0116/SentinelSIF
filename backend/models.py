from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, unique=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String)
    activity = Column(String)
    equipment = Column(String)
    narrative = Column(Text)
    incident_type = Column(String)
    source = Column(String)

    # Relationships
    safety_features = relationship("SafetyFeatures", back_populates="incident", uselist=False)
    risk_assessment = relationship("RiskAssessment", back_populates="incident", uselist=False)
    agent_result = relationship("AgentResult", back_populates="incident", uselist=False)

class SafetyFeatures(Base):
    __tablename__ = "safety_features"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    
    hazards = Column(JSON, default=list)
    energy_types = Column(JSON, default=list)
    exposure_level = Column(String)
    barrier_status = Column(String)
    barrier_types = Column(JSON, default=list)
    affected_personnel = Column(String)
    work_activity = Column(String)
    equipment = Column(String)
    confidence = Column(Float)

    incident = relationship("Incident", back_populates="safety_features")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    
    actual_severity = Column(String)
    actual_confidence = Column(Float)
    
    # Potential SIF components (Multi-output)
    energy_risk_score = Column(Float)
    exposure_risk_score = Column(Float)
    barrier_failure_score = Column(Float)
    potential_severity = Column(String)
    potential_confidence = Column(Float)
    
    sif_discordance = Column(String) # e.g. "HIGH", "LOW"
    risk_level = Column(String)      # The taxonomy: ROUTINE, WATCH, SIF PRECURSOR, SERIOUS EVENT, CRITICAL EVENT
    primary_driver = Column(String)
    explanation = Column(Text)

    incident = relationship("Incident", back_populates="risk_assessment")

class AgentResult(Base):
    __tablename__ = "agent_results"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    
    conclusion = Column(Text)
    confidence = Column(Float)
    
    historical_matches = Column(JSON, default=list)
    recommended_controls = Column(JSON, default=list)
    uncertainty = Column(JSON, default=list)

    incident = relationship("Incident", back_populates="agent_result")
    evidence = relationship("Evidence", back_populates="agent_result")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    agent_result_id = Column(Integer, ForeignKey("agent_results.id"))
    
    source_id = Column(String)
    source_type = Column(String)
    relevant_excerpt = Column(Text)
    relevance_score = Column(Float)

    agent_result = relationship("AgentResult", back_populates="evidence")
