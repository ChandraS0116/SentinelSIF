from typing import Optional, Dict, Any, List
from datetime import datetime

from app.schemas.safety_ontology import SafetySignals, BarrierStatus, ExposureLevel, RiskTaxonomy
from app.schemas.risk_decision import RiskDecisionOutput
from app.schemas.explainability import (
    ExplainabilityOutput,
    SeverityDetail,
    DiscordanceDetail,
    KeyRiskFactor,
    BarrierFinding,
    UncertaintyItem,
    DecisionBasis,
    DecisionTrace,
)
from ml.actual_severity.base import ActualSeverityOutput
from ml.potential_sif.base import PotentialSIFOutput
from app.services.explainability.base import ExplainabilityEngineBase

class ExplainabilityEngine(ExplainabilityEngineBase):
    """
    Phase 8: Deterministic Explainability Service.
    Turns Phase 7 risk decisions into structured, auditable, citation-ready explanations.
    All outputs are grounded in structured safety signals, never hallucinated by an LLM.

    Core Principle:
    Phase 7 DECIDES.
    Phase 8 EXPLAINS.
    """

    def generate_explanation(
        self,
        risk_decision: RiskDecisionOutput,
        safety_signals: SafetySignals,
        actual_severity: ActualSeverityOutput,
        potential_sif: PotentialSIFOutput,
        incident: Optional[Any] = None,
        recurrence_context: Optional[Dict[str, Any]] = None
    ) -> ExplainabilityOutput:
        act_sev = actual_severity.prediction.upper()
        pot_sev = potential_sif.potential_severity.upper()
        classification = (
            risk_decision.classification.value
            if hasattr(risk_decision.classification, "value")
            else str(risk_decision.classification)
        )

        # 1. Structured Severity Details
        actual_detail = SeverityDetail(
            level=act_sev,
            confidence=round(actual_severity.confidence, 2)
        )
        potential_detail = SeverityDetail(
            level=pot_sev,
            confidence=round(potential_sif.confidence, 2)
        )

        # 2. Discordance Evaluation
        is_discordant = (
            (act_sev == "LOW" and pot_sev == "HIGH")
            or (act_sev == "LOW" and potential_sif.potential_outcome == "CRITICAL")
            or (risk_decision.sif_discordance == "HIGH" and act_sev == "LOW")
        )
        discordance_status = "HIGH" if is_discordant else "LOW"

        if classification == RiskTaxonomy.SIF_PRECURSOR.value or (act_sev == "LOW" and pot_sev == "HIGH"):
            gap_desc = "Disproportionate severity gap: Low actual consequence disguised an unmitigated high-energy hazard pathway."
        elif classification == RiskTaxonomy.SERIOUS_EVENT.value or (act_sev == "HIGH" and pot_sev == "LOW"):
            gap_desc = "Actual injury consequence was serious, but systemic/energy potential was contained."
        elif classification == RiskTaxonomy.CRITICAL_EVENT.value or (act_sev == "HIGH" and pot_sev == "HIGH"):
            gap_desc = "Catastrophic alignment: High actual injury severity accompanied by uncontained critical energy."
        elif classification == RiskTaxonomy.WATCH.value:
            gap_desc = "Elevated potential risk: Low actual injury severity, but hazard conditions warrant operational watch."
        else:
            gap_desc = "Routine workplace event: Actual consequence and potential severity are balanced at low levels."

        discordance = DiscordanceDetail(
            actual=act_sev,
            potential=pot_sev,
            present=is_discordant,
            status=discordance_status,
            gap_description=gap_desc
        )

        # 3. Deterministic "Why Flagged?" reasons
        why_flagged: List[str] = []

        if classification == RiskTaxonomy.SIF_PRECURSOR.value:
            why_flagged.append("Actual severity is LOW while potential severity is HIGH.")
            if potential_sif.energy_risk == "HIGH" or safety_signals.energy_types:
                e_names = ", ".join([e.value if hasattr(e, "value") else str(e) for e in safety_signals.energy_types]) or "High energy"
                why_flagged.append(f"High hazardous-energy exposure potential identified: {e_names}.")
            exp_val = (
                safety_signals.exposure_level.value
                if hasattr(safety_signals.exposure_level, "value")
                else str(safety_signals.exposure_level)
            )
            if exp_val not in ["None", "Unknown"]:
                why_flagged.append(f"High worker exposure risk identified: {exp_val}.")
            b_status_val = (
                safety_signals.barrier_status.value
                if hasattr(safety_signals.barrier_status, "value")
                else str(safety_signals.barrier_status)
            )
            if b_status_val in ["FAILED", "ABSENT"] or potential_sif.barrier_failure_risk == "HIGH":
                b_names = ", ".join([b.value if hasattr(b, "value") else str(b) for b in safety_signals.barrier_types]) or "Critical safety barrier"
                why_flagged.append(f"Critical barrier {b_status_val.lower()} identified: {b_names}.")
            if potential_sif.potential_outcome == "CRITICAL":
                why_flagged.append("Potential consequence is classified as CRITICAL.")
            if recurrence_context and recurrence_context.get("similar_incident_count", 0) >= 3:
                why_flagged.append(f"Systemic recurrence detected: {recurrence_context.get('similar_incident_count')} similar incidents recorded.")

        elif classification == RiskTaxonomy.SERIOUS_EVENT.value:
            why_flagged.append("Actual injury consequence is classified as HIGH.")
            why_flagged.append("Actual event resulted in serious consequence requiring hospitalization or emergency medical intervention.")
            why_flagged.append("Systemic energy containment was maintained; no unmitigated catastrophic potential identified.")

        elif classification == RiskTaxonomy.ROUTINE.value:
            why_flagged.append("Actual injury severity is classified as LOW.")
            why_flagged.append("Potential severity is classified as LOW.")
            why_flagged.append("No significant actual/potential severity discordance detected.")
            b_status_val = (
                safety_signals.barrier_status.value
                if hasattr(safety_signals.barrier_status, "value")
                else str(safety_signals.barrier_status)
            )
            if b_status_val == BarrierStatus.FUNCTIONING.value:
                why_flagged.append("Routine operational controls and safety barriers are functioning as intended.")
            else:
                why_flagged.append("Hazard energy is low or contained within acceptable operational tolerances.")

        elif classification == RiskTaxonomy.WATCH.value:
            why_flagged.append("Actual injury severity is classified as LOW.")
            why_flagged.append("Potential severity is classified as MEDIUM.")
            why_flagged.append("Elevated potential risk identified requiring operational monitoring.")
            if safety_signals.energy_types:
                e_names = ", ".join([e.value if hasattr(e, "value") else str(e) for e in safety_signals.energy_types])
                why_flagged.append(f"Medium hazardous-energy exposure potential identified: {e_names}.")
            if recurrence_context and recurrence_context.get("similar_incident_count", 0) >= 3:
                why_flagged.append(f"Recurrence flag: {recurrence_context.get('similar_incident_count')} repeated occurrences track trending risk.")

        elif classification == RiskTaxonomy.CRITICAL_EVENT.value:
            why_flagged.append("Actual injury consequence is classified as HIGH.")
            why_flagged.append("Potential severity is classified as HIGH.")
            why_flagged.append("Catastrophic alignment: High actual injury severity accompanied by high potential severity.")
            b_status_val = (
                safety_signals.barrier_status.value
                if hasattr(safety_signals.barrier_status, "value")
                else str(safety_signals.barrier_status)
            )
            if b_status_val in ["FAILED", "ABSENT"]:
                b_names = ", ".join([b.value if hasattr(b, "value") else str(b) for b in safety_signals.barrier_types]) or "Critical safety barriers"
                why_flagged.append(f"Critical barrier failure identified under high-energy conditions: {b_names}.")

        else:
            # Fallback for unexpected classification
            why_flagged.append(f"Incident classified as {classification} based on actual severity {act_sev} and potential {pot_sev}.")

        # 4. Key Risk Factors
        key_risk_factors: List[KeyRiskFactor] = []
        
        # Energy
        e_names = ", ".join([e.value if hasattr(e, "value") else str(e) for e in safety_signals.energy_types]) or "Low/ambient energy"
        key_risk_factors.append(KeyRiskFactor(factor="Energy", level=potential_sif.energy_risk, value=e_names))

        # Exposure
        exp_val = (
            safety_signals.exposure_level.value
            if hasattr(safety_signals.exposure_level, "value")
            else str(safety_signals.exposure_level)
        )
        key_risk_factors.append(KeyRiskFactor(factor="Exposure", level=potential_sif.exposure_risk, value=exp_val))

        # Barrier
        b_names = ", ".join([b.value if hasattr(b, "value") else str(b) for b in safety_signals.barrier_types]) or "Safety controls"
        b_status_val = (
            safety_signals.barrier_status.value
            if hasattr(safety_signals.barrier_status, "value")
            else str(safety_signals.barrier_status)
        )
        key_risk_factors.append(
            KeyRiskFactor(
                factor="Barrier",
                level=potential_sif.barrier_failure_risk,
                value=f"{b_names} ({b_status_val})"
            )
        )

        # Recurrence if applicable
        if recurrence_context and recurrence_context.get("similar_incident_count", 0) >= 3:
            key_risk_factors.append(
                KeyRiskFactor(
                    factor="Recurrence",
                    level="HIGH",
                    value=f"{recurrence_context.get('similar_incident_count')} repeated incidents"
                )
            )

        # 5. Barrier Findings (Adhering to Phase 3 Controlled Ontology)
        barrier_findings: List[BarrierFinding] = []
        if b_status_val == BarrierStatus.FAILED.value:
            barrier_findings.append(
                BarrierFinding(
                    barrier=b_names,
                    status="FAILED",
                    impact="Critical barrier was compromised; worker remained exposed to hazardous energy."
                )
            )
        elif b_status_val == BarrierStatus.ABSENT.value:
            barrier_findings.append(
                BarrierFinding(
                    barrier=b_names,
                    status="ABSENT",
                    impact="Required safety barrier was absent or not implemented prior to activity."
                )
            )
        elif b_status_val == BarrierStatus.FUNCTIONING.value:
            barrier_findings.append(
                BarrierFinding(
                    barrier=b_names,
                    status="FUNCTIONING",
                    impact="Barrier was present and functioning as intended to mitigate hazard release."
                )
            )
        else: # UNKNOWN
            barrier_findings.append(
                BarrierFinding(
                    barrier=b_names,
                    status="UNKNOWN",
                    impact="Barrier status is unknown; additional field verification is required."
                )
            )

        # 6. Potential Consequences
        if potential_sif.potential_outcome == "CRITICAL" or pot_sev == "HIGH":
            potential_consequences = [
                "Permanent disabling injury",
                "Fatal outcome / SIF event",
                "Catastrophic asset failure"
            ]
        elif pot_sev == "MEDIUM" or potential_sif.potential_outcome == "SERIOUS":
            potential_consequences = [
                "Lost-time injury requiring medical hospitalization",
                "Localized equipment damage",
                "Secondary containment breach"
            ]
        else:
            potential_consequences = [
                "Minor superficial injury requiring first aid",
                "Temporary operational interruption"
            ]

        # 7. Uncertainties & Responsible AI Missing Information Checks
        uncertainties: List[UncertaintyItem] = []
        if b_status_val == BarrierStatus.UNKNOWN.value:
            uncertainties.append(
                UncertaintyItem(
                    field="barrier_status",
                    status="UNKNOWN",
                    prompt_for_officer="Confirm whether positive isolation/LOTO, guarding, or emergency stop controls were active during the activity."
                )
            )
        if exp_val in ["Unknown", "UNKNOWN"]:
            uncertainties.append(
                UncertaintyItem(
                    field="exposure_level",
                    status="UNKNOWN",
                    prompt_for_officer="Verify exact proximity and line-of-fire position of technician relative to energized components."
                )
            )
        if len(safety_signals.energy_types) == 0:
            uncertainties.append(
                UncertaintyItem(
                    field="energy_types",
                    status="UNKNOWN",
                    prompt_for_officer="Specify operating pressure, voltage, chemical identity, or mechanical energy state of equipment."
                )
            )
        if actual_severity.confidence < 0.75:
            uncertainties.append(
                UncertaintyItem(
                    field="actual_severity",
                    status="LOW_CONFIDENCE",
                    prompt_for_officer="Review narrative: injury consequence has ambiguity regarding medical treatment or lost-time status."
                )
            )
        if potential_sif.confidence < 0.75:
            uncertainties.append(
                UncertaintyItem(
                    field="potential_severity",
                    status="LOW_CONFIDENCE",
                    prompt_for_officer="Verify equipment specifications and isolation conditions to refine potential severity rating."
                )
            )

        # 8. Decision Basis Provenance
        decision_basis = DecisionBasis(
            engine="SIFRiskDecisionEngine",
            rules_version="v1.0-deterministic",
            actual_model=f"{actual_severity.model_type}:{actual_severity.model_version}",
            potential_model=f"{potential_sif.model_type}:{potential_sif.model_version}",
            calibrated_confidence=risk_decision.confidence,
            evaluated_at=datetime.utcnow().isoformat()
        )

        # 9. Machine-Readable Decision Trace
        decision_trace = DecisionTrace(
            actual_severity=act_sev,
            potential_severity=pot_sev,
            energy_risk=potential_sif.energy_risk,
            exposure_risk=potential_sif.exposure_risk,
            barrier_failure_risk=potential_sif.barrier_failure_risk,
            potential_outcome=potential_sif.potential_outcome,
            discordance=is_discordant,
            final_classification=classification
        )

        # 10. Causal Pathway
        h_str = ", ".join([h.value if hasattr(h, "value") else str(h) for h in safety_signals.hazards]) or "Operational Hazard"
        causal_pathway = (
            f"Hazard ({h_str}) -> Energy ({e_names}) -> Exposure ({exp_val}) -> "
            f"Barrier ({b_names} [{b_status_val}]) -> Potential Outcome ({potential_sif.potential_outcome})"
        )

        # 11. Human-Readable Executive Summary (Command Center Ready)
        summary_lines = [
            f"CLASSIFICATION: {classification}",
            f"Actual Consequence: {act_sev} | Potential SIF: {pot_sev} ({potential_sif.potential_outcome})",
            f"SIF Discordance: {discordance_status} | Calibrated Confidence: {int(risk_decision.confidence * 100)}%",
            f"Primary Driver: {risk_decision.primary_driver}",
            "",
            "Why Flagged:"
        ]
        for w in why_flagged:
            summary_lines.append(f"  • {w}")

        if uncertainties:
            summary_lines.append("")
            summary_lines.append("Information Required from Safety Officer:")
            for u in uncertainties:
                summary_lines.append(f"  ? [{u.field}] {u.prompt_for_officer}")

        human_summary = "\n".join(summary_lines)

        return ExplainabilityOutput(
            classification=classification,
            actual_severity=actual_detail,
            potential_severity=potential_detail,
            discordance=discordance,
            why_flagged=why_flagged,
            key_risk_factors=key_risk_factors,
            barrier_findings=barrier_findings,
            potential_consequences=potential_consequences,
            uncertainties=uncertainties,
            decision_basis=decision_basis,
            decision_trace=decision_trace,
            causal_pathway=causal_pathway,
            human_summary=human_summary,
            evidence=[]
        )
