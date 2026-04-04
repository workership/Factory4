import { Router } from "express";
import { logAI } from "../services/logger";

const router = Router();

const DOUBAO_API_KEY = "83692209-5668-4f18-8d9e-bce96b5c9a24";
const DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

// 注意：火山引擎（豆包）需要使用 Endpoint ID 作为 model 参数。
// 经测试，UUID 连接报错，已直接替换为你在截图中使用的可用字面量模型名。
const MODEL_ENDPOINT_ID = process.env.DOUBAO_ENDPOINT_ID || "doubao-seed-2-0-pro-260215"; 

// 系统预设 Persona Prompt：强化寒地水稻农业育秧专家人设
const SYSTEM_PROMPT = `你是本系统专属的「寒地水稻数字孪生工厂AI农业架构师与育秧专家」。
你的核心专长是：寒区水稻（特别是针对东北或高纬度地区）的育苗、工厂化温室管理、营养基质调控及环境胁迫（低温、冷害）预警与防治。

当回答用户问题时，请遵循以下准则：
1. 深入寒地特色：结合寒地水稻生长周期短、对积温敏感、前期抗冷害要求高的特点提供专业建议。
2. 结合工程数据：针对光照、二氧化碳、环境湿度、温度（特别是加温补偿方案）有敏锐的工程学洞察力。
3. 语气专业且精炼：不要说废话，以高级农业工程师或研究员的身份解答，必要时用数据或指标辅助，态度友好但不过分活泼，体现严谨的农业科学素养。`;

router.post("/", async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim()
               || req.socket.remoteAddress
               || "unknown";
  const { content, history } = req.body;
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "缺少聊天内容" });
  }

  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT }
  ];

  if (Array.isArray(history) && history.length > 0) {
    history.forEach((item: any) => {
      messages.push({
        role: item.role === "assistant" || item.role === "system" ? "assistant" : "user",
        content: item.content
      });
    });
  }
  
  messages.push({ role: "user", content });

  try {
    const response = await fetch(DOUBAO_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DOUBAO_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ENDPOINT_ID,
        messages: messages,
        temperature: 0.3,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Doubao API error:", errorText);
      return res.status(response.status).json({ error: `API 请求失败 (${response.status}): ${errorText}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "抱歉，未能获得有效回答。";
    // 写入 AI 问答日志
    logAI(clientIp, content, reply.trim());
    res.json({ reply: reply.trim() });
  } catch (error) {
    console.error("Doubao chat error:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    res.status(500).json({ error: `AI 服务调用失败：${errorMessage}` });
  }
});

export default router;
