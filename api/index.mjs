// Vercel serverless function for the whole Leafly API.
//
// Vercel's filename catch-all (api/[...path].mjs) only matched ONE path
// segment here: /api/plants worked but /api/plants/1 and /api/admin/login
// returned Vercel's own NOT_FOUND. So routing is done explicitly in
// vercel.json instead, which rewrites /api/<anything> to this single
// function and carries the original path in the __p query parameter.
import app from "../artifacts/api-server/vercel-dist/handler.mjs";

export default function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const p = url.searchParams.get("__p");

  // When the rewrite supplied the path, rebuild the URL Express should see.
  // When it didn't (direct hit, or Vercel already preserved the path), leave
  // req.url alone — the app is mounted at /api either way.
  if (p !== null) {
    url.searchParams.delete("__p");
    const qs = url.searchParams.toString();
    const clean = p.replace(/^\/+/, "");
    req.url = `/api${clean ? `/${clean}` : ""}${qs ? `?${qs}` : ""}`;
  }

  return app(req, res);
}
