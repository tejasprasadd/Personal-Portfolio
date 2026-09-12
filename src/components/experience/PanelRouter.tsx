import { HoloPanel } from "@/components/ui/HoloPanel";
import {
  AboutSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  ProjectDetail,
  ResumeSection,
  SkillsSection,
  SocialSection,
} from "@/components/content/Sections";
import { PROJECTS } from "@/data/portfolio";
import { ZONES, type ZoneId } from "@/components/3d/zones";

export function PanelRouter({
  zone,
  onClose,
  onSocial,
}: {
  zone: ZoneId;
  onClose: () => void;
  onSocial: (label: string) => void;
}) {
  const meta = ZONES.find((z) => z.id === zone)!;
  const project = PROJECTS.find((p) => p.id === zone);

  let body: React.ReactNode = null;
  let title = meta.label;
  let subtitle = meta.sub;

  if (project) {
    title = project.name;
    subtitle = project.tagline;
    body = <ProjectDetail project={project} />;
  } else if (zone === "about") {
    title = "IDENTITY / ABOUT";
    subtitle = "system log";
    body = <AboutSection />;
  } else if (zone === "experience") {
    title = "EXPERIENCE CONSOLE";
    subtitle = "work history";
    body = <ExperienceSection />;
  } else if (zone === "education") {
    title = "EDUCATION MODULE";
    subtitle = "academic record";
    body = <EducationSection />;
  } else if (zone === "skills") {
    title = "SKILLS REACTOR";
    subtitle = "technical stack";
    body = <SkillsSection />;
  } else if (zone === "social") {
    title = "SOCIAL TOWER";
    subtitle = "open a channel";
    body = <SocialSection onOpen={onSocial} />;
  } else if (zone === "resume") {
    title = "ACCESS RESUME";
    subtitle = "document terminal";
    body = <ResumeSection />;
  } else if (zone === "contact") {
    title = "OPEN COMMUNICATION CHANNEL";
    subtitle = "contact portal";
    body = <ContactSection />;
  }

  return (
    <HoloPanel title={title} subtitle={subtitle} accent={meta.color} onClose={onClose}>
      {body}
    </HoloPanel>
  );
}
