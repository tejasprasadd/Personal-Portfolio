import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Github, Mail } from "lucide-react";
import { CASE_STUDIES, PROJECTS, SOCIALS } from "@/data/portfolio";

const SITE = "https://tejas-playground.tejasprasad43.chatgpt.site";

export const Route = createFileRoute("/work/$slug")({
  head: ({ params }) => {
    const study = CASE_STUDIES.find((item) => item.slug === params.slug);
    const project = PROJECTS.find((item) => item.id === params.slug);
    const title = `${study?.title ?? project?.name ?? "Work"} — B R Tejas Prasad`;
    const description = study?.summary ?? project?.description[0] ?? "Selected engineering work by B R Tejas Prasad.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `${SITE}/work/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `${SITE}/work/${params.slug}` }],
    };
  },
  component: WorkDetail,
});

function WorkDetail() {
  const { slug } = Route.useParams();
  const study = CASE_STUDIES.find((item) => item.slug === slug);
  const project = PROJECTS.find((item) => item.id === slug);

  if (!study && !project) {
    return (
      <main className="min-h-screen bg-background px-5 py-24 text-center">
        <h1 className="text-3xl font-semibold">This work page was not found.</h1>
        <Link to="/portfolio" className="mt-6 inline-block text-cyan underline">Browse the portfolio</Link>
      </main>
    );
  }

  const title = study?.title ?? project!.name;
  const summary = study?.summary ?? project!.description[0];
  const area = study?.area ?? project!.tagline;
  const flow = study?.flow ?? project?.pipeline ?? [];
  const stack = study?.stack ?? project!.stack;
  const sourceUrl = study?.sourceUrl ?? project?.sourceUrl;
  const demoUrl = study?.demoUrl ?? project?.demoUrl;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-void/85">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">TEJAS_OS</Link>
          <Link to="/portfolio" className="inline-flex items-center gap-2 font-mono text-xs text-foreground/80 hover:text-cyan">
            <ArrowLeft className="size-4" /> Portfolio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan">Field notes / {area}</p>
        <h1 className="mt-4 max-w-4xl font-sans text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground/80">{summary}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-cyan/60 px-4 py-2.5 font-mono text-xs text-cyan hover:bg-cyan/10"><Github className="size-4" /> View source <ArrowUpRight className="size-3" /></a>}
          {demoUrl && <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-cyan/60 px-4 py-2.5 font-mono text-xs text-cyan hover:bg-cyan/10">Open demo <ArrowUpRight className="size-4" /></a>}
          <a href={`mailto:${SOCIALS.email}`} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-xs hover:border-cyan/60"><Mail className="size-4" /> Discuss this work</a>
        </div>

        {flow.length > 0 && (
          <section aria-labelledby="flow-heading" className="mt-16 rounded-lg border border-border bg-void/50 p-6 sm:p-8">
            <h2 id="flow-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">System flow</h2>
            <ol className="mt-6 flex flex-wrap items-center gap-2">
              {flow.map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="rounded border border-border px-3 py-2 font-mono text-xs text-foreground/85">{step}</span>
                  {index < flow.length - 1 && <span aria-hidden="true" className="text-cyan">→</span>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {study ? (
          <div className="mt-16 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-12">
              <section><h2 className="font-sans text-2xl font-semibold">The problem</h2><p className="mt-4 leading-8 text-foreground/80">{study.problem}</p></section>
              <section><h2 className="font-sans text-2xl font-semibold">What I built</h2><p className="mt-4 leading-8 text-foreground/80">{study.contribution}</p></section>
              <section><h2 className="font-sans text-2xl font-semibold">Engineering decisions</h2><ul className="mt-4 space-y-4">{study.decisions.map((decision) => <li key={decision} className="border-l-2 border-cyan/60 pl-4 leading-7 text-foreground/80">{decision}</li>)}</ul></section>
            </div>
            <aside className="space-y-8">
              <section className="rounded-lg border border-border bg-void/50 p-6"><h2 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Validation and testing</h2><p className="mt-4 text-sm leading-7 text-foreground/80">{study.validation}</p></section>
              <section className="rounded-lg border border-border bg-void/50 p-6"><h2 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Outcome</h2><p className="mt-4 text-sm leading-7 text-foreground/80">{study.outcome}</p></section>
              <section className="rounded-lg border border-border bg-void/50 p-6"><h2 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Tools used</h2><ul className="mt-4 flex flex-wrap gap-2">{stack.map((tool) => <li key={tool} className="rounded border border-border px-2.5 py-1 font-mono text-xs text-foreground/80">{tool}</li>)}</ul></section>
            </aside>
          </div>
        ) : (
          <div className="mt-16 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <section><h2 className="font-sans text-2xl font-semibold">Project overview</h2>{project!.description.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-foreground/80">{paragraph}</p>)}</section>
            <aside className="rounded-lg border border-border bg-void/50 p-6 self-start"><h2 className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Tools used</h2><ul className="mt-4 flex flex-wrap gap-2">{stack.map((tool) => <li key={tool} className="rounded border border-border px-2.5 py-1 font-mono text-xs text-foreground/80">{tool}</li>)}</ul></aside>
          </div>
        )}
        <div className="mt-20 border-t border-border pt-8"><Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-cyan hover:underline"><ArrowLeft className="size-4" /> Back to all work</Link></div>
      </main>
    </div>
  );
}
