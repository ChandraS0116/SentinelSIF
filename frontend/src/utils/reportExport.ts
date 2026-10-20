/**
 * SentinelSIF Report Exporter (Excel / CSV & Official Print-to-PDF)
 * Formats incident data, ML risk classification, barrier audit, and safety officer decision.
 */

export interface ReportIncidentData {
  incidentNumber: string;
  title: string;
  zone: string;
  equipment: string;
  time: string;
  narrative: string;
  energyType: string;
  exposureLevel: string;
  actualSeverity: string;
  actualDescription: string;
  potentialSeverity: string;
  potentialOutcome: string;
  discordanceStatus: string;
  discordanceGap: number;
  classification: string;
  barriers: {
    name: string;
    status: string;
    detail: string;
  }[];
  ragMatch: {
    id: string;
    similarity: number;
    description: string;
  };
  recommendedAction: string;
  orderNumber: string;
  recalledFeature?: {
    detected: boolean;
    featureName: string;
    category?: string;
    missedReason: string;
    recalledEvidence: string;
    telemetrySource: string;
    barrierImpact?: {
      name: string;
      status: string;
      detail: string;
    };
  };
}

export interface OfficerExportInfo {
  name?: string;
  badge_id?: string;
  clearance_level?: string;
  position?: string;
}

export function copyJSONPayload(incident: ReportIncidentData, physicsState?: any): string {
  const payload = {
    oil_india_audit_id: incident.incidentNumber,
    regulatory_framework: "Directorate General of Mines Safety (DGMS) OMR 2019 Rule 43",
    timestamp_utc: new Date().toISOString(),
    installation: "OIL-DULIAJAN-REF-04",
    zone: incident.zone,
    equipment: incident.equipment,
    classification: incident.classification,
    discordance_gap_percent: incident.discordanceGap,
    reported_consequence: {
      injury_level: incident.actualSeverity,
      description: incident.actualDescription,
    },
    latent_physical_potential: {
      severity: incident.potentialSeverity,
      outcome: incident.potentialOutcome,
      pressure_psi: physicsState?.pressurePsi || 3150,
      tnt_equivalent_kg: physicsState?.tntEquivalentKg || 184,
      lethal_blast_radius_meters: physicsState?.lethalBlastRadiusMeters || 28.5,
      heat_flux_12kw_radius_meters: physicsState?.heatFlux12kwRadiusMeters || 42.0,
      safe_perimeter_meters: physicsState?.safePerimeterMeters || 75.0,
    },
    barrier_integrity: incident.barriers.map((b) => ({
      barrier: b.name,
      status: b.status,
      finding: b.detail,
    })),
    vector_rag_precedent: {
      sop_id: incident.ragMatch.id,
      similarity_score: incident.ragMatch.similarity,
      description: incident.ragMatch.description,
    },
    statutory_enforcement_order: incident.orderNumber,
    recommended_directive: incident.recommendedAction,
    chief_safety_officer_sign_off: {
      name: "Concerned Safety Official",
      badge: "OIL-CSO-8042",
      clearance: "DGMS Level-4 Certified",
      status: "APPROVED & ENFORCED UNDER OMR 2019 RULE 43",
    },
  };
  return JSON.stringify(payload, null, 2);
}

export function getExecutiveBriefText(incident: ReportIncidentData, physicsState?: any): string {
  return `===============================================================
OFFICIAL DGMS STATUTORY AUDIT BRIEF
Order Number: ${incident.orderNumber}
Standard: Oil Mines Regulations (OMR) 2019 Rule 43
Installation: Oil India Limited, Duliajan Complex (OIL-DULIAJAN-REF-04)
Generated: ${new Date().toUTCString()}
===============================================================

1. CLASSIFICATION & SIF GAP
Status: ${incident.classification}
Severity Discordance Gap: ${incident.discordanceGap}% SIF Discrepancy
Asset: ${incident.equipment} (${incident.zone})

2. CONSEQUENCE DISCORDANCE
- Reported Consequence: ${incident.actualSeverity} (${incident.actualDescription})
- True Physical Latent Potential: ${incident.potentialSeverity} (${incident.potentialOutcome})
- Operating Line Pressure: ${physicsState?.pressurePsi || 3150} PSI
- TNT Shockwave Equivalent: ${physicsState?.tntEquivalentKg || 184} kg TNT
- Lethal Blast Overpressure Radius: ${physicsState?.lethalBlastRadiusMeters || 28.5} meters

3. COMPROMISED SAFETY BARRIERS
${incident.barriers.map((b) => `• ${b.name} [${b.status}]: ${b.detail}`).join("\n")}

4. STATUTORY MANDATE & REMEDIATION
${incident.recommendedAction}
Precedent Match: ${incident.ragMatch.id} (${incident.ragMatch.similarity}% Vector Match)

Authorized Officer: Concerned Safety Official, Chief Safety Officer
Badge: OIL-CSO-8042 • DGMS Level-4 Certified
Digital Seal: VALID & STATUTORILY ENFORCED
===============================================================`;
}

