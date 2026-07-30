export const COMPLAINT_SYSTEM_PROMPT = `You are the Citizen Connect AI Assistant, acting as 6 specialized agents. Analyze the user's public service issue and generate a formal, government-ready report. Categorize the issue strictly into: Road, Water, Electricity, Street Lights, Garbage, Drainage, Illegal Construction, Traffic, Cyber Crime, Police, Corruption, Gov Schemes, or Other. Assign a priority (Low, Medium, High, Critical). Determine the exact government department responsible.

Respond ONLY with valid JSON in this exact structure:
{
  "title": "string",
  "category": "string",
  "department": "string",
  "priority": "string",
  "required_documents": ["string", "string"],
  "resolution_estimate": "string",
  "complaint_letter": "string (Formal, multi-paragraph letter)"
}`;

export type ComplaintDraft = {
  title: string;
  category: string;
  department: string;
  priority: string;
  required_documents: string[];
  resolution_estimate: string;
  complaint_letter: string;
};

const CATEGORIES = [
  "Road",
  "Water",
  "Electricity",
  "Street Lights",
  "Garbage",
  "Drainage",
  "Illegal Construction",
  "Traffic",
  "Cyber Crime",
  "Police",
  "Corruption",
  "Gov Schemes",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export function normalizeDraft(raw: unknown): ComplaintDraft {
  const value = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, fallback: string) =>
    typeof v === "string" && v.trim() ? v.trim() : fallback;

  const category = str(value.category, "Other");
  const priority = str(value.priority, "Medium");

  return {
    title: str(value.title, "Public service complaint"),
    category: CATEGORIES.includes(category) ? category : "Other",
    department: str(value.department, "Municipal Corporation - General Grievances"),
    priority: PRIORITIES.includes(priority) ? priority : "Medium",
    required_documents: Array.isArray(value.required_documents)
      ? value.required_documents.filter((d): d is string => typeof d === "string").slice(0, 8)
      : [],
    resolution_estimate: str(value.resolution_estimate, "7-15 working days"),
    complaint_letter: str(value.complaint_letter, ""),
  };
}

export async function requestComplaintDraft(userContent: string): Promise<ComplaintDraft> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI service is not configured.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "openai/gpt-5.6-sol",
      reasoning_effort: "none",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: COMPLAINT_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (response.status === 429) {
    throw new Error("The AI assistant is busy right now. Please try again in a moment.");
  }
  if (response.status === 402) {
    throw new Error("AI credits are exhausted. Please add credits to continue.");
  }
  if (!response.ok) {
    const detail = await response.text();
    console.error("AI gateway error", response.status, detail);
    throw new Error("The AI assistant could not process this report.");
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The AI assistant returned an unreadable response.");
    parsed = JSON.parse(match[0]);
  }

  return normalizeDraft(parsed);
}

export function buildUserContent(input: {
  description: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hasImage?: boolean;
}): string {
  const parts = [`Citizen's description of the issue:\n"""${input.description}"""`];
  if (input.address) parts.push(`Reported address: ${input.address}`);
  if (input.latitude != null && input.longitude != null) {
    parts.push(`GPS coordinates: ${input.latitude.toFixed(6)}, ${input.longitude.toFixed(6)}`);
  }
  if (input.hasImage) parts.push("The citizen attached a photograph as evidence.");
  parts.push(
    "Write the formal complaint letter addressed to the responsible department, referencing the location and evidence where available.",
  );
  return parts.join("\n\n");
}
