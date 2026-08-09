import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_complaint",
  title: "File a complaint",
  description:
    "File a new civic complaint for the signed-in user. Provide the raw description; title, category, department and priority are optional refinements.",
  inputSchema: {
    raw_description: z.string().trim().min(5).describe("The citizen's description of the issue."),
    title: z.string().trim().optional().describe("Short title for the complaint."),
    category: z
      .string()
      .optional()
      .describe(
        "One of: Road, Water, Electricity, Street Lights, Garbage, Drainage, Illegal Construction, Traffic, Cyber Crime, Police, Corruption, Gov Schemes, Other.",
      ),
    department: z.string().optional().describe("Responsible government department."),
    priority: z.string().optional().describe("Low, Medium, High or Critical."),
    address: z.string().optional().describe("Human readable location of the issue."),
    latitude: z.number().optional().describe("Latitude of the issue location."),
    longitude: z.number().optional().describe("Longitude of the issue location."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("complaints")
      .insert({
        user_id: ctx.getUserId(),
        raw_description: input.raw_description,
        title: input.title ?? null,
        category: input.category ?? null,
        department: input.department ?? null,
        priority: input.priority ?? null,
        address: input.address ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      })
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { complaint: data },
    };
  },
});
