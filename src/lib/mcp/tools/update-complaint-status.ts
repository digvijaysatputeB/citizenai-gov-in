import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_complaint_status",
  title: "Update complaint status",
  description:
    "Update the status of a complaint. Only government officers are permitted to do this; citizen accounts are rejected by the database.",
  inputSchema: {
    id: z.string().describe("Complaint id (uuid)."),
    status: z
      .enum(["Pending", "In Progress", "Resolved", "Rejected"])
      .describe("New status for the complaint."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("complaints")
      .update({ status })
      .eq("id", id)
      .select("id,title,status")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return {
        content: [
          { type: "text", text: "No complaint updated — it does not exist or you are not an officer." },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { complaint: data },
    };
  },
});
