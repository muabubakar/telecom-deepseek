import { NextResponse } from "next/server";
import type { ComplaintForm, AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

const MAX_INPUT_LENGTH = 10000;

function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normalizePayload(body: unknown): ComplaintForm {
  const source = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const evidence = Array.isArray(source.evidence)
    ? source.evidence.filter((item): item is string => typeof item === "string").slice(0, 10)
    : [];

  return {
    operator: clean(source.operator, 80),
    category: clean(source.category, 80),
    specificIssue: clean(source.specificIssue, 200),
    period: clean(source.period, 100),
    impact: clean(source.impact, 200),
    contactedProvider: source.contactedProvider === "yes" ? "yes" : source.contactedProvider === "no" ? "no" : "",
    providerOutcome: clean(source.providerOutcome, 200),
    complaintReference: clean(source.complaintReference, 120),
    evidence,
    state: clean(source.state, 100),
    msisdn: clean(source.msisdn, 30),
    extraDetail: clean(source.extraDetail, 700),
  };
}

function validate(form: ComplaintForm): string | null {
  if (!form.operator || !form.category || !form.specificIssue || !form.period || !form.impact || !form.contactedProvider) {
    return "Some required complaint selections are missing.";
  }
  if (form.contactedProvider === "yes" && !form.providerOutcome) {
    return "Please select what happened after contacting the service provider.";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not configured on the server." }, { status: 500 });
    }

    const raw = await request.text();
    if (raw.length > MAX_INPUT_LENGTH) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }

    const form = normalizePayload(JSON.parse(raw));
    const validationError = validate(form);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const regulatorName = process.env.REGULATOR_NAME || "Nigerian Communications Commission (NCC)";
    const regulatorEmail = process.env.REGULATOR_EMAIL || "consumerportal@ncc.gov.ng";
    const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

    const mustGoToOperatorFirst = form.contactedProvider === "no";

    const systemPrompt = `
You are a complaint-writing assistant for Nigerian telecommunications consumers.
You receive STRUCTURED facts chosen by a consumer in a guided wizard.

Your job is to prepare a concise, factual complaint. Do not invent facts, dates, laws, SLA periods, operator obligations, penalties or regulatory findings.
Use clear professional Nigerian English. Avoid emotional or accusatory language.

Routing rule supplied by the application:
- If ROUTE is "operator", prepare the complaint for the consumer's service provider and make readyForRegulator false.
- If ROUTE is "regulator", prepare an escalation complaint for ${regulatorName} and make readyForRegulator true.
- Never override ROUTE.

When writing a regulator escalation, clearly mention the previous operator complaint reference if supplied and the unresolved outcome.
When a reference is not supplied, do not invent one; list it under missingInformation.
Do not include a made-up recipient email in the complaint text.
Do not include markdown.

Return ONLY valid JSON with exactly this shape:
{
  "readyForRegulator": true,
  "route": "regulator",
  "category": "",
  "subcategory": "",
  "title": "",
  "assessment": "",
  "missingInformation": [],
  "emailSubject": "",
  "complaint": ""
}
`.trim();

    const aiPayload = {
      ROUTE: mustGoToOperatorFirst ? "operator" : "regulator",
      complaintFacts: form,
    };

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(aiPayload) },
        ],
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
        stream: false,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 800);
      console.error("DeepSeek error:", response.status, detail);
      return NextResponse.json({ error: `AI service returned HTTP ${response.status}.` }, { status: 502 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "AI service returned an unexpected response." }, { status: 502 });
    }

    const parsed = JSON.parse(content) as Partial<AnalysisResult>;
    const route: "operator" | "regulator" = mustGoToOperatorFirst ? "operator" : "regulator";

    const result: AnalysisResult = {
      readyForRegulator: route === "regulator",
      route,
      category: clean(parsed.category, 120) || form.category,
      subcategory: clean(parsed.subcategory, 180) || form.specificIssue,
      title: clean(parsed.title, 180) || `${form.specificIssue} complaint`,
      assessment: clean(parsed.assessment, 800) || "The complaint has been prepared from the information provided.",
      missingInformation: Array.isArray(parsed.missingInformation)
        ? parsed.missingInformation.filter((x): x is string => typeof x === "string").slice(0, 8)
        : [],
      emailSubject: clean(parsed.emailSubject, 180) || `${form.specificIssue} - ${form.operator}`,
      complaint: clean(parsed.complaint, 6000),
      regulatorName,
      regulatorEmail,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyse route failed:", error);
    return NextResponse.json({ error: "Unable to analyse the complaint. Please try again." }, { status: 500 });
  }
}
