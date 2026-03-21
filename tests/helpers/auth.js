/**
 * Helper de autenticación reutilizable para todos los tests.
 * Lee credenciales desde variables de entorno con fallback a valores locales.
 *
 * Variables de entorno:
 *   TEST_USER  — nombre de usuario (default: gerente)
 *   TEST_PASS  — contraseña      (default: aurrera2024)
 */
export async function login(page) {
  const username = process.env.TEST_USER ?? 'gerente'
  const password = process.env.TEST_PASS ?? 'aurrera2024'

  await page.goto('/')
  await page.fill('#username', username)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  // Esperar a que el formulario de crédito sea visible
  await page.waitForSelector('.app-card-header', { timeout: 10_000 })
}
