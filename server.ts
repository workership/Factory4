import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import apiRouter from "./server/routes";
import { initMqtt, MQTT_BROKER } from "./server/services/mqtt";
import { initCronJobs } from "./server/services/cron";
import { initDataDirs, rootDir } from "./server/config";

async function startServer() {
  initDataDirs();
  const mqttClient = initMqtt();
  initCronJobs();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.use("/api", apiRouter);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(rootDir, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(rootDir, "dist", "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔌 MQTT broker: ${MQTT_BROKER}`);
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    mqttClient.end(true, () => {
      console.log("MQTT client closed");
    });
    server.close(() => {
      console.log("Web server closed");
      process.exit(0);
    });
  });
}

startServer();
