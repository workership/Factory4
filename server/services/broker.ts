import Aedes from "aedes";
import { WebSocketServer, createWebSocketStream } from "ws";
import { Server } from "http";

// 创建全局唯一的 Aedes (MQTT Broker) 实例
export const aedes = new Aedes();

aedes.on("client", (client) => {
  console.log(`[🏭 Broker] 农场设备/客户端已连接: ${client ? client.id : "未知"}`);
});

aedes.on("clientDisconnect", (client) => {
  console.log(`[🏭 Broker] 农场设备/客户端已断开: ${client ? client.id : "未知"}`);
});

aedes.on("publish", (packet, client) => {
  if (client) {
    console.log(`[🏭 Broker] 收到报文 (主题: ${packet.topic})`);
  }
});

/**
 * 将 MQTT Broker 附加到现有的 Express HTTP 服务器上
 */
export function attachMqttBroker(httpServer: Server) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws, req) => {
    // 将普通 Web Socket 升级为双工流供 Aedes 消费
    const stream = createWebSocketStream(ws);
    aedes.handle(stream as any);
  });

  // 拦截 HTTP Upgrade 请求（当 Nginx 或 Cloudflare 把 WSS 请求转发过来时）
  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url === "/mqtt") {
      wss.handleUpgrade(request, socket as any, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  console.log("🌟 [Broker] 内置 MQTT Broker 已成功挂载在 ws://localhost:3000/mqtt 路径下");
}
