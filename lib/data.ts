export const operators = ["MTN", "Airtel", "Globacom", "9mobile", "Other"];

export const issueCategories = [
  { id: "data", label: "Data", icon: "◒", description: "Bundles, browsing and depletion" },
  { id: "calls", label: "Calls", icon: "⌕", description: "Failed calls and call quality" },
  { id: "network", label: "Network", icon: "⌁", description: "Coverage, signal and outages" },
  { id: "recharge", label: "Recharge", icon: "₦", description: "Airtime and failed recharge" },
  { id: "billing", label: "Billing / VAS", icon: "◇", description: "Deductions and subscriptions" },
  { id: "sim", label: "SIM", icon: "▣", description: "SIM access and registration" },
  { id: "sms", label: "SMS", icon: "✉", description: "Sending and receiving messages" },
  { id: "porting", label: "Porting", icon: "⇄", description: "Mobile number portability" },
];

export const issueDetails: Record<string, string[]> = {
  data: ["Data finishes unusually quickly", "Bundle was charged but not activated", "Cannot browse with an active bundle", "Data balance appears incorrect", "Other data issue"],
  calls: ["Cannot make calls", "Cannot receive calls", "Calls keep dropping", "Poor voice quality", "Charged for failed calls"],
  network: ["No network signal", "Very weak signal", "Service outage in my area", "Internet is consistently slow", "Problem happens only in a location"],
  recharge: ["Paid but airtime not credited", "Recharge PIN failed", "Wrong recharge value credited", "Duplicate recharge debit", "Other recharge issue"],
  billing: ["Unexpected airtime deduction", "Unwanted subscription", "Recurring charge I do not recognise", "Incorrect billing", "Unable to stop a paid service"],
  sim: ["SIM suddenly stopped working", "SIM replacement issue", "SIM registration/NIN issue", "Line is barred or restricted", "Suspected SIM swap"],
  sms: ["Cannot send SMS", "Cannot receive SMS", "SMS is delayed", "Charged for failed SMS", "OTP messages are not arriving"],
  porting: ["Cannot receive calls after porting", "Cannot make calls after porting", "Porting request failed", "Porting is taking too long", "Some networks cannot reach my number"],
};

export const periods = ["Today", "Yesterday", "Within the last 7 days", "Within the last 30 days", "More than 30 days ago", "This keeps happening"];
export const impacts = ["Service is completely unavailable", "Service works poorly", "Money or airtime was deducted", "Problem happens intermittently", "I am unable to use an important service"];
export const providerOutcomes = ["No response", "Issue not resolved", "Partially resolved", "Operator says resolved, but it is not", "I disagree with the explanation received"];
export const evidenceOptions = ["Complaint reference", "Screenshot", "Payment receipt", "SMS notification", "Call log", "Data usage screenshot", "Email/chat with operator", "No evidence yet"];

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];