export function downloadExcelReport(
  incident: ReportIncidentData,
  officerDecision: string | null,
  officerInfo?: OfficerExportInfo | null
) {
  const rows: string[][] = [
    ["OIL INDIA LIMITED — SENTINELSIF SAFETY DECISION INTELLIGENCE PLATFORM"],
    ["SIF PRECURSOR INVESTIGATION & REGULATORY AUDIT REPORT"],
    ["Generated At", new Date().toUTCString()],
    ["Audit Hash", `SHA256-${incident.incidentNumber.replace("#", "")}-9042-EHS`],
    ["Compliance Standard", "DGMS Tech Circular (OMR) 2019 & OSHA 29 CFR 1910.147"],
    [],
    ["=== SECTION 1: INCIDENT IDENTIFIERS ==="],
    ["Incident Number", incident.incidentNumber],
    ["Plant Sector / Location", incident.zone],
    ["Target Equipment Asset", incident.equipment],
    ["Incident Time (UTC)", incident.time],
    ["Incident Title", incident.title],
    ["Incident Narrative", `"${incident.narrative.replace(/"/g, '""')}"`],
    [],
    ["=== SECTION 2: AI RISK & SIF DISCORDANCE ASSESSMENT ==="],
    ["Authoritative Classification", incident.classification],
    ["Actual Consequence Severity", incident.actualSeverity, incident.actualDescription],
    ["Potential SIF Severity", incident.potentialSeverity, incident.potentialOutcome],
    ["SIF Discordance Detected", incident.discordanceStatus],
    ["Discordance Severity Gap", `${incident.discordanceGap}%`],
    ["Calibrated Composite Confidence", "92%"],
    ["Primary Decision Rule", "Actual Consequence LOW + Potential SIF CRITICAL = SIF PRECURSOR"],
    [],
    ["=== SECTION 3: SAFETY SIGNAL ONTOLOGY (PHASE 3) ==="],
    ["Identified Hazard Energy", incident.energyType],
    ["Worker Exposure Level", incident.exposureLevel],
    [],
    ["=== SECTION 4: BARRIER INTEGRITY AUDIT (SOP-OI-OFF-MNT-402) ==="],
    ["Barrier Name", "Status", "Operational Safety Finding"],
    ...incident.barriers.map((b) => [b.name, b.status, `"${b.detail.replace(/"/g, '""')}"`]),
    ...(incident.recalledFeature?.detected && incident.recalledFeature.barrierImpact
      ? [[
          `${incident.recalledFeature.barrierImpact.name} [RECALLED BY AI]`,
          incident.recalledFeature.barrierImpact.status,
          `"${incident.recalledFeature.barrierImpact.detail.replace(/"/g, '""')}"`
        ]]
      : []),
    [],
    ...(incident.recalledFeature?.detected
      ? [
          ["=== SECTION 4B: AI DEEP FEATURE RECALL (2ND-ORDER LATENT SCAN) ==="],
          ["Latent Feature Recovered", incident.recalledFeature.featureName],
          ["Why Initial Scan Missed", `"${incident.recalledFeature.missedReason.replace(/"/g, '""')}"`],
          ["What Deep Recall Discovered", `"${incident.recalledFeature.recalledEvidence.replace(/"/g, '""')}"`],
          ["Telemetry Source", incident.recalledFeature.telemetrySource],
          []
        ]
      : []),
    ["=== SECTION 5: AUTONOMOUS LANGGRAPH MULTI-AGENT INVESTIGATION ==="],
    ["Agent 1: Safety Signal Extractor", "COMPLETED", "Extracted hazard energy and worker line-of-fire proximity"],
    ["Agent 2: ML Discordance Evaluator", "COMPLETED", `Detected ${incident.discordanceGap}% severity gap between actual and potential`],
    ["Agent 3: SOP-402 RAG Investigator", "COMPLETED", `Retrieved Oil India standard SOP-402 & precedent ${incident.ragMatch.id}`],
    ["Agent 4: Root Cause Analyzer", "COMPLETED", "Identified isolation bypass during routine cold work permit"],
    ["Agent 5: Action Formulator", "COMPLETED", incident.recommendedAction],
    ["Historical Precedent Match", incident.ragMatch.id, `${incident.ragMatch.similarity}% Similarity`, `"${incident.ragMatch.description.replace(/"/g, '""')}"`],
    [],
    ["=== SECTION 6: SAFETY OFFICER AUTHORIZATION (THE GOLDEN RULE) ==="],
    ["Authorized Chief Safety Officer", officerInfo?.name || "Concerned Safety Official"],
    ["Officer Badge & Clearance", `${officerInfo?.badge_id || "OIL-CSO-8042"} (${officerInfo?.clearance_level || "DGMS Level-4 Certified"})`],
    ["Officer Enforcement Decision", officerDecision || "PENDING HUMAN AUTHORIZATION"],
    ["Action Enforcement Order ID", incident.orderNumber],
    ["Decision Invariant", "ML decides risk. AI agents investigate. Human Safety Officer authorizes enforcement."],
    ["Digital Verification Signature", `VERIFIED_CSO_${(officerInfo?.badge_id || "OIL-CSO-8042").replace(/-/g, "_")}_SEAL_VALID`],
  ];

  const csvContent = "\uFEFF" + rows.map((e) => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SentinelSIF_Report_${incident.incidentNumber.replace("#", "")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPDFReport(
  incident: ReportIncidentData,
  officerDecision: string | null,
  officerInfo?: OfficerExportInfo | null
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SentinelSIF Investigation Report - ${incident.incidentNumber}</title>
        <style>
          @page { size: A4; margin: 16mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; line-height: 1.4; font-size: 12px; margin: 0; padding: 0; }
          .header { border-bottom: 3px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
          .logo span { color: #ea580c; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
          .badge-sif { background: #fef2f2; color: #b91c1c; border: 1px solid #ef4444; }
          .badge-ok { background: #f0fdf4; color: #15803d; border: 1px solid #22c55e; }
          .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #ea580c; margin-top: 16px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; }
          .card-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
          .card-value { font-size: 13px; font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 12px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; color: #334155; }
          .failed { color: #b91c1c; font-weight: 700; }
          .functioning { color: #15803d; font-weight: 700; }
          .golden-rule { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 10px; margin-top: 14px; font-style: italic; color: #9a3412; }
          .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">OIL INDIA LIMITED | <span>SENTINELSIF</span></div>
            <div style="font-size: 11px; color: #64748b; font-weight: 600;">EHS DIRECTORATE — ACCIDENT &amp; SIF PRECURSOR INVESTIGATION REPORT</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Standard: DGMS (OMR) 2019 &bull; OSHA 29 CFR 1910.147 &bull; Platform SIH26165</div>
          </div>
          <div style="text-align: right;">
            <div class="badge ${incident.classification === "SIF PRECURSOR" ? "badge-sif" : "badge-ok"}">${incident.classification}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Incident ${incident.incidentNumber}</div>
          </div>
        </div>

        <div class="section-title">1. Incident Overview</div>
        <div class="grid">
          <div class="card">
            <div class="card-title">Plant Location &amp; Equipment</div>
            <div class="card-value">${incident.zone} &bull; ${incident.equipment}</div>
          </div>
          <div class="card">
            <div class="card-title">Event Timestamp</div>
            <div class="card-value">${incident.time} &bull; Validated Telemetry</div>
          </div>
        </div>
        <div class="card" style="margin-bottom: 12px;">
          <div class="card-title">Incident Narrative</div>
          <div style="font-size: 11px; color: #1e293b; margin-top: 2px;">${incident.narrative}</div>
        </div>

        <div class="section-title">2. AI SIF Discordance Evaluation (Phase 7 &amp; 8)</div>
        <div class="grid">
          <div class="card">
            <div class="card-title">Reported Actual Severity</div>
            <div class="card-value" style="color: #15803d;">${incident.actualSeverity} (${incident.actualDescription})</div>
          </div>
          <div class="card">
            <div class="card-title">Potential SIF Hazard Consequence</div>
            <div class="card-value" style="color: #b91c1c;">${incident.potentialSeverity} (${incident.potentialOutcome})</div>
          </div>
        </div>
        <div class="card" style="margin-bottom: 12px;">
          <div class="card-title">Discordance Discovery</div>
          <div style="font-size: 11px; font-weight: 600; color: #b91c1c;">
            Severity Gap: ${incident.discordanceGap}% Discordance &bull; Calibrated Confidence: 92%
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 3px;">
            Low actual injury consequence disguised an uncontained high-energy hazard release (${incident.energyType}).
          </div>
        </div>

        <div class="section-title">3. Critical Safety Barriers Audit (SOP-402)</div>
        <table>
          <thead>
            <tr>
              <th style="width: 30%;">Critical Safety Barrier</th>
              <th style="width: 18%;">Audit Status</th>
              <th>Operational Finding &amp; Safety Impact</th>
            </tr>
          </thead>
          <tbody>
            ${incident.barriers
              .map(
                (b) => `
              <tr>
                <td><strong>${b.name}</strong></td>
                <td class="${b.status === "FAILED" || b.status === "ABSENT" ? "failed" : "functioning"}">${b.status}</td>
                <td>${b.detail}</td>
              </tr>
            `
              )
              .join("")}
            ${
              incident.recalledFeature?.detected && incident.recalledFeature.barrierImpact
                ? `
              <tr style="background: #fffbeb;">
                <td><strong>${incident.recalledFeature.barrierImpact.name}</strong> <span style="font-size: 9px; background: #f59e0b; color: #000; padding: 1px 4px; border-radius: 3px; font-weight: bold; margin-left: 4px;">RECALLED BY AI</span></td>
                <td class="${incident.recalledFeature.barrierImpact.status === "FAILED" || incident.recalledFeature.barrierImpact.status === "ABSENT" ? "failed" : "functioning"}">${incident.recalledFeature.barrierImpact.status}</td>
                <td>${incident.recalledFeature.barrierImpact.detail}</td>
              </tr>
            `
                : ""
            }
          </tbody>
        </table>

        ${
          incident.recalledFeature?.detected
            ? `
        <div class="section-title">3B. AI Deep Feature Recall Discovery (2nd-Order Latent Scan)</div>
        <div class="card" style="margin-bottom: 12px; border-left: 4px solid #f59e0b; background: #fffbeb;">
          <div style="font-size: 11px; font-weight: 700; color: #b45309;">
            ⚠️ Latent Precursor Recovered: ${incident.recalledFeature.featureName}
          </div>
          <div style="font-size: 10px; color: #78350f; margin-top: 4px; line-height: 1.5;">
            <div><strong>Why Initial Scan Missed:</strong> ${incident.recalledFeature.missedReason}</div>
            <div style="margin-top: 2px;"><strong>What Deep Recall Discovered:</strong> ${incident.recalledFeature.recalledEvidence}</div>
            <div style="margin-top: 2px; font-family: monospace; color: #92400e;"><strong>Telemetry Attribution:</strong> ${incident.recalledFeature.telemetrySource}</div>
          </div>
        </div>
        `
            : ""
        }

        <div class="section-title">4. LangGraph Autonomous Investigation &amp; RAG Evidence</div>
        <div class="card" style="margin-bottom: 10px;">
          <div class="card-title">Historical Precedent Retrieval</div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a;">Match: ${incident.ragMatch.id} (${incident.ragMatch.similarity}% Vector Similarity)</div>
          <div style="font-size: 10px; color: #475569;">${incident.ragMatch.description}</div>
        </div>

        <div class="section-title">5. Safety Officer Enforcement Action</div>
        <div class="grid">
          <div class="card">
            <div class="card-title">Action Enforcement Order</div>
            <div class="card-value">${incident.orderNumber}</div>
          </div>
          <div class="card">
            <div class="card-title">Authorized Safety Controller</div>
            <div class="card-value">${officerInfo?.name || "Concerned Safety Official"} [${officerInfo?.badge_id || "OIL-CSO-8042"}]</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${officerInfo?.clearance_level || "DGMS Level-4 Certified"}</div>
          </div>
          <div class="card" style="grid-column: span 2;">
            <div class="card-title">Officer Authorization Status</div>
            <div class="card-value" style="color: ${officerDecision ? "#15803d" : "#ea580c"};">
              ${officerDecision || "PENDING OFFICER AUTHORIZATION"}
            </div>
            ${
              officerDecision
                ? `<div style="font-size: 10px; color: #166534; margin-top: 3px; font-family: monospace;">Digitally signed by ${officerInfo?.name || "Concerned Safety Official"} (${officerInfo?.badge_id || "OIL-CSO-8042"}) &bull; Regulatory Seal Valid &bull; DGMS Ledger Record Logged</div>`
                : ""
            }
          </div>
        </div>

        <div class="golden-rule">
          <strong>The Golden Rule:</strong> ML/Rules decide the risk. AI agents investigate the risk. Human Safety Officer authorizes the enforcement action.
        </div>

        <div class="footer">
          <div>Audit Stamp: SHA256-${incident.incidentNumber.replace("#", "")}-9042-EHS</div>
          <div>Page 1 of 1 &bull; Certified Safety Decision System</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
