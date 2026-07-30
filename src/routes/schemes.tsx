import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading, PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import type { Scheme } from "@/lib/types";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Government Schemes — Citizen Connect AI" },
      {
        name: "description",
        content:
          "Browse housing, health, skilling, pension and business support schemes with eligibility explained in plain language.",
      },
      { property: "og:title", content: "Government Schemes — Citizen Connect AI" },
      {
        property: "og:description",
        content: "Find welfare schemes you qualify for and apply through official channels.",
      },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["schemes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schemes")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Scheme[];
    },
  });

  return (
    <PageShell>
      <PageHeading
        icon={<Landmark className="size-5" />}
        title="Government Schemes"
        subtitle="Benefits you may be eligible for, with official application links."
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(data ?? []).map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Card className="glass-card flex h-full flex-col rounded-2xl border-0 p-6">
                <h2 className="text-base font-semibold leading-snug">{scheme.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {scheme.description}
                </p>
                {scheme.eligibility && (
                  <div className="mt-4 rounded-xl bg-secondary p-3.5">
                    <p className="flex items-start gap-2 text-xs leading-relaxed text-secondary-foreground">
                      <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>
                        <strong className="font-semibold">Eligibility: </strong>
                        {scheme.eligibility}
                      </span>
                    </p>
                  </div>
                )}
                {scheme.official_link && (
                  <Button asChild variant="ghost" size="sm" className="mt-auto self-start pt-4">
                    <a href={scheme.official_link} target="_blank" rel="noopener noreferrer">
                      Official portal <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
