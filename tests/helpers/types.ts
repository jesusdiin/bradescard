export interface Field {
  label: string
  selector: string
  type: string
  name: string
  placeholder: string
  required: boolean
  options: string[]
  selectorStrategy: string
  csvColumn: string
}

export interface LoginInfo {
  usernameSelector: string
  passwordSelector: string
  submitSelector: string
}

export interface Step {
  index: number
  stepUrl: string
  nextButtonSelector: string | null
  fields: Field[]
}

export interface FieldMap {
  baseURL: string
  generatedAt: string
  login: LoginInfo | null
  steps: Step[]
}

export type Cliente = Record<string, string>
