import * as mqtt from "mqtt";
import { HttpsProxyAgent } from "https-proxy-agent";
import { sensorData } from "../state";

// 为了方便本地测试，默认改为了 EMQX 的公共测试 MQTT Broker。
// 等你部署到 VPS 后，可以通过环境变量设置 MQTT_BROKER 为你的真实地址 (比如 wss://seedingfactory.aisa/mqtt )
export const MQTT_BROKER = process.env.MQTT_BROKER || "wss://broker.emqx.io:8084/mqtt";

export function initMqtt() {
  const MQTT_TOPIC = process.env.MQTT_TOPIC || "sensors/#";
  const MQTT_USERNAME = process.env.MQTT_USERNAME || undefined;
  const MQTT_PASSWORD = process.env.MQTT_PASSWORD || undefined;

  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

  const mqttClient = mqtt.connect(MQTT_BROKER, {
    clientId: `factory-server-${Date.now()}`,
    clean: true,
    reconnectPeriod: 5000,
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    wsOptions: {
      agent: proxyAgent,
      rejectUnauthorized: false
    }
  });

  mqttClient.on("connect", () => {
    console.log(`✅ Connected to MQTT broker: ${MQTT_BROKER}`);
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error("❌ MQTT subscribe failed:", err.message);
      } else {
        console.log(`📡 Subscribed to ${MQTT_TOPIC}`);
      }
    });
  });

  mqttClient.on("message", (topic, message) => {
    const payload = message.toString();
    console.log(`📨 [MQTT] ${topic}: ${payload}`);
    try {
      const data = JSON.parse(payload);
      if (typeof data === "object" && data !== null) {
        Object.assign(sensorData, data);
      } else {
        const key = topic.split("/").pop() || topic;
        sensorData[key] = payload;
      }
    } catch {
      const key = topic.split("/").pop() || topic;
      sensorData[key] = payload;
    }
    sensorData.lastUpdate = new Date().toISOString();
  });

  mqttClient.on("error", (error) => {
    console.error("❌ MQTT error:", error.message || error);
  });

  mqttClient.on("offline", () => {
    console.warn("⚠️ MQTT offline, retrying...");
  });

  return mqttClient;
}
