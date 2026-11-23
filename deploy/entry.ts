// Source entry for the Vercel serverless function.
// Bundled by deploy/build-api.mjs into api/[...path].mjs so that Vercel never
// has to compile this project's TypeScript (it uses moduleResolution "bundler"
// plus a "workspace" export condition that Vercel's compiler does not honour).
import app from "../artifacts/api-server/src/app";

export default app;
