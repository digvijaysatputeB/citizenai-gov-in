import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  Bot,
  Building2,
  Droplets,
  Gavel,
  Landmark,
  MapPinned,
  ShieldAlert,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import heroImage from "@/assets/hero-civic.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Citizen Connect AI — Your AI-Powered Public Service Assistant" },
      {
        name: "description",
        content:
          "Describe any civic issue in plain words. Citizen Connect AI writes the formal complaint, routes it to the right department and tracks it to resolution.",
      },
      { property: "og:title", content: "Citizen Connect AI" },
      {
        property: "og:description",
        content:
          "Report civic issues, track complaints, and browse government alerts and schemes — powered by AI.",
      },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: ShieldAlert,
    title: "Cyber Crime",
    body: "Report online fraud, phishing and impersonation with an evidence-ready statement for the cyber cell.",
  },
  {
    icon: BellRing,
    title: "Government Alerts",
    body: "Live advisories on water cuts, weather warnings, road closures and public health drives.",
  },
  {
    icon: Landmark,
    title: "Welfare Schemes",
    body: "Discover housing, health, skilling and pension schemes with eligibility explained simply.",
  },
  {
    icon: Droplets,
    title: "Water & Drainage",
    body: "Leakages, contamination and waterlogging routed straight to the municipal utility board.",
  },
  {
    icon: Trash2,
    title: "Sanitation & Garbage",
    body: "Uncollected waste and illegal dumping escalated with photo evidence and geo-tagging.",
  },
  {
    icon: Gavel,
    title: "Corruption & Police",
    body: "Sensitive grievances drafted formally and directed to the correct oversight authority.",
  },
];

const steps = [
  {
    icon: Bot,
    title: "Describe it plainly",
    body: "Type the problem the way you'd tell a neighbour. Attach a photo and pin your location.",
  },
  {
    icon: Sparkles,
    title: "AI drafts the file",
    body: "Six specialised agents classify, prioritise, pick the department and write the formal letter.",
  },
  {
    icon: Timer,
    title: "Track to resolution",
    body: "Follow the status timeline with a realistic resolution estimate until it's closed.",
  },
];

function Index() {
  return (
    <PageShell hero>
      <section className="grid items-center gap-10 pb-16 pt-6 lg:grid-cols-[1.05fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            Your AI-Powered Public Service Assistant
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            AI-Powered <span className="text-gradient-primary">Public Service</span> Assistant
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Stop guessing which office handles your problem. Describe the issue once — Citizen
            Connect AI writes a government-ready complaint, assigns the right department and
            priority, and keeps you updated until it's resolved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/report">
                Report an issue <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6">
              <Link to="/track">Track my complaints</Link>
            </Button>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              ["13", "Issue categories"],
              ["6", "AI agents"],
              ["24/7", "Always open"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-semibold text-foreground">{value}</dt>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-card overflow-hidden rounded-[2rem] p-2"
        >
          <img
            src={heroImage}
            alt="Citizens using a digital public service assistant in a modern civic centre"
            className="h-[320px] w-full rounded-[1.6rem] object-cover sm:h-[420px]"
          />
        </motion.div>
      </section>

      <section className="pb-16">
        <h2 className="text-2xl font-semibold tracking-tight">What you can raise here</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every report is classified, prioritised and routed automatically.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="glass-card h-full rounded-2xl border-0 p-6 transition-shadow hover:shadow-elevated">
                <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="pb-8">
        <div className="glass-card rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                    <step.icon className="size-4.5" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link to="/report">
                <MapPinned className="size-4" /> Start a report
              </Link>
            </Button>
            <Button asChild variant="ghost" className="rounded-full">
              <Link to="/schemes">
                <Building2 className="size-4" /> Browse schemes
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
