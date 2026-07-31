import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LifeBuoy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EMERGENCY_CONTACTS, EmergencyContactCard } from "@/components/emergency-contacts";
import { useI18n } from "@/lib/i18n";

export function EmergencyWidget() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card w-[min(22rem,calc(100vw-2.5rem))] rounded-3xl border-0 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">{t("emergency.title")}</p>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t("emergency.close")}
                className="size-7 rounded-full"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="max-h-[22rem] space-y-2.5 overflow-y-auto pr-1">
              {EMERGENCY_CONTACTS.slice(0, 4).map((contact) => (
                <EmergencyContactCard key={contact.id} contact={contact} compact />
              ))}
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full rounded-full">
              <Link to="/emergency" onClick={() => setOpen(false)}>
                {t("emergency.viewAll")} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        aria-label={t("emergency.open")}
        onClick={() => setOpen((v) => !v)}
        className="relative size-14 rounded-full bg-destructive p-0 text-destructive-foreground shadow-soft hover:bg-destructive/90"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" aria-hidden />
        )}
        <LifeBuoy className="relative size-6" />
      </Button>
    </div>
  );
}
