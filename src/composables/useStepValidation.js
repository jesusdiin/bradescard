import { useCreditFormStore } from '@/stores/creditFormStore'
import { CURP_REGEX, EMAIL_REGEX, isAtLeast18, isOnlyDigits, isRequired } from '@/utils/validators'

export function useStepValidation() {
  function validate(step) {
    const store = useCreditFormStore()
    const errors = {}

    if (step === 1) {
      const { nombre, apellidoPaterno, fechaNacimiento, genero, estadoCivil, curp } = store.personal
      if (!isRequired(nombre) || nombre.trim().length < 2) errors.nombre = 'Ingresa tu nombre (mínimo 2 caracteres)'
      if (!isRequired(apellidoPaterno) || apellidoPaterno.trim().length < 2) errors.apellidoPaterno = 'Ingresa tu apellido paterno'
      if (!isRequired(fechaNacimiento)) errors.fechaNacimiento = 'Ingresa tu fecha de nacimiento'
      else if (!isAtLeast18(fechaNacimiento)) errors.fechaNacimiento = 'Debes tener al menos 18 años'
      if (!isRequired(genero)) errors.genero = 'Selecciona tu género'
      if (!isRequired(estadoCivil)) errors.estadoCivil = 'Selecciona tu estado civil'
      if (!isRequired(curp)) errors.curp = 'Ingresa tu CURP'
      else if (!CURP_REGEX.test(curp)) errors.curp = 'CURP con formato inválido (18 caracteres)'
    }

    if (step === 2) {
      const { email, telefono, direccion, ciudad, estado, codigoPostal } = store.contacto
      if (!isRequired(email)) errors.email = 'Ingresa tu email'
      else if (!EMAIL_REGEX.test(email)) errors.email = 'Email con formato inválido'
      if (!isRequired(telefono)) errors.telefono = 'Ingresa tu teléfono'
      else if (!isOnlyDigits(telefono, 10)) errors.telefono = 'El teléfono debe tener exactamente 10 dígitos'
      if (!isRequired(direccion)) errors.direccion = 'Ingresa tu dirección'
      if (!isRequired(ciudad)) errors.ciudad = 'Ingresa tu ciudad'
      if (!isRequired(estado)) errors.estado = 'Selecciona tu estado'
      if (!isRequired(codigoPostal)) errors.codigoPostal = 'Ingresa tu código postal'
      else if (!isOnlyDigits(codigoPostal, 5)) errors.codigoPostal = 'El código postal debe tener 5 dígitos'
    }

    if (step === 3) {
      const { tipoEmpleo, empresa, ingresosMensuales, aniosLaborando } = store.empleo
      if (!isRequired(tipoEmpleo)) errors.tipoEmpleo = 'Selecciona tu tipo de empleo'
      if ((tipoEmpleo === 'asalariado' || tipoEmpleo === 'empresario') && !isRequired(empresa)) {
        errors.empresa = 'Ingresa el nombre de tu empresa'
      }
      if (!isRequired(ingresosMensuales)) errors.ingresosMensuales = 'Ingresa tus ingresos mensuales'
      else if (Number(ingresosMensuales) <= 0) errors.ingresosMensuales = 'Los ingresos deben ser mayor a 0'
      if (!isRequired(aniosLaborando)) errors.aniosLaborando = 'Selecciona los años laborando'
    }

    if (step === 4) {
      const { montoSolicitado, plazo, destino, aceptaTerminos } = store.credito
      if (montoSolicitado < 10000 || montoSolicitado > 500000) errors.montoSolicitado = 'El monto debe estar entre $10,000 y $500,000'
      if (!isRequired(plazo)) errors.plazo = 'Selecciona el plazo del crédito'
      if (!isRequired(destino)) errors.destino = 'Selecciona al menos un destino del crédito'
      if (!aceptaTerminos) errors.aceptaTerminos = 'Debes aceptar los términos y condiciones'
    }

    return errors
  }

  return { validate }
}
