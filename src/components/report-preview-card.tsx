import { motion } from "framer-motion";
import { Building2, CalendarClock, FileText, MapPin, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge, StatusBadge } from "@/components/status-badges";
import { osmEmbedUrl, type Complaint } from "@/lib/types";

export function ReportPreviewCard({ complaint }: { complaint: Complaint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="glass-card overflow-hidden rounded-3xl border-0">
        <CardHeader className="gap-3 border-b border-border/60 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Official Report Preview
            </span>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
          <CardTitle className="text-xl leading-snug">{complaint.title}</CardTitle>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" /> {complaint.department}
            </span>
            <span className="flex items-center gap-2">
              <FileText className="size-4 shrink-0" /> {complaint.category}
            </span>
            <span className="flex items-center gap-2">
              <CalendarClock className="size-4 shrink-0" /> ETA:{" "}
              {complaint.resolution_estimate ?? "—"}
            </span>
            {complaint.address && (
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" /> {complaint.address}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <article className="whitespace-pre-wrap rounded-2xl bg-muted/60 p-5 text-sm leading-relaxed text-foreground">
            {complaint.generated_complaint}
          </article>

          {complaint.required_documents && complaint.required_documents.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Paperclip className="size-4" /> Documents you should keep ready
              </h3>
              <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                {complaint.required_documents.map((doc) => (
                  <li key={doc} className="rounded-lg bg-secondary px-3 py-2">
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(complaint.image_url || complaint.latitude != null) && <Separator />}

          <div className="grid gap-4 sm:grid-cols-2">
            {complaint.image_url && (
              <img
                src={complaint.image_url}
                alt={`Evidence photo for ${complaint.title ?? "the reported issue"}`}
                className="h-52 w-full rounded-2xl object-cover"
                loading="lazy"
              />
            )}
            {complaint.latitude != null && complaint.longitude != null && (
              <iframe
                title="Issue location map"
                className="h-52 w-full rounded-2xl border border-border"
                src={osmEmbedUrl(complaint.latitude, complaint.longitude)}
                loading="lazy"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
