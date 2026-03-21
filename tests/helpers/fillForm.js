/**
 * fillForm — Rellena el formulario completo de solicitud de crédito.
 *
 * Dos modos:
 *   fillForm(page, cliente)              — selectores hardcodeados (entorno local conocido)
 *   fillFormFromMap(page, cliente, map)  — selectores desde field-map.json (staging desconocido)
 *
 * Ambas funciones se detienen en el último paso (resumen) sin enviar.
 */

// ── MODO 1: Selectores hardcodeados (local) ───────────────────────────────────

export async function fillForm(page, cliente) {
  // ── PASO 1: Datos Personales
  await page.waitForSelector('#nombre')
  await page.fill('#nombre', cliente.nombre)
  await page.fill('#apellidoPaterno', cliente.apellidoPaterno)
  await page.fill('#apellidoMaterno', cliente.apellidoMaterno ?? '')
  await page.fill('#fechaNacimiento', cliente.fechaNacimiento)
  await page.check(`input[name="genero"][value="${cliente.genero}"]`)
  await page.selectOption('#estadoCivil', cliente.estadoCivil)
  await page.fill('#curp', cliente.curp)
  await clickSiguiente(page)

  // ── PASO 2: Datos de Contacto
  await page.waitForSelector('#email')
  await page.fill('#email', cliente.email)
  await page.fill('#telefono', cliente.telefono)
  await page.fill('#direccion', cliente.direccion)
  await page.fill('#ciudad', cliente.ciudad)
  await page.selectOption('#estado', cliente.estado)
  await page.fill('#codigoPostal', cliente.codigoPostal)
  await clickSiguiente(page)

  // ── PASO 3: Información Laboral
  await page.waitForSelector('input[name="tipoEmpleo"]')
  await page.check(`input[name="tipoEmpleo"][value="${cliente.tipoEmpleo}"]`)
  if (cliente.empresa && (cliente.tipoEmpleo === 'asalariado' || cliente.tipoEmpleo === 'empresario')) {
    await page.waitForSelector('#empresa', { timeout: 3_000 })
    await page.fill('#empresa', cliente.empresa)
  }
  await page.fill('#ingresosMensuales', String(cliente.ingresosMensuales))
  await page.selectOption('#aniosLaborando', cliente.aniosLaborando)
  await clickSiguiente(page)

  // ── PASO 4: Detalles del Crédito
  await page.waitForSelector('input.slider-number-input')
  await page.fill('input.slider-number-input', String(cliente.montoSolicitado))
  await page.dispatchEvent('input.slider-number-input', 'change')
  await page.selectOption('#plazo', String(cliente.plazo))
  const destinos = String(cliente.destino).split('|').map(d => d.trim())
  for (const destino of destinos) {
    await page.check(`input[type="checkbox"][value="${destino}"]`)
  }
  await page.check('label:has-text("Acepto") input[type="checkbox"]')
  await clickSiguiente(page)

  // ── PASO 5: Resumen — parar aquí para revisión visual
  await page.waitForSelector('.step-title', { timeout: 10_000 })
}

// ── MODO 2: Navegación + login desde field-map.json ───────────────────────────

/**
 * Navega a la URL del field-map y hace login si fue descubierto.
 * Si fieldMap.login === null, navega directo al formulario sin login.
 */
export async function loginFromMap(page, fieldMap) {
  await page.goto(fieldMap.baseURL)
  await page.waitForLoadState('load')
  await page.waitForTimeout(1500)

  if (fieldMap.login) {
    const username = process.env.TEST_USER ?? 'gerente'
    const password = process.env.TEST_PASS ?? 'aurrera2024'
    await page.fill(fieldMap.login.usernameSelector, username)
    await page.fill(fieldMap.login.passwordSelector, password)
    await page.click(fieldMap.login.submitSelector)
    await page.waitForTimeout(2000)
  }
}

// ── MODO 3: Config-driven desde field-map.json (staging desconocido) ──────────

/**
 * Rellena el formulario usando el mapa de campos generado por discover.js.
 * @param {import('@playwright/test').Page} page
 * @param {Object} cliente - fila del CSV como objeto plano
 * @param {Object} fieldMap - contenido de tests/field-map.json
 */
export async function fillFormFromMap(page, cliente, fieldMap) {
  for (const step of fieldMap.steps) {
    // Esperar a que al menos el primer campo del paso sea visible
    if (step.fields.length > 0) {
      await page.waitForSelector(step.fields[0].selector, { timeout: 10_000 })
    } else {
      await page.waitForTimeout(500)
    }

    // Rellenar cada campo del paso
    for (const field of step.fields) {
      const value = String(cliente[field.csvColumn] ?? '')
      if (!value || !field.csvColumn) continue

      try {
        await fillField(page, field, value)
      } catch (err) {
        console.warn(`  ⚠ No se pudo rellenar "${field.label}" (${field.selector}): ${err.message}`)
      }
    }

    // Avanzar al siguiente paso si no es el último
    if (step.nextButtonSelector) {
      await page.click(step.nextButtonSelector, { timeout: 5_000 })
      await page.waitForTimeout(400)
    }
  }
}

/**
 * Rellena un campo según su tipo.
 */
async function fillField(page, field, value) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
    case 'date':
    case 'password':
      await page.fill(field.selector, value)
      break

    case 'range':
      await page.fill(field.selector, value)
      await page.dispatchEvent(field.selector, 'change')
      break

    case 'select':
      await page.selectOption(field.selector, value)
      break

    case 'radio':
      await page.check(`${field.selector}[value="${value}"]`)
      break

    case 'checkbox':
      // Soporta valores separados por | para checkboxes múltiples
      if (field.options && field.options.length > 1) {
        const values = value.split('|').map(v => v.trim())
        for (const v of values) {
          await page.check(`${field.selector}[value="${v}"]`)
        }
      } else {
        // Checkbox simple (booleano)
        if (value === 'true' || value === '1') {
          await page.check(field.selector)
        }
      }
      break
  }
}

// ── Utilidad ──────────────────────────────────────────────────────────────────
async function clickSiguiente(page) {
  await page.click('button.btn-primary:has-text("Siguiente")')
  await page.waitForTimeout(300)
}
