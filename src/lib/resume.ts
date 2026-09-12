export const RESUME_URL = "/AI-Tejas-Resume-July-2026.pdf";
export const RESUME_FILENAME = "AI-Tejas-Resume-July-2026.pdf";

export function openResume() {
  if (typeof window !== "undefined") {
    window.open(RESUME_URL, "_blank", "noopener,noreferrer");
  }
}
