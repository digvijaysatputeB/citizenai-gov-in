import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BellRing, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading, PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import type { Alert } from "@/lib/types";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Government Alerts — Citizen Connect AI" },
      {
        name: "description",
        content:
          "Live civic advisories: water supply interruptions, weather warnings, road closures, health drives and cyber fraud alerts.",
      },
      { property: "og:title", content: "Government Alerts — Citizen Connect AI" },
      {
        property: "og:description",
        content: "Stay ahead of water cuts, weather warnings and public safety advisories.",
      },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Alert[];
    },
  });

  return (
    <PageShell>
      <PageHeading
        icon={<BellRing className="size-5" />}
        title="Government Alerts"
        subtitle="Official advisories currently active in your city."
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(data ?? []).map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Card className="glass-card h-full rounded-2xl border-0 p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold leading-snug">{alert.title}</h2>
                  <Badge variant="outline" className="shrink-0 rounded-full border-primary/30 bg-primary-soft text-primary">
                    {alert.type}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {alert.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" /> {alert.location ?? "City-wide"}
                  <span aria-hidden>•</span>
                  {new Date(alert.created_at).toLocaleDateString()}
                </div>
              </Card>
            </motion.div>
          ))}
          {(data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No active alerts right now.</p>
          )}
        </div>
      )}
    </PageShell>
  );
}
