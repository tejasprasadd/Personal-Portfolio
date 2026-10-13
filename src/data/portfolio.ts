export type Project = {
  id: string;
  name: string;
  tagline: string;
  color: string;
  description: string[];
  stack: string[];
  pipeline?: string[];
  visual: string;
  sourceUrl?: string;
  demoUrl?: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  area: string;
  summary: string;
  problem: string;
  contribution: string;
  flow: string[];
  decisions: string[];
  validation: string;
  outcome: string;
  stack: string[];
  sourceUrl?: string;
  demoUrl?: string;
};

export type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  period: string;
  points: string[];
};

export type EducationItem = {
  school: string;
  qualification: string;
  score: string;
  period: string;
  location: string;
};

export type SkillGroup = { category: string; color: string; skills: string[] };

export const PROFILE = {
  name: "B R Tejas Prasad",
  role: "AI-focused Software Engineer",
  subRole: "AI-focused Software Engineer & Full-Stack Developer",
  location: "Bengaluru, Karnataka, India",
  intro:
    "Hi, I'm Tejas — an AI-focused Software Engineer building reliable full-stack applications, agentic workflows, and human-in-the-loop AI systems.",
  about: [
    "Hi, I'm Tejas — an AI-focused Software Engineer who enjoys building reliable, scalable, and practical software systems.",
    "My work spans full-stack development, AI agents, LLM-powered applications, document intelligence, RAG systems, workflow orchestration, data platforms, and human-in-the-loop AI systems.",
    "I enjoy translating real business problems into useful engineering solutions.",
  ],
  terminalLines: [
    "> identity.load()",
    '> role = "AI-focused Software Engineer"',
    '> location = "Bengaluru, India"',
    '> interests = ["AI Systems", "Full-Stack Development", "Agentic Workflows", "Developer Experience"]',
    '> status = "Open to opportunities"',
  ],
};

export const SOCIALS = {
  github: "https://github.com/tejasprasadd",
  linkedin: "https://www.linkedin.com/in/b-r-tejas-prasad/",
  email: "tejasprasad43@gmail.com",
};

export const SOCIAL_LINKS = [
  { id: "github", label: "GitHub", value: "tejasprasadd", href: SOCIALS.github },
  { id: "linkedin", label: "LinkedIn", value: "b-r-tejas-prasad", href: SOCIALS.linkedin },
  { id: "email", label: "Email", value: SOCIALS.email, href: `mailto:${SOCIALS.email}` },
] as const;

