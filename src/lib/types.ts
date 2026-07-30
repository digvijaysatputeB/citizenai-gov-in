export type Complaint = {
  id: string;
  user_id: string;
  raw_description: string;
  title: string | null;
  category: string | null;
  department: string | null;
  priority: string | null;
  status: string;
  resolution_estimate: string | null;
  generated_complaint: string | null;
  required_documents: string[] | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  image_url: string | null;
  document_url: string | null;
  created_at: string;
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  type: string;
  created_at: string;
};

export type Scheme = {
  id: string;
  title: string;
  description: string;
  eligibility: string | null;
  official_link: string | null;
  created_at: string;
};

export const COMPLAINT_STATUSES = ["Pending", "In Progress", "Resolved", "Rejected"] as const;

export const CATEGORIES = [
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
] as const;

export function osmEmbedUrl(lat: number, lng: number, zoomDelta = 0.006) {
  const bbox = [lng - zoomDelta, lat - zoomDelta, lng + zoomDelta, lat + zoomDelta].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
}
