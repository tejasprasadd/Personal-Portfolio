import { writeFile, mkdir, readFile } from "node:fs/promises";
await mkdir("dist/server", { recursive: true });
await writeFile("dist/server/index.js", 'export { default } from "./index.mjs";\n');
const pkg = JSON.parse(await readFile("dist/package.json", "utf8").catch(() => "{}"));
await writeFile("dist/package.json", JSON.stringify({ ...pkg, type: "module" }, null, 2));
await mkdir("dist/.openai", { recursive: true });
await writeFile("dist/.openai/hosting.json", await readFile(".openai/hosting.json"));
await mkdir("dist/client", { recursive: true });
await writeFile(
  "dist/client/_headers",
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  Strict-Transport-Security: max-age=31536000; includeSubDomains

/assets/*
  cache-control: public, max-age=31536000, immutable
`,
);
