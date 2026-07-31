import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { PageHeading, PageShell } from "@/components/page-shell";
import { EmergencyContactGrid } from "@/components/emergency-contacts";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Contacts — Citizen Connect AI" },
      {
        name: "description",
        content:
          "One-tap access to police, ambulance, fire, women and child helplines, cyber crime and citizen support numbers with instant call and copy.",
      },
      { property: "og:title", content: "Emergency Contacts — Citizen Connect AI" },
      {
        property: "og:description",
        content: "Direct call and copy access to every essential public emergency helpline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { t } = useI18n();
  return (
    <PageShell>
      <PageHeading
        icon={<LifeBuoy className="size-5" />}
        title={t("emergency.title")}
        subtitle={t("emergency.subtitle")}
      />
      <EmergencyContactGrid />
    </PageShell>
  );
}
