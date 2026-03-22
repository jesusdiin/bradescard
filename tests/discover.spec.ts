/**
 * discover.spec.ts — Descubrimiento automático de campos de formulario.
 *
 * Soporta:
 *  - Formularios SPA (detección por cambio de DOM)
 *  - Formularios multi-página (detección por cambio de URL o título)
 *  - Todos los tipos de input HTML5
 *  - Labels: explícito, aria-label, aria-labelledby, fieldset/legend, placeholder
 *  - Selectores robustos: data-testid > id > name > aria-label > CSS
 *
 * Uso:
 *   npm run discover
 *   BASE_URL=https://staging.com TEST_USER=admin TEST_PASS=secret npm run discover
 */

import { test } from '@playwright/test'
import type { Page, ElementHandle } from '@playwright/test'
import type { Field, FieldMap, LoginInfo } from './helpers/types.js'
import fs from 'fs'
import path from 'path'

// ── Valores mínimos para pasar validaciones durante el descubrimiento ─────────
const FILL_DEFAULTS: Record<string, string> = {
  text:             'Test',
  email:            'test@test.com',
  tel:              '5512345678',
  number:           '10000',
  date:             '1990-01-15',
  password:         'pass123',
  range:            '50000',
  textarea:         'Texto de prueba para el campo de texto largo.',
  'datetime-local': '1990-01-15T10:00',
  time:             '10:00',
  url:              'https://ejemplo.com',
  search:           'busqueda prueba',
  color:            '#1a56db',
  week:             '1990-W01',
  month:            '1990-01',
  // file: omitido — no se puede simular con fill()
}

