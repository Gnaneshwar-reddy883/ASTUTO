interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-5xl py-8 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        ASTUTO workspace
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
        This route is reserved for the next build step.
      </p>
    </section>
  );
}
