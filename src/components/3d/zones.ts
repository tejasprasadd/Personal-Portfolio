export type ZoneId =
  | "about"
  | "queans"
  | "rag"
  | "motion"
  | "edulens"
  | "experience"
  | "education"
  | "skills"
  | "resume"
  | "social"
  | "contact";

export type Zone = {
  id: ZoneId;
  label: string;
  sub: string;
  color: string;
  position: [number, number, number];
};

export const ZONES: Zone[] = [
  { id: "about", label: "THE LAB", sub: "About me", color: "#b47b52", position: [0, 0, -1] },
  { id: "queans", label: "QueANS", sub: "Project", color: "#578c7f", position: [-24, 0, -21] },
  { id: "rag", label: "RAG AGENT", sub: "Project", color: "#728da4", position: [-33, 0, 2] },
  { id: "motion", label: "MOTION ALGO", sub: "Project", color: "#ce795b", position: [-23, 0, 24] },
  { id: "edulens", label: "EduLens", sub: "Project", color: "#b69745", position: [24, 0, 24] },
  {
    id: "experience",
    label: "EXPERIENCE",
    sub: "Experience",
    color: "#708e76",
    position: [34, 0, 6],
  },
  {
    id: "education",
    label: "EDUCATION",
    sub: "Education",
    color: "#a08d67",
    position: [31, 0, -12],
  },
  { id: "skills", label: "SKILLS", sub: "Skills", color: "#558980", position: [18, 0, -28] },
  { id: "resume", label: "RESUME", sub: "Resume", color: "#af985c", position: [0, 0, -34] },
  { id: "social", label: "CONNECT", sub: "Socials", color: "#a6807c", position: [-13, 0, -31] },
  { id: "contact", label: "SAY HELLO", sub: "Contact", color: "#708fa0", position: [10, 0, 34] },
];
export const PLATFORM_RADIUS = 47;
