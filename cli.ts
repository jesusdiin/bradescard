/**
 * cli.ts — CLI interactivo: Discovery → Validación CSV → Tests
 * Uso: npm run cli
 */

import { spawn, execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import prompts from 'prompts'
import chalk from 'chalk'
import type { FieldMap } from './tests/helpers/types.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function hr() {
  console.log(chalk.dim('─'.repeat(60)))
}

function section(title: string) {
  console.log()
  console.log(chalk.bold.cyan(`  ✦  ${title}`))
  console.log()
}

interface BrowserOption {
  title: string
  value: string
}

function detectSystemBrowsers(): BrowserOption[] {
  const found: BrowserOption[] = []
  const platform = process.platform

  const candidates: Array<{ title: string; paths: string[] }> = []

  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA ?? ''
    const programFiles = process.env.ProgramFiles ?? 'C:\\Program Files'
    const programFilesX86 = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)'

    candidates.push(
      {
        title: 'Google Chrome',
        paths: [
          path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
          path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        ],
      },
      {
        title: 'Microsoft Edge',
        paths: [
          path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
          path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
        ],
      },
      {
        title: 'Brave',
        paths: [
          path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
          path.join(programFilesX86, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
          path.join(localAppData, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
        ],
      },
      {
        title: 'Chromium',
        paths: [
          path.join(programFiles, 'Chromium', 'Application', 'chrome.exe'),
          path.join(localAppData, 'Chromium', 'Application', 'chrome.exe'),
        ],
      },
    )
  } else if (platform === 'darwin') {
    candidates.push(
      {
        title: 'Google Chrome',
        paths: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
      },
      {
        title: 'Microsoft Edge',
        paths: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
      },
      {
        title: 'Brave',
        paths: ['/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'],
      },
      {
        title: 'Chromium',
        paths: ['/Applications/Chromium.app/Contents/MacOS/Chromium'],
      },
    )
  } else {
    // Linux — buscar en PATH y rutas comunes
    const linuxPaths: Array<{ title: string; bins: string[] }> = [
      { title: 'Google Chrome',  bins: ['google-chrome', 'google-chrome-stable'] },
      { title: 'Chromium',       bins: ['chromium', 'chromium-browser'] },
      { title: 'Microsoft Edge', bins: ['microsoft-edge', 'microsoft-edge-stable'] },
      { title: 'Brave',          bins: ['brave-browser', 'brave'] },
    ]
    for (const { title, bins } of linuxPaths) {
      for (const bin of bins) {
        try {
          const result = execSync(`which ${bin} 2>/dev/null`, { encoding: 'utf8' }).trim()
          if (result) { found.push({ title, value: result }); break }
        } catch { /* no encontrado */ }
      }
    }
    return found
  }

  for (const { title, paths } of candidates) {
    for (const p of paths) {
      if (fs.existsSync(p)) {
        found.push({ title: `${title}  ${chalk.dim(p)}`, value: p })
        break
      }
    }
  }

  return found
}

/**
 * Verifica/selecciona el navegador a usar.
 * Retorna la ruta del ejecutable o undefined (usa el Chromium gestionado).
 */
async function checkBrowserInstall(): Promise<string | undefined> {
  const customPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH
  if (customPath) {
    if (!fs.existsSync(customPath)) {
      console.log(chalk.yellow(`\n  ⚠ PLAYWRIGHT_EXECUTABLE_PATH apunta a un archivo que no existe:\n    ${customPath}`))
      console.log(chalk.dim('    Corrige la ruta en tu .env y vuelve a intentarlo.\n'))
      process.exit(1)
    }
    console.log(chalk.green(`  ✓ Usando navegador personalizado: ${chalk.dim(customPath)}`))
    return customPath
  }

  // Verificar si el Chromium gestionado por Playwright está instalado
  const checkCode = await new Promise<number>(resolve => {
    const child = spawn('npx', ['playwright', 'install', '--check'], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
    })
    child.on('close', code => resolve(code ?? 1))
  })

  if (checkCode === 0) {
    return undefined // Chromium gestionado disponible
  }

  // Chromium de Playwright no disponible → detectar navegadores del sistema
  console.log(chalk.yellow('\n  ⚠ El navegador Chromium de Playwright no está instalado.'))

  const systemBrowsers = detectSystemBrowsers()

  const choices = [
    ...systemBrowsers,
    { title: chalk.dim('Instalar Chromium de Playwright (requiere internet)'), value: '__install__' },
  ]

  if (systemBrowsers.length > 0) {
    console.log(chalk.dim(`  Se detectaron ${systemBrowsers.length} navegador(es) del sistema.\n`))
  } else {
    console.log(chalk.dim('  No se detectaron navegadores instalados en rutas estándar.\n'))
  }

  const { browserChoice } = await prompts({
    type: 'select',
    name: 'browserChoice',
    message: 'Selecciona el navegador a usar:',
    choices,
    initial: 0,
  }, { onCancel: () => process.exit(0) })

  if (browserChoice === '__install__') {
    console.log(chalk.dim('\n  [Instalando Chromium...]\n'))
    const installCode = await new Promise<number>(resolve => {
      const child = spawn('npx', ['playwright', 'install', 'chromium'], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
      })
      child.on('close', code => resolve(code ?? 1))
    })

    if (installCode !== 0) {
      console.log(chalk.red('\n  ✗ Error al instalar Chromium. Instálalo manualmente con: npx playwright install chromium\n'))
      process.exit(installCode)
    }
    console.log(chalk.green('\n  ✓ Chromium instalado correctamente.\n'))
    return undefined
  }

  console.log(chalk.green(`\n  ✓ Usando: ${chalk.dim(browserChoice)}\n`))
  return browserChoice as string
}

