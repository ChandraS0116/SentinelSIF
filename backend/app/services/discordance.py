from typing import Optional, Dict, Any, List
from app.schemas.safety_ontology import RiskTaxonomy, SafetySignals, BarrierStatus
from app.schemas.risk_decision import RiskDecisionOutput
from ml.actual_severity.base import ActualSeverityOutput
from ml.potential_sif.base import PotentialSIFOutput

class SIFRiskDecisionEngine:
    """
    Phase 7 & 8: SIF Discordance Engine & Deterministic Explainability.
    The central, authoritative decision engine for SentinelSIF risk taxonomy.
    ML models produce probabilities/features; this engine produces the final taxonomy.
    """

    # Prototype Configurable Matrix: (Actual, Potential) -> Classification
    DISCORDANCE_MATRIX = {
        ("LOW", "LOW"): RiskTaxonomy.ROUTINE,
        ("LOW", "MEDIUM"): RiskTaxonomy.WATCH,
        ("LOW", "HIGH"): RiskTaxonomy.SIF_PRECURSOR,
        ("MEDIUM", "HIGH"): RiskTaxonomy.CRITICAL_EVENT, # Or SERIOUS POTENTIAL EVENT / CRITICAL depending on thresholds
        ("HIGH", "LOW"): RiskTaxonomy.SERIOUS_EVENT,
        ("HIGH", "HIGH"): RiskTaxonomy.CRITICAL_EVENT,
        # Default fallbacks
        ("MEDIUM", "LOW"): RiskTaxonomy.WATCH,
        ("MEDIUM", "MEDIUM"): RiskTaxonomy.WATCH,
        ("HIGH", "MEDIUM"): RiskTaxonomy.SERIOUS_EVENT,
    }

    def evaluate(
        self,
        actual: ActualSeverityOutput,
        potential: PotentialSIFOutput,
        signals: SafetySignals,
        recurrence_context: Optional[Dict[str, Any]] = None
    ) -> RiskDecisionOutput:
        act_sev = actual.prediction.upper()
        pot_sev = potential.potential_severity.upper()

        # 1. Evaluate baseline matrix
        classification = self.DISCORDANCE_MATRIX.get((act_sev, pot_sev), RiskTaxonomy.WATCH)

        # 2. Recurrence Context Escalation
        recurrence_flag = False
        if recurrence_context and recurrence_context.get("similar_incident_count", 0) >= 3:
            recurrence_flag = True
            # Systemic risk escalation: repeated near misses with failed barriers become critical
            if classification == RiskTaxonomy.ROUTINE and potential.barrier_failure_risk == "HIGH":
                classification = RiskTaxonomy.WATCH
            elif classification == RiskTaxonomy.WATCH and pot_sev in ["MEDIUM", "HIGH"]:
                classification = RiskTaxonomy.SIF_PRECURSOR

        # 3. Discordance determination
        is_discordant = (act_sev == "LOW" and pot_sev == "HIGH") or (act_sev == "LOW" and potential.potential_outcome == "CRITICAL")
        sif_discordance = "HIGH" if is_discordant else "LOW"

        # 4. Primary driver identification
        if classification == RiskTaxonomy.SIF_PRECURSOR:
            primary_driver = "HIGH-ENERGY EXPOSURE + BARRIER FAILURE"
        elif classification == RiskTaxonomy.CRITICAL_EVENT:
            primary_driver = "CATASTROPHIC ENERGY RELEASE / CRITICAL INJURY"
        elif classification == RiskTaxonomy.SERIOUS_EVENT:
            primary_driver = "ACTUAL LOST TIME / HOSPITALIZATION INJURY"
        elif classification == RiskTaxonomy.WATCH:
            primary_driver = "EMERGING HAZARD / RECURRING DEFICIENCY"
        else:
            primary_driver = "ROUTINE LOW-ENERGY WORKPLACE EVENT"

        # 5. Composite Confidence (deterministic combination of model confidences)
        composite_confidence = round((actual.confidence * 0.4) + (potential.confidence * 0.6), 2)

        # 6. Structured Reasons & Explanation Generation (Phase 8)
        reasons, full_explanation = self._build_explanation(
            classification=classification,
            actual_sev=act_sev,
            potential_sev=pot_sev,
            potential_outcome=potential.potential_outcome,
            signals=signals,
            potential_output=potential,
            recurrence_flag=recurrence_flag,
            recurrence_context=recurrence_context
        )

        return RiskDecisionOutput(
            classification=classification,
            actual_severity=act_sev,
            potential_severity=pot_sev,
            sif_discordance=sif_discordance,
            confidence=composite_confidence,
            primary_driver=primary_driver,
            energy_risk=potential.energy_risk,
            exposure_risk=potential.exposure_risk,
            barrier_failure_risk=potential.barrier_failure_risk,
            potential_outcome=potential.potential_outcome,
            reasons=reasons,
            explanation=full_explanation,
            recurrence_flag=recurrence_flag,
            model_metadata={
                "actual_model": f"{actual.model_type}:{actual.model_version}",
                "potential_model": f"{potential.model_type}:{potential.model_version}",
                "engine_version": "decision-engine-v1"
            }
        )

    def _build_explanation(
        self,
        classification: RiskTaxonomy,
        actual_sev: str,
        potential_sev: str,
        potential_outcome: str,
        signals: SafetySignals,
        potential_output: PotentialSIFOutput,
        recurrence_flag: bool,
        recurrence_context: Optional[Dict[str, Any]]
    ) -> tuple[List[str], str]:
        reasons: List[str] = []

        # Energy reasons
        if signals.energy_types:
            energy_names = ", ".join([e.value if hasattr(e, 'value') else str(e) for e in signals.energy_types])
            reasons.append(f"{potential_output.energy_risk}-energy hazard present ({energy_names})")

        # Exposure reasons
        if signals.exposure_level.value != "None" and signals.exposure_level.value != "Unknown":
            reasons.append(f"Worker exposure status: {signals.exposure_level.value}")

        # Barrier reasons
        b_status = signals.barrier_status.value
        if b_status in ["FAILED", "ABSENT"]:
            b_types = ", ".join([b.value if hasattr(b, 'value') else str(b) for b in signals.barrier_types]) or "Required safety barrier"
            reasons.append(f"Critical barrier {b_status.lower()}: {b_types}")

        # Recurrence reasons
        if recurrence_flag and recurrence_context:
            count = recurrence_context.get("similar_incident_count", 0)
            reasons.append(f"Systemic recurrence: {count} similar incidents detected historically")

        # Discordance gap reason
        if classification == RiskTaxonomy.SIF_PRECURSOR:
            reasons.append(f"High potential consequence ({potential_outcome}) disguised by low actual outcome ({actual_sev})")

        # Format full explanation
        lines = [
            f"CLASSIFICATION: {classification.value}",
            f"Actual Consequence: {actual_sev}",
            f"Potential Consequence: {potential_sev} ({potential_outcome})",
            "",
            "Why Flagged:"
        ]
        for r in reasons:
            lines.append(f"• {r}")

        return reasons, "\n".join(lines)
