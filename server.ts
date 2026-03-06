import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
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
    
    // Check if this IP has submitted a task (simplified check)
    // In a real app we'd track IP per task, but here we'll just check if any task exists for simplicity 
    // or we could just say "true" if there are any tasks in the system as a placeholder
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
