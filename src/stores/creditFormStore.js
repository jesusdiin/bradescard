import { defineStore } from 'pinia'

export const useCreditFormStore = defineStore('creditForm', {
  state: () => ({
    currentStep: 1,
    submitted: false,

    personal: {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      genero: '',
      estadoCivil: '',
      curp: '',
    },

    contacto: {
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
    },

    empleo: {
      tipoEmpleo: '',
      empresa: '',
      ingresosMensuales: '',
      aniosLaborando: '',
    },

    credito: {
      montoSolicitado: 50000,
      plazo: '',
      destino: [],
      aceptaTerminos: false,
    },

    errors: {},
  }),

  getters: {
    fullName: (state) =>
      `${state.personal.nombre} ${state.personal.apellidoPaterno}`.trim(),

    montoCurrency: (state) =>
      new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
        .format(state.credito.montoSolicitado),

    pagoMensualEstimado: (state) => {
      const monto = state.credito.montoSolicitado
      const meses = Number(state.credito.plazo)
      if (!meses) return null
      const tasaMensual = 0.025 // 2.5% mensual referencial
      const pago = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses))
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
        .format(pago)
    },

    sliderPercent: (state) => {
      const min = 10000
      const max = 500000
      return ((state.credito.montoSolicitado - min) / (max - min)) * 100
    },
  },

  actions: {
    setField(section, field, value) {
      this[section][field] = value
      // Clear error for this field on edit
      if (this.errors[field]) {
        const newErrors = { ...this.errors }
        delete newErrors[field]
        this.errors = newErrors
      }
    },

    setErrors(errorsObj) {
      this.errors = errorsObj
    },

    clearErrors() {
      this.errors = {}
    },

    nextStep() {
      if (this.currentStep < 5) this.currentStep++
    },

    prevStep() {
      if (this.currentStep > 1) this.currentStep--
    },

    goToStep(n) {
      if (n >= 1 && n <= 5) this.currentStep = n
    },

    submitForm() {
      this.submitted = true
    },

    resetForm() {
      this.currentStep = 1
      this.submitted = false
      this.personal = { nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', genero: '', estadoCivil: '', curp: '' }
      this.contacto = { email: '', telefono: '', direccion: '', ciudad: '', estado: '', codigoPostal: '' }
      this.empleo = { tipoEmpleo: '', empresa: '', ingresosMensuales: '', aniosLaborando: '' }
      this.credito = { montoSolicitado: 50000, plazo: '', destino: [], aceptaTerminos: false }
      this.errors = {}
      sessionStorage.removeItem('creditForm')
    },
  },
})
