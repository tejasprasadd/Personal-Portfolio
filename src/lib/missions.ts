import type { ZoneId } from "@/components/3d/zones";

export type MissionId = "ai" | "fullstack";
export type MissionStep = {
  zone: ZoneId;
  title: string;
  objective: string;
  evidence: string;
  challenge?: "confidence-gate" | "tenant-route";
};
export type MissionDefinition = {
  id: MissionId;
  title: string;
  shortTitle: string;
  description: string;
  accent: string;
  stamp: string;
  skills: string[];
  steps: MissionStep[];
};
export type MissionState = {
  version: 1;
  active: { id: MissionId; step: number } | null;
  completed: MissionId[];
};

export const MISSIONS: Record<MissionId, MissionDefinition> = {
  ai: {
    id: "ai",
    title: "AI Engineering Expedition",
    shortTitle: "AI Engineering",
    description:
      "Follow evidence from document extraction to grounded retrieval and reliable delivery.",
    accent: "#4e94a6",
    stamp: "AI FIELD TESTED",
    skills: [
      "Document intelligence",
      "RAG",
      "Workflow orchestration",
      "LLM evaluation",
      "Human review",
    ],
    steps: [
      {
        zone: "queans",
        title: "Gate uncertain AI output",
        objective: "Drive to QueANS and triage three extracted questions.",
        evidence: "Confidence-aware extraction with human review for uncertain results.",
        challenge: "confidence-gate",
      },
      {
        zone: "rag",
        title: "Inspect grounded retrieval",
        objective: "Continue to the RAG Agent station.",
        evidence:
          "Multi-document retrieval using chunking, embeddings, vector search, and conversational context.",
      },
      {
        zone: "experience",
        title: "Connect the work to delivery",
        objective: "Finish at Experience and inspect production-oriented AI work.",
        evidence:
          "AI interview agents, evaluation pipelines, backend services, testing, and production bug fixes.",
      },
    ],
  },
  fullstack: {
    id: "fullstack",
    title: "Full-Stack Systems Expedition",
    shortTitle: "Full-Stack",
    description:
      "Trace a secure product request through UI, services, data, and resilient workflows.",
    accent: "#c1714f",
    stamp: "SYSTEMS TRAIL COMPLETE",
    skills: [
      "React and Next.js",
      "REST APIs",
      "Authentication",
      "Tenant isolation",
      "PostgreSQL",
      "Testing",
    ],
    steps: [
      {
        zone: "experience",
        title: "Protect a tenant request",
        objective: "Drive to Experience and choose the safe request path.",
        evidence:
          "Authenticated multi-tenant applications with backend-enforced organization isolation.",
        challenge: "tenant-route",
      },
      {
        zone: "skills",
        title: "Inspect the implementation stack",
        objective: "Continue to the Skills reactor.",
        evidence:
          "Frontend, backend, database, infrastructure, and testing tools used across delivered systems.",
      },
      {
        zone: "queans",
        title: "Trace an end-to-end product",
        objective: "Finish at QueANS and inspect its complete application pipeline.",
        evidence:
          "TypeScript APIs, PostgreSQL, durable workflows, object storage, AI processing, and review UI.",
      },
    ],
  },
};

export const EMPTY_MISSION_STATE: MissionState = { version: 1, active: null, completed: [] };

export function parseMissionState(raw: string | null): MissionState {
  if (!raw) return EMPTY_MISSION_STATE;
  try {
    const value = JSON.parse(raw) as Partial<MissionState>;
    const completed = Array.isArray(value.completed)
      ? value.completed.filter((id): id is MissionId => id === "ai" || id === "fullstack")
      : [];
    const active = value.active;
    if (
      value.version !== 1 ||
      (active &&
        ((active.id !== "ai" && active.id !== "fullstack") ||
          !Number.isInteger(active.step) ||
          active.step < 0 ||
          active.step >= MISSIONS[active.id].steps.length))
    ) {
      return { ...EMPTY_MISSION_STATE, completed };
    }
    return { version: 1, active: active ?? null, completed: [...new Set(completed)] };
  } catch {
    return EMPTY_MISSION_STATE;
  }
}

export function advanceMission(state: MissionState, zone: ZoneId): MissionState {
  if (!state.active) return state;
  const mission = MISSIONS[state.active.id];
  if (mission.steps[state.active.step]?.zone !== zone) return state;
  if (state.active.step < mission.steps.length - 1) {
    return { ...state, active: { ...state.active, step: state.active.step + 1 } };
  }
  return {
    version: 1,
    active: null,
    completed: state.completed.includes(mission.id)
      ? state.completed
      : [...state.completed, mission.id],
  };
}
