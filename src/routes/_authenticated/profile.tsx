import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { UserRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading, PageShell } from "@/components/page-shell";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Citizen Connect AI" },
      {
        name: "description",
        content: "Manage your Citizen Connect AI contact details and view your account role.",
      },
      { property: "og:title", content: "My Profile — Citizen Connect AI" },
      {
        property: "og:description",
        content: "Keep your contact details up to date for complaint follow-ups.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { session } = useSession();
  const navigate = useNavigate();
  const { profile, role, loading } = useProfile(session?.user?.id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const save = async () => {
    if (!session?.user?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim().slice(0, 120), phone: phone.trim().slice(0, 30) })
      .eq("id", session.user.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    toast.success("Profile updated");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <PageShell>
      <PageHeading
        icon={<UserRound className="size-5" />}
        title="My Profile"
        subtitle="Keep your contact details current so departments can reach you."
      />

      {loading ? (
        <Skeleton className="h-80 max-w-xl rounded-3xl" />
      ) : (
        <Card className="glass-card max-w-xl space-y-5 rounded-3xl border-0 p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-gradient-primary text-lg font-semibold text-primary-foreground">
              {(name || profile?.email || "?").charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-base font-semibold">{name || "Citizen"}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <Badge
              variant="outline"
              className="ml-auto rounded-full border-primary/30 bg-primary-soft text-primary"
            >
              <ShieldCheck className="size-3.5" /> {role === "officer" ? "Officer" : "Citizen"}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              className="rounded-xl bg-background/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={30}
              className="rounded-xl bg-background/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email ?? ""} readOnly className="rounded-xl bg-muted" />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={save} disabled={saving} className="rounded-full px-6">
              {saving && <Loader2 className="size-4 animate-spin" />} Save changes
            </Button>
            <Button variant="outline" onClick={signOut} className="rounded-full">
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
