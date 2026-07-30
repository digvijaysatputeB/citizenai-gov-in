import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const GenerateComplaintInput = z.object({
  description: z.string().trim().min(15).max(4000),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  address: z.string().trim().max(400).nullable().optional(),
  imageUrl: z.string().trim().max(1000).nullable().optional(),
  documentUrl: z.string().trim().max(1000).nullable().optional(),
});

export const generateComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateComplaintInput.parse(input))
  .handler(async ({ data, context }) => {
    const { requestComplaintDraft, buildUserContent } = await import("./ai.server");

    const draft = await requestComplaintDraft(
      buildUserContent({
        description: data.description,
        address: data.address ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        hasImage: Boolean(data.imageUrl),
      }),
    );

    const { data: row, error } = await context.supabase
      .from("complaints")
      .insert({
        user_id: context.userId,
        raw_description: data.description,
        title: draft.title,
        category: draft.category,
        department: draft.department,
        priority: draft.priority,
        status: "Pending",
        resolution_estimate: draft.resolution_estimate,
        generated_complaint: draft.complaint_letter,
        required_documents: draft.required_documents,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        address: data.address ?? null,
        image_url: data.imageUrl ?? null,
        document_url: data.documentUrl ?? null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Failed to save complaint", error);
      throw new Error("The report was generated but could not be saved.");
    }

    return row;
  });
