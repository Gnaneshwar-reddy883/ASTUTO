import { Sparkles } from "lucide-react";

interface MotivationCardProps {
  completedCount: number;
  totalCount: number;
}

export function MotivationCard({ completedCount, totalCount }: MotivationCardProps) {
  const message =
    completedCount === 0
      ? "Start small. One focused session is enough to get your rhythm going."
      : completedCount >= totalCount
        ? "You did what you came to do today. Let that be enough."
        : "You don’t need a perfect day. Just the next small step.";

  return (
    <section className="rounded-card border border-border bg-lavender p-5" aria-label="A note for today">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <Sparkles size={15} />
        A note for today
      </div>
      <p className="text-[15px] font-medium leading-relaxed tracking-[-0.01em]">{message}</p>
      <p className="mt-3 text-xs text-muted">Your pace is allowed to be human.</p>
    </section>
  );
}
