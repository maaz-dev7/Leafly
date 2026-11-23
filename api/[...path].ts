// Vercel serverless entry for the Leafly API.
//
// The Express app is exported separately from the `app.listen()` call in
// artifacts/api-server/src/index.ts, so it can be reused here unchanged.
// A catch-all route ([...path]) is used so req.url keeps the full original
// path (/api/plants, /api/admin/login, ...), which is what the app's
// `app.use("/api", router)` mount expects.
import app from "../artifacts/api-server/src/app";

export default app;
