import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityStyles: Record<string, string> = {
  Low: "bg-muted text-muted-foreground border-transparent",
  Medium: "bg-info/15 text-info border-info/30",
  High: "bg-warning/20 text-warning-foreground border-warning/40",
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
};

const statusStyles: Record<string, string> = {
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  "In Progress": "bg-info/15 text-info border-info/30",
  Resolved: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

export function PriorityBadge({ priority }: { priority: string | null }) {
  const value = priority ?? "Medium";
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", priorityStyles[value])}>
      {value}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string | null }) {
  const value = status ?? "Pending";
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", statusStyles[value])}>
      {value}
    </Badge>
  );
}

export const STATUS_STEPS = ["Pending", "In Progress", "Resolved"] as const;
