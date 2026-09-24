import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listProjectsTool from "./tools/list-projects";
import getResumeTool from "./tools/get-resume";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";
const publicAppUrl = (
  import.meta.env["VITE_PUBLIC_APP_URL"] ??
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://tejas-playground.tejasprasad43.chatgpt.site")
).replace(/\/$/, "");

export default defineMcp({
  name: "tejas-os-interactive",
  title: "Tejas OS Interactive",
  version: "0.1.0",
  instructions:
    "Tools for the TEJAS_OS portfolio of B R Tejas Prasad. Use `get_profile` for identity and links, `list_projects` for engineering projects, and `get_resume` for experience, education and skills.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    resource: `${publicAppUrl}/mcp`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listProjectsTool, getResumeTool] as never,
});
