<template>
  <div>
    <h2 class="step-title">Datos Personales</h2>
    <div class="form-grid">
      <FormField label="Nombre(s)" field-id="nombre" :error="store.errors.nombre" required>
        <input
          id="nombre"
          :value="store.personal.nombre"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.nombre }"
          placeholder="Ej. María"
          @input="store.setField('personal', 'nombre', $event.target.value)"
        />
      </FormField>

      <FormField label="Apellido Paterno" field-id="apellidoPaterno" :error="store.errors.apellidoPaterno" required>
        <input
          id="apellidoPaterno"
          :value="store.personal.apellidoPaterno"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.apellidoPaterno }"
          placeholder="Ej. García"
          @input="store.setField('personal', 'apellidoPaterno', $event.target.value)"
        />
      </FormField>

      <FormField label="Apellido Materno" field-id="apellidoMaterno" :error="store.errors.apellidoMaterno">
        <input
          id="apellidoMaterno"
          :value="store.personal.apellidoMaterno"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.apellidoMaterno }"
          placeholder="Ej. López"
          @input="store.setField('personal', 'apellidoMaterno', $event.target.value)"
        />
      </FormField>

      <FormField label="Fecha de Nacimiento" field-id="fechaNacimiento" :error="store.errors.fechaNacimiento" required>
        <input
          id="fechaNacimiento"
          :value="store.personal.fechaNacimiento"
          type="date"
          class="form-control"
          :class="{ 'has-error': store.errors.fechaNacimiento }"
          :max="maxDate"
          @change="store.setField('personal', 'fechaNacimiento', $event.target.value)"
        />
      </FormField>

      <FormField label="Género" field-id="genero" :error="store.errors.genero" class="full-width" required>
        <div class="radio-group" :class="{ 'has-error': store.errors.genero }">
          <label
            v-for="opt in generoOptions"
            :key="opt.value"
            class="radio-option"
            :class="{ selected: store.personal.genero === opt.value }"
          >
            <input
              type="radio"
              name="genero"
              :value="opt.value"
              :checked="store.personal.genero === opt.value"
              @change="store.setField('personal', 'genero', opt.value)"
            />
            {{ opt.label }}
          </label>
        </div>
      </FormField>

      <FormField label="Estado Civil" field-id="estadoCivil" :error="store.errors.estadoCivil" required>
        <select
          id="estadoCivil"
          :value="store.personal.estadoCivil"
          class="form-control"
          :class="{ 'has-error': store.errors.estadoCivil }"
          @change="store.setField('personal', 'estadoCivil', $event.target.value)"
        >
          <option value="">Selecciona...</option>
          <option value="soltero">Soltero/a</option>
          <option value="casado">Casado/a</option>
          <option value="divorciado">Divorciado/a</option>
          <option value="viudo">Viudo/a</option>
          <option value="union_libre">Unión Libre</option>
        </select>
      </FormField>

      <FormField label="CURP" field-id="curp" :error="store.errors.curp" class="full-width" required>
        <input
          id="curp"
          :value="store.personal.curp"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.curp }"
          placeholder="Ej. GAML900101HMCRCR01"
          maxlength="18"
          style="text-transform: uppercase"
          @input="store.setField('personal', 'curp', $event.target.value.toUpperCase())"
        />
      </FormField>
    </div>
  </div>
</template>

<script setup>
import FormField from '@/components/FormField.vue'
import { useCreditFormStore } from '@/stores/creditFormStore'

const store = useCreditFormStore()

const generoOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'no_especificar', label: 'Prefiero no decir' },
]

// Max date = 18 years ago
const today = new Date()
const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  .toISOString().split('T')[0]
</script>
