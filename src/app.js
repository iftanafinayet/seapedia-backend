import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sanitizeResponse } from "./middleware/sanitize.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import routes from "./routes/index.js";
import swaggerDoc from "./config/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());
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
