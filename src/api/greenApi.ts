import type {
  CheckAccountParams,
  CheckAccountResponse,
  Credentials,
  GetStateInstanceResponse,
  Notification,
  SendMessageResponse,
} from '../types/greenApi'

export class GreenApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

interface RequestOptions {
  httpMethod?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number>
  pathSuffix?: string | number
  signal?: AbortSignal
}

function buildUrl(creds: Credentials, method: string, options: RequestOptions): string {
  const base = creds.apiUrl.trim().replace(/\/+$/, '')
  const token = encodeURIComponent(creds.apiTokenInstance.trim())
  let url = `${base}/waInstance${creds.idInstance.trim()}/${method}/${token}`
  if (options.pathSuffix !== undefined) {
    url += `/${encodeURIComponent(String(options.pathSuffix))}`
  }
  if (options.query) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(options.query)) {
      params.set(key, String(value))
    }
    url += `?${params}`
  }
  return url
}

function httpErrorMessage(status: number, details: string): string {
  switch (status) {
    case 401:
    case 403:
      return 'Неверный idInstance или apiTokenInstance'
    case 429:
      return 'Слишком много запросов, попробуйте позже'
    case 466:
      return 'Исчерпан лимит тарифа GREEN-API'
    default:
      return `Ошибка GREEN-API (${status})${details ? `: ${details}` : ''}`
  }
}

async function request<T>(
  creds: Credentials,
  method: string,
  options: RequestOptions = {},
): Promise<T> {
  const { httpMethod = 'GET', body, signal } = options

  let res: Response
  try {
    res = await fetch(buildUrl(creds, method, options), {
      method: httpMethod,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    if (signal?.aborted) throw err
    throw new GreenApiError(
      'Не удалось связаться с GREEN-API. Проверьте подключение к интернету и apiUrl',
    )
  }

  const text = await res.text()

  if (!res.ok) {
    throw new GreenApiError(httpErrorMessage(res.status, text.slice(0, 200)), res.status)
  }

  if (!text) return null as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new GreenApiError('GREEN-API вернул некорректный ответ', res.status)
  }
}

export function getStateInstance(creds: Credentials) {
  return request<GetStateInstanceResponse>(creds, 'getStateInstance')
}

export async function checkAccount(
  creds: Credentials,
  params: CheckAccountParams,
): Promise<CheckAccountResponse> {
  const body =
    'phoneNumber' in params
      ? { phoneNumber: Number(params.phoneNumber) }
      : { username: params.username }

  const data = await request<CheckAccountResponse>(creds, 'checkAccount', {
    httpMethod: 'POST',
    body,
  })

  if (data.status === false) {
    throw new GreenApiError(data.reason || 'Не удалось проверить аккаунт')
  }
  return data
}

export function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<SendMessageResponse>(creds, 'sendMessage', {
    httpMethod: 'POST',
    body: { chatId, message },
  })
}

export async function receiveNotification(
  creds: Credentials,
  receiveTimeout: number,
  signal: AbortSignal,
): Promise<Notification | null> {
  try {
    return await request<Notification | null>(creds, 'receiveNotification', {
      query: { receiveTimeout },
      signal,
    })
  } catch (err) {
    if (err instanceof GreenApiError && err.status === 408) return null
    throw err
  }
}

export async function deleteNotification(
  creds: Credentials,
  receiptId: number,
  signal: AbortSignal,
): Promise<void> {
  await request(creds, 'deleteNotification', {
    httpMethod: 'DELETE',
    pathSuffix: receiptId,
    signal,
  })
}
