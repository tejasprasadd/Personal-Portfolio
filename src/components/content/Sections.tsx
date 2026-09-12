import {
  EDUCATION,
  EXPERIENCE,
  PROFILE,
  PROJECTS,
  SKILL_GROUPS,
  SOCIAL_LINKS,
  type Project,
} from "@/data/portfolio";
import { RESUME_FILENAME, RESUME_URL } from "@/lib/resume";
import { ArrowUpRight, Download, Github, Linkedin, Mail } from "lucide-react";

export const Tag = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <span
    className="rounded-sm border px-2 py-0.5 font-mono text-[11px] tracking-wide"
    style={{
      borderColor: `${color ?? "#8B5CF6"}66`,
      color: color ?? "#C4B5FD",
      background: `${color ?? "#8B5CF6"}14`,
    }}
  >
    {children}
  </span>
);

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan/80">{children}</p>
);

export function AboutSection() {
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-void/70 p-4 font-mono text-[12px] leading-6 text-crt sm:text-[13px]">
        {PROFILE.terminalLines.map((line) => (
          <p key={line} className="break-words">
            {line}
          </p>
        ))}
        <p className="text-crt/70">
          _<span className="caret-blink">|</span>
        </p>
      </div>
      {PROFILE.about.map((p) => (
        <p key={p.slice(0, 24)} className="text-sm leading-7 text-foreground/85">
          {p}
        </p>
      ))}
      <div className="flex flex-wrap gap-2">
        <Tag color="#22D3EE">{PROFILE.location}</Tag>
        <Tag color="#86EFAC">Open to opportunities</Tag>
      </div>
    </div>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>{project.tagline}</SectionLabel>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{project.visual}</p>
      </div>
      {project.pipeline && (
        <div className="flex flex-wrap items-center gap-2">
          {project.pipeline.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span
                className="rounded-sm border px-2 py-1 font-mono text-[11px]"
                style={{
                  borderColor: `${project.color}55`,
                  color: project.color,
                  background: `${project.color}12`,
                }}
              >
                {step}
              </span>
              {i < project.pipeline!.length - 1 && (
                <span className="font-mono text-xs text-muted-foreground">→</span>
              )}
            </span>
          ))}
        </div>
      )}
      {project.description.map((d) => (
        <p key={d.slice(0, 24)} className="text-sm leading-7 text-foreground/85">
          {d}
        </p>
      ))}
      <div>
        <SectionLabel>Tech stack</SectionLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <Tag key={s} color={project.color}>
              {s}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectsSection({ onOpen }: { onOpen?: (id: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PROJECTS.map((p) => (
        <article
          key={p.id}
          className="glass-panel pixel-corners rounded-lg p-5 transition-transform duration-300 hover:-translate-y-1"
          style={{ borderColor: `${p.color}55` }}
        >
          <h3 className="font-sans text-lg font-semibold" style={{ color: p.color }}>
            {p.name}
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {p.tagline}
          </p>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-foreground/80">
            {p.description[0]}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.stack.slice(0, 5).map((s) => (
              <Tag key={s} color={p.color}>
                {s}
              </Tag>
            ))}
          </div>
          {onOpen && (
            <button
              onClick={() => onOpen(p.id)}
              className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-cyan hover:text-glow"
            >
              OPEN MODULE <ArrowUpRight className="size-3.5" />
            </button>
          )}
        </article>
      ))}
    </div>
  );
}

export function ExperienceSection() {
  return (
    <div className="space-y-6">
      {EXPERIENCE.map((e) => (
        <article key={e.company} className="rounded-md border border-border bg-void/50 p-5">
          <h3 className="text-base font-semibold text-foreground">{e.company}</h3>
          <p className="font-mono text-xs text-cyan">{e.role}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {e.location} · {e.period}
          </p>
          <ul className="mt-3 space-y-2">
            {e.points.map((p) => (
              <li key={p.slice(0, 24)} className="flex gap-2 text-sm leading-6 text-foreground/85">
                <span className="mt-2 size-1.5 shrink-0 rounded-none bg-pink" aria-hidden />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function EducationSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {EDUCATION.map((e) => (
        <article key={e.school} className="rounded-md border border-border bg-void/50 p-5">
          <h3 className="text-base font-semibold text-foreground">{e.school}</h3>
          <p className="mt-1 text-sm text-foreground/80">{e.qualification}</p>
          <p className="mt-2 font-mono text-xs text-amber">{e.score}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{e.period}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{e.location}</p>
        </article>
      ))}
    </div>
  );
}

export function SkillsSection() {
  return (
    <div className="space-y-5">
      {SKILL_GROUPS.map((g) => (
        <div key={g.category}>
          <p
            className="font-mono text-[11px] uppercase tracking-[0.25em]"
            style={{ color: g.color }}
          >
            {g.category}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {g.skills.map((s) => (
              <Tag key={s} color={g.color}>
                {s}
              </Tag>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const ICONS = { github: Github, linkedin: Linkedin, email: Mail } as const;

export function SocialSection({ onOpen }: { onOpen?: (label: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SOCIAL_LINKS.map((s) => {
        const Icon = ICONS[s.id];
        const external = s.id === "github" || s.id === "linkedin";
        return (
          <a
            key={s.id}
            href={s.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            onClick={() => onOpen?.(s.label)}
            className="group flex items-center gap-3 rounded-md border border-border bg-void/60 p-4 transition-colors hover:border-cyan/70"
          >
            <Icon className="size-5 text-cyan" aria-hidden />
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </span>
              <span className="block text-sm text-foreground group-hover:text-cyan">{s.value}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

export function ResumeSection() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-7 text-foreground/85">
        Full resume with detailed experience, projects, and skills.
      </p>
      <p className="font-mono text-xs text-muted-foreground">FILE: {RESUME_FILENAME}</p>
      <div className="flex flex-wrap gap-3">
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="neon-border inline-flex items-center gap-2 rounded-md bg-primary/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-primary/35"
        >
          <ArrowUpRight className="size-4" /> View resume
        </a>
        <a
          href={RESUME_URL}
          download={RESUME_FILENAME}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:border-cyan/70"
        >
          <Download className="size-4" /> Download
        </a>
      </div>
    </div>
  );
}

export function ContactSection() {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-7 text-foreground/85">
        Have an interesting AI, full-stack, or product engineering problem? Let's connect.
      </p>
      <SocialSection />
      <ResumeSection />
    </div>
  );
}
