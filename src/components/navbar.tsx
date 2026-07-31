import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LandPlot, LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useAuth";
import { useI18n, type TKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const links = [
  { to: "/", labelKey: "nav.home" },
  { to: "/report", labelKey: "nav.report" },
  { to: "/track", labelKey: "nav.track" },
  { to: "/alerts", labelKey: "nav.alerts" },
  { to: "/schemes", labelKey: "nav.schemes" },
  { to: "/emergency", labelKey: "nav.emergency" },
] as const;

export function Navbar() {
  const { session } = useSession();
  const { isOfficer } = useProfile(session?.user?.id);
  const { t } = useI18n();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const navItems = [
    ...links,
    ...(isOfficer ? [{ to: "/officer", labelKey: "nav.officer" } as const] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
            <LandPlot className="size-4.5" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Citizen Connect AI</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-primary-soft"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{t(item.labelKey as TKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/profile">{t("nav.profile")}</Link>
              </Button>
              <Button variant="outline" size="icon" aria-label={t("nav.signOut")} onClick={signOut}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">
                <ShieldCheck className="size-4" /> {t("nav.signIn")}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t("nav.menu")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-3 lg:hidden">
          <div className="flex flex-col">
            {[...navItems, { to: "/profile", labelKey: "nav.profile" } as const].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {t(item.labelKey as TKey)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
