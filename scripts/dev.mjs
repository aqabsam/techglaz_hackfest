import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const backendPort = Number(process.env.PORT || 5000);
const backendUrl = `http://127.0.0.1:${backendPort}`;
const pythonBin = process.env.PYTHON_BIN || 'python3';
const viteBin = process.platform === 'win32'
  ? 'node_modules/vite/bin/vite.js'
  : 'node_modules/vite/bin/vite.js';

let backendProcess = null;
let frontendProcess = null;
let shuttingDown = false;

function startBackend() {
  const child = spawn(pythonBin, ['backend/app.py'], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`Backend exited${signal ? ` with signal ${signal}` : ` with code ${code}`}.`);
    shutdown(code ?? 1);
  });

  return child;
}

async function waitForBackendReady() {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${backendUrl}/`);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until Flask is ready.
    }

    await delay(1000);
  }

  throw new Error(`Backend did not become ready at ${backendUrl}`);
}

function startFrontend() {
  const child = spawn(process.execPath, [viteBin], {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`Frontend exited${signal ? ` with signal ${signal}` : ` with code ${code}`}.`);
    shutdown(code ?? 1);
  });

  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill('SIGTERM');
  }

  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill('SIGTERM');
  }

  setTimeout(() => process.exit(code), 250).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

try {
  backendProcess = startBackend();
  await waitForBackendReady();
  frontendProcess = startFrontend();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  shutdown(1);
}
