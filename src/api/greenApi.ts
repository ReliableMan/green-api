import type {
  CheckAccountParams,
  CheckAccountResponse,
  Credentials,
  DeleteNotificationResponse,
  GetStateInstanceResponse,
  Notification,
  SendMessageResponse,
} from '../types/greenApi'

export type GreenApiErrorKind =
  'network' | 'auth' | 'rateLimit' | 'quota' | 'http' | 'api'

export class GreenApiError extends Error {
  readonly kind: GreenApiErrorKind
  readonly status?: number

  constructor(kind: GreenApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'GreenApiError'
    this.kind = kind
    this.status = status
  }
}

interface RequestOptions {
  httpMethod?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number>
  // Часть пути после токена, например receiptId для deleteNotification
  pathSuffix?: string | number
  signal?: AbortSignal
}

function buildUrl(creds: Credentials, method: string, options: RequestOptions): string {
  const base = creds.apiUrl.trim().replace(/\/+$/, '')
  let url = `${base}/waInstance${creds.idInstance.trim()}/${method}/${encodeURIComponent(
    creds.apiTokenInstance.trim(),
  )}`
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

function httpError(status: number, details: string): GreenApiError {
  switch (status) {
    case 401:
    case 403:
      return new GreenApiError('auth', 'Неверный idInstance или apiTokenInstance', status)
    case 429:
      return new GreenApiError(
        'rateLimit',
        'Слишком много запросов, попробуйте позже',
        status,
      )
    case 466:
      return new GreenApiError('quota', 'Исчерпан лимит тарифа GREEN-API', status)
    default:
      return new GreenApiError(
        'http',
        `Ошибка GREEN-API (${status})${details ? `: ${details}` : ''}`,
        status,
      )
  }
}

export async function request<T>(
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
      'network',
      'Не удалось связаться с GREEN-API. Проверьте подключение к интернету и apiUrl',
    )
  }

  const text = await res.text()

  if (!res.ok) {
    throw httpError(res.status, text.slice(0, 200))
  }

  if (!text) return null as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new GreenApiError('api', 'GREEN-API вернул некорректный ответ', res.status)
  }
}

export function getStateInstance(creds: Credentials, signal?: AbortSignal) {
  return request<GetStateInstanceResponse>(creds, 'getStateInstance', { signal })
}

export async function checkAccount(
  creds: Credentials,
  params: CheckAccountParams,
  signal?: AbortSignal,
): Promise<CheckAccountResponse> {
  const body =
    'phoneNumber' in params
      ? { phoneNumber: Number(params.phoneNumber) }
      : { username: params.username }

  const data = await request<CheckAccountResponse>(creds, 'checkAccount', {
    httpMethod: 'POST',
    body,
    signal,
  })

  if (data.status === false) {
    throw new GreenApiError('api', data.reason || 'Не удалось проверить аккаунт')
  }
  return data
}

export function sendMessage(
  creds: Credentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
) {
  return request<SendMessageResponse>(creds, 'sendMessage', {
    httpMethod: 'POST',
    body: { chatId, message },
    signal,
  })
}

export async function receiveNotification(
  creds: Credentials,
  receiveTimeout = 20,
  signal?: AbortSignal,
): Promise<Notification | null> {
  try {
    return await request<Notification | null>(creds, 'receiveNotification', {
      query: { receiveTimeout },
      signal,
    })
  } catch (err) {
    // Telegram-инстансы при пустой очереди отвечают 408 после таймаута, а не 200 null
    if (err instanceof GreenApiError && err.status === 408) return null
    throw err
  }
}

export function deleteNotification(
  creds: Credentials,
  receiptId: number,
  signal?: AbortSignal,
) {
  return request<DeleteNotificationResponse>(creds, 'deleteNotification', {
    httpMethod: 'DELETE',
    pathSuffix: receiptId,
    signal,
  })
}
