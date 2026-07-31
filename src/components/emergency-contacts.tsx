import { useState } from "react";
import { motion } from "framer-motion";
import {
  Ambulance,
  Baby,
  Check,
  Copy,
  Flame,
  Headset,
  LifeBuoy,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type EmergencyContact = {
  id: string;
  icon: LucideIcon;
  nameKey: TKey;
  descKey: TKey;
  number: string;
  email?: string;
  tone: "critical" | "urgent" | "support";
};

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "unified",
    icon: LifeBuoy,
    nameKey: "emergency.unified",
    descKey: "emergency.unifiedDesc",
    number: "112",
    tone: "critical",
  },
  {
    id: "police",
    icon: ShieldCheck,
    nameKey: "emergency.police",
    descKey: "emergency.policeDesc",
    number: "100",
    tone: "critical",
  },
  {
    id: "ambulance",
    icon: Ambulance,
    nameKey: "emergency.ambulance",
    descKey: "emergency.ambulanceDesc",
    number: "108",
    tone: "critical",
  },
  {
    id: "fire",
    icon: Flame,
    nameKey: "emergency.fire",
    descKey: "emergency.fireDesc",
    number: "101",
    tone: "critical",
  },
  {
    id: "women",
    icon: UserRound,
    nameKey: "emergency.women",
    descKey: "emergency.womenDesc",
    number: "1091",
    tone: "urgent",
  },
  {
    id: "child",
    icon: Baby,
    nameKey: "emergency.child",
    descKey: "emergency.childDesc",
    number: "1098",
    tone: "urgent",
  },
  {
    id: "cyber",
    icon: ShieldAlert,
    nameKey: "emergency.cyber",
    descKey: "emergency.cyberDesc",
    number: "1930",
    email: "cybercrime@gov.in",
    tone: "urgent",
  },
  {
    id: "support",
    icon: Headset,
    nameKey: "emergency.support",
    descKey: "emergency.supportDesc",
    number: "1800-111-555",
    email: "support@citizenconnect.ai",
    tone: "support",
  },
];

const toneStyles: Record<EmergencyContact["tone"], string> = {
  critical: "bg-destructive/10 text-destructive",
  urgent: "bg-warning/15 text-warning",
  support: "bg-primary-soft text-primary",
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t("emergency.copied"));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={copy}
      className="size-8 rounded-full text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

export function EmergencyContactCard({
  contact,
  compact = false,
}: {
  contact: EmergencyContact;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const Icon = contact.icon;

  return (
    <Card
      className={cn(
        "glass-card flex flex-col gap-3 rounded-3xl border-0",
        compact ? "p-4" : "p-5",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", toneStyles[contact.tone])}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{t(contact.nameKey)}</h3>
          {!compact && <p className="mt-1 text-xs text-muted-foreground">{t(contact.descKey)}</p>}
        </div>
        <span className="ml-auto shrink-0 text-lg font-semibold tabular-nums tracking-tight">
          {contact.number}
        </span>
      </div>

      <div className="mt-auto flex items-center gap-1.5">
        <Button asChild size="sm" className="flex-1 rounded-full">
          <a href={`tel:${contact.number.replace(/[^\d+]/g, "")}`}>
            <Phone className="size-4" /> {t("emergency.call")}
          </a>
        </Button>
        <CopyButton value={contact.number} label={t("emergency.copy")} />
        {contact.email && (
          <>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={`mailto:${contact.email}`}>{t("emergency.email")}</a>
            </Button>
            <CopyButton value={contact.email} label={contact.email} />
          </>
        )}
      </div>
    </Card>
  );
}

export function EmergencyContactGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {EMERGENCY_CONTACTS.map((contact, index) => (
        <motion.div
          key={contact.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.04 }}
          className="flex"
        >
          <div className="w-full">
            <EmergencyContactCard contact={contact} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
