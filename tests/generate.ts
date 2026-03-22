// generate.ts — Genera 20 clientes de prueba para el formulario de crédito
// Uso: npm run generate

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Estado {
  clave: string
  ciudades: string[]
  cp: string
  lada: string
  curp: string
}

interface ClienteRecord {
  id: number
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string
  genero: string
  estadoCivil: string
  curp: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  estado: string
  codigoPostal: string
  tipoEmpleo: string
  empresa: string
  ingresosMensuales: number
  aniosLaborando: string
  montoSolicitado: number
  plazo: string
  destino: string
  aceptaTerminos: boolean
}

// ─── Datos base ───────────────────────────────────────────────────────────────

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

const estados: Estado[] = [
  { clave: 'CDMX', ciudades: ['Ciudad de México', 'Coyoacán', 'Tlalpan'],       cp: '060', lada: '55', curp: 'DF' },
  { clave: 'JAL',  ciudades: ['Guadalajara', 'Zapopan', 'Tlaquepaque'],          cp: '445', lada: '33', curp: 'JA' },
  { clave: 'NL',   ciudades: ['Monterrey', 'San Pedro Garza García', 'Apodaca'], cp: '640', lada: '81', curp: 'NL' },
  { clave: 'PUE',  ciudades: ['Puebla', 'Tehuacán', 'Cholula'],                  cp: '720', lada: '22', curp: 'PL' },
  { clave: 'MEX',  ciudades: ['Toluca', 'Ecatepec', 'Naucalpan'],                cp: '500', lada: '72', curp: 'MC' },
  { clave: 'VER',  ciudades: ['Veracruz', 'Xalapa', 'Coatzacoalcos'],            cp: '910', lada: '22', curp: 'VZ' },
  { clave: 'GTO',  ciudades: ['León', 'Guanajuato', 'Irapuato'],                 cp: '370', lada: '47', curp: 'GT' },
  { clave: 'SON',  ciudades: ['Hermosillo', 'Nogales', 'Ciudad Obregón'],        cp: '830', lada: '66', curp: 'SR' },
  { clave: 'QRO',  ciudades: ['Querétaro', 'San Juan del Río', 'Corregidora'],   cp: '760', lada: '44', curp: 'QT' },
  { clave: 'YUC',  ciudades: ['Mérida', 'Valladolid', 'Progreso'],               cp: '970', lada: '99', curp: 'YN' },
]

const empresas: string[] = [
  'Grupo Alfa S.A.', 'Soluciones Tech MX', 'Comercializadora del Norte',
  'Industrias Solarte', 'Servicios Integrales GDL', 'Consultores Asociados',
  'Manufactura Moderna S.A.', 'Distribuidora Centro S.A. de C.V.',
]

const calles: string[] = [
  'Av. Insurgentes', 'Calle Hidalgo', 'Blvd. Díaz Ordaz', 'Av. Revolución',
  'Calle Morelos', 'Av. Juárez', 'Calzada de los Héroes', 'Av. Universidad',
  'Calle Independencia', 'Paseo de la Reforma',
]

const dominios: string[]     = ['gmail.com', 'hotmail.com', 'yahoo.com.mx', 'outlook.com']
const tiposEmpleo: string[]  = ['asalariado', 'independiente', 'empresario', 'jubilado']
const aniosOpts: string[]    = ['menos1', '1a3', '3a5', '5a10', 'mas10']
const estadosCivil: string[] = ['soltero', 'casado', 'casado', 'casado', 'divorciado', 'viudo', 'union_libre']
const plazos: string[]       = ['6', '12', '18', '24', '36', '48', '60']
const destinos: string[]     = ['vivienda', 'auto', 'educacion', 'negocio', 'salud', 'viajes', 'deudas', 'otro']
const generos: string[]      = ['masculino', 'masculino', 'femenino', 'femenino', 'otro', 'no_especificar']

// ─── Utilidades ───────────────────────────────────────────────────────────────