// ── Test principal ─────────────────────────────────────────────────────────────
test('Descubrir campos del formulario', async ({ page }) => {
  const baseURL  = process.env.BASE_URL  ?? 'https://www.creditea.mx/mx/apply/login?principal=50000&signupgate=true&homeSlider=false&_gl=1*h1xwnk*_up*MQ..*_gs*MQ..&gclid=CjwKCAjwg_nNBhAGEiwAiYPYA1G34mvjmK1IX76TuuYq4pfA8keQywv2nvkZSbs4_t9wLWIEBHe3PxoCABsQAvD_BwE&gclsrc=aw.ds&gbraid=0AAAAADRF-tOqBeSP11tu7dBsTHwMnquRq'
  const username = process.env.TEST_USER ?? 'gerente'
  const password = process.env.TEST_PASS ?? 'aurrera2024'

  const fieldMap: FieldMap = {
    baseURL,
    generatedAt: new Date().toISOString(),
    login: null,
    steps: [],
  }

  // ── Navegación inicial ─────────────────────────────────────────────────────
  await page.goto(baseURL)
  await page.waitForLoadState('load')
  await page.waitForTimeout(3500)   // gracia para JS post-carga (SPAs, analytics)

  // ── FASE 1: ¿Hay login? ────────────────────────────────────────────────────
  const loginPassEl = await page.$('input[type="password"]')
  const hasLogin    = loginPassEl !== null && await loginPassEl.isVisible()

  if (hasLogin && loginPassEl) {
    const loginUser = await page.$('input[type="text"], input[type="email"], #username')
    const loginBtn  = await page.$('button[type="submit"]')

    const loginInfo: LoginInfo = {
      usernameSelector: loginUser ? await getBestSelector(page, loginUser) : '#username',
      passwordSelector: await getBestSelector(page, loginPassEl),
      submitSelector:   loginBtn  ? await getBestSelector(page, loginBtn)  : 'button[type="submit"]',
    }
    fieldMap.login = loginInfo

    console.log('✓ Login detectado:', JSON.stringify(fieldMap.login))

    // ── FASE 2: Login ──────────────────────────────────────────────────────
    await page.fill(loginInfo.usernameSelector, username)
    await page.fill(loginInfo.passwordSelector, password)
    await page.click(loginInfo.submitSelector)
    await page.waitForTimeout(2000)
    console.log('✓ Login enviado — continuando discovery')
  } else {
    fieldMap.login = null
    console.log('ℹ Sin pantalla de login — iniciando discovery directo')
  }

  // ── FASE 3: Recorrer pasos ─────────────────────────────────────────────────
  let stepIndex = 1
  let hasNextStep = true

  while (hasNextStep && stepIndex <= 20) {
    console.log(`\n── Analizando Paso ${stepIndex} (${page.url()}) ──`)

    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)

    const urlAntes     = page.url()
    const tituloAntes  = await page.title()
    const headingAntes = await getHeadingText(page)

    const fields  = await extractFields(page)
    const nextBtn = await findNextButton(page)

    fieldMap.steps.push({
      index: stepIndex,
      stepUrl: urlAntes,
      nextButtonSelector: nextBtn,
      fields,
    })

    console.log(`  URL:    ${urlAntes}`)
    console.log(`  Campos: ${fields.length}`)
    fields.forEach(f =>
      console.log(`    [${f.type}] "${f.label}" → ${f.selector} (via ${f.selectorStrategy})`)
    )

    // Intentar avanzar al siguiente paso
    if (!nextBtn) {
      console.log(`  → No se encontró botón de avance. Fin del formulario.`)
      hasNextStep = false
      continue
    }

    await fillMinimumValues(page, fields)
    await page.waitForTimeout(300)

    try {
      await page.click(nextBtn, { timeout: 4_000 })
      await page.waitForTimeout(700)

      const urlDespues     = page.url()
      const tituloDespues  = await page.title()
      const headingDespues = await getHeadingText(page)
      const nuevosCampos   = await extractFields(page)

      // Tres señales independientes de avance — cualquiera es suficiente
      const avanzoURL    = urlDespues !== urlAntes
      const avanzoDOM    = JSON.stringify(nuevosCampos.map(f => f.selector)) !==
                           JSON.stringify(fields.map(f => f.selector))
      const avanzoTitulo = tituloDespues !== tituloAntes || headingDespues !== headingAntes

      if (avanzoURL || avanzoDOM || avanzoTitulo) {
        const razon = [
          avanzoURL    && 'URL',
          avanzoDOM    && 'DOM',
          avanzoTitulo && 'título',
        ].filter(Boolean).join('+')
        console.log(`  → Avanzó al paso ${stepIndex + 1} (señal: ${razon})`)
        stepIndex++
      } else {
        console.log(`  → Sin cambios detectados. Fin del recorrido.`)
        hasNextStep = false
      }
    } catch {
      console.log(`  → Error al hacer click en Siguiente. Fin del recorrido.`)
      hasNextStep = false
    }
  }

  // ── FASE 4: Guardar field-map.json ─────────────────────────────────────────
  const outPath = path.join(process.cwd(), 'tests', 'field-map.json')
  fs.writeFileSync(outPath, JSON.stringify(fieldMap, null, 2), 'utf8')

  const totalCampos = fieldMap.steps.reduce((s, st) => s + st.fields.length, 0)
  console.log(`\n✓ field-map.json generado: ${outPath}`)
  console.log(`  Pasos:  ${fieldMap.steps.length}`)
  console.log(`  Campos: ${totalCampos}`)
  console.log(`\n  → Abre tests/field-map.json y asigna "csvColumn" a cada campo`)
  console.log(`  → Luego corre: npm run test:csv\n`)

  await page.waitForTimeout(10000)
})

