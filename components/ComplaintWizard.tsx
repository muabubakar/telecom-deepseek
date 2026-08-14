"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  evidenceOptions,
  impacts,
  issueCategories,
  issueDetails,
  nigerianStates,
  operators,
  periods,
  providerOutcomes,
} from "@/lib/data";
import type { AnalysisResult, ComplaintForm } from "@/lib/types";

const emptyForm: ComplaintForm = {
  operator: "",
  category: "",
  specificIssue: "",
  period: "",
  impact: "",
  contactedProvider: "",
  providerOutcome: "",
  complaintReference: "",
  evidence: [],
  state: "",
  msisdn: "",
  extraDetail: "",
};

const steps = ["Network", "Problem", "Timing", "Provider", "Evidence", "Review"];

function Option({ active, title, subtitle, icon, onClick }: { active: boolean; title: string; subtitle?: string; icon?: string; onClick: () => void }) {
  return (
    <button className={`option-card ${active ? "active" : ""}`} onClick={onClick} type="button">
      {icon && <span className="option-icon">{icon}</span>}
      <span className="option-copy">
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>
      <span className="option-check">{active ? "✓" : ""}</span>
    </button>
  );
}

function Pill({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button className={`pill ${active ? "active" : ""}`} onClick={onClick} type="button">
      {active && <span>✓</span>}{children}
    </button>
  );
}

