import { TASKS_FILE } from "../config";
import { readJSON, writeJSON } from "../utils";
import { Task } from "../../src/types";

export function initCronJobs() {
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
}
