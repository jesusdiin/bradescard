// generate-from-map.ts — Genera CSV de prueba a partir de tests/field-map.json
// Uso: npm run generate:map
//      También actualiza csvColumn en field-map.json automáticamente.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Field, FieldMap } from './helpers/types.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Datos base ───────────────────────────────────────────────────────────────

interface EstadoSimple { lada: string; curp: string }

const nombresMasculinos: string[] = [
  'Carlos', 'Luis', 'Miguel', 'Jorge', 'José', 'Alejandro', 'Fernando', 'Ricardo',
  'Eduardo', 'Roberto', 'Sergio', 'Daniel', 'Andrés', 'Héctor', 'Raúl',
  'Gabriel', 'Francisco', 'Arturo', 'Ernesto', 'Marco',
]

const nombresFemeninos: string[] = [
  'María', 'Ana', 'Laura', 'Sofía', 'Valentina', 'Fernanda', 'Gabriela', 'Paola',
  'Daniela', 'Claudia', 'Patricia', 'Mariana', 'Alejandra', 'Karla', 'Verónica',
  'Lucía', 'Adriana', 'Guadalupe', 'Mónica', 'Isabel',
]

const apellidos: string[] = [
  'García', 'Martínez', 'López', 'Hernández', 'González', 'Pérez', 'Rodríguez',
  'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Torres', 'Rivera', 'Morales', 'Jiménez',
  'Reyes', 'Gutiérrez', 'Díaz', 'Vargas', 'Castillo', 'Mendoza', 'Ramos', 'Moreno',
  'Ruiz', 'Núñez', 'Alvarado', 'Medina', 'Aguilar', 'Rojas', 'Ortega',
]

const estados: EstadoSimple[] = [
  { lada: '55', curp: 'DF' }, { lada: '33', curp: 'JA' }, { lada: '81', curp: 'NL' },
  { lada: '22', curp: 'PL' }, { lada: '72', curp: 'MC' }, { lada: '22', curp: 'VZ' },
  { lada: '47', curp: 'GT' }, { lada: '66', curp: 'SR' }, { lada: '44', curp: 'QT' },
  { lada: '99', curp: 'YN' },
]

const dominios: string[] = ['gmail.com', 'hotmail.com', 'yahoo.com.mx', 'outlook.com']

// ─── Utilidades ───────────────────────────────────────────────────────────────

