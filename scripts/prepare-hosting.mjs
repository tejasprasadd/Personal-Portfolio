import { writeFile, mkdir, readFile } from "node:fs/promises";
await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/index.js", 'export { default } from "./index.mjs";\n');
const pkg = JSON.parse(await readFile("dist/package.json", "utf8").catch(() => "{}"));
await writeFile("dist/package.json", JSON.stringify({ ...pkg, type: "module" }, null, 2));
await mkdir("dist/.openai", { recursive: true });
await writeFile("dist/.openai/hosting.json", await readFile(".openai/hosting.json"));
