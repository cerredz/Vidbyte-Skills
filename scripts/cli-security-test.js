import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const script = path.join(__dirname, "cli-security-test.py");
const py = process.env.PYTHON || (process.platform === "win32" ? "python" : "python3");

const result = spawnSync(py, [script], { stdio: "inherit", cwd: path.join(__dirname, "..") });
process.exit(result.status ?? 1);
