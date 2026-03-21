export const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isAtLeast18(dateString) {
  if (!dateString) return false
  const birth = new Date(dateString)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18
  }
  return age >= 18
}

export function isOnlyDigits(value, length) {
  return new RegExp(`^\\d{${length}}$`).test(value)
}

export function isRequired(value) {
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined && String(value).trim() !== ''
}
