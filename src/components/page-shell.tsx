import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";

export function PageShell({
  children,
  hero = false,
}: {
  children: ReactNode;
  hero?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className={hero ? "bg-hero" : undefined}>
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10"
        >
          {children}
        </motion.main>
      </div>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        Citizen Connect AI — Your AI-Powered Public Service Assistant
      </footer>
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start gap-3">
      {icon && (
        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          {icon}
        </span>
      )}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
