# 农场边缘端 MQTT 接入文档规范

本文档旨在指导农场的边缘网关或物联网传感器设备，如何将采集到的环境数据安全、稳定地发布到中央服务器。

## 1. 连接协议与鉴权

为了跨越特殊的网络环境并保证通道的安全性，本系统采用 **MQTT over WebSocket Secure (WSS)** 协议。

- **协议**: WSS / MQTT over WebSockets
- **Broker 地址**: `wss://seedingfactory.aisa/mqtt`
- **端口**: `443` (标准 HTTPS/WSS 端口)
- **MQTT 版本**: `MQTT 3.1.1` 或 `MQTT 5.0` 均可

### 1.1 连接参数说明

| 参数名称 | 描述说明 | 必填 | 备注 |
| :--- | :--- | :--- | :--- |
| **ClientId** | 客户端唯一标识符 | 是 | 推荐格式: `farm-sensor-[设备MAC或随机字符串]` |
| **Username** | 连接用户名 | 否 | *(预留)* 目前暂不开启强校验，留空即可 |
| **Password** | 连接密码 | 否 | *(预留)* 目前暂不开启强校验，留空即可 |
| **Clean Session**| 是否清除会话 | 是 | 设置为 `true` (边缘设备断开后不保留在途消息) |
| **Keep Alive** | 心跳时间 | 是 | 推荐 `60` 秒 |

---

## 2. 数据发布 (Publish) 规范

硬件设备采集到传感器数值后，请将数据组装至 JSON 格式，并发布到指定的主题（Topic）。

### 2.1 Topic 定义

- **默认数据上报 Topic**: `sensors/data`
- **单设备独立上报 (推荐)**: `sensors/<设备ID>` (例如: `sensors/device-01`)
  *(服务器订阅了 `sensors/#`，将自动兼容以上所有格式)*

### 2.2 Payload JSON 数据格式

发布的内容（Payload）必须是一个合法的 JSON 字符串。
请参考以下字段说明（无需凑齐所有字段，有哪个发哪个即可）：

| 字段名称 | 数据类型 | 描述 | 示例值 |
| :--- | :--- | :--- | :--- |
| `temperature` | Float/Double | 当前温度 (摄氏度 ℃) | `24.5` |
| `humidity` | Float/Double | 当前相对湿度 (%) | `72.8` |
| `co2` | Float/Double | 二氧化碳浓度 (PPM) | `620.0` |
| `light` | Float/Double | 当前光照强度 (Lux) | `850.5` |
| `timestamp` | String | 数据采集时的标准时间戳 (ISO 8601格式) | `"2026-04-04T15:30:00.000Z"` |

### 2.3 JSON 上报示例

```json
{
  "temperature": 25.1,
  "humidity": 68.5,
  "co2": 450.2,
  "light": 920.0,
  "timestamp": "2026-04-04T15:30:00.000Z"
}
```

### 2.4 发布 QoS (服务质量)建议
- 推荐使用 **`QoS 0`** (最多交付一次) 来发送实时性的温湿度数据。这是因为温湿度数据是周期性发送的，偶尔丢失一帧并不影响业务整体逻辑，可以极大节省边缘设备内存与开销。

---

## 3. Node.js / JavaScript 接入示例参考

如果农场边缘侧使用的是 Node.js 或是基于 Web 技术的网关，可直接参考以下代码片段：

```javascript
const mqtt = require("mqtt");

// 连接配置
const brokerUrl = "wss://seedingfactory.aisa/mqtt";
const client = mqtt.connect(brokerUrl, {
  clientId: "smart-farm-gateway-01",
  clean: true,
  reconnectPeriod: 5000 // 断线自动重连
});

client.on("connect", () => {
  console.log("MQTT Broker 连接成功！");
  
  // 组装数据并发送
  const data = {
    temperature: 24.5,
    humidity: 70.1,
    co2: 500,
    timestamp: new Date().toISOString()
  };
  
  client.publish("sensors/data", JSON.stringify(data), { qos: 0 });
});

client.on("error", (err) => {
  console.error("连接异常: ", err.message);
});
```

