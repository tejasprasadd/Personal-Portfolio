import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PROJECTS } from "@/data/portfolio";

export default defineTool({
  name: "list_projects",
  title: "List projects",
  description:
    "List Tejas Prasad's engineering projects with taglines, descriptions, tech stacks and pipelines. Optionally filter by project id or name.",
  inputSchema: {
    query: z
      .string()
      .optional()
      .describe("Optional case-insensitive filter matched against project id, name or stack."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const q = query?.trim().toLowerCase();
    const projects = (
      q
        ? PROJECTS.filter(
            (p) =>
              p.id.includes(q) ||
              p.name.toLowerCase().includes(q) ||
              p.stack.some((s) => s.toLowerCase().includes(q)),
          )
        : PROJECTS
    ).map(({ id, name, tagline, description, stack, pipeline }) => ({
      id,
      name,
      tagline,
      description,
      stack,
      pipeline,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(projects, null, 2) }],
      structuredContent: { projects },
    };
  },
});
