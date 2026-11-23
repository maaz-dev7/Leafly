// Bundles the Express app into a single ESM file that Vercel serves as a
// serverless function. Mirrors artifacts/api-server/build.mjs, but emits a
// handler (export default app) instead of a server that calls listen().
//
// Re-run after changing any backend code:  node deploy/build-api.mjs
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

globalThis.require = createRequire(import.meta.url);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// esbuild is a dependency of @workspace/api-server, not of the repo root,
// so resolve it from there rather than relying on hoisting.
const requireFromApi = createRequire(path.join(root, "artifacts/api-server/package.json"));
const esbuildMod = await import(pathToFileURL(requireFromApi.resolve("esbuild")).href);
const esbuild = esbuildMod.build ?? esbuildMod.default.build;

await esbuild({
  entryPoints: [path.join(root, "deploy/entry.ts")],
  outfile: path.join(root, "artifacts/api-server/vercel-dist/handler.mjs"),
  platform: "node",
  bundle: true,
  format: "esm",
  minify: false,
  logLevel: "info",
  // Same external list as artifacts/api-server/build.mjs: these packages break
  // when bundled (dynamic requires, path traversal to sibling files, native
  // modules). The output lives inside artifacts/api-server/ so that Node can
  // still resolve them from that package's own node_modules at runtime.
  external: [
    "*.node", "pg-native", "nodemailer", "@google-cloud/*", "@grpc/*",
    "sharp", "better-sqlite3", "sqlite3", "canvas", "bcrypt", "argon2",
    "fsevents", "re2", "bufferutil", "utf-8-validate", "handlebars",
    "protobufjs", "googleapis", "google-auth-library", "lightningcss",
  ],
  banner: {
    js: `import { createRequire as __cr } from 'node:module';
import __p from 'node:path';
import __u from 'node:url';
globalThis.require = __cr(import.meta.url);
globalThis.__filename = __u.fileURLToPath(import.meta.url);
globalThis.__dirname = __p.dirname(globalThis.__filename);`,
  },
});

console.log("built artifacts/api-server/vercel-dist/handler.mjs");
