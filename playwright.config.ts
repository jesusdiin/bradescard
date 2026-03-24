import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    headless: false,          // navegador visible
    launchOptions: {
      slowMo: 1000,           // pausa entre acciones (ms)
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, // opcional: ruta a Chrome instalado
    },
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  workers: 1,                 // secuencial: 1 test a la vez
  timeout: 120_000,           // 2 min por test (formulario largo)
})