const rand    = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
const pad2    = (n: number): string => String(n).padStart(2, '0')

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function randomDate(minAge: number, maxAge: number): string {
  const now   = new Date()
  const year  = randInt(now.getFullYear() - maxAge, now.getFullYear() - minAge)
  const month = randInt(1, 12)
  const day   = randInt(1, 28)
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function firstVowel(str: string): string {
  const s = removeAccents(str).toUpperCase()
  for (let i = 1; i < s.length; i++) {
    if ('AEIOU'.includes(s[i])) return s[i]
  }
  return 'X'
}

function buildCURP(nombre: string, apPat: string, apMat: string, fechaNac: string, genero: string, estadoCurp: string): string {
  const n  = removeAccents(nombre).toUpperCase()
  const ap = removeAccents(apPat).toUpperCase()
  const am = removeAccents(apMat).toUpperCase()

  const [yy, mm, dd] = fechaNac.split('-')
  const dateCode = yy.slice(2) + mm + dd
  const sexCode  = genero === 'femenino' ? 'M' : 'H'

  const fullName = `${n} ${ap} ${am}`
  const cons: string[] = []
  for (let i = 0; i < fullName.length && cons.length < 3; i++) {
    const ch = fullName[i]
    if (ch !== ' ' && !'AEIOU'.includes(ch)) cons.push(ch)
  }
  while (cons.length < 3) cons.push('X')

  return `${ap[0]}${firstVowel(ap)}${am[0]}${n[0]}${dateCode}${sexCode}${estadoCurp}${cons[0]}${cons[1]}${cons[2]}${randInt(0, 9)}${randInt(0, 9)}`
}

function buildEmail(nombre: string, apellido: string, idx: number): string {
  const base = removeAccents(nombre).toLowerCase().replace(/\s+/g, '') +
               '.' + removeAccents(apellido).toLowerCase().replace(/\s+/g, '')
  return `${base}${idx}@${rand(dominios)}`
}

function buildTelefono(lada: string): string {
  return lada + String(randInt(10000000, 99999999))
}

// ─── Heurística: inferir generador para un campo ──────────────────────────────

function inferGenerator(field: Field): string {
  const k = (field.name + ' ' + field.label).toLowerCase()

  if (field.type === 'email' || /email|correo/.test(k))    return 'email'
  if (/ssn|curp|rfc/.test(k))                              return 'curp'
  if (/second|segundo|middle/.test(k))                     return 'secondName'
  if (/first|nombre|given/.test(k))                        return 'firstName'
  if (/paternal|paterno/.test(k))                          return 'paternalName'
  if (/maternal|materno/.test(k))                          return 'maternalName'
  if (/msisdn2|phone2|tel2|celular2|confirm/.test(k))       return 'phoneConfirm'
  if (/msisdn|phone|tel|celular|movil/.test(k))             return 'phone'
  if (/date|fecha|birth|nac/.test(k) || field.type === 'date') return 'date'
  if (/address|direccion|calle/.test(k))                   return 'address'
  if (field.type === 'checkbox')                           return 'checkbox'
  if (field.type === 'radio'  && field.options.length > 0) return 'radio'
  if (field.type === 'select' && field.options.length > 0) return 'select'

  return 'text'
}

// ─── Leer field-map.json ──────────────────────────────────────────────────────

const mapPath = path.join(__dirname, 'field-map.json')
const map     = JSON.parse(fs.readFileSync(mapPath, 'utf8')) as FieldMap

const allFields = map.steps.flatMap(s => s.fields)
const unique    = [...new Map(allFields.map(f => [f.name || f.selector, f])).values()]

// ─── Generar 15 registros ─────────────────────────────────────────────────────

const records: Record<string, string>[] = []

for (let i = 1; i <= 15; i++) {
  const genero    = rand(['masculino', 'femenino'])
  const firstName = genero === 'femenino' ? rand(nombresFemeninos) : rand(nombresMasculinos)
  const apPat     = rand(apellidos)
  const apMat     = rand(apellidos.filter(a => a !== apPat))
  const fechaNac  = randomDate(18, 65)
  const estadoInfo = rand(estados)
  const email     = buildEmail(firstName, apPat, i)
  const phone     = buildTelefono(estadoInfo.lada)
  const curp      = buildCURP(firstName, apPat, apMat, fechaNac, genero, estadoInfo.curp)

  const row: Record<string, string> = { id: String(i) }

  for (const field of unique) {
    const gen = inferGenerator(field)
    switch (gen) {
      case 'firstName':    row[field.name] = firstName; break
      case 'secondName':   row[field.name] = Math.random() < 0.3 ? '' : rand(genero === 'femenino' ? nombresFemeninos : nombresMasculinos); break
      case 'paternalName': row[field.name] = apPat; break
      case 'maternalName': row[field.name] = apMat; break
      case 'email':        row[field.name] = email; break
      case 'phone':        row[field.name] = phone; break
      case 'phoneConfirm': row[field.name] = phone; break
      case 'curp':         row[field.name] = curp; break
      case 'date':         row[field.name] = fechaNac; break
      case 'address':      row[field.name] = `Av. Insurgentes #${randInt(1, 999)}`; break
      case 'checkbox':     row[field.name] = Math.random() < 0.7 ? 'on' : ''; break
      case 'radio':        row[field.name] = field.options[0]; break
      case 'select':       row[field.name] = field.options[0]; break
      default:             row[field.name] = 'Test'; break
    }
  }

  records.push(row)
}

// ─── Escribir CSV ─────────────────────────────────────────────────────────────

const headers  = ['id', ...unique.map(f => f.name)]
const csvLines = [
  headers.join(','),
  ...records.map(r =>
    headers.map(h => {
      const val = String(r[h] ?? '')
      return val.includes(',') || val.includes('"')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(',')
  ),
]

const csvPath = path.join(__dirname, 'clientes-map.csv')
fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8')
console.log(`✓ CSV generado: ${csvPath}`)
console.log(`  Filas:    ${records.length}`)
console.log(`  Columnas: ${headers.join(', ')}`)

// ─── Actualizar csvColumn en field-map.json ───────────────────────────────────

map.steps.forEach(step =>
  step.fields.forEach(f => { f.csvColumn = f.name || '' })
)
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2), 'utf8')
console.log(`✓ field-map.json actualizado con csvColumn`)
console.log(`\n  → Actualiza CSV_PATH=tests/clientes-map.csv en .env`)
console.log(`  → Luego corre: npm run test:csv\n`)
