import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { PREDICT_SCRIPT, rootDir } from "../config";

function getPythonPath() {
  const isWin = process.platform === "win32";
  // 检查可能存在的虚拟环境目录
  const venvPaths = [
    path.join(rootDir, "Seedling_Est", "venv", isWin ? "Scripts" : "bin", isWin ? "python.exe" : "python"),
    path.join(rootDir, "Seedling_Est", ".venv", isWin ? "Scripts" : "bin", isWin ? "python.exe" : "python"),
    path.join(rootDir, "venv", isWin ? "Scripts" : "bin", isWin ? "python.exe" : "python")
  ];

  for (const venv of venvPaths) {
    if (fs.existsSync(venv)) {
      return venv;
    }
  }

  // 回退到系统默认的 python
  return isWin ? "python" : "python3";
}

const PYTHON_COMMAND = getPythonPath();

export const runPythonPrediction = (input: any, callback: (err: Error | null, result?: any) => void) => {
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