function runProcess(
  cmd: string,
  args: string[],
  env: Record<string, string> = {},
): Promise<number> {
  return new Promise(resolve => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: { ...process.env, ...env },
      shell: process.platform === 'win32',
    })
    child.on('close', code => resolve(code ?? 1))
  })
}

function parseCSVHeaders(filePath: string): string[] {
  const firstLine = fs.readFileSync(filePath, 'utf8').split('\n')[0]
  return firstLine.split(',').map(h => h.trim())
}

function countCSVRows(filePath: string): number {
  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n')
  return Math.max(0, lines.length - 1) // excluir header
}

function readFieldMap(): FieldMap | null {
  const p = path.join(process.cwd(), 'tests', 'field-map.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8')) as FieldMap
}

// ── Entrada ───────────────────────────────────────────────────────────────────

// Ctrl+C limpio
process.on('SIGINT', () => {
  console.log(chalk.dim('\n\n  Saliendo...\n'))
  process.exit(0)
})

// ── Banner ────────────────────────────────────────────────────────────────────

console.clear()
console.log()
console.log(chalk.bold.white('  ┌────────────────────────────────────────────┐'))
console.log(chalk.bold.white('  │') + chalk.bold.cyan('  🔍  Auto Form Discovery & Testing         ') + chalk.bold.white('│'))
console.log(chalk.bold.white('  └────────────────────────────────────────────┘'))
console.log()

// ── PASO 1: Discovery ─────────────────────────────────────────────────────────

section('PASO 1 — Discovery')

const step1 = await prompts(
  [
    {
      type: 'text',
      name: 'url',
      message: 'URL del formulario a descubrir:',
      initial: process.env.BASE_URL ?? '',
      validate: v => v.startsWith('http') ? true : 'Debe ser una URL válida (http/https)',
    },
    {
      type: 'text',
      name: 'usuario',
      message: 'Usuario de login (vacío si no hay login):',
      initial: process.env.TEST_USER ?? '',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Contraseña (vacío si no hay login):',
      initial: process.env.TEST_PASS ?? '',
    },
  ],
  { onCancel: () => process.exit(0) },
)

console.log()
const confirmDiscover = await prompts({
  type: 'confirm',
  name: 'ok',
  message: 'Iniciar discovery (abrirá el navegador)',
  initial: true,
}, { onCancel: () => process.exit(0) })

if (!confirmDiscover.ok) {
  console.log(chalk.yellow('\n  Discovery cancelado.\n'))
  process.exit(0)
}

hr()
const browserPath = await checkBrowserInstall()
console.log(chalk.dim('\n  [Playwright — discover.spec.ts]\n'))

const discoverEnv: Record<string, string> = { BASE_URL: step1.url }
if (step1.usuario) discoverEnv.TEST_USER = step1.usuario
if (step1.password) discoverEnv.TEST_PASS = step1.password
if (browserPath) discoverEnv.PLAYWRIGHT_EXECUTABLE_PATH = browserPath

const discoverCode = await runProcess('npx', ['playwright', 'test', 'tests/discover.spec.ts'], discoverEnv)

hr()

if (discoverCode !== 0) {
  console.log(chalk.red(`\n  ✗ Discovery terminó con errores (código ${discoverCode}).\n`))
  process.exit(discoverCode)
}

// Mostrar resumen del field-map generado
const fieldMap = readFieldMap()
if (fieldMap) {
  const totalCampos = fieldMap.steps.reduce((s, st) => s + st.fields.length, 0)
  console.log(chalk.green(`\n  ✓ Discovery completo.`))
  console.log(chalk.white(`    Pasos:  ${fieldMap.steps.length}`))
  console.log(chalk.white(`    Campos: ${totalCampos}`))
  console.log()
  fieldMap.steps.forEach(step => {
    console.log(chalk.dim(`    Paso ${step.index}:`))
    step.fields.forEach(f =>
      console.log(chalk.dim(`      [${f.type}] "${f.label || f.name}" → ${f.selector}`))
    )
  })
} else {
  console.log(chalk.yellow('  ⚠ No se encontró field-map.json tras el discovery.'))
}

