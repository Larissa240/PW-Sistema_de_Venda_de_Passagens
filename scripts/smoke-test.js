const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(timeoutMs = 10000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) return;
    } catch (_) {
      // servidor ainda iniciando
    }

    await delay(300);
  }

  throw new Error('Tempo esgotado aguardando o servidor iniciar.');
}

async function run() {
  const server = spawn(process.execPath, [path.resolve(__dirname, '..', 'backend/server.js')], {
    env: {
      ...process.env,
      PORT: String(PORT),
      JWT_SECRET: process.env.JWT_SECRET || 'ci-secret',
      DB_HOST: process.env.DB_HOST || '127.0.0.1',
      DB_USER: process.env.DB_USER || 'root',
      DB_PASSWORD: process.env.DB_PASSWORD || 'password',
      DB_NAME: process.env.DB_NAME || 'sistema_passagens'
    },
    stdio: 'inherit'
  });

  try {
    await waitForServer();

    const health = await fetch(`${BASE_URL}/health`);
    if (!health.ok) throw new Error('Falha no healthcheck /health');

    const status = await fetch(`${BASE_URL}/api/status`);
    if (!status.ok) throw new Error('Falha na rota /api/status');

    const home = await fetch(`${BASE_URL}/`);
    const html = await home.text();
    if (!home.ok || !html.includes('SkyFly')) {
      throw new Error('Frontend não foi servido corretamente na rota raiz.');
    }

    console.log('Smoke test executado com sucesso.');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
