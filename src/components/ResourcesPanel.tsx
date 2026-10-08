import { ArrowUpRight, Code2, FileText, Play } from "lucide-react";
import type { Resource } from "../types";

interface ResourcesPanelProps {
  resources: Resource[];
}

function ResourceIcon({ kind }: { kind: Resource["kind"] }) {
  if (kind === "GitHub repo") return <Code2 size={17} />;
  if (kind === "YouTube") return <Play size={16} />;
  return <FileText size={17} />;
}

export function ResourcesPanel({ resources }: ResourcesPanelProps) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 sm:p-6" aria-labelledby="resources-title">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Keep it handy</p>
          <h2 id="resources-title" className="mt-1 text-lg font-semibold tracking-[-0.03em]">Resources for today</h2>
        </div>
        <span className="rounded-pill bg-mint px-2.5 py-1 text-xs font-medium">{resources.length} picks</span>
      </div>
      <ul className="divide-y divide-border">
        {resources.map((resource) => (
          <li key={resource.id} className="py-3 first:pt-0 last:pb-0">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 rounded-lg focus-visible:outline"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bg text-text">
                <ResourceIcon kind={resource.kind} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-muted">
                  {resource.source}{resource.duration ? ` · ${resource.duration}` : ""}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-snug group-hover:underline">{resource.title}</span>
              </span>
              <ArrowUpRight size={16} className="mt-1 shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
      {resources.length === 0 && (
        <p className="rounded-xl bg-bg p-4 text-sm text-muted">Your resources will show up here.</p>
      )}
    </section>
  );
}
