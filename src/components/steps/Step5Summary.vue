<template>
  <div>
    <h2 class="step-title">Resumen de tu Solicitud</h2>
    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1.5rem;">
      Revisa tu información antes de enviar. Si necesitas corregir algo, usa el botón "Anterior".
    </p>

    <!-- Datos Personales -->
    <div class="summary-section">
      <div class="summary-section-title">Datos Personales</div>
      <dl class="summary-dl">
        <dt>Nombre completo</dt>
        <dd>{{ fullName || '—' }}</dd>
        <dt>Fecha de nacimiento</dt>
        <dd>{{ formatDate(s.personal.fechaNacimiento) }}</dd>
        <dt>Género</dt>
        <dd>{{ labelMap.genero[s.personal.genero] || '—' }}</dd>
        <dt>Estado civil</dt>
        <dd>{{ labelMap.estadoCivil[s.personal.estadoCivil] || '—' }}</dd>
        <dt>CURP</dt>
        <dd>{{ s.personal.curp || '—' }}</dd>
      </dl>
    </div>

    <!-- Datos de Contacto -->
    <div class="summary-section">
      <div class="summary-section-title">Datos de Contacto</div>
      <dl class="summary-dl">
        <dt>Email</dt>
        <dd>{{ s.contacto.email || '—' }}</dd>
        <dt>Teléfono</dt>
        <dd>{{ s.contacto.telefono || '—' }}</dd>
        <dt>Dirección</dt>
        <dd>{{ s.contacto.direccion || '—' }}</dd>
        <dt>Ciudad</dt>
        <dd>{{ s.contacto.ciudad || '—' }}</dd>
        <dt>Estado</dt>
        <dd>{{ s.contacto.estado || '—' }}</dd>
        <dt>Código Postal</dt>
        <dd>{{ s.contacto.codigoPostal || '—' }}</dd>
      </dl>
    </div>

    <!-- Información Laboral -->
    <div class="summary-section">
      <div class="summary-section-title">Información Laboral</div>
      <dl class="summary-dl">
        <dt>Tipo de empleo</dt>
        <dd>{{ labelMap.tipoEmpleo[s.empleo.tipoEmpleo] || '—' }}</dd>
        <dt v-if="s.empleo.empresa">Empresa</dt>
        <dd v-if="s.empleo.empresa">{{ s.empleo.empresa }}</dd>
        <dt>Ingresos mensuales</dt>
        <dd>{{ formatCurrency(s.empleo.ingresosMensuales) }}</dd>
        <dt>Años laborando</dt>
        <dd>{{ labelMap.aniosLaborando[s.empleo.aniosLaborando] || '—' }}</dd>
      </dl>
    </div>

    <!-- Detalles del Crédito -->
    <div class="summary-section">
      <div class="summary-section-title">Detalles del Crédito</div>
      <dl class="summary-dl">
        <dt>Monto solicitado</dt>
        <dd>{{ store.montoCurrency }}</dd>
        <dt>Plazo</dt>
        <dd>{{ s.credito.plazo ? s.credito.plazo + ' meses' : '—' }}</dd>
        <dt>Pago mensual estimado</dt>
        <dd>{{ store.pagoMensualEstimado || '—' }}</dd>
        <dt>Destino del crédito</dt>
        <dd>{{ destinoLabels || '—' }}</dd>
        <dt>Términos aceptados</dt>
        <dd>{{ s.credito.aceptaTerminos ? '✓ Sí' : '✗ No' }}</dd>
      </dl>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCreditFormStore } from '@/stores/creditFormStore'

const store = useCreditFormStore()
const s = store

const fullName = computed(() =>
  [s.personal.nombre, s.personal.apellidoPaterno, s.personal.apellidoMaterno]
    .filter(Boolean).join(' ')
)

const destinoLabels = computed(() => {
  const map = {
    vivienda: 'Vivienda', auto: 'Auto', educacion: 'Educación',
    negocio: 'Negocio', salud: 'Salud', viajes: 'Viajes',
    deudas: 'Consolidación de deudas', otro: 'Otro',
  }
  return s.credito.destino.map(d => map[d] || d).join(', ')
})

const labelMap = {
  genero: {
    masculino: 'Masculino', femenino: 'Femenino',
    otro: 'Otro', no_especificar: 'Prefiero no decir',
  },
  estadoCivil: {
    soltero: 'Soltero/a', casado: 'Casado/a', divorciado: 'Divorciado/a',
    viudo: 'Viudo/a', union_libre: 'Unión Libre',
  },
  tipoEmpleo: {
    asalariado: 'Asalariado', independiente: 'Independiente / Freelance',
    empresario: 'Empresario', jubilado: 'Jubilado / Pensionado',
  },
  aniosLaborando: {
    menos1: 'Menos de 1 año', '1a3': '1 a 3 años', '3a5': '3 a 5 años',
    '5a10': '5 a 10 años', mas10: 'Más de 10 años',
  },
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatCurrency(val) {
  if (!val) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val)
}
</script>
