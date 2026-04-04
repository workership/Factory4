import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import apiRouter from "./server/routes";
import { initMqtt, MQTT_BROKER } from "./server/services/mqtt";
import { initCronJobs } from "./server/services/cron";
import { initDataDirs, rootDir } from "./server/config";
import { attachMqttBroker, aedes } from "./server/services/broker";

async function startServer() {
  initDataDirs();
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

    // 启动 HTTP 服务后，将我们自带的 Aedes MQTT Broker 挂载上去
    attachMqttBroker(server);

    // 挂载完毕后，启动我们自己的订阅端客户端去连接它
    const mqttClient = initMqtt();

    process.on("SIGINT", () => {
      console.log("\nShutting down...");
      mqttClient.end(true, () => {
        console.log("MQTT client closed");
      });
      aedes.close(() => {
        console.log("Aedes Broker closed");
      });
      server.close(() => {
        console.log("Web server closed");
        process.exit(0);
      });
    });
  });
}

startServer();
