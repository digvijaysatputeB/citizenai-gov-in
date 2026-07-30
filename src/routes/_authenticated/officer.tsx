import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Map as MapIcon, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading, PageShell } from "@/components/page-shell";
import { PriorityBadge, StatusBadge } from "@/components/status-badges";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useAuth";
import { COMPLAINT_STATUSES, osmEmbedUrl, type Complaint } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/officer")({
  head: () => ({
    meta: [
      { title: "Officer Dashboard — Citizen Connect AI" },
      {
        name: "description",
        content:
          "Departmental workspace for reviewing, mapping and resolving citizen complaints across the city.",
      },
      { property: "og:title", content: "Officer Dashboard — Citizen Connect AI" },
      {
        property: "og:description",
        content: "Review, map and resolve citizen complaints in one workspace.",
      },
    ],
  }),
  component: OfficerPage,
});

function OfficerPage() {
  const { session } = useSession();
  const { isOfficer, loading: roleLoading } = useProfile(session?.user?.id);
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [focused, setFocused] = useState<Complaint | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["all-complaints"],
    enabled: isOfficer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: string }) => {
      const { error } = await supabase.from("complaints").update({ status: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["all-complaints"] });
    },
    onError: () => toast.error("Could not update status."),
  });

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      const matchesTerm =
        !term ||
        [c.title, c.department, c.category, c.address]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term));
      return matchesTerm && (status === "all" || c.status === status);
    });
  }, [data, query, status]);

  const stats = useMemo(() => {
    const all = data ?? [];
    return [
      { label: "Total", value: all.length },
      { label: "Pending", value: all.filter((c) => c.status === "Pending").length },
      { label: "In Progress", value: all.filter((c) => c.status === "In Progress").length },
      { label: "Critical", value: all.filter((c) => c.priority === "Critical").length },
    ];
  }, [data]);

  const mapTarget = focused ?? (data ?? []).find((c) => c.latitude && c.longitude) ?? null;

  if (roleLoading) {
    return (
      <PageShell>
        <Skeleton className="h-72 rounded-3xl" />
      </PageShell>
    );
  }

  if (!isOfficer) {
    return (
      <PageShell>
        <Card className="glass-card mx-auto max-w-md rounded-3xl border-0 p-10 text-center">
          <ShieldAlert className="mx-auto size-8 text-destructive" />
          <h1 className="mt-4 text-lg font-semibold">Officer access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This workspace is restricted to verified government officers.
          </p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeading
        icon={<MapIcon className="size-5" />}
        title="Officer Dashboard"
        subtitle="All citizen complaints across departments, with live status control."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card rounded-2xl border-0 p-5">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search complaints"
            aria-label="Search complaints"
            className="rounded-full bg-card/70 pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="rounded-full bg-card/70 sm:w-44" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {COMPLAINT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="glass-card overflow-hidden rounded-3xl border-0 p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-40">Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((complaint) => (
                    <TableRow
                      key={complaint.id}
                      onClick={() => setFocused(complaint)}
                      className="cursor-pointer"
                    >
                      <TableCell className="max-w-56">
                        <p className="truncate text-sm font-medium">{complaint.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {complaint.category} • {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {complaint.department}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={complaint.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status} />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={complaint.status}
                          onValueChange={(next) =>
                            updateStatus.mutate({ id: complaint.id, next })
                          }
                        >
                          <SelectTrigger
                            className="h-9 rounded-full"
                            aria-label={`Update status for ${complaint.title}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPLAINT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No complaints match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {updateStatus.isPending && (
            <p className="flex items-center gap-2 border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Saving status…
            </p>
          )}
        </Card>

        <Card className="glass-card h-fit rounded-3xl border-0 p-5">
          <h2 className="text-sm font-semibold">Map view</h2>
          {mapTarget?.latitude && mapTarget?.longitude ? (
            <>
              <iframe
                title="Complaint location map"
                className="mt-3 h-72 w-full rounded-2xl border border-border"
                src={osmEmbedUrl(mapTarget.latitude, mapTarget.longitude)}
              />
              <p className="mt-3 text-sm font-medium">{mapTarget.title}</p>
              <p className="text-xs text-muted-foreground">
                {mapTarget.address ?? "Address not provided"}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Select a complaint with location data to see it on the map.
            </p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
