/**
 * Test data-driven — lee el CSV y rellena el formulario con cada fila.
 *
 * Modo automático:
 *   - Si existe tests/field-map.json  → usa fillFormFromMap (staging/desconocido)
 *   - Si no existe                    → usa fillForm con selectores hardcodeados (local)
 *
 * Variables de entorno:
 *   BASE_URL   — URL base (default: http://localhost:5173)
 *   TEST_USER  — usuario de login (default: gerente)
 *   TEST_PASS  — contraseña      (default: aurrera2024)
 *   CSV_PATH   — ruta al CSV     (default: test/clientes.csv)
 */
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth.js'
import { fillForm, fillFormFromMap, loginFromMap } from './helpers/fillForm.js'
import fs from 'fs'
import path from 'path'

// ── Detectar modo de ejecución ────────────────────────────────────────────────
const fieldMapPath = path.join(process.cwd(), 'tests', 'field-map.json')
const hasFieldMap = fs.existsSync(fieldMapPath)
const fieldMap = hasFieldMap ? JSON.parse(fs.readFileSync(fieldMapPath, 'utf8')) : null

if (hasFieldMap) {
  console.log('✓ field-map.json detectado → modo config-driven (staging)')
} else {
  console.log('ℹ field-map.json no encontrado → modo local con selectores hardcodeados')
}

// ── Parser de CSV ─────────────────────────────────────────────────────────────
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    const obj = {}
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] ?? '').trim() })
    return obj
  })
}

const csvPath = path.join(process.cwd(), process.env.CSV_PATH ?? 'test/clientes-map.csv')
const clientes = parseCSV(csvPath)

// ── Tests dinámicos — 1 test por fila del CSV ─────────────────────────────────
for (const cliente of clientes) {
  const nombre = cliente.nombre ?? cliente.sugFirstName ?? `Cliente ${cliente.id}`
  const apPat  = cliente.apellidoPaterno ?? cliente.sugPaternalName ?? ''
  test(`CSV [${String(cliente.id).padStart(2, '0')}] ${nombre} ${apPat}`.trim(), async ({ page }) => {
    if (hasFieldMap) {
      await loginFromMap(page, fieldMap)
      await fillFormFromMap(page, cliente, fieldMap)
    } else {
      await login(page)
      await fillForm(page, cliente)
      await expect(page.locator('.step-title')).toBeVisible()
    }

    await page.waitForTimeout(2500)
  })
}
