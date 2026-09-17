import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "error" }> = {
  APPLIED: { label: "Applied", tone: "neutral" },
  SCREENING: { label: "In screening", tone: "accent" },
  SHORTLISTED: { label: "Shortlisted", tone: "accent" },
  INTERVIEW: { label: "Interview", tone: "warning" },
  ASSESSMENT: { label: "Assessment", tone: "warning" },
  OFFER: { label: "Offer extended", tone: "success" },
  HIRED: { label: "Hired", tone: "success" },
  REJECTED: { label: "Not selected", tone: "error" },
  WITHDRAWN: { label: "Withdrawn", tone: "neutral" },
};

export function ApplicationStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
