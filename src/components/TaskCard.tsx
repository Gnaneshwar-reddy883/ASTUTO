import { useState } from "react";
import { Check, Clock3, ExternalLink } from "lucide-react";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
  const [showTags, setShowTags] = useState(false);

  return (
    <article
      className={`rounded-card border border-border bg-surface p-4 transition-colors sm:p-5 ${
        task.completed ? "bg-progress/40" : ""
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
            task.completed
              ? "border-progress-strong bg-progress-strong text-surface"
              : "border-border bg-surface hover:border-progress-strong"
          }`}
        >
          {task.completed && <Check size={14} strokeWidth={2.5} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs font-semibold text-muted">{task.timeLabel}</span>
            {task.optional && (
              <span className="rounded-pill bg-lavender px-2 py-0.5 text-[11px] font-medium">Optional</span>
            )}
            {task.completed && (
              <span className="rounded-pill bg-progress px-2 py-0.5 text-[11px] font-medium text-progress-strong">
                Done
              </span>
            )}
          </div>
          <h3 className={`text-[15px] font-semibold leading-snug tracking-[-0.02em] ${task.completed ? "text-muted line-through decoration-border" : ""}`}>
            {task.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted">{task.source}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Clock3 size={14} />
              {task.estimatedMinutes} min
            </span>
            {task.tags.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTags((value) => !value)}
                aria-expanded={showTags}
                className="rounded-pill border border-border px-2.5 py-1 text-xs text-muted hover:bg-bg"
              >
                {showTags ? "Hide focus" : `${task.tags.length} focus ${task.tags.length === 1 ? "point" : "points"}`}
              </button>
            )}
            <a
              href={task.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold text-text hover:bg-bg"
            >
              Open <ExternalLink size={13} />
            </a>
          </div>
          {showTags && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Focus points">
              {task.tags.map((tag) => (
                <li key={tag} className="rounded-pill bg-bg px-2.5 py-1 text-xs text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