export const PROJECTS: Project[] = [
  {
    id: "queans",
    name: "QueANS",
    tagline: "AI Document Intelligence Platform",
    color: "#397d70",
    visual:
      "A document-processing machine: PDFs enter one side, structured question cards emerge from the other.",
    description: [
      "Created an end-to-end AI document intelligence platform that transforms educational PDFs into structured question banks using OCR, LLM-based extraction, confidence evaluation, and human-in-the-loop validation.",
      "Designed resilient Temporal workflows for asynchronous orchestration with durable retries, duplicate detection, automated quality gating, and scalable document ingestion for production-ready processing.",
    ],
    stack: [
      "TypeScript",
      "Fastify",
      "Temporal",
      "PostgreSQL",
      "Prisma",
      "Cloudflare R2",
      "Mistral OCR",
      "LLM Evaluation",
    ],
    pipeline: [
      "PDF Upload",
      "OCR",
      "LLM Extraction",
      "Confidence Evaluation",
      "Human Review",
      "Question Bank",
    ],
  },
  {
    id: "motion",
    name: "Motion Algorithm",
    tagline: "Self-Driving Navigation",
    color: "#b76e51",
    visual: "A small retro autonomous vehicle navigating around glowing obstacles.",
    description: [
      "Developed a Virtual Force Field navigation algorithm for autonomous campus vehicles, enabling real-time obstacle detection, collision avoidance, and path planning.",
      "Integrated Arduino-based steering control through serial communication for autonomous vehicle movement.",
    ],
    stack: [
      "Python",
      "Arduino",
      "Serial I/O",
      "Virtual Force Field",
      "Obstacle Avoidance",
      "Path Planning",
    ],
    pipeline: ["Sense", "Force Field", "Avoid", "Plan Path", "Steer"],
    sourceUrl: "https://github.com/tejasprasadd/Motion-Algorithm-EV",
  },
  {
    id: "rag",
    name: "Conversational RAG Multi-PDF Agent Q&A",
    tagline: "Multi-document conversational retrieval",
    color: "#64839b",
    visual:
      "A conversational AI terminal surrounded by floating documents and connected knowledge nodes.",
    description: [
      "Created a Streamlit application that allows users to upload multiple PDFs and ask natural-language questions over their document content.",
      "Implemented text extraction, chunking, semantic search, and conversational retrieval using RAG, LangChain, FAISS, Sentence Transformers, and Ollama, with persistent chat history for multi-turn question answering.",
    ],
    stack: [
      "Python",
      "Streamlit",
      "LangChain",
      "Ollama",
      "FAISS",
      "Sentence Transformers",
      "PyPDF2",
      "RAG",
    ],
    pipeline: ["Upload PDFs", "Chunk", "Embed", "Vector Search", "Answer"],
    sourceUrl: "https://github.com/tejasprasadd/RAG-Multiple-PDF",
  },
  {
    id: "edulens",
    name: "EduLens",
    tagline: "Academic and Placement Analytics",
    color: "#987c3d",
    visual:
      "A retro analytics dashboard with animated charts, student data points, and glowing trend lines.",
    description: [
      "Analyzed academic and placement records of more than 600 students to identify performance trends using machine learning models and interactive visualizations.",
      "Generated actionable insights to support academic planning and placement readiness.",
    ],
    stack: [
      "Python",
      "Pandas",
      "Scikit-learn",
      "Matplotlib",
      "Machine Learning",
      "Data Visualization",
    ],
    pipeline: ["Records", "Clean", "Model", "Visualize", "Insights"],
    sourceUrl: "https://github.com/tejasprasadd/EduLens-RNSIT--Academic-Data-Analytics",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "queans",
    title: "QueANS",
    area: "AI engineering · document intelligence",
    summary: "Turning educational PDFs into question banks with a review step for uncertain AI output.",
    problem:
      "Educational PDFs need to become usable, structured questions. OCR and language model output can be incomplete or uncertain, so the processing flow needs a way to catch questionable results before they enter a question bank.",
    contribution:
      "I created the end-to-end platform and designed the document ingestion and processing workflow, including OCR, LLM extraction, confidence evaluation, duplicate detection, quality gating, and human review.",
    flow: ["PDF upload", "R2 storage", "OCR", "LLM extraction", "Confidence evaluation", "Human review", "Question bank"],
    decisions: [
      "Route low-confidence extraction to human review instead of treating every model response as final.",
      "Use Temporal workflows and durable retries to keep asynchronous document processing resilient.",
      "Detect duplicates and apply quality gates before accepting extracted questions.",
    ],
    validation:
      "Confidence evaluation, duplicate detection, quality gating, and human review check output before questions are accepted. Public automated test coverage and benchmark data are not available.",
    outcome:
      "The platform provides an end-to-end path from educational PDFs to structured question banks. No accuracy or throughput improvement is claimed without a measured benchmark.",
    stack: ["TypeScript", "Fastify", "Temporal", "PostgreSQL", "Prisma", "Cloudflare R2", "Mistral OCR"],
  },
  {
    slug: "apex-academy",
    title: "Apex Academy platform",
    area: "Full-stack engineering · multi-tenant systems",
    summary: "An education management platform designed to serve multiple institutions with isolated users and data.",
    problem:
      "Multiple educational institutions needed to share one product without exposing one organization’s users or data to another.",
    contribution:
      "As a Full Stack Developer Intern, I built the Next.js platform, configured BetterAuth and OAuth2 authentication, developed Hono REST APIs on Supabase, and modeled the database with Drizzle ORM.",
    flow: ["Next.js interface", "BetterAuth / OAuth2", "Hono API", "Organization scope", "Supabase data"],
    decisions: [
      "Keep organization boundaries in the application and data access flow rather than relying on the interface alone.",
      "Use Drizzle ORM to keep database models and application code type aligned.",
    ],
    validation:
      "The documented implementation includes authenticated access and organization-level user and data isolation. A public test suite and client code are not available to inspect.",
    outcome:
      "The platform supports multiple institutions in one application with separated users and data. No institution count or performance result is published.",
    stack: ["Next.js", "TypeScript", "BetterAuth", "OAuth2", "Hono.js", "Supabase", "Drizzle ORM"],
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    company: "Webknot Technologies Pvt. Ltd.",
    role: "Software Developer Intern",
    location: "Bengaluru, Karnataka, India",
    period: "November 2025 – June 2026",
    points: [
      "Engineered candidate-facing and recruiter-facing modules for a D2C recruitment platform using Next.js and TypeScript.",
      "Developed AI interview agents for a recruitment training platform using Python, LangGraph, and OpenAI GPT-4.1.",
      "Designed an automated evaluation pipeline that generated structured feedback reports scoring candidates on tone consistency, content delivery, confidence, and other behavioral parameters.",
      "Built a memory and context taxonomy to persist per-user interview history and context across sessions.",
      "Architected backend services with Spring Boot and FastAPI.",
      "Built REST APIs, PostgreSQL data models, and internal communication layers between backend and AI/LLM inference services.",
      "Resolved critical production bugs and improved system stability.",
      "Implemented unit and integration tests using Jest, React Testing Library, and MSW.",
    ],
  },
  {
    company: "Apex Academy",
    role: "Full Stack Developer Intern",
    location: "Bengaluru, Karnataka, India",
    period: "March 2025 – November 2025",
    points: [
      "Constructed a multi-tenant education management platform using Next.js.",
      "Supported multiple educational institutions on one platform through organization-level data and user isolation.",
      "Configured secure authentication with BetterAuth and OAuth2.",
      "Developed backend REST APIs using Hono.js on Supabase.",
      "Modeled the database schema with Drizzle ORM for end-to-end type safety.",
    ],
  },
];

