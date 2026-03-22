/**
 * Test de referencia — equivalente a una grabación de Playwright Codegen.
 * Usa el cliente #1 del CSV hardcodeado para que sirva como ejemplo base.
 *
 * Para grabar tus propias acciones usa:
 *   npm run codegen
 */
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth.js'
import { fillForm } from './helpers/fillForm.js'
import type { Cliente } from './helpers/types.js'

// Cliente #1 del CSV — datos hardcodeados al estilo de una grabación codegen
const cliente1: Cliente = {
  nombre:            'Luis',
  apellidoPaterno:   'Ortega',
  apellidoMaterno:   'Alvarado',
  fechaNacimiento:   '1986-03-12',
  genero:            'masculino',
  estadoCivil:       'soltero',
  curp:              'OEAL860312HVZLSR37',
  email:             'luis.ortega1@yahoo.com.mx',
  telefono:          '2220262445',
  direccion:         'Av. Insurgentes #107',
  ciudad:            'Veracruz',
  estado:            'VER',
  codigoPostal:      '91046',
  tipoEmpleo:        'jubilado',
  empresa:           '',
  ingresosMensuales: '75000',
  aniosLaborando:    'menos1',
  montoSolicitado:   '255000',
  plazo:             '18',
  destino:           'otro|negocio',
  aceptaTerminos:    'true',
}

test('Referencia: Cliente 1 — Luis Ortega (Jubilado, Veracruz)', async ({ page }) => {
  // Login
  await login(page)

  // Rellenar formulario completo
  await fillForm(page, cliente1)

  // Verificar que llegamos al resumen (Paso 5)
  await expect(page.locator('.step-title')).toBeVisible()

  // Pausa para revisión visual antes de cerrar
  await page.waitForTimeout(4000)
})
