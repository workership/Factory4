import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { spawn } from "child_process";
import { HttpsProxyAgent } from "https-proxy-agent";
import { GoogleGenAI } from "@google/genai";
import { Task, FeedbackMessage } from "./src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

// Initialize data directory and files
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(TASKS_FILE)) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to read data
  const readJSON = <T>(file: string): T[] => {
    try {
      const data = fs.readFileSync(file, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  };

  // Helper to write data
  const writeJSON = (file: string, data: any) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  };

  const PYTHON_COMMAND = process.platform === "win32" ? "python" : "python3";
  const PREDICT_SCRIPT = path.join(__dirname, "Seedling_Est", "predict.py");

  const createSimulatedEnv = () => ({
    currentTemp: parseFloat((18 + Math.random() * 6).toFixed(1)),
    currentHumidity: parseFloat((70 + Math.random() * 20).toFixed(1)),
    currentCO2: parseFloat((420 + Math.random() * 260).toFixed(1)),
    currentLight: parseFloat((Math.random() * 1000).toFixed(1)),
  });

  const runPythonPrediction = (input: any, callback: (err: Error | null, result?: any) => void) => {
    const pythonProcess = spawn(PYTHON_COMMAND, [PREDICT_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return callback(new Error(`Python exited with code ${code}: ${stderr}`));
      }
      try {
        const parsed = JSON.parse(stdout);
        callback(null, parsed);
      } catch (error) {
        callback(new Error(`Failed to parse Python output: ${error}. Output: ${stdout}`));
      }
    });

    pythonProcess.stdin.write(JSON.stringify(input));
    pythonProcess.stdin.end();
  };

  // API Routes
  app.get("/api/tasks", (req, res) => {
    res.json(readJSON<Task>(TASKS_FILE));
  });

  app.post("/api/tasks", (req, res) => {
    const newTask: Task = req.body;
    const tasks = readJSON<Task>(TASKS_FILE);
    tasks.unshift(newTask);
    writeJSON(TASKS_FILE, tasks);
    res.status(201).json(newTask);
  });

  app.get("/api/messages", (req, res) => {
    res.json(readJSON<FeedbackMessage>(MESSAGES_FILE));
  });

  app.post("/api/messages", (req, res) => {
    const { content } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const ipStr = Array.isArray(ip) ? ip[0] : ip;
    
    const hash = crypto.createHash('md5').update(ipStr).digest('hex').substring(0, 8).toUpperCase();
    const tasks = readJSON<Task>(TASKS_FILE);
    
    const hasTask = tasks.length > 0; 

    const newMessage: FeedbackMessage = {
      id: `MSG-${Date.now()}`,
      hash,
      ip: ipStr,
      content,
      timestamp: new Date().toLocaleString(),
      hasTask
    };

    const messages = readJSON<FeedbackMessage>(MESSAGES_FILE);
    messages.unshift(newMessage);
    writeJSON(MESSAGES_FILE, messages);
    res.status(201).json(newMessage);
  });

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBCVY0eJPCuyXTzjO7XVgDcgqBn7Tup3IM";
  const GEMINI_BASE_URL = process.env.GEMINI_NEXT_GEN_API_BASE_URL || process.env.GEMINI_API_BASE_URL || "https://generativelanguage.googleapis.com";
  process.env.GEMINI_NEXT_GEN_API_BASE_URL = GEMINI_BASE_URL;

  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
  const fetchWithProxy = proxyAgent
    ? (input: RequestInfo | URL, init?: RequestInit & { dispatcher?: unknown }) =>
        globalThis.fetch(input, { ...init, dispatcher: proxyAgent } as any)
    : globalThis.fetch;

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    fetch: proxyAgent ? fetchWithProxy : undefined,
  } as any);

  const SYSTEM_PROMPT = `你是一个农业育秧专家，请以专业、简明、友好的方式回答用户关于育秧、育苗、温室管理、营养调控、病虫害防治等方面的问题。`;

  app.post("/api/chat", async (req, res) => {
    const { content, history } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: '缺少聊天内容' });
    }

    let prompt = SYSTEM_PROMPT;
    if (Array.isArray(history) && history.length > 0) {
      const historyText = history.map((item: any) => {
        if (item.role === 'assistant') return `专家: ${item.content}`;
        if (item.role === 'user') return `用户: ${item.content}`;
        return `${item.role}: ${item.content}`;
      }).join('\n');
      prompt += `\n\n以下是当前对话历史：\n${historyText}`;
    }
    prompt += `\n\n用户: ${content}\n专家:`;

    try {
      const chat = ai.chats.create({ model: 'gemini-1.5-pro', config: { temperature: 0.3, maxOutputTokens: 512 } });
      const response = await chat.sendMessage({ message: prompt });
      res.json({ reply: response.text?.trim() || '抱歉，未能获得有效回答。' });
    } catch (error) {
      console.error('Gemini chat error:', error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      res.status(500).json({ error: `AI 服务调用失败：${errorMessage}` });
    }
  });

  app.get("/api/predict", (req, res) => {
    const envInput = createSimulatedEnv();

    runPythonPrediction(envInput, (err, prediction) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ input: envInput, prediction });
    });
  });

  app.post("/api/predict", (req, res) => {
    const body = req.body || {};
    const envInput = {
      currentTemp: typeof body.currentTemp === "number" ? body.currentTemp : 18.6,
      currentHumidity: typeof body.currentHumidity === "number" ? body.currentHumidity : 87.8,
      currentCO2: typeof body.currentCO2 === "number" ? body.currentCO2 : 620.0,
      currentLight: typeof body.currentLight === "number" ? body.currentLight : 0.0,
    };

    runPythonPrediction(envInput, (err, prediction) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ input: envInput, prediction });
    });
  });

  // Background process to simulate task progress
  setInterval(() => {
    const tasks = readJSON<Task>(TASKS_FILE);
    let changed = false;
    const updatedTasks = tasks.map((task) => {
      if (task.status === "completed") return task;
      
      changed = true;
      const newProgress = Math.min(100, task.progress + Math.floor(Math.random() * 10) + 1);
      const newStatus = (newProgress === 100 ? "completed" : "processing") as "completed" | "processing";
      
      return { ...task, progress: newProgress, status: newStatus };
    });

    if (changed) {
      writeJSON(TASKS_FILE, updatedTasks);
    }
  }, 5000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
