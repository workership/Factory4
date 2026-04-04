import { Router } from "express";

const router = Router();

const DOUBAO_API_KEY = "83692209-5668-4f18-8d9e-bce96b5c9a24";
const DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

// 注意：火山引擎（豆包）需要使用 Endpoint ID 作为 model 参数。
// 用户提供的 ID 为 0d032d6e-eade-4c13-b7ef-0188ebb57532
// 如果调用失败，也可以尝试填入控制台显示的最新模型字面量如 'doubao-seed-2-0-pro-260215'
const MODEL_ENDPOINT_ID = process.env.DOUBAO_ENDPOINT_ID || "0d032d6e-eade-4c13-b7ef-0188ebb57532"; 

const SYSTEM_PROMPT = `你是一个农业育秧专家，请以专业、简明、友好的方式回答用户关于育秧、育苗、温室管理、营养调控、病虫害防治等方面的问题。`;

router.post("/", async (req, res) => {
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
    res.json({ reply: reply.trim() });
  } catch (error) {
    console.error("Doubao chat error:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    res.status(500).json({ error: `AI 服务调用失败：${errorMessage}` });
  }
});

export default router;
