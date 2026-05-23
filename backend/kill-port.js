import { execSync } from 'child_process';

const port = process.argv[2] || 5000;

try {
  let stdout;
  if (process.platform === 'win32') {
    try {
      stdout = execSync(`netstat -ano | findstr :${port}`).toString();
    } catch (e) {
      // netstat exits with code 1 if no match is found, which means port is free
      stdout = '';
    }
    
    const lines = stdout.split('\n');
    const pids = new Set();
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(pid);
        }
      }
    }
    
    for (const pid of pids) {
      if (parseInt(pid) !== process.pid) {
        console.log(`[KillPort] Found stale process ${pid} using port ${port}. Terminating...`);
        try {
          execSync(`taskkill /F /PID ${pid}`);
        } catch (e) {
          // Ignore if process already exited
        }
      }
    }
  } else {
    try {
      stdout = execSync(`lsof -t -i:${port}`).toString();
    } catch (e) {
      stdout = '';
    }
    
    const pids = stdout.split('\n').map(p => p.trim()).filter(Boolean);
    for (const pid of pids) {
      if (parseInt(pid) !== process.pid) {
        console.log(`[KillPort] Found stale process ${pid} using port ${port}. Terminating...`);
        try {
          execSync(`kill -9 ${pid}`);
        } catch (e) {
          // Ignore
        }
      }
    }
  }
} catch (error) {
  console.error('[KillPort] Error freeing port:', error.message);
}
