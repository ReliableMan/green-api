import type { Credentials } from '../types/greenApi'

const KEY = 'greenApi.credentials'

export function loadCredentials(): Credentials | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<Credentials>
    if (data.apiUrl && data.idInstance && data.apiTokenInstance) {
      return {
        apiUrl: data.apiUrl,
        idInstance: data.idInstance,
        apiTokenInstance: data.apiTokenInstance,
      }
    }
  } catch {
    // Хранилище недоступно или данные повреждены — просто попросим войти заново
  }
  return null
}

export function saveCredentials(credentials: Credentials | null): void {
  try {
    if (credentials) {
      sessionStorage.setItem(KEY, JSON.stringify(credentials))
    } else {
      sessionStorage.removeItem(KEY)
    }
  } catch {
    // Без sessionStorage вход просто не переживёт перезагрузку страницы
  }
}
