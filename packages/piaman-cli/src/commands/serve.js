import { spawn } from 'node:child_process';

function parseServeArgs(args) {
  const options = { port: null, host: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) {
      options.port = args[i + 1];
      i++;
    } else if (args[i] === '--host' && args[i + 1]) {
      options.host = args[i + 1];
      i++;
    }
  }

  return options;
}

function serve(args) {
  const options = parseServeArgs(args);

  const env = { ...process.env };
  if (options.port) env.PORT = options.port;
  if (options.host) env.HOST = options.host;

  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    env,
    stdio: 'inherit',
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });

  serverProcess.on('close', (code) => {
    process.exit(code || 0);
  });
}

export { serve, parseServeArgs };