// ── PASO 2: CSV ───────────────────────────────────────────────────────────────

section('PASO 2 — Datos CSV')

const { tieneCSV } = await prompts({
  type: 'confirm',
  name: 'tieneCSV',
  message: '¿Tienes un CSV con datos de prueba listo?',
  initial: true,
}, { onCancel: () => process.exit(0) })

if (!tieneCSV) {
  const { generar } = await prompts({
    type: 'confirm',
    name: 'generar',
    message: '¿Deseas generar un CSV de prueba compatible ahora?',
    initial: true,
  }, { onCancel: () => process.exit(0) })

  if (!generar) {
    console.log(chalk.dim('\n  Genera el CSV manualmente con: npm run generate:map\n'))
    process.exit(0)
  }

  hr()
  console.log(chalk.dim('\n  [Generando CSV a partir de field-map.json...]\n'))
  const genCode = await runProcess('npx', ['tsx', 'tests/generate-from-map.ts'])
  hr()

  if (genCode !== 0) {
    console.log(chalk.red('\n  ✗ Error al generar el CSV.\n'))
    process.exit(genCode)
  }

  console.log(chalk.green('  ✓ CSV generado: tests/clientes-map.csv\n'))
}

const { csvPath } = await prompts({
  type: 'text',
  name: 'csvPath',
  message: 'Ruta del CSV:',
  initial: process.env.CSV_PATH ?? 'tests/clientes-map.csv',
  validate: v => fs.existsSync(path.join(process.cwd(), v)) ? true : 'Archivo no encontrado',
}, { onCancel: () => process.exit(0) })

const absoluteCSV = path.join(process.cwd(), csvPath)

// Validar columnas CSV vs field-map
console.log()
console.log(chalk.dim('  Validando columnas...'))
console.log()

const csvHeaders  = parseCSVHeaders(absoluteCSV)
const csvRows     = countCSVRows(absoluteCSV)
let   missingCols = 0

if (fieldMap) {
  const allFields   = fieldMap.steps.flatMap(s => s.fields)
  const required    = [...new Set(allFields.map(f => f.csvColumn).filter(Boolean))]

  for (const col of required) {
    if (csvHeaders.includes(col)) {
      console.log(chalk.green(`    ✓ ${col}`))
    } else {
      console.log(chalk.red(`    ✗ ${col} — columna no encontrada en el CSV`))
      missingCols++
    }
  }
} else {
  console.log(chalk.yellow('  ⚠ No hay field-map.json para validar. Se usarán las columnas del CSV tal cual.'))
}

console.log()
console.log(chalk.white(`  CSV: ${csvRows} filas, ${csvHeaders.length} columnas`))

if (missingCols > 0) {
  console.log(chalk.yellow(`\n  ⚠ ${missingCols} columna(s) faltante(s) en el CSV.`))
  const { continuar } = await prompts({
    type: 'confirm',
    name: 'continuar',
    message: '¿Continuar con los tests de todas formas?',
    initial: false,
  }, { onCancel: () => process.exit(0) })

  if (!continuar) {
    console.log(chalk.dim('\n  Actualiza el CSV y vuelve a correr el CLI.\n'))
    process.exit(0)
  }
} else {
  console.log(chalk.green('  ✓ CSV válido — todas las columnas encontradas.\n'))
}

// ── PASO 3: Tests ─────────────────────────────────────────────────────────────

section('PASO 3 — Tests')

const confirmTests = await prompts({
  type: 'confirm',
  name: 'ok',
  message: 'Iniciar tests (abrirá el navegador con cada fila del CSV)',
  initial: true,
}, { onCancel: () => process.exit(0) })

if (!confirmTests.ok) {
  console.log(chalk.yellow('\n  Tests cancelados.\n'))
  process.exit(0)
}

hr()
console.log(chalk.dim('\n  [Playwright — form-csv.spec.ts]\n'))

const testsCode = await runProcess('npx', ['playwright', 'test', 'tests/form-csv.spec.ts'], {
  BASE_URL:  step1.url,
  CSV_PATH:  csvPath,
  ...(step1.usuario  ? { TEST_USER: step1.usuario }   : {}),
  ...(step1.password ? { TEST_PASS: step1.password }  : {}),
  ...(browserPath    ? { PLAYWRIGHT_EXECUTABLE_PATH: browserPath } : {}),
})

hr()
console.log()

if (testsCode === 0) {
  console.log(chalk.green.bold('  ✓ Tests completados exitosamente.\n'))
} else {
  console.log(chalk.red(`  ✗ Algunos tests fallaron (código ${testsCode}).`))
  console.log(chalk.dim('    Revisa el reporte en playwright-report/\n'))
}

process.exit(testsCode)
