import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AboutSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  ProjectsSection,
  SkillsSection,
} from "@/components/content/Sections";
import { PROFILE, SOCIALS } from "@/data/portfolio";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/resume";
import { ArrowUpRight, Boxes, Download, Github, Linkedin, Mail } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Projects & Experience | B R Tejas Prasad" },
      {
        name: "description",
        content:
          "Text portfolio of B R Tejas Prasad: AI projects including QueANS, RAG Agent, Motion Algo and EduLens, plus work experience, skills, education and resume.",
      },
      { property: "og:title", content: "Portfolio — Projects & Experience | B R Tejas Prasad" },
      {
        property: "og:description",
        content:
          "Browse the projects, experience, skills, education and resume of B R Tejas Prasad, AI-focused Software Engineer in Bengaluru.",
      },
      { property: "og:type", content: "profile" },
      {
        property: "og:url",
        content: "https://tejas-playground.tejasprasad43.chatgpt.site/portfolio",
      },
      {
        property: "og:image",
        content: "https://tejas-playground.tejasprasad43.chatgpt.site/og-preview.jpg",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Portfolio — Projects & Experience | B R Tejas Prasad" },
      {
        name: "twitter:description",
        content:
          "Browse the projects, experience, skills, education and resume of B R Tejas Prasad, AI-focused Software Engineer in Bengaluru.",
      },
      {
        name: "twitter:image",
        content: "https://tejas-playground.tejasprasad43.chatgpt.site/og-preview.jpg",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://tejas-playground.tejasprasad43.chatgpt.site/portfolio",
      },
    ],
  }),

  component: StandardPortfolio,
});

const NAV = [
  ["about", "About"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["skills", "Skills"],
  ["education", "Education"],
  ["contact", "Contact"],
] as const;

function Section({
  id,
  title,
  index,
  children,
}: {
  id: string;
  title: string;
  index: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/60 py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-violet">{index}</p>
      <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function StandardPortfolio() {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-void/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link to="/" className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">
            TEJAS_OS
          </Link>
          <nav aria-label="Sections" className="hidden gap-5 md:flex">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-cyan"
              >
                {label}
              </a>
            ))}
          </nav>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground/85 hover:border-cyan/70 hover:text-cyan"
          >
            <Boxes className="size-3.5" /> 3D world
          </Link>
        </div>
        <details className="portfolio-mobile-menu relative border-t border-border/50 md:hidden">
          <summary className="mx-auto max-w-5xl cursor-pointer px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-cyan">Jump to a section</summary>
          <nav aria-label="Mobile sections" className="absolute left-0 right-0 top-full grid grid-cols-2 gap-1 border-b border-border bg-void p-3 shadow-xl">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")} className="rounded px-3 py-2.5 font-mono text-xs text-foreground/85 hover:bg-primary/20 hover:text-cyan">{label}</a>
            ))}
          </nav>
        </details>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-5 pb-24">
        <section className="dotted-grid scanlines relative overflow-hidden rounded-lg border border-border/70 px-6 py-16 sm:px-10 sm:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan">
            {PROFILE.location}
          </p>
          <h1 className="mt-4 font-sans text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl">
            {PROFILE.name}
          </h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-[0.2em] text-violet">
            AI engineering · Full-stack engineering
          </p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-foreground/85">{PROFILE.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              download={RESUME_FILENAME}
              className="neon-border inline-flex items-center gap-2 rounded-md bg-primary/25 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-foreground hover:bg-primary/40"
            >
              <Download className="size-4" /> Resume
            </a>
            <a
              href={SOCIALS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest hover:border-cyan/70 hover:text-cyan"
            >
              <Github className="size-4" /> GitHub
            </a>
            <a
              href={SOCIALS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest hover:border-cyan/70 hover:text-cyan"
            >
              <Linkedin className="size-4" /> LinkedIn
            </a>
            <a
              href={`mailto:${SOCIALS.email}`}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest hover:border-cyan/70 hover:text-cyan"
            >
              <Mail className="size-4" /> Email
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-cyan">
            <a href="/work/queans" className="inline-flex items-center gap-1 hover:underline">AI engineering case study <ArrowUpRight className="size-3.5" /></a>
            <a href="/work/apex-academy" className="inline-flex items-center gap-1 hover:underline">Full-stack case study <ArrowUpRight className="size-3.5" /></a>
          </div>
        </section>

        <Section id="about" title="About" index="01 / identity">
          <AboutSection />
        </Section>
        <Section id="experience" title="Experience" index="02 / work log">
          <ExperienceSection />
        </Section>
        <Section id="projects" title="Projects" index="03 / archive">
          <article className="mb-4 rounded-lg border border-cyan/40 bg-void/55 p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-cyan">Featured full-stack case study</p>
            <h3 className="mt-2 text-lg font-semibold">Apex Academy platform</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/80">A multi-tenant education management platform with institution-level user and data isolation, authentication, APIs, and a type-safe database model.</p>
            <a href="/work/apex-academy" className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-cyan hover:underline">Read case study <ArrowUpRight className="size-3.5" /></a>
          </article>
          <ProjectsSection />
        </Section>
        <Section id="skills" title="Skills" index="04 / reactor">
          <SkillsSection />
        </Section>
        <Section id="education" title="Education" index="05 / module">
          <EducationSection />
        </Section>
        <Section id="contact" title="Contact" index="06 / comms">
          <ContactSection />
        </Section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          TEJAS_OS — {PROFILE.name}
        </p>
      </footer>
    </div>
  );
}
