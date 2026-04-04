import { Router } from "express";
import crypto from "crypto";
import { MESSAGES_FILE, TASKS_FILE } from "../config";
import { readJSON, writeJSON } from "../utils";
import { Task, FeedbackMessage } from "../../src/types";

const router = Router();

router.get("/", (req, res) => {
  res.json(readJSON<FeedbackMessage>(MESSAGES_FILE));
});

router.post("/", (req, res) => {
  const { content } = req.body;
  const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
  const ipStr = Array.isArray(ip) ? ip[0] : ip;
  const hash = crypto.createHash("md5").update(ipStr).digest("hex").substring(0, 8).toUpperCase();
  const tasks = readJSON<Task>(TASKS_FILE);
  const hasTask = tasks.length > 0;

  const newMessage: FeedbackMessage = {
    id: `MSG-${Date.now()}`,
    hash,
    ip: ipStr,
    content,
    timestamp: new Date().toLocaleString(),
    hasTask,
  };

  const messages = readJSON<FeedbackMessage>(MESSAGES_FILE);
  messages.unshift(newMessage);
  writeJSON(MESSAGES_FILE, messages);
  res.status(201).json(newMessage);
});

export default router;
