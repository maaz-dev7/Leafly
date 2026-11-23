// Vercel serverless function for the Leafly API.
//
// The real handler is a pre-built bundle that lives inside the api-server
// package, so that the few packages which cannot be bundled (nodemailer,
// @google-cloud/*) still resolve from that package's own node_modules.
// Rebuild it with:  node deploy/build-api.mjs
export { default } from "../artifacts/api-server/vercel-dist/handler.mjs";