const rand    = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
const pad2    = (n: number): string => String(n).padStart(2, '0')

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function randomDate(minAge: number, maxAge: number): string {
  const now    = new Date()
  const year   = randInt(now.getFullYear() - maxAge, now.getFullYear() - minAge)
  const month  = randInt(1, 12)
  const day    = randInt(1, 28)
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function firstVowel(str: string): string {
  const clean = removeAccents(str).toUpperCase()
  for (let i = 1; i < clean.length; i++) {
    if ('AEIOU'.includes(clean[i])) return clean[i]
  }
  return 'X'
}

function buildCURP(nombre: string, apPat: string, apMat: string, fechaNac: string, genero: string, estadoCurp: string): string {
  const n  = removeAccents(nombre).toUpperCase()
  const ap = removeAccents(apPat).toUpperCase()
  const am = removeAccents(apMat).toUpperCase()

  const c1 = ap[0]
  const c2 = firstVowel(ap)
  const c3 = am[0]
  const c4 = n[0]

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

  return `${c1}${c2}${c3}${c4}${dateCode}${sexCode}${estadoCurp}${cons[0]}${cons[1]}${cons[2]}${randInt(0, 9)}${randInt(0, 9)}`
}

function buildEmail(nombre: string, apellido: string, idx: number): string {
  const base = removeAccents(nombre).toLowerCase().replace(/\s+/g, '') +
               '.' + removeAccents(apellido).toLowerCase().replace(/\s+/g, '')
  return `${base}${idx}@${rand(dominios)}`
}

function buildTelefono(lada: string): string {
  return lada + String(randInt(10000000, 99999999))
}

function pickDestinos(): string {
  const n        = randInt(1, 3)
  const shuffled = [...destinos].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n).join('|')
}

// ─── Generación de registros ──────────────────────────────────────────────────

const records: ClienteRecord[] = []

for (let i = 1; i <= 20; i++) {
  const genero     = rand(generos)
  const nombre     = genero === 'femenino' ? rand(nombresFemeninos) : rand(nombresMasculinos)
  const apPat      = rand(apellidos)
  const apMat      = rand(apellidos.filter(a => a !== apPat))
  const fechaNac   = randomDate(18, 65)
  const estadoCivil = rand(estadosCivil)

  const estadoInfo = rand(estados)
  const ciudad     = rand(estadoInfo.ciudades)
  const cp         = estadoInfo.cp + String(randInt(0, 99)).padStart(2, '0')
  const telefono   = buildTelefono(estadoInfo.lada)
  const curp       = buildCURP(nombre, apPat, apMat, fechaNac, genero, estadoInfo.curp)
  const email      = buildEmail(nombre, apPat, i)

  const tipoEmpleo     = rand(tiposEmpleo)
  const empresa        = (tipoEmpleo === 'asalariado' || tipoEmpleo === 'empresario') ? rand(empresas) : ''
  const ingresos       = randInt(8, 120) * 1000
  const aniosLaborando = rand(aniosOpts)
  const monto          = randInt(2, 100) * 5000
  const plazo          = rand(plazos)
  const destino        = pickDestinos()
  const calle          = rand(calles)
  const numExt         = randInt(1, 999)

  records.push({
    id: i,
    nombre,
    apellidoPaterno:   apPat,
    apellidoMaterno:   apMat,
    fechaNacimiento:   fechaNac,
    genero,
    estadoCivil,
    curp,
    email,
    telefono,
    direccion:         `${calle} #${numExt}`,
    ciudad,
    estado:            estadoInfo.clave,
    codigoPostal:      cp,
    tipoEmpleo,
    empresa,
    ingresosMensuales: ingresos,
    aniosLaborando,
    montoSolicitado:   monto,
    plazo,
    destino,
    aceptaTerminos:    true,
  })
}

// ─── Escritura del CSV ────────────────────────────────────────────────────────

const headers = Object.keys(records[0]) as (keyof ClienteRecord)[]

const csvLines = [
  headers.join(','),
  ...records.map(r =>
    headers.map(h => {
      const val = String(r[h])
      return val.includes(',') || val.includes('"')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(',')
  ),
]

const outPath = path.join(__dirname, 'clientes.csv')
fs.writeFileSync(outPath, csvLines.join('\n'), 'utf8')

console.log(`✓ Generados ${records.length} clientes → ${outPath}`)
console.log(`  Columnas: ${headers.join(', ')}`)