export const EDUCATION: EducationItem[] = [
  {
    school: "RNS Institute of Technology",
    qualification: "Bachelor of Technology – Computer Science and Engineering",
    score: "CGPA: 8.70",
    period: "December 2022 – May 2026",
    location: "Bengaluru, Karnataka, India",
  },
  {
    school: "BASE PU College",
    qualification: "12th Grade",
    score: "96%",
    period: "June 2020 – March 2022",
    location: "Bengaluru, Karnataka, India",
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "Languages",
    color: "#397d70",
    skills: ["Python", "TypeScript", "JavaScript", "Java", "SQL", "C++", "C"],
  },
  {
    category: "AI and LLM Engineering",
    color: "#64839b",
    skills: [
      "AI Agents",
      "LangGraph",
      "Agentic Workflows",
      "Prompt Engineering",
      "Tool Calling",
      "RAG",
      "LLM Evaluation",
      "Human-in-the-Loop Systems",
      "Memory and Context Management",
      "OpenAI API",
      "MCP",
    ],
  },
  {
    category: "Frameworks and APIs",
    color: "#527c8a",
    skills: [
      "React",
      "Next.js",
      "FastAPI",
      "Fastify",
      "Spring Boot",
      "Hono.js",
      "LangChain",
      "Streamlit",
      "REST APIs",
      "OAuth2",
    ],
  },
  {
    category: "Databases and Infrastructure",
    color: "#b76e51",
    skills: [
      "PostgreSQL",
      "Temporal",
      "Prisma",
      "Drizzle ORM",
      "Supabase",
      "Firebase",
      "Cloudflare R2",
      "Docker",
    ],
  },
  {
    category: "AI and Data Tools",
    color: "#987c3d",
    skills: [
      "OpenAI",
      "Mistral OCR",
      "Ollama",
      "FAISS",
      "Sentence Transformers",
      "Scikit-learn",
      "Pandas",
    ],
  },
  {
    category: "Testing and Developer Tools",
    color: "#608257",
    skills: [
      "Jest",
      "React Testing Library",
      "MSW",
      "Git",
      "Cursor",
      "Codex",
      "Claude Code",
      "Gemini",
      "Postman",
    ],
  },
];

export type AchievementId =
  | "system_booted"
  | "first_contact"
  | "project_explorer"
  | "network_connected"
  | "data_analyst"
  | "ai_architect";

export const ACHIEVEMENTS: { id: AchievementId; label: string; hint: string }[] = [
  { id: "system_booted", label: "SYSTEM BOOTED", hint: "Complete the intro" },
  { id: "first_contact", label: "FIRST CONTACT", hint: "Open the About section" },
  { id: "project_explorer", label: "PROJECT EXPLORER", hint: "Open all project panels" },
  { id: "network_connected", label: "NETWORK CONNECTED", hint: "Open a social link" },
  { id: "data_analyst", label: "DATA ANALYST", hint: "Visit the EduLens module" },
  { id: "ai_architect", label: "AI ARCHITECT", hint: "Visit the QueANS module" },
];
