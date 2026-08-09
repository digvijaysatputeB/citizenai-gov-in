import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_complaints",
  title: "List complaints",
  description:
    "List civic complaints visible to the signed-in user (own complaints for citizens, all complaints for officers). Optionally filter by status or category.",
  inputSchema: {
    status: z.string().optional().describe("Filter by status, e.g. Pending, In Progress, Resolved, Rejected."),
    category: z.string().optional().describe("Filter by category, e.g. Road, Water, Garbage."),
    limit: z.number().int().min(1).max(100).optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("complaints")
      .select(
        "id,title,category,department,priority,status,address,resolution_estimate,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (status) query = query.eq("status", status);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { complaints: data ?? [] },
    };
  },
});
