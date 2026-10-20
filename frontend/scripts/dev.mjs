import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("   SENTINELSIF INDUSTRIAL SAFETY COMMAND CENTER");
console.log("=======================================================");
console.log("💡 SHORTCUT ENABLED: Type 'o' + Enter to open browser!");
console.log("   Or Ctrl + Click on http://localhost:3000");
console.log("=======================================================\n");

const nextProcess = spawn("npx", ["next", "dev", "-p", "3000"], {
  stdio: "inherit",
  shell: true,
  cwd: frontendDir,
});

// Also listen to stdin for the 'o' keystroke
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (key) => {
    // Check for 'o' or 'O'
    if (key === "o" || key === "O") {
      console.log("\n🚀 Opening SentinelSIF at http://localhost:3000 in your browser...\n");
      const cmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
      spawn(cmd, ["http://localhost:3000"], { shell: true });
    }
    // Handle Ctrl+C
    if (key === "\u0003") {
      nextProcess.kill();
      process.exit();
    }
  });
} else {
  process.stdin.on("data", (chunk) => {
    const input = chunk.toString().trim().toLowerCase();
    if (input === "o") {
      console.log("\n🚀 Opening SentinelSIF at http://localhost:3000 in your browser...\n");
      const cmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
      spawn(cmd, ["http://localhost:3000"], { shell: true });
    }
  });
}

process.on("SIGINT", () => {
  nextProcess.kill();
  process.exit();
});
