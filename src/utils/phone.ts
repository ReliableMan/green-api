import type { CheckAccountParams } from '../types/greenApi'

export type RecipientParseResult =
  { ok: true; params: CheckAccountParams; key: string } | { ok: false; error: string }

const USERNAME_RE = /^[a-zA-Z][a-zA-Z0-9_]{3,31}$/

function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`
  }
  return digits
}

export function parseRecipient(input: string): RecipientParseResult {
  const value = input.trim()
  if (!value) {
    return { ok: false, error: 'Введите номер телефона или @username' }
  }

  if (value.startsWith('@') || /[a-zA-Z]/.test(value)) {
    const username = value.replace(/^@/, '')
    if (!USERNAME_RE.test(username)) {
      return {
        ok: false,
        error: 'Username: 5–32 символа, латиница, цифры и _, начинается с буквы',
      }
    }
    return {
      ok: true,
      params: { username: `@${username}` },
      key: `@${username.toLowerCase()}`,
    }
  }

  if (!/^[\d\s()+-]+$/.test(value)) {
    return {
      ok: false,
      error: 'Номер может содержать только цифры, пробелы, +, - и скобки',
    }
  }
  const phone = normalizePhone(value)
  if (phone.length < 10 || phone.length > 15) {
    return { ok: false, error: 'Номер должен содержать от 10 до 15 цифр с кодом страны' }
  }
  return { ok: true, params: { phoneNumber: phone }, key: phone }
}
