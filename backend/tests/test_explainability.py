import sys
import os
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.safety_ontology import (
    RiskTaxonomy,
    SafetySignals,
    HazardType,
    EnergyType,
    ExposureLevel,
    BarrierType,
    BarrierStatus,
)
from app.services.safety_signal_extractor import SafetySignalExtractor
from ml.actual_severity.mock import MockActualSeverityModel
from ml.actual_severity.base import ActualSeverityOutput
from ml.potential_sif.mock import MockPotentialSIFEngine
from ml.potential_sif.base import PotentialSIFOutput
from app.services.discordance import SIFRiskDecisionEngine
from app.services.explainability import ExplainabilityEngine, ExplainabilityEngineBase
from app.schemas.explainability import ExplainabilityOutput

def test_explainability():
    print("==================================================")
    print("Testing SentinelSIF Phase 8 Explainability Service")
    print("==================================================")

    extractor = SafetySignalExtractor()
    actual_model = MockActualSeverityModel()
    potential_engine = MockPotentialSIFEngine()
    decision_engine = SIFRiskDecisionEngine()
    explainability_engine = ExplainabilityEngine()

    # Verify interface inheritance
    assert isinstance(explainability_engine, ExplainabilityEngineBase), "ExplainabilityEngine must inherit from ExplainabilityEngineBase"
    print("-> Interface Verification PASSED: ExplainabilityEngine implements ExplainabilityEngineBase.")

    # ----------------------------------------------------
    # Test A: SIF PRECURSOR (LOW actual + HIGH potential)
    # ----------------------------------------------------
    print("\n--- [Test A] SIF PRECURSOR ---")
    case_a = (
        "During maintenance on pump P-102, a technician entered the immediate vicinity. "
        "No injury occurred. The high pressure line was not isolated (LOTO failed) and the coupling guard was removed."
    )
    signals_a = extractor.extract(case_a)
    actual_a = actual_model.predict(case_a)
    potential_a = potential_engine.predict(signals_a)
    decision_a = decision_engine.evaluate(actual_a, potential_a, signals_a)

    report_a = explainability_engine.generate_explanation(decision_a, signals_a, actual_a, potential_a)

    print(f"  Classification: {report_a.classification}")
    print(f"  Actual: {report_a.actual_severity.level} (conf: {report_a.actual_severity.confidence})")
    print(f"  Potential: {report_a.potential_severity.level} (conf: {report_a.potential_severity.confidence})")
    print(f"  Discordance: present={report_a.discordance.present}, status={report_a.discordance.status}")
    print(f"  Trace Discordance: {report_a.decision_trace.discordance}")

    assert report_a.classification == RiskTaxonomy.SIF_PRECURSOR.value
    assert report_a.actual_severity.level == "LOW"
    assert report_a.potential_severity.level == "HIGH"
    assert report_a.discordance.present is True
    assert report_a.discordance.status == "HIGH"
    assert report_a.decision_trace.discordance is True
    assert report_a.decision_trace.final_classification == RiskTaxonomy.SIF_PRECURSOR.value

    # Verify reasons content
    why_text_a = " ".join(report_a.why_flagged).lower()
    assert "low" in why_text_a and "high" in why_text_a, "Reasons must cite low actual vs high potential"
    assert any("energy" in f.factor.lower() for f in report_a.key_risk_factors)
    assert any("exposure" in f.factor.lower() for f in report_a.key_risk_factors)
    assert any("barrier" in f.factor.lower() for f in report_a.key_risk_factors)
    assert len(report_a.potential_consequences) > 0
    assert any("fatal" in c.lower() or "disabling" in c.lower() or "sif" in c.lower() for c in report_a.potential_consequences)
    assert len(report_a.barrier_findings) > 0
    assert any(b.status in ["FAILED", "ABSENT"] for b in report_a.barrier_findings)
    print("  -> Test A PASSED: Comprehensive structured explanation generated for SIF Precursor.")

    # ----------------------------------------------------
    # Test B: SERIOUS EVENT (HIGH actual + LOW potential)
    # ----------------------------------------------------
    print("\n--- [Test B] SERIOUS EVENT ---")
    case_b = "Worker in site office fell off standard chair, sustained serious injury requiring emergency surgical hospital treatment."
    signals_b = extractor.extract(case_b)
    actual_b = actual_model.predict(case_b)
    potential_b = potential_engine.predict(signals_b)
    decision_b = decision_engine.evaluate(actual_b, potential_b, signals_b)

    report_b = explainability_engine.generate_explanation(decision_b, signals_b, actual_b, potential_b)

    print(f"  Classification: {report_b.classification}")
    print(f"  Actual: {report_b.actual_severity.level} | Potential: {report_b.potential_severity.level}")
    print(f"  Discordance present: {report_b.discordance.present}")

    assert report_b.classification == RiskTaxonomy.SERIOUS_EVENT.value
    assert report_b.actual_severity.level == "HIGH"
    assert report_b.discordance.present is False
    assert report_b.decision_trace.discordance is False

    # Must emphasize actual severity and NOT call it a SIF precursor
    why_text_b = " ".join(report_b.why_flagged).lower()
    assert "actual" in why_text_b and "serious" in why_text_b
    assert "precursor" not in why_text_b, "SERIOUS EVENT must NOT be described as a SIF precursor"
    print("  -> Test B PASSED: Serious actual event properly explained without SIF precursor false flag.")

    # ----------------------------------------------------
    # Test C: ROUTINE (LOW actual + LOW potential)
    # ----------------------------------------------------
    print("\n--- [Test C] ROUTINE ---")
    case_c = "Employee slipped on wet floor. Minor scrape. First aid provided. Worker wore slip-resistant boots."
    signals_c = extractor.extract(case_c)
    actual_c = actual_model.predict(case_c)
    potential_c = potential_engine.predict(signals_c)
    decision_c = decision_engine.evaluate(actual_c, potential_c, signals_c)

    report_c = explainability_engine.generate_explanation(decision_c, signals_c, actual_c, potential_c)

    print(f"  Classification: {report_c.classification}")
    print(f"  Actual: {report_c.actual_severity.level} | Potential: {report_c.potential_severity.level}")

    assert report_c.classification == RiskTaxonomy.ROUTINE.value
    assert report_c.actual_severity.level == "LOW"
    assert report_c.potential_severity.level == "LOW"
    assert report_c.discordance.present is False
    assert report_c.decision_trace.discordance is False

    why_text_c = " ".join(report_c.why_flagged).lower()
    assert "precursor" not in why_text_c, "ROUTINE event must NOT contain SIF precursor language"
    print("  -> Test C PASSED: Routine event correctly explained with balanced low risk.")

    # ----------------------------------------------------
    # Test D: UNKNOWN BARRIER (Responsible AI Uncertainty)
    # ----------------------------------------------------
    print("\n--- [Test D] UNKNOWN BARRIER ---")
    signals_d = SafetySignals(
        hazards=[HazardType.PRESSURE],
        energy_types=[EnergyType.PRESSURE],
        exposure_level=ExposureLevel.POTENTIAL,
        barrier_types=[BarrierType.ISOLATION],
        barrier_status=BarrierStatus.UNKNOWN,
        confidence=0.85
    )
    actual_d = ActualSeverityOutput(
        prediction="LOW",
        probabilities={"LOW": 0.9, "MEDIUM": 0.08, "HIGH": 0.02},
        confidence=0.90,
        model_type="mock",
        model_version="mock-v1"
    )
    potential_d = potential_engine.predict(signals_d)
    decision_d = decision_engine.evaluate(actual_d, potential_d, signals_d)

    report_d = explainability_engine.generate_explanation(decision_d, signals_d, actual_d, potential_d)

    print(f"  Barrier Findings: {[(b.barrier, b.status) for b in report_d.barrier_findings]}")
    print(f"  Uncertainties ({len(report_d.uncertainties)}): {[u.field for u in report_d.uncertainties]}")

    # Must NOT claim barrier failed
    assert all(b.status != "FAILED" for b in report_d.barrier_findings), "UNKNOWN barrier must NEVER be reported as FAILED"
    assert any(b.status == "UNKNOWN" for b in report_d.barrier_findings)
    # Must report uncertainty with officer prompt
    assert len(report_d.uncertainties) > 0
    barrier_unc = next((u for u in report_d.uncertainties if u.field == "barrier_status"), None)
    assert barrier_unc is not None, "Must generate uncertainty item for unknown barrier status"
    assert barrier_unc.status == "UNKNOWN"
    assert len(barrier_unc.prompt_for_officer) > 10
    print(f"  Prompt for Officer: '{barrier_unc.prompt_for_officer}'")
    print("  -> Test D PASSED: UNKNOWN barrier preserved as UNKNOWN and surfaced as uncertainty prompt.")

    # ----------------------------------------------------
    # Test E: WATCH (LOW actual + MEDIUM potential)
    # ----------------------------------------------------
    print("\n--- [Test E] WATCH ---")
    signals_e = SafetySignals(
        hazards=[HazardType.MECHANICAL],
        energy_types=[EnergyType.MECHANICAL],
        exposure_level=ExposureLevel.POTENTIAL,
        barrier_types=[BarrierType.GUARDING],
        barrier_status=BarrierStatus.FUNCTIONING,
        confidence=0.85
    )
    actual_e = ActualSeverityOutput(
        prediction="LOW",
        probabilities={"LOW": 0.95, "MEDIUM": 0.04, "HIGH": 0.01},
        confidence=0.95,
        model_type="mock",
        model_version="mock-v1"
    )
    potential_e = PotentialSIFOutput(
        energy_risk="MEDIUM",
        exposure_risk="MEDIUM",
        barrier_failure_risk="LOW",
        potential_outcome="SERIOUS",
        potential_severity="MEDIUM",
        confidence=0.82,
        model_type="mock",
        model_version="mock-v1"
    )
    decision_e = decision_engine.evaluate(actual_e, potential_e, signals_e)

    report_e = explainability_engine.generate_explanation(decision_e, signals_e, actual_e, potential_e)

    print(f"  Classification: {report_e.classification}")
    print(f"  Actual: {report_e.actual_severity.level} | Potential: {report_e.potential_severity.level}")

    assert report_e.classification == RiskTaxonomy.WATCH.value
    assert report_e.actual_severity.level == "LOW"
    assert report_e.potential_severity.level == "MEDIUM"

    why_text_e = " ".join(report_e.why_flagged).lower()
    assert "elevated" in why_text_e or "medium" in why_text_e, "WATCH should explain elevated risk"
    assert "precursor" not in why_text_e, "WATCH must NOT be called a SIF precursor"
    print("  -> Test E PASSED: WATCH classification accurately explained without precursor inflation.")

    # ----------------------------------------------------
    # Test F: CRITICAL EVENT (HIGH actual + HIGH potential)
    # ----------------------------------------------------
    print("\n--- [Test F] CRITICAL EVENT ---")
    signals_f = SafetySignals(
        hazards=[HazardType.PRESSURE, HazardType.EXPLOSION],
        energy_types=[EnergyType.PRESSURE, EnergyType.CHEMICAL],
        exposure_level=ExposureLevel.DIRECT,
        barrier_types=[BarrierType.ISOLATION, BarrierType.EMERGENCY_SHUTDOWN],
        barrier_status=BarrierStatus.FAILED,
        confidence=0.95
    )
    actual_f = ActualSeverityOutput(
        prediction="HIGH",
        probabilities={"LOW": 0.02, "MEDIUM": 0.08, "HIGH": 0.90},
        confidence=0.90,
        model_type="mock",
        model_version="mock-v1"
    )
    potential_f = PotentialSIFOutput(
        energy_risk="HIGH",
        exposure_risk="HIGH",
        barrier_failure_risk="HIGH",
        potential_outcome="CRITICAL",
        potential_severity="HIGH",
        confidence=0.92,
        model_type="mock",
        model_version="mock-v1"
    )
    decision_f = decision_engine.evaluate(actual_f, potential_f, signals_f)

    report_f = explainability_engine.generate_explanation(decision_f, signals_f, actual_f, potential_f)

    print(f"  Classification: {report_f.classification}")
    print(f"  Actual: {report_f.actual_severity.level} | Potential: {report_f.potential_severity.level}")

    assert report_f.classification == RiskTaxonomy.CRITICAL_EVENT.value
    assert report_f.actual_severity.level == "HIGH"
    assert report_f.potential_severity.level == "HIGH"

    why_text_f = " ".join(report_f.why_flagged).lower()
    assert "high" in why_text_f or "catastrophic" in why_text_f or "critical" in why_text_f
    assert report_f.decision_trace.final_classification == RiskTaxonomy.CRITICAL_EVENT.value
    print("  -> Test F PASSED: Critical event identifies catastrophic alignment of actual & potential severity.")

    print("\n==================================================")
    print("ALL PHASE 8 EXPLAINABILITY TESTS (A - F) PASSED")
    print("==================================================")

if __name__ == "__main__":
    test_explainability()
