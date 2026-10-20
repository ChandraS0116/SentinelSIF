import sys
import os
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.safety_ontology import RiskTaxonomy
from app.services.safety_signal_extractor import SafetySignalExtractor
from ml.actual_severity.mock import MockActualSeverityModel
from ml.potential_sif.mock import MockPotentialSIFEngine
from app.services.discordance import SIFRiskDecisionEngine

def run_tests():
    print("==================================================")
    print("Testing SentinelSIF Phases 5, 6, 7 Risk Pipeline")
    print("==================================================")

    extractor = SafetySignalExtractor()
    actual_model = MockActualSeverityModel()
    potential_engine = MockPotentialSIFEngine()
    decision_engine = SIFRiskDecisionEngine()

    # ----------------------------------------------------
    # Edge Case Tests (Cases A through E)
    # ----------------------------------------------------
    print("\n--- Testing Edge Cases A - E ---")

    # Case A: No injury + high energy + failed barrier -> SIF PRECURSOR
    case_a_text = "Technician entered pump area. No injury occurred. The high pressure 3000 PSI line was not safely depressurized and LOTO was missing."
    signals_a = extractor.extract(case_a_text)
    actual_a = actual_model.predict(case_a_text)
    potential_a = potential_engine.predict(signals_a)
    decision_a = decision_engine.evaluate(actual_a, potential_a, signals_a)

    print(f"\n[Case A] Hidden SIF Precursor:")
    print(f"  Actual: {decision_a.actual_severity} | Potential: {decision_a.potential_severity} ({decision_a.potential_outcome})")
    print(f"  Classification: {decision_a.classification.value}")
    print(f"  Discordance: {decision_a.sif_discordance}")
    print(f"  Primary Driver: {decision_a.primary_driver}")
    assert decision_a.classification == RiskTaxonomy.SIF_PRECURSOR, f"Expected SIF PRECURSOR, got {decision_a.classification}"
    assert decision_a.sif_discordance == "HIGH"
    print("  -> PASSED: Successfully flagged as SIF PRECURSOR with HIGH discordance.")

    # Case B: Serious injury + low potential -> SERIOUS EVENT
    case_b_text = "Worker in site office fell off standard chair, sustained serious injury requiring emergency surgical hospital treatment."
    signals_b = extractor.extract(case_b_text)
    actual_b = actual_model.predict(case_b_text)
    potential_b = potential_engine.predict(signals_b)
    decision_b = decision_engine.evaluate(actual_b, potential_b, signals_b)

    print(f"\n[Case B] Serious Actual Event:")
    print(f"  Actual: {decision_b.actual_severity} | Potential: {decision_b.potential_severity}")
    print(f"  Classification: {decision_b.classification.value}")
    assert decision_b.classification == RiskTaxonomy.SERIOUS_EVENT, f"Expected SERIOUS EVENT, got {decision_b.classification}"
    print("  -> PASSED: Successfully classified as SERIOUS EVENT based on actual consequence.")

    # Case C: No injury + low energy + functioning barriers -> ROUTINE
    case_c_text = "Employee tripped over an uneven mat in the hallway. Minor scrape. First aid provided. Worker wore PPE."
    signals_c = extractor.extract(case_c_text)
    actual_c = actual_model.predict(case_c_text)
    potential_c = potential_engine.predict(signals_c)
    decision_c = decision_engine.evaluate(actual_c, potential_c, signals_c)

    print(f"\n[Case C] Routine Low-Energy Event:")
    print(f"  Actual: {decision_c.actual_severity} | Potential: {decision_c.potential_severity}")
    print(f"  Classification: {decision_c.classification.value}")
    assert decision_c.classification == RiskTaxonomy.ROUTINE, f"Expected ROUTINE, got {decision_c.classification}"
    print("  -> PASSED: Correctly identified as ROUTINE workplace event.")

    # Case D: Ambiguous text / Insufficient signals
    case_d_text = "Worker reported general noise near unit. No specific equipment details."
    signals_d = extractor.extract(case_d_text)
    actual_d = actual_model.predict(case_d_text)
    potential_d = potential_engine.predict(signals_d)
    decision_d = decision_engine.evaluate(actual_d, potential_d, signals_d)

    print(f"\n[Case D] Ambiguous / Low Energy Report:")
    print(f"  Actual: {decision_d.actual_severity} | Potential: {decision_d.potential_severity}")
    print(f"  Classification: {decision_d.classification.value}")
    assert decision_d.classification in [RiskTaxonomy.ROUTINE, RiskTaxonomy.WATCH]
    print("  -> PASSED: Properly non-escalated without high-energy evidence.")

    # Case E: Repeated low-severity incidents with recurrence escalation
    case_e_text = "Small hydraulic drip observed. Repaired."
    signals_e = extractor.extract(case_e_text)
    actual_e = actual_model.predict(case_e_text)
    potential_e = potential_engine.predict(signals_e)
    # Simulate recurrence context: 4 similar incidents in last 30 days
    recurrence_ctx = {"similar_incident_count": 4, "recurrence_cluster": "Hydraulic_Drip_Pumps"}
    decision_e = decision_engine.evaluate(actual_e, potential_e, signals_e, recurrence_context=recurrence_ctx)

    print(f"\n[Case E] Recurrence Context Detection:")
    print(f"  Actual: {decision_e.actual_severity} | Potential: {decision_e.potential_severity}")
    print(f"  Recurrence Detected: {decision_e.recurrence_flag}")
    print(f"  Classification: {decision_e.classification.value}")
    assert decision_e.recurrence_flag is True
    print("  -> PASSED: Recurrence context properly tracked and evaluated.")

    # ----------------------------------------------------
    # Synthetic Dataset Pipeline Execution
    # ----------------------------------------------------
    print("\n--- Evaluating Entire Synthetic Dataset ---")
    data_path = os.path.join(os.path.dirname(__file__), "..", "data_train.json")
    if os.path.exists(data_path):
        with open(data_path, "r") as f:
            records = json.load(f)

        counts = {tax.value: 0 for tax in RiskTaxonomy}
        for rec in records:
            narrative = rec.get("narrative", "")
            activity = rec.get("activity", "")
            equipment = rec.get("equipment", "")

            sigs = extractor.extract(narrative, activity, equipment)
            act = actual_model.predict(narrative)
            pot = potential_engine.predict(sigs)
            dec = decision_engine.evaluate(act, pot, sigs)

            counts[dec.classification.value] += 1

        print(f"Processed {len(records)} training records:")
        for tax_val, count in counts.items():
            print(f"  - {tax_val:20s}: {count:3d} ({count/len(records)*100:.1f}%)")

        assert counts[RiskTaxonomy.SIF_PRECURSOR.value] > 0, "Expected some SIF PRECURSOR cases in synthetic data"
        assert counts[RiskTaxonomy.ROUTINE.value] > 0, "Expected some ROUTINE cases in synthetic data"
        print("  -> PASSED: Clean distribution across taxonomy on synthetic dataset.")

    print("\n==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY (Phases 5, 6, 7)")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
