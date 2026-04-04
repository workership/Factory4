import { Router } from "express";
import { TASKS_FILE } from "../config";
import { readJSON, writeJSON } from "../utils";
import { Task } from "../../src/types";

const router = Router();

router.get("/", (req, res) => {
  res.json(readJSON<Task>(TASKS_FILE));
});

router.post("/", (req, res) => {
  const newTask: Task = req.body;
  const tasks = readJSON<Task>(TASKS_FILE);
  tasks.unshift(newTask);
  writeJSON(TASKS_FILE, tasks);
  res.status(201).json(newTask);
});

export default router;
