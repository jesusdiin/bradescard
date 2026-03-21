<template>
  <!-- Login -->
  <template v-if="!authStore.isAuthenticated">
    <LoginScreen />
  </template>

  <!-- Formulario de crédito -->
  <div v-else class="app-card">
    <div class="app-card-header">
      <div class="header-top">
        <div>
          <h1>Solicitud de Crédito</h1>
          <p>Completa el formulario para conocer las opciones disponibles para ti</p>
        </div>
        <div class="header-user">
          <span class="header-empresa">
            {{ authStore.currentEmpresa.icono }} {{ authStore.currentEmpresa.nombre }}
          </span>
          <span class="header-username">{{ authStore.currentUser.username }}</span>
          <button class="btn-logout" @click="handleLogout">Salir</button>
        </div>
      </div>
    </div>

    <div class="app-card-body">
      <template v-if="!store.submitted">
        <StepIndicator />

        <Transition :name="transitionName">
          <component :is="currentStepComponent" :key="store.currentStep" />
        </Transition>

        <div class="form-nav">
          <button
            v-if="store.currentStep > 1"
            class="btn btn-secondary"
            @click="handleBack"
          >
            ← Anterior
          </button>
          <span v-else />

          <button
            v-if="store.currentStep < 5"
            class="btn btn-primary"
            @click="handleNext"
          >
            Siguiente →
          </button>
          <button
            v-else
            class="btn btn-success"
            @click="handleSubmit"
          >
            Enviar Solicitud ✓
          </button>
        </div>
      </template>

      <div v-else class="success-screen">
        <div class="success-icon">✓</div>
        <h2>¡Solicitud Enviada!</h2>
        <p>
          Hemos recibido tu solicitud, {{ store.fullName }}.<br />
          Nos pondremos en contacto en un plazo de 24–48 horas.
        </p>
        <button class="btn btn-primary" @click="store.resetForm()">
          Nueva Solicitud
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCreditFormStore } from '@/stores/creditFormStore'
import { useAuthStore } from '@/stores/authStore'
import { useStepValidation } from '@/composables/useStepValidation'
import LoginScreen from '@/components/LoginScreen.vue'
import StepIndicator from '@/components/StepIndicator.vue'
import Step1PersonalData from '@/components/steps/Step1PersonalData.vue'
import Step2ContactData from '@/components/steps/Step2ContactData.vue'
import Step3EmploymentInfo from '@/components/steps/Step3EmploymentInfo.vue'
import Step4CreditDetails from '@/components/steps/Step4CreditDetails.vue'
import Step5Summary from '@/components/steps/Step5Summary.vue'

const store = useCreditFormStore()
const authStore = useAuthStore()
const { validate } = useStepValidation()

const stepComponents = {
  1: Step1PersonalData,
  2: Step2ContactData,
  3: Step3EmploymentInfo,
  4: Step4CreditDetails,
  5: Step5Summary,
}

const currentStepComponent = computed(() => stepComponents[store.currentStep])

const direction = ref('forward')
const transitionName = computed(() =>
  direction.value === 'forward' ? 'slide' : 'slide-reverse'
)

function handleNext() {
  const errors = validate(store.currentStep)
  if (Object.keys(errors).length > 0) {
    store.setErrors(errors)
    return
  }
  store.clearErrors()
  direction.value = 'forward'
  store.nextStep()
}

function handleBack() {
  store.clearErrors()
  direction.value = 'back'
  store.prevStep()
}

function handleSubmit() {
  store.submitForm()
}

function handleLogout() {
  store.resetForm()
  authStore.logout()
}
</script>

<style scoped>
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.header-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
}

.header-empresa {
  font-size: 0.8rem;
  font-weight: 700;
  opacity: 0.95;
}

.header-username {
  font-size: 0.75rem;
  opacity: 0.75;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 0.3rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.35);
}

@media (max-width: 520px) {
  .header-top { flex-direction: column; }
  .header-user { align-items: flex-start; }
}
</style>
