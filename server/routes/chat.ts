import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { HttpsProxyAgent } from "https-proxy-agent";

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBCVY0eJPCuyXTzjO7XVgDcgqBn7Tup3IM";
const GEMINI_BASE_URL = process.env.GEMINI_NEXT_GEN_API_BASE_URL || process.env.GEMINI_API_BASE_URL || "https://generativelanguage.googleapis.com";
process.env.GEMINI_NEXT_GEN_API_BASE_URL = GEMINI_BASE_URL;

const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
const fetchWithProxy = proxyAgent
  ? (input: RequestInfo | URL, init?: RequestInit & { dispatcher?: unknown }) => globalThis.fetch(input, { ...init, dispatcher: proxyAgent } as any)
  : globalThis.fetch;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY, fetch: proxyAgent ? fetchWithProxy : undefined } as any);

const SYSTEM_PROMPT = `你是一个农业育秧专家，请以专业、简明、友好的方式回答用户关于育秧、育苗、温室管理、营养调控、病虫害防治等方面的问题。`;

router.post("/", async (req, res) => {
  const { content, history } = req.body;
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "缺少聊天内容" });
  }

  let prompt = SYSTEM_PROMPT;
  if (Array.isArray(history) && history.length > 0) {
    const historyText = history
      .map((item: any) => {
        if (item.role === "assistant") return `专家: ${item.content}`;
        if (item.role === "user") return `用户: ${item.content}`;
        return `${item.role}: ${item.content}`;
      })
      .join("\n");
    prompt += `\n\n以下是当前对话历史：\n${historyText}`;
  }
  prompt += `\n\n用户: ${content}\n专家:`;

  try {
    const chat = ai.chats.create({ model: "gemini-1.5-pro", config: { temperature: 0.3, maxOutputTokens: 512 } });
    const response = await chat.sendMessage({ message: prompt });
    res.json({ reply: response.text?.trim() || "抱歉，未能获得有效回答。" });
  } catch (error) {
    console.error("Gemini chat error:", error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    res.status(500).json({ error: `AI 服务调用失败：${errorMessage}` });
  }
});

export default router;
