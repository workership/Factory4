import { spawn } from "child_process";
import { PREDICT_SCRIPT } from "../config";

const PYTHON_COMMAND = process.platform === "win32" ? "python" : "python3";

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
