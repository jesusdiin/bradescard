<template>
  <div>
    <h2 class="step-title">Información Laboral</h2>
    <div class="form-grid">
      <FormField label="Tipo de Empleo" field-id="tipoEmpleo" :error="store.errors.tipoEmpleo" class="full-width" required>
        <div class="radio-group" :class="{ 'has-error': store.errors.tipoEmpleo }">
          <label
            v-for="opt in tipoEmpleoOptions"
            :key="opt.value"
            class="radio-option"
            :class="{ selected: store.empleo.tipoEmpleo === opt.value }"
          >
            <input
              type="radio"
              name="tipoEmpleo"
              :value="opt.value"
              :checked="store.empleo.tipoEmpleo === opt.value"
              @change="store.setField('empleo', 'tipoEmpleo', opt.value)"
            />
            {{ opt.label }}
          </label>
        </div>
      </FormField>

      <FormField
        v-if="store.empleo.tipoEmpleo === 'asalariado' || store.empleo.tipoEmpleo === 'empresario'"
        label="Empresa / Razón Social"
        field-id="empresa"
        :error="store.errors.empresa"
        class="full-width"
        required
      >
        <input
          id="empresa"
          :value="store.empleo.empresa"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.empresa }"
          placeholder="Nombre de la empresa"
          @input="store.setField('empleo', 'empresa', $event.target.value)"
        />
      </FormField>

      <FormField label="Ingresos Mensuales (MXN)" field-id="ingresosMensuales" :error="store.errors.ingresosMensuales" required>
        <input
          id="ingresosMensuales"
          :value="store.empleo.ingresosMensuales"
          type="number"
          class="form-control"
          :class="{ 'has-error': store.errors.ingresosMensuales }"
          placeholder="Ej. 15000"
          min="1"
          @input="store.setField('empleo', 'ingresosMensuales', $event.target.value)"
        />
      </FormField>

      <FormField label="Años Laborando" field-id="aniosLaborando" :error="store.errors.aniosLaborando" required>
        <select
          id="aniosLaborando"
          :value="store.empleo.aniosLaborando"
          class="form-control"
          :class="{ 'has-error': store.errors.aniosLaborando }"
          @change="store.setField('empleo', 'aniosLaborando', $event.target.value)"
        >
          <option value="">Selecciona...</option>
          <option value="menos1">Menos de 1 año</option>
          <option value="1a3">1 a 3 años</option>
          <option value="3a5">3 a 5 años</option>
          <option value="5a10">5 a 10 años</option>
          <option value="mas10">Más de 10 años</option>
        </select>
      </FormField>
    </div>
  </div>
</template>

<script setup>
import FormField from '@/components/FormField.vue'
import { useCreditFormStore } from '@/stores/creditFormStore'

const store = useCreditFormStore()

const tipoEmpleoOptions = [
  { value: 'asalariado', label: 'Asalariado' },
  { value: 'independiente', label: 'Independiente / Freelance' },
  { value: 'empresario', label: 'Empresario' },
  { value: 'jubilado', label: 'Jubilado / Pensionado' },
]
</script>
