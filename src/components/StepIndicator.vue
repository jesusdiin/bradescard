<template>
  <div class="step-indicator">
    <template v-for="(step, index) in steps" :key="step.n">
      <div
        class="step-item"
        :class="{
          completed: currentStep > step.n,
          active: currentStep === step.n,
        }"
      >
        <div class="step-circle">
          <span v-if="currentStep > step.n">✓</span>
          <span v-else>{{ step.n }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
      </div>
      <div
        v-if="index < steps.length - 1"
        class="step-connector"
        :class="{ completed: currentStep > step.n }"
      />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCreditFormStore } from '@/stores/creditFormStore'

const store = useCreditFormStore()
const currentStep = computed(() => store.currentStep)

const steps = [
  { n: 1, label: 'Personales' },
  { n: 2, label: 'Contacto' },
  { n: 3, label: 'Laboral' },
  { n: 4, label: 'Crédito' },
  { n: 5, label: 'Resumen' },
]
</script>
