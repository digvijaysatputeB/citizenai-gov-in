import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ClipboardList, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading, PageShell } from "@/components/page-shell";
import { PriorityBadge, StatusBadge, STATUS_STEPS } from "@/components/status-badges";
import { ReportPreviewCard } from "@/components/report-preview-card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAuth";
import { CATEGORIES, type Complaint } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/track")({
  head: () => ({
    meta: [
      { title: "Track Complaints — Citizen Connect AI" },
      {
        name: "description",
        content:
          "Follow every civic complaint you have filed: status timeline, priority, assigned department and expected resolution.",
      },
      { property: "og:title", content: "Track Complaints — Citizen Connect AI" },
      {
        property: "og:description",
        content: "Your civic complaint dashboard with live status tracking.",
      },
    ],
  }),
  component: TrackPage,
});

export function statusProgress(status: string) {
  if (status === "Resolved") return 100;
  if (status === "In Progress") return 60;
  if (status === "Rejected") return 100;
  return 20;
}

function Timeline({ status }: { status: string }) {
  const activeIndex = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
  return (
    <div className="flex items-center gap-2">
      {STATUS_STEPS.map((step, index) => (
        <div key={step} className="flex flex-1 items-center gap-2">
          <span
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              index <= activeIndex && status !== "Rejected" ? "bg-primary" : "bg-border",
            )}
          />
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">{step}</span>
          {index < STATUS_STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
        </div>
      ))}
    </div>
  );
}

function TrackPage() {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Complaint | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      const matchesTerm =
        !term ||
        [c.title, c.department, c.address, c.raw_description]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term));
      const matchesStatus = status === "all" || c.status === status;
      const matchesCategory = category === "all" || c.category === category;
      return matchesTerm && matchesStatus && matchesCategory;
    });
  }, [data, query, status, category]);

  return (
    <PageShell>
      <PageHeading
        icon={<ClipboardList className="size-5" />}
        title="Track Complaint"
        subtitle="Every report you've filed, with live status and resolution estimates."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, department or address"
            className="rounded-full bg-card/70 pl-9"
            aria-label="Search complaints"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="rounded-full bg-card/70 sm:w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Pending", "In Progress", "Resolved", "Rejected"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-full bg-card/70 sm:w-44" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card rounded-3xl border-0 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No complaints match your filters yet.
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link to="/report">File your first report</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <Card className="glass-card rounded-2xl border-0 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-snug">{complaint.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {complaint.category} • {complaint.department} •{" "}
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={complaint.priority} />
                    <StatusBadge status={complaint.status} />
                  </div>
                </div>

                <Progress value={statusProgress(complaint.status)} className="mt-5 h-1.5" />
                <div className="mt-3">
                  <Timeline status={complaint.status} />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> {complaint.address ?? "Location not provided"}
                  </span>
                  <span>Estimated resolution: {complaint.resolution_estimate ?? "—"}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 px-0"
                  onClick={() =>
                    setSelected((current) => (current?.id === complaint.id ? null : complaint))
                  }
                >
                  {selected?.id === complaint.id ? "Hide official report" : "View official report"}
                </Button>

                {selected?.id === complaint.id && (
                  <div className="mt-5">
                    <ReportPreviewCard complaint={complaint} />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
