export type ComplaintForm = {
  operator: string;
  category: string;
  specificIssue: string;
  period: string;
  impact: string;
  contactedProvider: "yes" | "no" | "";
  providerOutcome: string;
  complaintReference: string;
  evidence: string[];
  state: string;
  msisdn: string;
  extraDetail: string;
};

export type AnalysisResult = {
  readyForRegulator: boolean;
  route: "operator" | "regulator";
  category: string;
  subcategory: string;
  title: string;
  assessment: string;
  missingInformation: string[];
  emailSubject: string;
  complaint: string;
  regulatorName: string;
  regulatorEmail: string;
};
