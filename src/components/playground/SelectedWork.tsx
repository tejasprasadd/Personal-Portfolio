import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ArrowRight, Github, Linkedin } from "lucide-react";
import { CASE_STUDIES, PROJECTS, PROFILE, SOCIALS } from "@/data/portfolio";
import type { ZoneId } from "@/components/3d/zones";
const apexCase = CASE_STUDIES.find((study) => study.slug === "apex-academy")!;
export function SelectedWork({ onOpen }: { onOpen: (id: ZoneId) => void }) {
  const reduced = useReducedMotion();
  return (
    <main id="work" className="work-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Built with purpose</p>
          <h2>
            A few things
            <br />
            I’ve put into the world.
          </h2>
        </div>
        <p>
          AI systems, useful software, and the
          <br className="desktop-only" /> occasional detour into the unexpected.
        </p>
      </div>
      <article className="case-study-spotlight">
        <div>
          <p className="eyebrow">Full-stack field note</p>
          <h3>{apexCase.title}</h3>
          <p>{apexCase.summary}</p>
        </div>
        <a href="/work/apex-academy">
          Read the case study <ArrowUpRight size={17} />
        </a>
      </article>
      <div className="project-grid">
        {PROJECTS.map((project, i) => (
          <motion.article
            key={project.id}
            className={`project-card project-${project.id}`}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
          >
            <button className="project-preview" onClick={() => onOpen(project.id as ZoneId)} aria-label={`Explore ${project.name} in the island` }>
            <div className="project-art" aria-hidden="true">
              {project.id === "queans" ? (
                <div className="paper-stack">
                  <span />
                  <span />
                  <span>
                    <b>Q.</b>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              ) : project.id === "motion" ? (
                <div className="path-art">
                  <span />
                  <b>↗</b>
                  <i />
                  <i />
                </div>
              ) : project.id === "rag" ? (
                <div className="nodes-art">
                  <span>PDF</span>
                  <b>↔</b>
                  <span>AI</span>
                  <i>Ask. Find. Understand.</i>
                </div>
              ) : (
                <div className="chart-art">
                  {[32, 55, 42, 78, 65, 95].map((h, i) => (
                    <span key={i} style={{ height: `${h}%` }} />
                  ))}
                </div>
              )}
              <span className="project-open">
                <ArrowUpRight size={20} />
              </span>
            </div>
            <div className="project-caption">
              <p className="eyebrow">{project.tagline}</p>
              <h3>{project.id === "rag" ? "Conversational RAG Agent" : project.name}</h3>
              <p>{project.stack.slice(0, 3).join(" / ")}</p>
            </div>
            </button>
            <div className="project-links">
              <a href={`/work/${project.id}`}>{project.id === "queans" ? "Read case study" : "Project details"} <ArrowRight size={14} /></a>
              {project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">Source code <ArrowUpRight size={14} /></a>}
              {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Live demo <ArrowUpRight size={14} /></a>}
            </div>
          </motion.article>
        ))}
      </div>
      <section className="about-strip">
        <span className="about-mark" aria-hidden="true">
          t<span>p</span>.
        </span>
        <div>
          <p className="eyebrow">The person behind the wheel</p>
          <h2>Hi, I’m Tejas.</h2>
          <p>
            {PROFILE.intro.replace("Hi, I'm Tejas — an", "An")} I’m based in Bengaluru, and I like
            making complex things feel simple.
          </p>
          <button className="text-link" onClick={() => onOpen("about")}>
            A little more about me <ArrowRight size={16} />
          </button>
        </div>
        <div className="about-links">
          <button onClick={() => onOpen("experience")}>
            Experience <ArrowUpRight size={18} />
          </button>
          <button onClick={() => onOpen("skills")}>
            My toolkit <ArrowUpRight size={18} />
          </button>
          <button onClick={() => onOpen("education")}>
            Education <ArrowUpRight size={18} />
          </button>
        </div>
      </section>
      <footer className="playground-footer">
        <div>
          <p className="eyebrow">Have something in mind?</p>
          <a href={`mailto:${SOCIALS.email}`}>
            Let’s make it happen. <ArrowUpRight />
          </a>
        </div>
        <div className="footer-socials">
          <a href={SOCIALS.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <Github size={21} />
          </a>
          <a href={SOCIALS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <Linkedin size={21} />
          </a>
        </div>
        <p>© {new Date().getFullYear()} B R Tejas Prasad · Made for the curious.</p>
      </footer>
    </main>
  );
}
