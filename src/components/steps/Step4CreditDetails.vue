<template>
  <div>
    <h2 class="step-title">Detalles del Crédito</h2>
    <div class="form-grid">

      <!-- Monto solicitado con slider -->
      <FormField label="Monto Solicitado" field-id="montoSolicitado" :error="store.errors.montoSolicitado" class="full-width" required>
        <div class="slider-wrapper">
          <div class="slider-display">{{ store.montoCurrency }}</div>
          <div class="slider-row">
            <input
              type="range"
              min="10000"
              max="500000"
              step="5000"
              :value="store.credito.montoSolicitado"
              :style="{ '--slider-pct': store.sliderPercent + '%' }"
              @input="store.setField('credito', 'montoSolicitado', Number($event.target.value))"
            />
            <input
              type="number"
              class="form-control slider-number-input"
              :class="{ 'has-error': store.errors.montoSolicitado }"
              :value="store.credito.montoSolicitado"
              min="10000"
              max="500000"
              step="5000"
              @change="store.setField('credito', 'montoSolicitado', Math.min(500000, Math.max(10000, Number($event.target.value))))"
            />
          </div>
          <div class="pago-estimado" v-if="store.pagoMensualEstimado">
            <span>Pago mensual estimado*</span>
            <strong>{{ store.pagoMensualEstimado }}</strong>
          </div>
        </div>
      </FormField>

      <!-- Plazo -->
      <FormField label="Plazo" field-id="plazo" :error="store.errors.plazo" required>
        <select
          id="plazo"
          :value="store.credito.plazo"
          class="form-control"
          :class="{ 'has-error': store.errors.plazo }"
          @change="store.setField('credito', 'plazo', $event.target.value)"
        >
          <option value="">Selecciona...</option>
          <option value="6">6 meses</option>
          <option value="12">12 meses</option>
          <option value="18">18 meses</option>
          <option value="24">24 meses</option>
          <option value="36">36 meses</option>
          <option value="48">48 meses</option>
          <option value="60">60 meses</option>
        </select>
      </FormField>

      <!-- Destino del crédito -->
      <FormField label="Destino del Crédito" field-id="destino" :error="store.errors.destino" class="full-width" required>
        <div class="checkbox-group" :class="{ 'has-error': store.errors.destino }">
          <label
            v-for="opt in destinoOptions"
            :key="opt.value"
            class="checkbox-option"
            :class="{ selected: store.credito.destino.includes(opt.value) }"
          >
            <input
              type="checkbox"
              :value="opt.value"
              :checked="store.credito.destino.includes(opt.value)"
              @change="toggleDestino(opt.value)"
            />
            {{ opt.label }}
          </label>
        </div>
      </FormField>

      <!-- Términos y condiciones -->
      <FormField label="" field-id="aceptaTerminos" :error="store.errors.aceptaTerminos" class="full-width">
        <label
          class="checkbox-option"
          :class="{ selected: store.credito.aceptaTerminos, 'has-error': store.errors.aceptaTerminos }"
          style="width: 100%"
        >
          <input
            type="checkbox"
            :checked="store.credito.aceptaTerminos"
            @change="store.setField('credito', 'aceptaTerminos', $event.target.checked)"
          />
          Acepto los términos y condiciones, y autorizo la consulta de mi historial crediticio
        </label>
      </FormField>

    </div>
    <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 1rem;">
      * El pago mensual estimado es referencial con una tasa del 2.5% mensual y no representa una oferta contractual.
    </p>
  </div>
</template>

<script setup>
import FormField from '@/components/FormField.vue'
import { useCreditFormStore } from '@/stores/creditFormStore'

const store = useCreditFormStore()

const destinoOptions = [
  { value: 'vivienda', label: 'Vivienda' },
  { value: 'auto', label: 'Auto' },
  { value: 'educacion', label: 'Educación' },
  { value: 'negocio', label: 'Negocio' },
  { value: 'salud', label: 'Salud' },
  { value: 'viajes', label: 'Viajes' },
  { value: 'deudas', label: 'Consolidación de deudas' },
  { value: 'otro', label: 'Otro' },
]

function toggleDestino(value) {
  const current = [...store.credito.destino]
  const idx = current.indexOf(value)
  if (idx === -1) current.push(value)
  else current.splice(idx, 1)
  store.setField('credito', 'destino', current)
}
</script>
