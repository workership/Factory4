import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
export const serverDir = path.dirname(__filename);
export const rootDir = path.join(serverDir, "..");

export const DATA_DIR = path.join(rootDir, "data");
export const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
export const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
export const PREDICT_SCRIPT = path.join(rootDir, "Seedling_Est", "predict.py");

export function initDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
  }
}
