import * as mqtt from "mqtt";
import { HttpsProxyAgent } from "https-proxy-agent";

/**
 * 这是一个 MQTT 发布端模拟程序（模拟真实的硬件传感器）。
 * 传感器通过 Cloudflare 的 WSS (WebSocket Secure) 通道发布数据。
 */

// 为了本地测试方便，这里临时换成了 EMQX 的公共测试 MQTT Broker。
// 等你的 VPS 搭建好后，再换回 "wss://seedingfactory.aisa/mqtt"
const MQTT_BROKER = process.env.MQTT_BROKER || "wss://broker.emqx.io:8084/mqtt"; 
const MQTT_TOPIC = process.env.MQTT_TOPIC || "sensors/test/data"; 
const MQTT_USERNAME = process.env.MQTT_USERNAME || undefined;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || undefined;

console.log(`[🚀 Publisher] 正在通过 WebSocket 连接到 Broker: ${MQTT_BROKER}...`);

// 从终端获取本地的代理设置（通常对于在中国大陆直连偶尔被阻断的 CF 节点很有效）
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

if (proxyAgent) {
  console.log(`[🌐 Proxy] 检测到系统代理: ${proxyUrl}，将尝试通过代理建立 MQTT/WSS 连接`);
}

const client = mqtt.connect(MQTT_BROKER, {
  clientId: `sensor-publisher-${Date.now()}`,
  clean: true,
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  reconnectPeriod: 5000, 
  // 为底层的 ws 连接传递额外参数
  wsOptions: {
    agent: proxyAgent,           // 挂载代理
    rejectUnauthorized: false    // 忽略部分 TLS 证书强校验问题
  }
});

client.on("connect", () => {
  console.log(`[✅ Publisher] 成功连接到 MQTT Broker!`);
  
  setInterval(() => {
    const sensorPayload = {
      temperature: parseFloat((18 + Math.random() * 6).toFixed(1)),
      humidity: parseFloat((70 + Math.random() * 20).toFixed(1)),  
      co2: parseFloat((420 + Math.random() * 260).toFixed(1)),     
      light: parseFloat((Math.random() * 1000).toFixed(1)),        
      timestamp: new Date().toISOString()                           
    };

    const message = JSON.stringify(sensorPayload);

    client.publish(MQTT_TOPIC, message, { qos: 0 }, (err) => {
      if (err) {
        console.error(`[❌ Publisher] 数据发布失败:`, err);
      } else {
        console.log(`[📨 Publisher] 成功发布数据到主题 ${MQTT_TOPIC} ->`, message);
      }
    });

  }, 3000); 
});

client.on("error", (error) => {
  console.error("[❌ Publisher] 连接发生错误:", error.message || error);
});

client.on("offline", () => {
  console.warn("[⚠️ Publisher] 网络离线，正在尝试重新连接...");
});

process.on("SIGINT", () => {
  console.log("\n[Publisher] 正在关闭...");
  client.end(true, () => {
    console.log("[Publisher] 退出。");
    process.exit(0);
  });
});
