import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listComplaints from "./tools/list-complaints";
import getComplaint from "./tools/get-complaint";
import createComplaint from "./tools/create-complaint";
import updateComplaintStatus from "./tools/update-complaint-status";
import listAlerts from "./tools/list-alerts";
import listSchemes from "./tools/list-schemes";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "citizen-connect-ai",
  title: "Citizen Connect AI",
  version: "0.1.0",
  instructions:
    "Tools for Citizen Connect AI, a civic complaint platform. File and track public service complaints, read government alerts and welfare schemes. Officers can also update complaint status. All access is scoped to the signed-in user's permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listComplaints, getComplaint, createComplaint, updateComplaintStatus, listAlerts, listSchemes],
});