export default function ComplaintWizard() {
  const [form, setForm] = useState<ComplaintForm>(emptyForm);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedCategory = issueCategories.find((x) => x.id === form.category);
  const progress = ((step + 1) / steps.length) * 100;

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(form.operator);
    if (step === 1) return Boolean(form.category && form.specificIssue);
    if (step === 2) return Boolean(form.period && form.impact);
    if (step === 3) return Boolean(form.contactedProvider && (form.contactedProvider === "no" || form.providerOutcome));
    if (step === 4) return Boolean(form.state || form.evidence.length > 0 || form.msisdn);
    return true;
  }, [step, form]);

  function patch(values: Partial<ComplaintForm>) {
    setForm((current) => ({ ...current, ...values }));
  }

  function toggleEvidence(item: string) {
    setForm((current) => {
      const exists = current.evidence.includes(item);
      let evidence = exists ? current.evidence.filter((x) => x !== item) : [...current.evidence, item];
      if (item === "No evidence yet" && !exists) evidence = ["No evidence yet"];
      if (item !== "No evidence yet") evidence = evidence.filter((x) => x !== "No evidence yet");
      return { ...current, evidence };
    });
  }

  async function analyse() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to generate complaint");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate complaint");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm(emptyForm);
    setStep(0);
    setResult(null);
    setError("");
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyComplaint() {
    if (!result) return;
    await navigator.clipboard.writeText(result.complaint);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function emailRegulator() {
    if (!result?.readyForRegulator) return;
    const to = result.regulatorEmail;
    const subject = encodeURIComponent(result.emailSubject);
    const body = encodeURIComponent(result.complaint);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  if (result) {
    return (
      <main className="shell result-shell">
        <nav className="topbar">
          <div className="brand"><span className="brand-mark">TC</span><span>Telecom <b>Copilot</b></span></div>
          <button className="ghost-button" onClick={reset}>Start new complaint</button>
        </nav>

        <section className="result-hero">
          <div className={`ready-orb ${result.readyForRegulator ? "green" : "amber"}`}>{result.readyForRegulator ? "✓" : "1"}</div>
          <p className="eyebrow">{result.readyForRegulator ? "READY FOR ESCALATION" : "FIRST STEP"}</p>
          <h1>{result.readyForRegulator ? "Your regulatory complaint is ready." : "Contact your service provider first."}</h1>
          <p>{result.assessment}</p>
        </section>

        <section className="result-grid">
          <article className="card summary-card">
            <div className="section-kicker">Complaint summary</div>
            <h2>{result.title}</h2>
            <div className="summary-row"><span>Network</span><strong>{form.operator}</strong></div>
            <div className="summary-row"><span>Category</span><strong>{result.category}</strong></div>
            <div className="summary-row"><span>Issue</span><strong>{result.subcategory}</strong></div>
            <div className="summary-row"><span>When</span><strong>{form.period}</strong></div>
            <div className="summary-row"><span>Provider contacted</span><strong>{form.contactedProvider === "yes" ? "Yes" : "No"}</strong></div>
            {form.complaintReference && <div className="summary-row"><span>Reference</span><strong>{form.complaintReference}</strong></div>}
          </article>

          <article className="card readiness-card">
            <div className="section-kicker">Complaint readiness</div>
            {[form.operator, form.specificIssue, form.period, form.impact, form.contactedProvider === "yes" ? form.providerOutcome : "Provider-first route"].map((value, index) => (
              <div className="readiness-item" key={index}><span className="tiny-check">✓</span><span>{["Network identified", "Problem identified", "Timing supplied", "Impact supplied", form.contactedProvider === "yes" ? "Operator outcome supplied" : "Operator contact required"][index]}</span></div>
            ))}
            {result.missingInformation.map((item) => <div className="readiness-item warning" key={item}><span>!</span><span>{item}</span></div>)}
            <div className={`route-badge ${result.readyForRegulator ? "ready" : "operator"}`}>{result.readyForRegulator ? "READY FOR REGULATOR" : "SEND TO OPERATOR FIRST"}</div>
          </article>

          <article className="card complaint-card">
            <div className="complaint-head">
              <div><div className="section-kicker">AI-prepared complaint</div><h2>Review before sending</h2></div>
              <span className="ai-chip">✦ DeepSeek assisted</span>
            </div>
            <div className="letter-preview">{result.complaint}</div>
            <div className="action-row">
              <button className="secondary-button" onClick={copyComplaint}>{copied ? "✓ Copied" : "Copy complaint"}</button>
              {result.readyForRegulator ? (
                <button className="primary-button" onClick={emailRegulator}>Email regulator <span>↗</span></button>
              ) : (
                <button className="primary-button" onClick={copyComplaint}>Copy for {form.operator} <span>→</span></button>
              )}
            </div>
            {result.readyForRegulator && <p className="send-note">This opens your default email application addressed to <b>{result.regulatorName}</b>. You remain in control of the final send.</p>}
          </article>
        </section>

        <footer className="footer">AI prepares the wording. The consumer reviews and sends it.</footer>
      </main>
    );
  }

  return (
    <main className="shell">
      <nav className="topbar">
        <div className="brand"><span className="brand-mark">TC</span><span>Telecom <b>Copilot</b></span></div>
        <div className="secure-chip"><span></span> Guided complaint assistant</div>
      </nav>

      <header className="intro">
        <div className="intro-badge">✦ NO LONG FORMS. NO PROMPT WRITING.</div>
        <h1>Build a better telecom complaint <em>one choice at a time.</em></h1>
        <p>Choose what happened. We organise the facts, check the complaint path and use AI only when it is time to write.</p>
      </header>

      <section className="wizard-card">
        <div className="progress-head">
          <div><span className="step-label">STEP {step + 1} OF {steps.length}</span><strong>{steps[step]}</strong></div>
          <span className="progress-percent">{Math.round(progress)}%</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>

        <div className="wizard-body">
          {step === 0 && (
            <div className="step-panel">
              <div className="question"><span className="question-number">01</span><div><h2>Which network is affected?</h2><p>Select the service provider for this complaint.</p></div></div>
              <div className="operator-grid">
                {operators.map((operator) => <Option key={operator} active={form.operator === operator} title={operator} icon={operator === "Other" ? "+" : operator.slice(0, 1)} onClick={() => patch({ operator })} />)}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="step-panel">
              <div className="question"><span className="question-number">02</span><div><h2>What is the main problem?</h2><p>Choose a category, then the closest description.</p></div></div>
              <div className="category-grid">
                {issueCategories.map((item) => <Option key={item.id} active={form.category === item.id} title={item.label} subtitle={item.description} icon={item.icon} onClick={() => patch({ category: item.id, specificIssue: "" })} />)}
              </div>
              {form.category && (
                <div className="subquestion"><label>Which best describes it?</label><div className="pill-wrap">{issueDetails[form.category].map((item) => <Pill key={item} active={form.specificIssue === item} onClick={() => patch({ specificIssue: item })}>{item}</Pill>)}</div></div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="step-panel">
              <div className="question"><span className="question-number">03</span><div><h2>When and how did it affect you?</h2><p>Two quick selections give the AI useful context.</p></div></div>
              <div className="field-block"><label>When did this happen?</label><div className="pill-wrap">{periods.map((item) => <Pill key={item} active={form.period === item} onClick={() => patch({ period: item })}>{item}</Pill>)}</div></div>
              <div className="field-block"><label>What was the impact?</label><div className="pill-wrap">{impacts.map((item) => <Pill key={item} active={form.impact === item} onClick={() => patch({ impact: item })}>{item}</Pill>)}</div></div>
            </div>
          )}

          {step === 3 && (
            <div className="step-panel">
              <div className="question"><span className="question-number">04</span><div><h2>Have you reported this to {form.operator}?</h2><p>This determines whether the complaint should go to the provider first or can be prepared for regulatory escalation.</p></div></div>
              <div className="two-grid">
                <Option active={form.contactedProvider === "yes"} title="Yes, I have complained" subtitle="I already contacted the service provider" icon="✓" onClick={() => patch({ contactedProvider: "yes" })} />
                <Option active={form.contactedProvider === "no"} title="No, not yet" subtitle="I have not reported it to the provider" icon="→" onClick={() => patch({ contactedProvider: "no", providerOutcome: "", complaintReference: "" })} />
              </div>
              {form.contactedProvider === "yes" && (
                <div className="provider-details">
                  <div className="field-block"><label>What happened after you complained?</label><div className="pill-wrap">{providerOutcomes.map((item) => <Pill key={item} active={form.providerOutcome === item} onClick={() => patch({ providerOutcome: item })}>{item}</Pill>)}</div></div>
                  <div className="text-field"><label>Complaint reference <span>optional, but useful</span></label><input value={form.complaintReference} onChange={(e) => patch({ complaintReference: e.target.value })} placeholder="e.g. MTN-123456" maxLength={120} /></div>
                </div>
              )}
              {form.contactedProvider === "no" && <div className="info-banner"><span>i</span><div><strong>We will prepare the first complaint for {form.operator}.</strong><p>After you receive a complaint reference and the issue remains unresolved, you can return and generate the regulatory escalation.</p></div></div>}
            </div>
          )}

          {step === 4 && (
            <div className="step-panel">
              <div className="question"><span className="question-number">05</span><div><h2>Add the useful details</h2><p>These are not long-form prompts—just the identifiers and evidence that make a complaint easier to investigate.</p></div></div>
              <div className="field-block"><label>Evidence you already have</label><div className="pill-wrap">{evidenceOptions.map((item) => <Pill key={item} active={form.evidence.includes(item)} onClick={() => toggleEvidence(item)}>{item}</Pill>)}</div></div>
              <div className="form-grid">
                <div className="text-field"><label>State / FCT</label><select value={form.state} onChange={(e) => patch({ state: e.target.value })}><option value="">Select location</option>{nigerianStates.map((state) => <option key={state}>{state}</option>)}</select></div>
                <div className="text-field"><label>Phone number / MSISDN <span>optional</span></label><input value={form.msisdn} onChange={(e) => patch({ msisdn: e.target.value.replace(/[^0-9+]/g, "") })} placeholder="080..." maxLength={16} /></div>
              </div>
              <div className="text-field"><label>One extra detail <span>optional — not a prompt</span></label><textarea value={form.extraDetail} onChange={(e) => patch({ extraDetail: e.target.value })} placeholder="Example: I bought a 10GB bundle and about 8GB was gone by the next morning." maxLength={500} /><small>{form.extraDetail.length}/500</small></div>
            </div>
          )}

          {step === 5 && (
            <div className="step-panel review-panel">
              <div className="question"><span className="question-number">06</span><div><h2>Review the facts, then let AI write.</h2><p>Nothing is sent automatically. DeepSeek will only turn these selections into a professional complaint.</p></div></div>
              <div className="review-grid">
                <div className="review-item"><span>Network</span><strong>{form.operator}</strong></div>
                <div className="review-item"><span>Problem</span><strong>{selectedCategory?.label}</strong></div>
                <div className="review-item wide"><span>Specific issue</span><strong>{form.specificIssue}</strong></div>
                <div className="review-item"><span>When</span><strong>{form.period}</strong></div>
                <div className="review-item"><span>Impact</span><strong>{form.impact}</strong></div>
                <div className="review-item"><span>Provider contacted</span><strong>{form.contactedProvider === "yes" ? "Yes" : "No"}</strong></div>
                <div className="review-item"><span>Location</span><strong>{form.state || "Not supplied"}</strong></div>
              </div>
              <div className={`decision-preview ${form.contactedProvider === "yes" ? "regulator" : "operator"}`}><span>{form.contactedProvider === "yes" ? "✓" : "→"}</span><div><strong>{form.contactedProvider === "yes" ? "Potential regulatory escalation" : `Provider-first complaint to ${form.operator}`}</strong><p>{form.contactedProvider === "yes" ? "DeepSeek will prepare the escalation using the operator outcome you supplied." : "DeepSeek will prepare the initial complaint for the operator first."}</p></div></div>
              {error && <div className="error-banner">{error}</div>}
            </div>
          )}
        </div>

        <div className="wizard-footer">
          <button className="back-button" type="button" disabled={step === 0 || loading} onClick={() => setStep((s) => Math.max(0, s - 1))}>← Back</button>
          {step < steps.length - 1 ? (
            <button className="primary-button" type="button" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>Continue <span>→</span></button>
          ) : (
            <button className="primary-button generate" type="button" disabled={loading} onClick={analyse}>{loading ? <><span className="spinner" /> Writing complaint...</> : <>✦ Generate best complaint</>}</button>
          )}
        </div>
      </section>

      <section className="trust-row"><span>01 <b>Guided choices</b></span><span>02 <b>AI structures the complaint</b></span><span>03 <b>You review before sending</b></span></section>
      <footer className="footer">Designed as a guided consumer aid. AI-generated wording should be reviewed before submission.</footer>
    </main>
  );
}
