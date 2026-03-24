# Auto Form Tester

Herramienta de automatización de pruebas para formularios web multi-paso.
Diseñada para el equipo de QA de **Bradescard**: en lugar de ingresar manualmente cada caso de un Excel, esta herramienta lo hace de forma automática — un test por fila, con capturas de pantalla al fallar.

---

## ¿Por qué existe?

El flujo habitual de QA es recibir un Excel con cientos de clientes y probarlos uno por uno en el formulario. Esto es lento, repetitivo y propenso a errores humanos.

**Auto Form Tester** resuelve eso en tres pasos:

```
1. Discovery   — apunta a la URL del formulario → genera un mapa de campos
2. CSV         — convierte tu Excel a CSV (o genera datos de prueba)
3. Tests       — ejecuta 1 test por fila, de forma automática, en el navegador
```

---

## Inicio rápido

```bash
npm install
npx playwright install   # instalar navegadores (solo la primera vez)

npm run cli              # flujo guiado: discovery → CSV → tests
```

El CLI te pregunta la URL, credenciales de login (si aplica), y la ruta del CSV. El resto es automático.

---

## Comandos disponibles

| Comando                  | Descripción                                                  |
|--------------------------|--------------------------------------------------------------|
| `npm run cli`            | Flujo interactivo completo (recomendado)                     |
| `npm run discover`       | Solo discovery — genera `tests/field-map.json`               |
| `npm run generate:map`   | Genera CSV de prueba a partir del field-map                  |
| `npm run test:csv`       | Ejecuta tests con el CSV actual                              |
| `npm run test:ref`       | Test de referencia con datos hardcodeados (localhost)        |
| `npm run test:all`       | Ejecuta todos los tests                                      |

---

## Los tres pasos en detalle

### 1. Discovery

```bash
npm run discover
# o desde el CLI: PASO 1
```

Abre el navegador, navega al formulario y detecta automáticamente:

- Todos los campos (texto, select, radio, checkboxes, dropdowns custom)
- Etiquetas y selectores para cada campo
- Pasos del formulario (siguiente → siguiente → ...)
- Pantalla de login (si existe)

Resultado: **`tests/field-map.json`** — el mapa completo del formulario.

> Las variables de entorno `BASE_URL`, `TEST_USER` y `TEST_PASS` controlan la URL y credenciales. El CLI las solicita de forma interactiva.

---

### 2. CSV de datos

```bash
npm run generate:map     # genera datos de prueba ficticios
# o usa tu propio Excel convertido a CSV
```

Opciones:

- **Generar datos de prueba**: crea `tests/clientes-map.csv` con datos ficticios compatibles con los campos descubiertos.
- **Usar tu CSV real**: convierte el Excel de QA a `.csv` y apunta la ruta cuando el CLI lo solicite. Las columnas deben coincidir con los nombres de campos del `field-map.json`.

El CLI valida automáticamente que todas las columnas requeridas estén presentes.

---

### 3. Tests automáticos

```bash
npm run test:csv
# o desde el CLI: PASO 3
```

- Abre el navegador una vez por cada fila del CSV
- Rellena el formulario completo con los datos de esa fila
- Se detiene en el paso de resumen (sin enviar) para revisión visual
- Toma una captura de pantalla si algo falla
- Genera un reporte HTML en `playwright-report/`

---

## Variables de entorno

| Variable    | Descripción                                      | Default                     |
|-------------|--------------------------------------------------|-----------------------------|
| `BASE_URL`  | URL completa del formulario a probar             | `http://localhost:5173`     |
| `TEST_USER` | Usuario para el login (si aplica)                | `gerente`                   |
| `TEST_PASS` | Contraseña para el login (si aplica)             | `aurrera2024`               |
| `CSV_PATH`  | Ruta al archivo CSV con los datos de prueba      | `tests/clientes-map.csv`    |

Se pueden definir en un archivo `.env` o pasarse directamente al CLI.

---

## Estructura del proyecto

```
auto/
├── cli.ts                        # CLI interactivo (punto de entrada principal)
├── playwright.config.ts          # Configuración de Playwright
│
├── tests/
│   ├── discover.spec.ts          # Discovery automático de campos
│   ├── form-csv.spec.ts          # Tests guiados por CSV (uso principal)
│   ├── form-reference.spec.ts    # Test de referencia con datos fijos
│   ├── generate.ts               # Generador de datos para formulario local
│   ├── generate-from-map.ts      # Generador de CSV compatible con field-map
│   ├── field-map.json            # Mapa de campos generado por discovery
│   ├── clientes-map.csv          # CSV de prueba generado
│   │
│   └── helpers/
│       ├── types.ts              # Interfaces TypeScript (Field, FieldMap, etc.)
│       ├── fillForm.ts           # Lógica de relleno de formularios
│       └── auth.ts               # Helper de login
│
└── src/                          # App Vue local (solo para desarrollo)
                                  # Formulario de crédito de ejemplo usado
                                  # para desarrollar y probar la herramienta
```

---

## Requisitos

- **Node.js** 18 o superior
- **npm** 9 o superior

```bash
npm install
npx playwright install   # descarga Chromium
```

---

## Windows / Red corporativa (error 407)

Si `npx playwright install` falla con **Error 407 Proxy Authentication Required**, la red bloquea la descarga de Chromium. Usa una de estas opciones:

### Opción A — Configurar el proxy antes de instalar (recomendado)

```bat
set HTTPS_PROXY=http://usuario:contraseña@proxy-host:puerto
set HTTP_PROXY=http://usuario:contraseña@proxy-host:puerto
npx playwright install chromium
```

> Si no sabes la dirección del proxy, pregúntale a tu área de IT.

### Opción B — Usar Chrome ya instalado (sin descargar nada)

Si ya tienes Google Chrome instalado en la máquina, puedes saltarte la descarga:

**1.** Antes de `npm install`, configura la variable de entorno para evitar la descarga:

```bat
set PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
npm install
```

**2.** Agrega esta línea a tu archivo `.env`:

```
PLAYWRIGHT_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

Listo. Playwright usará ese Chrome en vez de descargar uno propio.

### Opción C — Descargar manualmente desde otra red

Descarga el archivo `chrome-win64.zip` del CDN de Playwright desde una máquina sin proxy, cópialo a la máquina con restricciones y extráelo. Luego usa `PLAYWRIGHT_EXECUTABLE_PATH` para apuntar al ejecutable extraído.

---

## Reporte de resultados

Después de correr los tests, Playwright genera un reporte visual:

```bash
npx playwright show-report
```

Abre un navegador con el resultado de cada test, capturas de pantalla de los fallos y tiempo de ejecución por caso.
