import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sanitizeResponse } from "./middleware/sanitize.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import routes from "./routes/index.js";
import swaggerDoc from "./config/swagger.js";

const app = express();

const isLocalNetworkOrigin = (origin) => {
  if (!origin) return true;
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
  } catch {
    return false;
  }
};

app.use(cors({
  origin: (origin, cb) => {
    if (isLocalNetworkOrigin(origin) || env.FRONTEND_URLS.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeResponse);
app.use(generalLimiter);

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerDoc);
});

app.get("/api-docs", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>SEAPEDIA API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>body{background:#f5f5f5}.swagger-ui .topbar{display:none}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({ url: "/api-docs.json", dom_id: "#swagger-ui", deepLinking: true });
  </script>
</body>
</html>`);
});

app.get("/", (_req, res) => {
  res.json({ message: "SEAPEDIA API", version: "1.0.0", docs: "/api-docs" });
});

app.use("/api", routes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`SEAPEDIA API running on http://localhost:${env.PORT}`);
  console.log(`API Docs: http://localhost:${env.PORT}/api-docs`);
});

export default app;
