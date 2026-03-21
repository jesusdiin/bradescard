<template>
  <div>
    <h2 class="step-title">Datos de Contacto</h2>
    <div class="form-grid">
      <FormField label="Correo Electrónico" field-id="email" :error="store.errors.email" class="full-width" required>
        <input
          id="email"
          :value="store.contacto.email"
          type="email"
          class="form-control"
          :class="{ 'has-error': store.errors.email }"
          placeholder="correo@ejemplo.com"
          @input="store.setField('contacto', 'email', $event.target.value)"
        />
      </FormField>

      <FormField label="Teléfono (10 dígitos)" field-id="telefono" :error="store.errors.telefono" required>
        <input
          id="telefono"
          :value="store.contacto.telefono"
          type="tel"
          class="form-control"
          :class="{ 'has-error': store.errors.telefono }"
          placeholder="5512345678"
          maxlength="10"
          @input="store.setField('contacto', 'telefono', $event.target.value.replace(/\D/g, ''))"
        />
      </FormField>

      <FormField label="Dirección" field-id="direccion" :error="store.errors.direccion" class="full-width" required>
        <input
          id="direccion"
          :value="store.contacto.direccion"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.direccion }"
          placeholder="Calle, número, colonia"
          @input="store.setField('contacto', 'direccion', $event.target.value)"
        />
      </FormField>

      <FormField label="Ciudad" field-id="ciudad" :error="store.errors.ciudad" required>
        <input
          id="ciudad"
          :value="store.contacto.ciudad"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.ciudad }"
          placeholder="Ej. Guadalajara"
          @input="store.setField('contacto', 'ciudad', $event.target.value)"
        />
      </FormField>

      <FormField label="Estado" field-id="estado" :error="store.errors.estado" required>
        <select
          id="estado"
          :value="store.contacto.estado"
          class="form-control"
          :class="{ 'has-error': store.errors.estado }"
          @change="store.setField('contacto', 'estado', $event.target.value)"
        >
          <option value="">Selecciona...</option>
          <option v-for="est in estados" :key="est.value" :value="est.value">{{ est.label }}</option>
        </select>
      </FormField>

      <FormField label="Código Postal" field-id="codigoPostal" :error="store.errors.codigoPostal" required>
        <input
          id="codigoPostal"
          :value="store.contacto.codigoPostal"
          type="text"
          class="form-control"
          :class="{ 'has-error': store.errors.codigoPostal }"
          placeholder="12345"
          maxlength="5"
          @input="store.setField('contacto', 'codigoPostal', $event.target.value.replace(/\D/g, ''))"
        />
      </FormField>
    </div>
  </div>
</template>

<script setup>
import FormField from '@/components/FormField.vue'
import { useCreditFormStore } from '@/stores/creditFormStore'

const store = useCreditFormStore()

const estados = [
  { value: 'AGS', label: 'Aguascalientes' },
  { value: 'BC', label: 'Baja California' },
  { value: 'BCS', label: 'Baja California Sur' },
  { value: 'CAMP', label: 'Campeche' },
  { value: 'CHIS', label: 'Chiapas' },
  { value: 'CHIH', label: 'Chihuahua' },
  { value: 'CDMX', label: 'Ciudad de México' },
  { value: 'COAH', label: 'Coahuila' },
  { value: 'COL', label: 'Colima' },
  { value: 'DGO', label: 'Durango' },
  { value: 'GTO', label: 'Guanajuato' },
  { value: 'GRO', label: 'Guerrero' },
  { value: 'HGO', label: 'Hidalgo' },
  { value: 'JAL', label: 'Jalisco' },
  { value: 'MEX', label: 'Estado de México' },
  { value: 'MICH', label: 'Michoacán' },
  { value: 'MOR', label: 'Morelos' },
  { value: 'NAY', label: 'Nayarit' },
  { value: 'NL', label: 'Nuevo León' },
  { value: 'OAX', label: 'Oaxaca' },
  { value: 'PUE', label: 'Puebla' },
  { value: 'QRO', label: 'Querétaro' },
  { value: 'QROO', label: 'Quintana Roo' },
  { value: 'SLP', label: 'San Luis Potosí' },
  { value: 'SIN', label: 'Sinaloa' },
  { value: 'SON', label: 'Sonora' },
  { value: 'TAB', label: 'Tabasco' },
  { value: 'TAMPS', label: 'Tamaulipas' },
  { value: 'TLAX', label: 'Tlaxcala' },
  { value: 'VER', label: 'Veracruz' },
  { value: 'YUC', label: 'Yucatán' },
  { value: 'ZAC', label: 'Zacatecas' },
]
</script>
