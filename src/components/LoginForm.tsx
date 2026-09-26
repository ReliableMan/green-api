import { useState, type FormEvent } from 'react'
import { getStateInstance, GreenApiError } from '../api/greenApi'
import { useChat } from '../store/useChat'
import type { Credentials, StateInstance } from '../types/greenApi'
import styles from './LoginForm.module.css'

const DEFAULT_API_URL = 'https://api.green-api.com'

type Errors = Partial<Record<keyof Credentials, string>>

const STATE_ERRORS: Record<Exclude<StateInstance, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован. Войдите в Telegram в консоли GREEN-API',
  blocked: 'Инстанс заблокирован',
  sleepMode: 'Инстанс в спящем режиме. Проверьте его в консоли GREEN-API',
  starting: 'Инстанс запускается. Повторите попытку через минуту',
  yellowCard: 'Отправка сообщений для инстанса временно ограничена',
}

function validate(values: Credentials): Errors {
  const errors: Errors = {}
  if (!values.idInstance.trim()) {
    errors.idInstance = 'Укажите idInstance'
  } else if (!/^\d+$/.test(values.idInstance.trim())) {
    errors.idInstance = 'idInstance должен состоять только из цифр'
  }
  if (!values.apiTokenInstance.trim()) {
    errors.apiTokenInstance = 'Укажите apiTokenInstance'
  }
  if (!values.apiUrl.trim()) {
    errors.apiUrl = 'Укажите apiUrl'
  } else if (!/^https?:\/\/\S+$/.test(values.apiUrl.trim())) {
    errors.apiUrl = 'apiUrl должен начинаться с https://'
  }
  return errors
}

export function LoginForm() {
  const { dispatch } = useChat()
  const [values, setValues] = useState<Credentials>({
    idInstance: '',
    apiTokenInstance: '',
    apiUrl: DEFAULT_API_URL,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(field: keyof Credentials, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitError(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const credentials: Credentials = {
      idInstance: values.idInstance.trim(),
      apiTokenInstance: values.apiTokenInstance.trim(),
      apiUrl: values.apiUrl.trim().replace(/\/+$/, ''),
    }

    setLoading(true)
    setSubmitError(null)
    try {
      const { stateInstance } = await getStateInstance(credentials)
      if (stateInstance === 'authorized') {
        dispatch({ type: 'login', credentials })
        return
      }
      setSubmitError(
        STATE_ERRORS[stateInstance] ?? `Неожиданное состояние инстанса: ${stateInstance}`,
      )
    } catch (err) {
      setSubmitError(
        err instanceof GreenApiError ? err.message : 'Не удалось проверить инстанс',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Вход</h1>
        <p className={styles.subtitle}>
          Данные инстанса из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            консоли GREEN-API
          </a>
        </p>

        <Field
          label="idInstance"
          value={values.idInstance}
          error={errors.idInstance}
          inputMode="numeric"
          autoComplete="username"
          onChange={(v) => handleChange('idInstance', v)}
        />
        <Field
          label="apiTokenInstance"
          type="password"
          value={values.apiTokenInstance}
          error={errors.apiTokenInstance}
          autoComplete="current-password"
          onChange={(v) => handleChange('apiTokenInstance', v)}
        />
        <Field
          label="apiUrl"
          type="url"
          value={values.apiUrl}
          error={errors.apiUrl}
          onChange={(v) => handleChange('apiUrl', v)}
        />

        {submitError && (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        )}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  error?: string
  type?: 'text' | 'password' | 'url'
  inputMode?: 'numeric'
  autoComplete?: string
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  onChange,
}: FieldProps) {
  const id = `login-${label}`
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        data-invalid={error ? true : undefined}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        spellCheck={false}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <span id={`${id}-error`} className={styles.fieldError}>
          {error}
        </span>
      )}
    </div>
  )
}