// ── extractFields ─────────────────────────────────────────────────────────────
async function extractFields(page: Page): Promise<Field[]> {
  return await page.evaluate((): Field[] => {
    const fields: Field[] = []
    const seen   = new Set<string>()

    const SKIP_TYPES = new Set(['hidden', 'submit', 'button', 'image', 'reset'])

    function clean(str: string | null): string {
      return (str || '').replace(/\s+/g, ' ').replace(/\*/g, '').trim()
    }

    function getLabel(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
      if (el.id) {
        try {
          const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
          if (lbl) return clean(lbl.textContent)
        } catch {}
      }
      if (el.getAttribute('aria-label')) return clean(el.getAttribute('aria-label'))
      const lblBy = el.getAttribute('aria-labelledby')
      if (lblBy) {
        const ref = document.getElementById(lblBy)
        if (ref) return clean(ref.textContent)
      }
      const fieldset = el.closest('fieldset')
      if (fieldset) {
        const legend = fieldset.querySelector('legend')
        if (legend) return clean(legend.textContent)
      }
      const parentLabel = el.closest('label')
      if (parentLabel) return clean(parentLabel.textContent)
      const container = el.closest('.form-field, .field-group, [class*="field"], [class*="form-group"], [class*="input-wrap"]')
      if (container) {
        const lbl = container.querySelector('label')
        if (lbl) return clean(lbl.textContent)
      }
      let prev = el.previousElementSibling
      while (prev) {
        if (/^h[1-6]$/i.test(prev.tagName)) return clean(prev.textContent)
        prev = prev.previousElementSibling
      }
      return (el as HTMLInputElement).placeholder || el.name || el.id || ''
    }

    function getSelector(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): { selector: string; strategy: string } {
      const testid = el.getAttribute('data-testid')
      if (testid) return { selector: `[data-testid="${testid}"]`, strategy: 'testid' }
      const cy = el.getAttribute('data-cy') || el.getAttribute('data-qa')
      if (cy)   return { selector: `[data-cy="${cy}"]`, strategy: 'data-cy' }
      if (el.id) {
        try { return { selector: `#${CSS.escape(el.id)}`, strategy: 'id' } } catch {}
      }
      if (el.name) return { selector: `[name="${el.name}"]`, strategy: 'name' }
      const aria = el.getAttribute('aria-label')
      if (aria) return { selector: `[aria-label="${aria}"]`, strategy: 'aria' }
      const tag = el.tagName.toLowerCase()
      const cls = Array.from(el.classList)
        .filter(c => !/error|has-|is-|active|focus|valid|invalid|dirty|pristine/.test(c))
        .slice(0, 2).join('.')
      return { selector: cls ? `${tag}.${cls}` : tag, strategy: 'css' }
    }

    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select').forEach(el => {
      if (!el.offsetParent && el.tagName !== 'SELECT') return

      const inputEl   = el as HTMLInputElement
      const inputType = (inputEl.type || el.tagName).toLowerCase()
      if (SKIP_TYPES.has(inputType)) return

      const { selector, strategy } = getSelector(el)

      if ((inputType === 'radio' || inputType === 'checkbox') && el.name) {
        const groupKey = `${inputType}:${el.name}`
        if (seen.has(groupKey)) return
        seen.add(groupKey)

        const groupSel = `input[name="${el.name}"]`
        const opts = Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${el.name}"]`))
          .map(r => r.value).filter(Boolean)

        let groupLabel = getLabel(el)
        const fieldset = el.closest('fieldset')
        if (fieldset) {
          const legend = fieldset.querySelector('legend')
          if (legend) groupLabel = clean(legend.textContent)
        }

        fields.push({
          label: groupLabel, selector: groupSel, type: inputType,
          name: el.name, placeholder: '', required: inputEl.required || el.hasAttribute('required'),
          options: opts, selectorStrategy: 'name', csvColumn: '',
        })
        return
      }

      if (seen.has(selector)) return
      seen.add(selector)

      const type = el.tagName === 'TEXTAREA' ? 'textarea'
                 : el.tagName === 'SELECT'   ? 'select'
                 : inputType

      const selectEl  = el as HTMLSelectElement
      const options   = el.tagName === 'SELECT'
        ? Array.from(selectEl.options).slice(1).map(o => o.value).filter(Boolean)
        : []

      fields.push({
        label: getLabel(el), selector, type,
        name: el.name || '', placeholder: (el as HTMLInputElement).placeholder || '',
        required: inputEl.required || el.hasAttribute('required'),
        options, selectorStrategy: strategy, csvColumn: '',
      })
    })

    // ── Custom combobox/listbox (Angular Material, Vuetify, Ant Design, etc.) ──
    document.querySelectorAll<HTMLElement>(
      '[role="combobox"], [role="listbox"], [role="select"], [aria-haspopup="listbox"], [aria-haspopup="true"]'
    ).forEach(el => {
      // Ignorar si no es visible
      if (!el.offsetParent) return

      // Ignorar si contiene o está dentro de un <select> nativo ya procesado
      if (el.querySelector('select') ?? el.closest('select')) return

      const { selector, strategy } = getSelector(el as unknown as HTMLInputElement)
      if (seen.has(selector)) return
      seen.add(selector)

      fields.push({
        label:            getLabel(el as unknown as HTMLInputElement),
        selector,
        type:             'combobox',
        name:             el.getAttribute('name') || el.id || '',
        placeholder:      el.getAttribute('placeholder') || el.getAttribute('aria-placeholder') || '',
        required:         el.getAttribute('aria-required') === 'true' || el.hasAttribute('required'),
        options:          [],
        selectorStrategy: strategy,
        csvColumn:        '',
      })
    })

    return fields
  })
}

