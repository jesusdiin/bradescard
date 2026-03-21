<template>
  <div class="form-field">
    <label :for="fieldId">
      {{ label }}
      <span v-if="required" class="required-star">*</span>
    </label>
    <slot />
    <span v-if="error" class="error-msg">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  fieldId: { type: String, default: '' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
})
</script>
