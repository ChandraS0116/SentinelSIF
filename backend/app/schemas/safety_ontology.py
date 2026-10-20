from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class HazardType(str, Enum):
    ELECTRICAL = "Electrical"
    PRESSURE = "Pressure"
    MECHANICAL = "Mechanical"
    CHEMICAL = "Chemical"
    FIRE = "Fire"
    EXPLOSION = "Explosion"
    FALL = "Fall"
    VEHICLE = "Vehicle"
    CONFINED_SPACE = "Confined Space"
    THERMAL = "Thermal"
    STORED_ENERGY = "Stored Energy"
    MOVING_EQUIPMENT = "Moving Equipment"

class EnergyType(str, Enum):
    ELECTRICAL = "Electrical"
    PRESSURE = "Pressure"
    MECHANICAL = "Mechanical"
    CHEMICAL = "Chemical"
    THERMAL = "Thermal"
    GRAVITATIONAL = "Gravitational"
    KINETIC = "Kinetic"
    RADIATION = "Radiation"
    STORED_ENERGY = "Stored Energy"

class ExposureLevel(str, Enum):
    NONE = "None"
    POTENTIAL = "Potential"
    DIRECT = "Direct"
    PROLONGED = "Prolonged"
    WORKER_IN_HAZARD_ZONE = "Worker in hazard zone"
    WORKER_NEAR_ENERGIZED = "Worker near energized equipment"
    WORKER_BENEATH_SUSPENDED_LOAD = "Worker beneath suspended load"
    WORKER_NEAR_PRESSURIZED = "Worker near pressurized equipment"
    UNKNOWN = "Unknown"

class BarrierType(str, Enum):
    PHYSICAL_BARRIER = "Physical barrier"
    GUARDING = "Guarding"
    LOTO = "LOTO"
    ISOLATION = "Isolation"
    PPE = "PPE"
    INTERLOCK = "Interlock"
    PERMIT = "Permit"
    ALARM = "Alarm"
    EMERGENCY_SHUTDOWN = "Emergency shutdown"
    EXCLUSION_ZONE = "Exclusion zone"
    PROCEDURE = "Procedure"
    TRAINING = "Training"

class BarrierStatus(str, Enum):
    FUNCTIONING = "FUNCTIONING"
    FAILED = "FAILED"
    ABSENT = "ABSENT"
    UNKNOWN = "UNKNOWN"

class RiskTaxonomy(str, Enum):
    ROUTINE = "ROUTINE"
    WATCH = "WATCH"
    SIF_PRECURSOR = "SIF PRECURSOR"
    SERIOUS_EVENT = "SERIOUS EVENT"
    CRITICAL_EVENT = "CRITICAL EVENT"

class SafetySignals(BaseModel):
    hazards: List[HazardType] = Field(default_factory=list)
    energy_types: List[EnergyType] = Field(default_factory=list)
    exposure_level: ExposureLevel = ExposureLevel.UNKNOWN
    barrier_types: List[BarrierType] = Field(default_factory=list)
    barrier_status: BarrierStatus = BarrierStatus.UNKNOWN
    potential_contact: Optional[str] = None
    potential_outcome: Optional[str] = None
    confidence: float = 1.0
