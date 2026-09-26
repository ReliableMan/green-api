import { useState, type FormEvent } from 'react'
import { checkAccount, GreenApiError } from '../api/greenApi'
import { useChat } from '../store/useChat'
import { parseRecipient } from '../utils/phone'
import styles from './NewChatForm.module.css'

export function NewChatForm() {
  const { state, dispatch } = useChat()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading || !state.credentials) return

    const parsed = parseRecipient(value)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }

    const existing = state.chats.find((c) => c.lookup === parsed.key)
    if (existing) {
      dispatch({ type: 'selectChat', chatId: existing.chatId })
      setValue('')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await checkAccount(state.credentials, parsed.params)
      if (!res.exist || !res.chatId) {
        setError('Не найден в Telegram или номер скрыт настройками приватности')
        return
      }
      const title = res.username
        ? `@${res.username.replace(/^@/, '')}`
        : 'phoneNumber' in parsed.params
          ? `+${parsed.params.phoneNumber}`
          : parsed.params.username
      dispatch({
        type: 'openChat',
        chatId: String(res.chatId),
        title,
        lookup: parsed.key,
      })
      setValue('')
    } catch (err) {
      setError(
        err instanceof GreenApiError ? err.message : 'Не удалось проверить аккаунт',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="text"
          placeholder="Номер или @username"
          aria-label="Номер телефона или @username"
          value={value}
          disabled={loading}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
        />
        <button
          className={styles.button}
          type="submit"
          disabled={loading || !value.trim()}
        >
          {loading ? '…' : 'Найти'}
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
