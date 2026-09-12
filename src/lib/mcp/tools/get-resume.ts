import { defineTool } from "@lovable.dev/mcp-js";
import { EDUCATION, EXPERIENCE, PROFILE, SKILL_GROUPS } from "@/data/portfolio";

export default defineTool({
  name: "get_resume",
  title: "Get resume",
  description:
    "Get the full resume: work experience, education and skill groups for B R Tejas Prasad.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const resume = {
      name: PROFILE.name,
      role: PROFILE.role,
      location: PROFILE.location,
      experience: EXPERIENCE,
      education: EDUCATION,
      skills: SKILL_GROUPS.map((g) => ({ category: g.category, skills: g.skills })),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(resume, null, 2) }],
      structuredContent: resume,
    };
  },
});
