import fs from "fs";
import path from "path";

// ── 目录常量 ──────────────────────────────────────────────────────────────────
const rootDir = path.resolve(new URL("../../", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
export const LOG_ROOT = path.join(rootDir, "logs");
export const LOG_ACCESS = path.join(LOG_ROOT, "access");
export const LOG_MQTT   = path.join(LOG_ROOT, "mqtt");
export const LOG_AI     = path.join(LOG_ROOT, "ai");

const MAX_DIR_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

// ── 工具函数 ──────────────────────────────────────────────────────────────────

/** 获取当前北京时区 (UTC+8) 的 YYYY-MM-DD 日期字符串 */
function todayCST(): string {
  const now = new Date(Date.now() + 8 * 3600_000);
  return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/** 带 CST 时区标记的 ISO 时间戳 */
function timestampCST(): string {
  const now = new Date(Date.now() + 8 * 3600_000);
  return now.toISOString().replace("Z", "+08:00");
}

/** 确保目录存在 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/** 获取目录下所有日志文件，按修改时间升序（最旧的在前）*/
function getLogFiles(dir: string): Array<{ file: string; size: number }> {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".log"))
    .map(f => {
      const stat = fs.statSync(path.join(dir, f));
      return { file: f, size: stat.size, mtime: stat.mtimeMs };
    })
    .sort((a: any, b: any) => a.mtime - b.mtime)
    .map(({ file, size }) => ({ file, size }));
}

/** 当目录超过 2GB 时，轮转删除最旧的日志文件 */
function rotateLogs(dir: string): void {
  const files = getLogFiles(dir);
  let total = files.reduce((s, f) => s + f.size, 0);

  while (total > MAX_DIR_BYTES && files.length > 0) {
    const oldest = files.shift()!;
    const filePath = path.join(dir, oldest.file);
    try {
      fs.unlinkSync(filePath);
      total -= oldest.size;
      console.log(`[Logger] 已删除过期日志以释放空间: ${filePath}`);
    } catch {
      break;
    }
  }
}

/** 向指定分类目录追加一行日志（自动按天分文件）*/
function writeLog(dir: string, line: string): void {
  ensureDir(dir);
  const filePath = path.join(dir, `${todayCST()}.log`);
  const entry = `[${timestampCST()}] ${line}\n`;
  fs.appendFileSync(filePath, entry, "utf-8");
  // 异步触发轮转，不阻塞请求
  setImmediate(() => rotateLogs(dir));
}

// ── 三种日志写入接口 ──────────────────────────────────────────────────────────

/** 访问日志：记录来访客户端 IP / 请求路径 */
export function logAccess(ip: string, method: string, url: string, status?: number): void {
  const statusText = status !== undefined ? ` → ${status}` : "";
  writeLog(LOG_ACCESS, `${ip} ${method} ${url}${statusText}`);
}

/** MQTT 数据日志：记录主题与原始 Payload */
export function logMqtt(topic: string, payload: string): void {
  writeLog(LOG_MQTT, `TOPIC=${topic} PAYLOAD=${payload}`);
}

/** AI 问答日志：记录用户输入与模型回复 */
export function logAI(ip: string, input: string, reply: string): void {
  // 多行内容统一换行缩进，便于阅读
  const q = input.replace(/\n/g, "\\n").slice(0, 1000);
  const a = reply.replace(/\n/g, "\\n").slice(0, 2000);
  writeLog(LOG_AI, `IP=${ip}\n  Q: ${q}\n  A: ${a}`);
}

/** 初始化所有日志目录（在 server 启动时调用）*/
export function initLogDirs(): void {
  [LOG_ROOT, LOG_ACCESS, LOG_MQTT, LOG_AI].forEach(ensureDir);
}
