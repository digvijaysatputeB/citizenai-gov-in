import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Loader2,
  LocateFixed,
  MessageSquareText,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeading, PageShell } from "@/components/page-shell";
import { ReportPreviewCard } from "@/components/report-preview-card";
import { supabase } from "@/integrations/supabase/client";
import { generateComplaint } from "@/lib/complaints.functions";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { osmEmbedUrl, type Complaint } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/report")({
  head: () => ({
    meta: [
      { title: "Report an Issue — Citizen Connect AI" },
      {
        name: "description",
        content:
          "Describe a civic problem in plain words. The AI assistant classifies it, finds the responsible department and drafts a formal complaint letter.",
      },
      { property: "og:title", content: "Report an Issue — Citizen Connect AI" },
      {
        property: "og:description",
        content: "AI-drafted, government-ready civic complaints in under a minute.",
      },
    ],
  }),
  component: ReportPage,
});

const AGENT_STAGES = [
  "Reading your description…",
  "Classifying the issue category…",
  "Assigning urgency and priority…",
  "Identifying the responsible department…",
  "Estimating a resolution timeline…",
  "Drafting your formal complaint letter…",
];

function ReportPage() {
  const callGenerate = useServerFn(generateComplaint);
  const fileInput = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState<Complaint | null>(null);

  const submitting = stage >= 0;

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { Accept: "application/json" } },
          );
          const json = (await res.json()) as { display_name?: string };
          if (json.display_name) setAddress(json.display_name);
        } catch {
          /* address stays manual */
        }
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Could not read your location. Please enter the address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const uploadImage = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Please choose an image under 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("You must be signed in to upload evidence.");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("complaint-media")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: signed, error: signError } = await supabase.storage
        .from("complaint-media")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signError) throw signError;
      setImageUrl(signed.signedUrl);
      toast.success("Photo attached");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (description.trim().length < 15) {
      toast.error("Please describe the issue in at least 15 characters.");
      return;
    }
    setStage(0);
    const timer = setInterval(() => {
      setStage((s) => (s < AGENT_STAGES.length - 1 ? s + 1 : s));
    }, 1200);

    try {
      const complaint = await callGenerate({
        data: {
          description: description.trim(),
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          address: address.trim() ? address.trim().slice(0, 400) : null,
          imageUrl,
          documentUrl: null,
        },
      });
      setResult(complaint as Complaint);
      toast.success("Complaint filed successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate the report.");
    } finally {
      clearInterval(timer);
      setStage(-1);
    }
  };

  const reset = () => {
    setResult(null);
    setDescription("");
    setAddress("");
    setCoords(null);
    setImageUrl(null);
  };

  return (
    <PageShell>
      <PageHeading
        icon={<MessageSquareText className="size-5" />}
        title="Report an Issue"
        subtitle="Tell us what's wrong. Six AI agents turn it into a formal, department-ready complaint."
      />

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" className="space-y-6">
            <ReportPreviewCard complaint={result} />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="rounded-full" onClick={reset}>
                <RotateCcw className="size-4" /> Report another issue
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Card className="glass-card rounded-3xl border-0 p-6">
              <Label htmlFor="description" className="text-sm font-semibold">
                Describe your issue
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 4000))}
                placeholder="Describe your issue… e.g. The street light outside house no. 42 has been off for two weeks and the road is unsafe at night."
                className="mt-3 min-h-44 resize-y rounded-2xl bg-background/70 text-sm leading-relaxed"
                disabled={submitting}
              />
              <p className="mt-2 text-right text-xs text-muted-foreground">
                {description.length}/4000
              </p>

              <div className="mt-4 space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold">
                  Address / landmark
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value.slice(0, 400))}
                  placeholder="Street, area, city"
                  className="rounded-xl bg-background/70"
                  disabled={submitting}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadImage(file);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading || submitting}
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                  Upload image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={useMyLocation}
                  disabled={locating || submitting}
                >
                  {locating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LocateFixed className="size-4" />
                  )}
                  Use current location
                </Button>
                <Button
                  type="button"
                  className="ml-auto rounded-full px-6"
                  onClick={submit}
                  disabled={submitting || uploading}
                >
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Generate & file report
                </Button>
              </div>

              <AnimatePresence>
                {submitting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="rounded-2xl border border-primary/25 bg-primary-soft/60 p-5">
                      <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles className="size-4 animate-pulse" /> AI agents at work
                      </p>
                      <ul className="mt-3 space-y-2">
                        {AGENT_STAGES.map((label, index) => (
                          <li
                            key={label}
                            className={
                              index <= stage
                                ? "flex items-center gap-2 text-sm text-foreground"
                                : "flex items-center gap-2 text-sm text-muted-foreground/60"
                            }
                          >
                            {index < stage ? (
                              <span className="size-1.5 rounded-full bg-success" />
                            ) : index === stage ? (
                              <Loader2 className="size-3.5 animate-spin text-primary" />
                            ) : (
                              <span className="size-1.5 rounded-full bg-border" />
                            )}
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            <div className="space-y-4">
              {imageUrl && (
                <Card className="glass-card relative overflow-hidden rounded-3xl border-0 p-2">
                  <img
                    src={imageUrl}
                    alt="Attached evidence preview"
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Remove photo"
                    className="absolute right-4 top-4 rounded-full"
                    onClick={() => setImageUrl(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </Card>
              )}
              {coords && (
                <Card className="glass-card overflow-hidden rounded-3xl border-0 p-2">
                  <iframe
                    title="Selected location"
                    className="h-52 w-full rounded-2xl border border-border"
                    src={osmEmbedUrl(coords.lat, coords.lng)}
                  />
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                </Card>
              )}
              <Card className="glass-card rounded-3xl border-0 p-6">
                <h2 className="text-sm font-semibold">What happens next</h2>
                <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <li>1. Your words are analysed and classified into one of 13 civic categories.</li>
                  <li>2. A priority level and responsible department are assigned.</li>
                  <li>3. A formal complaint letter is drafted and saved to your dashboard.</li>
                  <li>4. Track progress any time from “Track Complaint”.</li>
                </ol>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