// ── getBestSelector (fuera de evaluate, para el login) ────────────────────────
async function getBestSelector(_page: Page, handle: ElementHandle<Element>): Promise<string> {
  return await handle.evaluate((el: Element) => {
    if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`
    try { if ((el as HTMLElement).id) return `#${CSS.escape((el as HTMLElement).id)}` } catch {}
    if ((el as HTMLInputElement).name) return `[name="${(el as HTMLInputElement).name}"]`
    return el.tagName.toLowerCase()
  })
}

// ── getHeadingText ────────────────────────────────────────────────────────────
async function getHeadingText(page: Page): Promise<string> {
  try {
    return await page.textContent('h1, h2, .step-title, [class*="step-title"]', { timeout: 1_000 }) ?? ''
  } catch {
    return ''
  }
}

// ── findNextButton ────────────────────────────────────────────────────────────
async function findNextButton(page: Page): Promise<string | null> {
  const candidates = [
    'button:has-text("Siguiente")',
    'button:has-text("Next")',
    'button:has-text("Continuar")',
    'button:has-text("Continue")',
    'button:has-text("Avanzar")',
    '[data-testid*="next"]',
    '[data-testid*="submit"]',
    'button[type="submit"]:not(:has-text("Enviar")):not(:has-text("Submit")):not(:has-text("Guardar"))',
    '.btn-primary',
    'button[class*="primary"]',
    'button[class*="next"]',
  ]
  for (const sel of candidates) {
    try {
      const btn = await page.$(sel)
      if (btn && await btn.isVisible()) return sel
    } catch { /* continuar */ }
  }
  return null
}

// ── fillMinimumValues ─────────────────────────────────────────────────────────
async function fillMinimumValues(page: Page, fields: Field[]): Promise<void> {
  for (const field of fields) {
    if (field.type === 'file') continue
    try {
      if (field.type === 'radio' && field.options.length > 0) {
        await page.check(`input[name="${field.name}"][value="${field.options[0]}"]`, { timeout: 2_000 })
      } else if (field.type === 'checkbox' && field.options.length > 1) {
        await page.check(`input[name="${field.name}"][value="${field.options[0]}"]`, { timeout: 2_000 })
      } else if (field.type === 'checkbox') {
        await page.check(field.selector, { timeout: 2_000 })
      } else if (field.type === 'select' && field.options.length > 0) {
        await page.selectOption(field.selector, field.options[0], { timeout: 2_000 })
      } else if (field.type === 'combobox') {
        await page.click(field.selector, { timeout: 2_000 })
        await page.waitForTimeout(400)
        const firstOption = page.locator('[role="option"]').first()
        if (await firstOption.isVisible({ timeout: 1_500 })) {
          await firstOption.click()
        } else {
          await page.keyboard.press('Escape')
        }
      } else {
        const val = FILL_DEFAULTS[field.type] ?? 'Test'
        await page.fill(field.selector, val, { timeout: 2_000 })
        if (field.type === 'range') {
          await page.dispatchEvent(field.selector, 'change')
        }
      }
    } catch { /* ignorar campos no rellenables */ }
  }
}
