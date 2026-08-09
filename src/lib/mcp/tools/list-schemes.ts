import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_schemes",
  title: "List government schemes",
  description: "List government welfare schemes with eligibility details and official links.",
  inputSchema: {
    search: z.string().optional().describe("Optional text to match against scheme titles."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("schemes")
      .select("id,title,description,eligibility,official_link,created_at")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (search) query = query.ilike("title", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { schemes: data ?? [] },
    };
  },
});
