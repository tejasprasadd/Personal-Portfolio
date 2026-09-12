import { defineTool } from "@lovable.dev/mcp-js";
import { PROFILE, SOCIAL_LINKS } from "@/data/portfolio";

export default defineTool({
  name: "get_profile",
  title: "Get profile",
  description:
    "Get B R Tejas Prasad's professional profile: name, role, location, intro, about and social links.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const profile = {
      name: PROFILE.name,
      role: PROFILE.role,
      subRole: PROFILE.subRole,
      location: PROFILE.location,
      intro: PROFILE.intro,
      about: PROFILE.about,
      socials: SOCIAL_LINKS.map((s) => ({ label: s.label, href: s.href })),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(profile, null, 2) }],
      structuredContent: profile,
    };
  },
});
